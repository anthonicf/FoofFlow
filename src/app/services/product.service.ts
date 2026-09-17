import { Injectable, signal } from '@angular/core';
import { PRODUCTS } from '../data/data';
import type { Product } from '../models/models';

/**
 * Fuente de datos de productos.
 * Etapa mock -> posteriormente GET /api/restaurants/{id}/products.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly all = signal<Product[]>(PRODUCTS);

  readonly products = this.all.asReadonly();

  getById(id: string): Product | undefined {
    return this.all().find((p) => p.id === id);
  }

  byRestaurant(restaurantId: string, availableOnly = false): Product[] {
    return this.all()
      .filter((p) => p.restaurantId === restaurantId)
      .filter((p) => !availableOnly || p.available);
  }

  /** Prductos destacados de un restaurante (por calificación implícita). */
  featuredByRestaurant(restaurantId: string, count = 4): Product[] {
    return this.byRestaurant(restaurantId, true).slice(0, count);
  }

  byRestaurants(restaurantIds: string[]): Product[] {
    return this.all().filter((p) => restaurantIds.includes(p.restaurantId));
  }
}