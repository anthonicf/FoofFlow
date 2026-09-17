import { Injectable, signal } from '@angular/core';
import { RESTAURANTS } from '../data/data';
import type { Restaurant } from '../models/models';
import { GamificationService } from './gamification.service';

/**
 * Fuente de datos de restaurantes.
 * Etapa mock -> posteriormente GET /api/restaurants vía HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private readonly all = signal<Restaurant[]>(RESTAURANTS);

  constructor(private readonly gamification: GamificationService) {}

  readonly restaurants = this.all.asReadonly();

  getById(id: string): Restaurant | undefined {
    return this.all().find((r) => r.id === id);
  }

  getByCategory(category: string): Restaurant[] {
    return this.all().filter((r) => r.category === category);
  }

  byIds(ids: string[]): Restaurant[] {
    return this.all().filter((r) => ids.includes(r.id));
  }

  /** Búsqueda por nombre / descripción / categoría / tags. */
  search(query: string): Restaurant[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.all();
    return this.all().filter((r) =>
      [r.name, r.description, r.category, ...r.tags].join(' ').toLowerCase().includes(q),
    );
  }

  /** Abrir el menú de un restaurante: cuenta como descubierto. */
  discover(restaurantId: string): void {
    this.gamification.markDiscovered(restaurantId);
  }
}