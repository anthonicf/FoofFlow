import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { PricePipe } from '../pipes/price.pipe';
import type { CartItem } from '../../models/models';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PricePipe],
  template: `
    <div class="cart-item">
      <img class="thumb" [src]="item().product.image" [alt]="item().product.name" loading="lazy" />
      <div class="info">
        <div class="flex items-center justify-between gap-xs">
          <h4 class="name">{{ item().product.name }}</h4>
          <b class="line-total">{{ item().product.price * item().quantity | price }}</b>
        </div>
        <p class="unit">{{ item().product.price | price }} c/u</p>

        <div class="actions">
          <div class="qty-control">
            <button class="qty-btn" (click)="cart.decrement(item().product.id)" aria-label="Restar">−</button>
            <span class="qty-value">{{ item().quantity }}</span>
            <button class="qty-btn" (click)="cart.increment(item().product.id)" aria-label="Sumar">+</button>
          </div>
          <button class="remove" (click)="cart.remove(item().product.id)">Eliminar</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cart-item { display: flex; gap: 14px; padding: 12px; background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius); }
      .thumb { width: 76px; height: 76px; border-radius: var(--radius-sm); flex-shrink: 0; }
      .info { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
      .name { font-size: 0.92rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .line-total { font-family: var(--font-display); color: var(--accent-strong); white-space: nowrap; }
      .unit { font-size: 0.78rem; color: var(--text-muted); }
      .actions { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
      .qty-control { display: flex; align-items: center; gap: 8px; }
      .qty-btn {
        width: 28px; height: 28px;
        border-radius: var(--radius-xs);
        background: var(--surface-2);
        border: 1px solid var(--border);
        font-weight: 700;
      }
      .qty-btn:hover { background: var(--accent); color: #fff; }
      .qty-value { font-weight: 700; min-width: 24px; text-align: center; }
      .remove { font-size: 0.78rem; color: var(--red); font-weight: 600; }
      .remove:hover { text-decoration: underline; }
    `,
  ],
})
export class CartItemComponent {
  readonly item = input.required<CartItem>();

  constructor(readonly cart: CartService) {}
}