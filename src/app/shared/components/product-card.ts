import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { PricePipe } from '../pipes/price.pipe';
import type { Product } from '../../models/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PricePipe],
  template: `
    <article class="product-card card">
      <div class="product-image">
        <img [src]="product().image" [alt]="product().name" loading="lazy" />
        @if (!product().available) {
          <span class="badge badge-red unavailable">Agotado</span>
        }
      </div>
      <div class="product-body">
        <div class="flex items-center justify-between gap-xs">
          <h3 class="truncate">{{ product().name }}</h3>
          <span class="price">{{ product().price | price }}</span>
        </div>
        <p class="product-desc truncate-2">{{ product().description }}</p>

        @if (product().available) {
          @if (inCart() > 0) {
            <div class="qty-control">
              <button class="qty-btn" (click)="cart.decrement(product().id)" aria-label="Restar">−</button>
              <span class="qty-value">{{ inCart() }}</span>
              <button class="qty-btn" (click)="cart.increment(product().id)" aria-label="Sumar">+</button>
            </div>
          } @else {
            <button class="btn btn-primary btn-sm w-full" (click)="cart.add(product())">
              <span>Agregar</span>
            </button>
          }
        } @else {
          <button class="btn btn-secondary btn-sm w-full" disabled>No disponible</button>
        }
      </div>
    </article>
  `,
  styles: [
    `
      .product-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
      .product-image { position: relative; aspect-ratio: 4/3; overflow: hidden; }
      .product-image img { width: 100%; height: 100%; }
      .unavailable { position: absolute; top: 8px; left: 8px; }
      .product-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
      .price { font-family: var(--font-display); font-weight: 700; color: var(--accent-strong); white-space: nowrap; }
      .product-desc { font-size: 0.78rem; color: var(--text-muted); }
      .truncate-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .qty-control {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 4px;
      }
      .qty-btn {
        width: 30px; height: 30px;
        border-radius: var(--radius-xs);
        background: var(--surface-3);
        color: var(--text);
        font-weight: 700;
      }
      .qty-btn:hover { background: var(--accent); color: #fff; }
      .qty-value { font-weight: 700; min-width: 28px; text-align: center; }
      .btn[disabled] { cursor: not-allowed; opacity: 0.5; }
    `,
  ],
})
export class ProductCard {
  readonly product = input.required<Product>();

  constructor(readonly cart: CartService) {}

  readonly inCart = computed(() => this.cart.quantityOf(this.product().id));
}