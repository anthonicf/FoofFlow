import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES } from '../../data/data';
import type { Restaurant } from '../../models/models';
import { fmtDistance, priceLevel } from '../utils/format';
import { RatingStars } from './rating-stars';

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RatingStars],
  template: `
    <article class="card card-hover restaurant-card">
      <a [routerLink]="['/restaurante', restaurant().id]" class="restaurant-image">
        <img [src]="restaurant().image" [alt]="restaurant().name" loading="lazy" />
        <span [class]="restaurant().isOpen ? 'badge badge-open' : 'badge badge-closed'">
          {{ restaurant().isOpen ? 'Abierto' : 'Cerrado' }}
        </span>
        <span class="badge badge-gold distance-badge">{{ fmtDistance(restaurant().distance) }}</span>
      </a>

      <div class="restaurant-body">
        <div>
          <h3 class="truncate">{{ restaurant().name }}</h3>
          <p class="category-name">{{ categoryName() }} · {{ priceLevel(restaurant().priceRange) }}</p>
        </div>
        <div class="restaurant-meta">
          <app-rating-stars [rating]="restaurant().rating" />
          <span class="meta-count">({{ restaurant().ratingCount }})</span>
        </div>
        <p class="delivery-time">🛵 {{ restaurant().deliveryTime }} min</p>
        <a [routerLink]="['/restaurante', restaurant().id]" class="btn btn-primary btn-sm w-full menu-btn">
          Ver menú
        </a>
      </div>
    </article>
  `,
  styles: [
    `
      .restaurant-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
      .restaurant-image { position: relative; display: block; aspect-ratio: 16/9; overflow: hidden; }
      .restaurant-image img { width: 100%; height: 100%; transition: transform 0.35s ease; }
      .restaurant-image:hover img { transform: scale(1.05); }
      .restaurant-image .badge { position: absolute; top: 10px; left: 10px; }
      .distance-badge { left: auto; right: 10px; }
      .restaurant-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 8px; }
      .category-name { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }
      .restaurant-meta { display: flex; align-items: center; gap: 6px; }
      .meta-count { font-size: 0.75rem; color: var(--text-muted); }
      .delivery-time { font-size: 0.8rem; color: var(--text-secondary); }
      .menu-btn { margin-top: 4px; }
    `,
  ],
})
export class RestaurantCard {
  readonly restaurant = input.required<Restaurant>();
  private readonly categories = CATEGORIES;

  protected readonly fmtDistance = fmtDistance;
  protected readonly priceLevel = priceLevel;

  categoryName(): string {
    return (
      this.categories.find((c) => c.id === this.restaurant().category)?.name ??
      this.restaurant().category
    );
  }
}