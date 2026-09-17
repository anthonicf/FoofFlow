import { Injectable } from '@angular/core';
import type { Recommendation, Restaurant, UserPreferences } from '../models/models';
import { RestaurantService } from './restaurant.service';
import { UserService } from './user.service';

export interface RecommendationOptions {
  craving?: Craving | null;
  maxTime?: number | null;
  count?: number;
}

/** Antojos del asistente "Sorpréndeme". */
export type Craving = 'salado' | 'dulce' | 'picante' | 'ligero';

/**
 * Sistema de recomendaciones por reglas simples y transparentes.
 * Sin IA ni ML: la lógica se puede replicar en el backend (Spring Boot).
 *
 * Puntajes:
 *  +5  coincidencia de categoría favorita
 *  +4  coincidencia de sabores favoritos
 *  +3  dentro del presupuesto
 *  +3  buena calificación (>= 4.5)
 *  +2  tiempo de entrega compatible
 *  +2  distancia compatible (<= 3 km)
 */
export class RecommendationEngine {
  score(
    restaurant: Restaurant,
    preferences: UserPreferences,
    maxTime?: number | null,
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const budget = preferences.budgetPerPlate;

    if (preferences.favoriteCategories.includes(restaurant.category)) {
      score += 5;
      reasons.push('Categoría favorita (+5)');
    }

    const priceMax = [0, 20, 30, 45][restaurant.priceRange] ?? 30;
    if (priceMax <= budget || restaurant.priceRange === 1) {
      score += 3;
      reasons.push('Dentro de tu presupuesto (+3)');
    }

    if (restaurant.rating >= 4.5) {
      score += 3;
      reasons.push('Excelente calificación (+3)');
    }

    const effectiveTime = maxTime ?? preferences.maxDeliveryTime;
    if (restaurant.deliveryTime <= effectiveTime) {
      score += 2;
      reasons.push('Tiempo de entrega compatible (+2)');
    }

    if (restaurant.distance <= 3) {
      score += 2;
      reasons.push('Cerca de ti (+2)');
    }

    if (restaurant.tags.some((t) => preferences.favoriteFlavors.includes(t))) {
      score += 4;
      reasons.push('Coincide con tus sabores (+4)');
    }

    return { score, reasons };
  }
}

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly engine = new RecommendationEngine();

  constructor(
    private readonly restaurants: RestaurantService,
    private readonly user: UserService,
  ) {}

  /** Clasificación de restaurantes según preferencias del usuario. */
  getRecommendations(options: RecommendationOptions = {}): Recommendation[] {
    const preferences = this.user.preferences();
    const craving = options.craving ?? null;
    const maxTime = options.maxTime ?? null;
    const count = options.count ?? 8;

    let pool = this.restaurants.restaurants().filter((r) => r.isOpen);

    // Filtro duro por tiempo si el usuario lo indicó explícitamente.
    const timeFilter = maxTime ?? null;
    if (timeFilter) {
      pool = pool.filter((r) => r.deliveryTime <= timeFilter);
    }

    // Un antojo orienta la búsqueda.
    if (craving) {
      const cravingCategories = this.cravingToCategories(craving);
      if (cravingCategories.length) {
        pool = pool.filter((r) => cravingCategories.includes(r.category));
      }
    }

    const scored = pool.map((restaurant) => {
      const { score, reasons } = this.engine.score(restaurant, preferences, timeFilter);
      // Bono por coincidir con el antojo, queda reflejado en las restricciones previas.
      return { restaurant, score, reasons };
    });

    return scored
      .sort((a, b) => b.score - a.score || b.restaurant.rating - a.restaurant.rating)
      .slice(0, count);
  }

  topRecommendations(count = 4): Recommendation[] {
    return this.getRecommendations({ count });
  }

  /** Muestra de forma legible el desglose de puntuación (transparencia). */
  explain(restaurantId: string): Recommendation {
    const restaurant = this.restaurants.getById(restaurantId);
    const preferences = this.user.preferences();
    if (!restaurant) {
      throw new Error(`Restaurante no encontrado: ${restaurantId}`);
    }
    const { score, reasons } = this.engine.score(restaurant, preferences);
    return { restaurant, score, reasons };
  }

  private cravingToCategories(craving: Craving): string[] {
    switch (craving) {
      case 'salado':
        return ['criolla', 'hamburguesas', 'pizza'];
      case 'dulce':
        return ['postres', 'cafe'];
      case 'picante':
        return ['mexicana', 'japonesa', 'criolla'];
      case 'ligero':
        return ['saludable', 'japonesa'];
      default:
        return [];
    }
  }
}