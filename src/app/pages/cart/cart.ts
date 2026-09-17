import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItemComponent } from '../../shared/components/cart-item';
import { PricePipe } from '../../shared/pipes/price.pipe';
import { APP_CONFIG } from '../../core/app.config';

@Component({
  selector: 'app-cart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CartItemComponent, PricePipe],
  template: `
    <div class="fade-in">
      <header class="page-header">
        <h1>Mi carrito</h1>
        @if (cart.count() > 0) {
          <p>{{ cart.count() }} artículo(s)</p>
        }
      </header>

      @if (cart.count() === 0) {
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3>Tu carrito está vacío</h3>
          <p>Explora restaurantes y agrega productos que te gusten.</p>
          <a routerLink="/explorar" class="btn btn-primary mt-md">Ir a explorar</a>
        </div>
      } @else {
        <div class="cart-grid">
          <div class="cart-list">
            @for (item of cart.items(); track item.product.id) {
              <app-cart-item [item]="item" />
            }
            <button class="btn btn-ghost" (click)="cart.clear()">🗑 Vaciar carrito</button>
          </div>

          <div class="cart-summary card">
            <h3>Resumen del pedido</h3>
            <div class="summary-row"><span>Subtotal</span><span>{{ cart.subtotal() | price }}</span></div>
            <div class="summary-row">
              <span>Delivery</span>
              @if (cart.deliveryFee() === 0) {
                <span class="free">¡Gratis!</span>
              } @else {
                <span>{{ cart.deliveryFee() | price }}</span>
              }
            </div>
            @if (cart.subtotal() > 0 && cart.subtotal() < threshold) {
              <p class="free-hint">Agrega {{ threshold - cart.subtotal() | price }} más para delivery gratis 🎉</p>
            }
            <div class="divider"></div>
            <div class="summary-row total-row"><span>Total</span><b>{{ cart.total() | price }}</b></div>
            <a routerLink="/checkout" class="btn btn-primary w-full mt-sm">Ir al checkout →</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .cart-grid { display: grid; grid-template-columns: 1fr 340px; gap: 28px; align-items: start; }
      .cart-list { display: flex; flex-direction: column; gap: 14px; }
      .cart-summary { display: flex; flex-direction: column; gap: 12px; position: sticky; top: 88px; }
      .summary-row { display: flex; justify-content: space-between; font-size: 0.9rem; }
      .free { color: var(--green); font-weight: 600; }
      .free-hint { font-size: 0.78rem; color: var(--gold); font-weight: 600; }
      .total-row { font-size: 1.05rem; }
      .total-row b { font-family: var(--font-display); color: var(--accent-strong); }
      .btn[disabled] { cursor: not-allowed; opacity: .5; }
      @media (max-width: 960px) { .cart-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class CartPage {
  protected readonly cart = inject(CartService);
  protected readonly threshold = APP_CONFIG.freeDeliveryThreshold;
}