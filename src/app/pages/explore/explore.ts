import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CATEGORIES } from '../../data/data';
import type { Restaurant } from '../../models/models';
import { RestaurantService } from '../../services/restaurant.service';
import { RestaurantCard } from '../../shared/components/restaurant-card';
import { SearchBar } from '../../shared/components/search-bar';

@Component({
  selector: 'app-explore',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RestaurantCard, SearchBar],
  template: `
    <div class="fade-in">
      <header class="page-header">
        <h1>Explorar restaurantes</h1>
        <p>Busca, filtra y descubre nuevos lugares para pedir.</p>
      </header>

      <div class="controls">
        <app-search-bar
          placeholder="Buscar por nombre, plato o categoría…"
          [value]="queried()"
          (search)="setQuery($event)"
        />

        <div class="chips-scroll">
          <button
            class="chip"
            [class.chip-active]="category() === null"
            (click)="setCategory(null)"
          >Todas</button>
          @for (c of categories; track c.id) {
            <button
              class="chip"
              [class.chip-active]="category() === c.id"
              (click)="setCategory(c.id)"
            >{{ c.icon }} {{ c.name }}</button>
          }
        </div>

        <div class="filters">
          <select class="select" [value]="ratingFilter()" (change)="ratingFilter.set($any($event).target.value)">
            <option value="0">Cualquier calificación</option>
            <option value="4.5">4.5 ★ o más</option>
            <option value="4">4.0 ★ o más</option>
          </select>
          <select class="select" [value]="timeFilter()" (change)="timeFilter.set($any($event).target.value)">
            <option value="120">Cualquier tiempo</option>
            <option value="60">Hasta 60 min</option>
            <option value="40">Hasta 40 min</option>
            <option value="30">Hasta 30 min</option>
            <option value="20">Hasta 20 min</option>
          </select>
          <select class="select" [value]="sortMode()" (change)="sortMode.set($any($event).target.value)">
            <option value="recommended">Mejor puntuación</option>
            <option value="rating">Mayor calificación</option>
            <option value="time">Entrega más rápida</option>
            <option value="distance">Más cercanos</option>
          </select>
        </div>
      </div>

      <p class="results-count">{{ results().length }} restaurante(s)</p>

      @if (results().length) {
        <div class="grid grid-3">
          @for (r of results(); track r.id) {
            <app-restaurant-card [restaurant]="r" />
          }
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">🔎</div>
          <h3>Sin resultados</h3>
          <p>Prueba con otro término o quita los filtros.</p>
          <button class="btn btn-secondary mt-md" (click)="resetFilters()">Limpiar filtros</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .controls { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
      .chips-scroll {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .filters { display: flex; gap: 10px; flex-wrap: wrap; }
      .select {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 10px 12px;
        font-size: 0.85rem;
        outline: none;
        flex: 1 1 180px;
        color: var(--text);
      }
      .select:focus { border-color: var(--accent); }
      .results-count { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 14px; }
    `,
  ],
})
export class ExplorePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly restaurants = inject(RestaurantService);

  protected readonly categories = CATEGORIES;

  readonly category = signal<string | null>(null);
  readonly ratingFilter = signal('0');
  readonly timeFilter = signal('120');
  readonly sortMode = signal('recommended');
  readonly queried = signal('');

  constructor() {
    this.route.queryParams.subscribe((params) => {
      if (params['categoria']) this.category.set(params['categoria']);
      if (params['q']) this.queried.set(params['q']);
    });
  }

  protected readonly results = computed<Restaurant[]>(() => {
    let list = this.restaurants.search(this.queried());

    if (this.category()) {
      list = list.filter((r) => r.category === this.category());
    }

    const minRating = parseFloat(this.ratingFilter());
    if (minRating > 0) list = list.filter((r) => r.rating >= minRating);

    const maxTime = parseInt(this.timeFilter(), 10);
    if (maxTime < 120) list = list.filter((r) => r.deliveryTime <= maxTime);

    switch (this.sortMode()) {
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case 'time':
        list = [...list].sort((a, b) => a.deliveryTime - b.deliveryTime);
        break;
      case 'distance':
        list = [...list].sort((a, b) => a.distance - b.distance);
        break;
      default:
        list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  });

  setQuery(value: string): void {
    this.queried.set(value);
    this.router.navigate(['/explorar'], { queryParams: { q: value || null } });
  }

  setCategory(id: string | null): void {
    this.category.set(id);
    this.router.navigate(['/explorar'], {
      queryParams: { categoria: id || null },
      queryParamsHandling: 'merge',
    });
  }

  resetFilters(): void {
    this.category.set(null);
    this.ratingFilter.set('0');
    this.timeFilter.set('120');
    this.sortMode.set('recommended');
    this.queried.set('');
    this.router.navigate(['/explorar']);
  }
}