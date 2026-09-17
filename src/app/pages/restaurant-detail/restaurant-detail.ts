import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CATEGORIES } from '../../data/data';
import { ProductService } from '../../services/product.service';
import { RestaurantService } from '../../services/restaurant.service';
import { ProductCard } from '../../shared/components/product-card';
import { RatingStars } from '../../shared/components/rating-stars';
import { fmtDistance, priceLevel } from '../../shared/utils/format';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCard, RatingStars],
  template: `
    @if (restaurant(); as r) {
      <div class="fade-in">
        <button class="back-btn" (click)="goBack()">← Volver a explorar</button>

        <section class="hero">
          <img class="hero-bg" [src]="r.image" [alt]="r.name" />
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <div class="flex items-center gap-sm">
              <span [class]="r.isOpen ? 'badge badge-open' : 'badge badge-closed'">
                {{ r.isOpen ? 'Abierto ahora' : 'Cerrado' }}
              </span>
              <span class="badge badge-gold">{{ categoryName(r.category) }}</span>
            </div>
            <h1>{{ r.name }}</h1>
            <p>{{ r.description }}</p>
            <div class="hero-meta">
              <app-rating-stars [rating]="r.rating" />
              <span class="meta-item">🛵 {{ r.deliveryTime }} min</span>
              <span class="meta-item">📍 {{ fmtDistance(r.distance) }}</span>
              <span class="meta-item">{{ priceLevel(r.priceRange) }}</span>
            </div>
          </div>
        </section>

        <div class="menu">
          @for (group of menuGroups(); track group.name) {
            <section class="section">
              <h2 class="menu-cat">{{ group.name }}</h2>
              <div class="product-grid">
                @for (p of group.products; track p.id) {
                  <app-product-card [product]="p" />
                }
              </div>
            </section>
          }
        </div>
      </div>
    } @else {
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>Restaurante no encontrado</h3>
        <a routerLink="/explorar" class="btn btn-secondary mt-md">Ir a explorar</a>
      </div>
    }
  `,
  styles: [
    `
      .back-btn {
        font-size: 0.85rem;
        color: var(--text-secondary);
        font-weight: 600;
        margin-bottom: 16px;
        padding: 6px 10px;
        border-radius: var(--radius-xs);
      }
      .back-btn:hover { color: var(--text); background: var(--surface); }

      .hero {
        position: relative;
        border-radius: var(--radius);
        overflow: hidden;
        height: 300px;
        margin-bottom: 28px;
      }
      .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .hero-overlay {
        position: absolute; inset: 0;
        background: linear-gradient(to top, rgba(10,12,15,0.95) 0%, rgba(10,12,15,0.25) 55%, rgba(10,12,15,0.4) 100%);
      }
      .hero-content {
        position: absolute;
        inset: auto 0 0 0;
        padding: 24px 28px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .hero-content h1 { font-size: 1.9rem; }
      .hero-content p { font-size: 0.9rem; max-width: 640px; }
      .hero-meta { display: flex; align-items: center; gap: 16px; margin-top: 8px; flex-wrap: wrap; }
      .meta-item { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; }

      .section { margin-bottom: 30px; }
      .menu-cat { font-size: 1.1rem; margin-bottom: 14px; }
      .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
      }
    `,
  ],
})
export class RestaurantDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly restaurants = inject(RestaurantService);
  private readonly products = inject(ProductService);

  private readonly id = signal('');
  readonly restaurant = computed(() => this.restaurants.getById(this.id()));

  protected readonly menuGroups = computed(() => {
    const r = this.restaurant();
    if (!r) return [];
    const list = this.products.byRestaurant(r.id, true);
    const map = new Map<string, typeof list>();
    for (const p of list) {
      const key = p.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return [...map.entries()].map(([name, products]) => ({ name, products }));
  });

  protected readonly fmtDistance = fmtDistance;
  protected readonly priceLevel = priceLevel;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const restaurantId = params.get('id') ?? '';
      this.id.set(restaurantId);
      if (restaurantId) {
        // Visitar el menú cuenta como "restaurante descubierto" (+100 XP la primera vez).
        this.restaurants.discover(restaurantId);
      }
    });
  }

  categoryName(id: string): string {
    return CATEGORIES.find((c) => c.id === id)?.name ?? id;
  }

  goBack(): void {
    window.history.length > 1
      ? window.history.back()
      : window.location.assign('/explorar');
  }
}