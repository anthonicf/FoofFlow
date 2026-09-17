import { Injectable, computed, signal } from '@angular/core';
import { XP_RULES } from '../data/data';
import type { CartItem, Order, OrderStatus } from '../models/models';
import { GamificationService } from './gamification.service';
import { UserService } from './user.service';

export interface OrderEntry {
  order: Order;
}

/**
 * Pedidos del usuario: activos e historial (simulados localmente).
 * Posteriormente: POST /api/pedidos, GET /api/pedidos.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly ordersSignal = signal<OrderEntry[]>([]);

  readonly orders = this.ordersSignal.asReadonly();

  readonly activeOrders = computed(() =>
    this.orders().filter((o) => o.order.status === 'Preparando' || o.order.status === 'En camino'),
  );

  readonly history = computed(() =>
    this.orders().filter((o) => o.order.status === 'Entregado' || o.order.status === 'Cancelado'),
  );

  readonly totalRatingDone = computed(
    () => this.orders().filter((o) => o.order.rating !== undefined).length,
  );

  constructor(
    private readonly gamification: GamificationService,
    private readonly user: UserService,
  ) {}

  /**
   * Crea un pedido simulado, vacía el carrito y otorga XP.
   */
  placeOrder(payload: {
    restaurant: { id: string; name: string; category: string; image: string };
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
  }): Order {
    const id = `FF-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const order: Order = {
      id,
      restaurantId: payload.restaurant.id,
      restaurantName: payload.restaurant.name,
      restaurantCategory: payload.restaurant.category,
      restaurantImage: payload.restaurant.image,
      date: new Date().toISOString(),
      items: payload.items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      })),
      subtotal: payload.subtotal,
      deliveryFee: payload.deliveryFee,
      total: payload.total,
      status: 'Preparando',
      xpEarned: XP_RULES.orderPlaced,
    };

    this.ordersSignal.update((orders) => [{ order }, ...orders]);

    this.gamification.addXp(XP_RULES.orderPlaced, 'Pedido confirmado');
    this.gamification.incrementMissionProgress('order');
    this.gamification.unlockAchievement('a1');

    const isNewCategory =
      !this.user.preferences().favoriteCategories.includes(payload.restaurant.category);
    if (isNewCategory) {
      this.gamification.incrementMissionProgress('newCategory');
    }

    return order;
  }

  rateOrder(orderId: string, rating: number): void {
    this.ordersSignal.update((orders) =>
      orders.map((e) =>
        e.order.id === orderId && e.order.rating === undefined
          ? { order: { ...e.order, rating } }
          : e,
      ),
    );
    this.gamification.addXp(XP_RULES.orderRated, 'Valoraste un pedido');
    this.gamification.incrementMissionProgress('rate');
    this.gamification.unlockAchievement('a3');
  }

  advanceStatus(orderId: string): void {
    this.ordersSignal.update((orders) =>
      orders.map((e) => {
        if (e.order.id !== orderId) return e;
        const next: Record<OrderStatus, OrderStatus | null> = {
          Preparando: 'En camino',
          'En camino': 'Entregado',
          Entregado: null,
          Cancelado: null,
        };
        const nextStatus = next[e.order.status];
        return nextStatus ? { order: { ...e.order, status: nextStatus } } : e;
      }),
    );
  }
}