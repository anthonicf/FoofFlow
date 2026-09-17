import { Injectable, computed, signal } from '@angular/core';
import { APP_CONFIG } from '../core/app.config';
import type { CartItem, Product } from '../models/models';

/**
 * Estado del carrito. Se conserva mientras dure la sesión (single service).
 * Posteriormente podrá persistirse y sincronizarse con el backend.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsSignal = signal<CartItem[]>([]);

  readonly items = this.itemsSignal.asReadonly();

  readonly count = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0),
  );

  readonly subtotal = computed(() =>
    this.items().reduce((acc, item) => acc + item.product.price * item.quantity, 0),
  );

  readonly deliveryFee = computed(() => {
    const sub = this.subtotal();
    if (sub === 0) return 0;
    if (sub >= APP_CONFIG.freeDeliveryThreshold) return 0;
    return APP_CONFIG.deliveryFeeBase;
  });

  readonly total = computed(() => this.subtotal() + this.deliveryFee());

  quantityOf(productId: string): number {
    return this.items().find((i) => i.product.id === productId)?.quantity ?? 0;
  }

  add(product: Product, quantity = 1): void {
    this.itemsSignal.update((items) => {
      const exists = items.find((i) => i.product.id === product.id);
      if (exists) {
        return items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...items, { product, quantity }];
    });
  }

  increment(productId: string): void {
    this.addQuantity(productId, 1);
  }

  decrement(productId: string): void {
    this.itemsSignal.update((items) =>
      items
        .map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  remove(productId: string): void {
    this.itemsSignal.update((items) => items.filter((i) => i.product.id !== productId));
  }

  clear(): void {
    this.itemsSignal.set([]);
  }

  private addQuantity(productId: string, delta: number): void {
    this.itemsSignal.update((items) =>
      items.map((i) => (i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)),
    );
  }
}