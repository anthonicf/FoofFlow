import { Injectable, computed, signal } from '@angular/core';
import type { GroupOrder, GroupOrderParticipant, OrderItem, Product } from '../models/models';
import { GamificationService } from './gamification.service';

/**
 * Pedidos grupales simulados (sin tiempo real).
 * Cada participante añade sus productos y se acumula el total del grupo.
 */
@Injectable({ providedIn: 'root' })
export class GroupOrderService {
  private readonly activeSignal = signal<GroupOrder | null>(null);
  private readonly historySignal = signal<GroupOrder[]>([]);

  readonly active = this.activeSignal.asReadonly();
  readonly history = this.historySignal.asReadonly();

  constructor(private readonly gamification: GamificationService) {}

  readonly groupTotal = computed(() => this.active()?.total ?? 0);

  create(name: string, participantNames: string[]): GroupOrder {
    const sanitized = name.trim() || 'Pedido grupal';
    const participants: GroupOrderParticipant[] = participantNames
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => ({ id: `gp${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: n, items: [] }));

    const group: GroupOrder = {
      id: `gr${Date.now()}`,
      code: this.generateCode(),
      name: sanitized,
      createdAt: new Date().toISOString(),
      participants,
      total: 0,
      active: true,
    };

    this.activeSignal.set(group);
    return group;
  }

  addParticipant(name: string): void {
    const group = this.activeSignal();
    if (!group || !name.trim()) return;
    const participant: GroupOrderParticipant = {
      id: `gp${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      items: [],
    };
    this.activeSignal.update((g) =>
      g ? { ...g, participants: [...g.participants, participant] } : g,
    );
  }

  removeParticipant(participantId: string): void {
    this.activeSignal.update((g) =>
      g
        ? {
            ...g,
            participants: g.participants.filter((p) => p.id !== participantId),
          }
        : g,
    );
  }

  addItem(participantId: string, product: Product): void {
    this.activeSignal.update((g) =>
      g
        ? {
            ...g,
            participants: g.participants.map((p) => {
              if (p.id !== participantId) return p;
              const existing = p.items.find((i) => i.productId === product.id);
              const items = existing
                ? p.items.map((i) =>
                    i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
                  )
                : [...p.items, this.toOrderItem(product, 1)];
              return { ...p, items };
            }),
          }
        : g,
    );
    this.recalcTotal();
  }

  removeItem(participantId: string, productId: string): void {
    this.activeSignal.update((g) =>
      g
        ? {
            ...g,
            participants: g.participants.map((p) =>
              p.id === participantId
                ? { ...p, items: p.items.filter((i) => i.productId !== productId) }
                : p,
            ),
          }
        : g,
    );
    this.recalcTotal();
  }

  participantTotal(participantId: string): number {
    return (
      this.activeSignal()
        ?.participants.find((p) => p.id === participantId)
        ?.items.reduce((acc, i) => acc + i.price * i.quantity, 0) ?? 0
    );
  }

  /** Simula la confirmación: archiva el pedido grupal y reinicia. */
  finalize(): GroupOrder | null {
    const group = this.activeSignal();
    if (!group) return null;
    const finalized: GroupOrder = { ...group, active: false, total: this.groupTotal() };
    this.historySignal.update((h) => [finalized, ...h]);
    this.activeSignal.set(null);
    this.gamification.completeGroupAchievement();
    this.gamification.addXp(20, 'Participaste en un pedido grupal');
    return finalized;
  }

  private recalcTotal(): void {
    this.activeSignal.update((g) =>
      g
        ? {
            ...g,
            total: g.participants.reduce(
              (acc, p) => acc + p.items.reduce((a, i) => a + i.price * i.quantity, 0),
              0,
            ),
          }
        : g,
    );
  }

  private toOrderItem(product: Product, quantity: number): OrderItem {
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
    };
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
}