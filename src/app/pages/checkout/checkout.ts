import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { RestaurantService } from '../../services/restaurant.service';
import { UserService } from '../../services/user.service';
import { APP_CONFIG } from '../../core/app.config';
import type { Order } from '../../models/models';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, PricePipe],
  template: `
    <div class="fade-in">
      @if (placed(); as confirmed) {
        <div class="success card text-center">
          <div class="success-icon">✅</div>
          <h1>¡Pedido confirmado!</h1>
          <p>
            Pedido <b class="order-id">{{ confirmed.id }}</b> · {{ confirmed.restaurantName }}.
            +{{ confirmed.xpEarned }} XP ganados.
          </p>
          <div class="success-actions">
            <a routerLink="/pedidos" class="btn btn-primary">Ver mis pedidos</a>
            <a routerLink="/" class="btn btn-secondary">Volver al inicio</a>
          </div>
        </div>
      } @else if (cart.count() === 0) {
        <div class="empty-state">
          <div class="empty-icon">🧾</div>
          <h3>No hay nada para confirmar</h3>
          <p>Tu carrito está vacío. Agrega productos antes del checkout.</p>
          <a routerLink="/explorar" class="btn btn-primary mt-md">Ir a explorar</a>
        </div>
      } @else {
        <header class="page-header">
          <h1>Checkout</h1>
          <p>Revisa tu pedido y confirma.</p>
        </header>

        <div class="checkout-grid">
          <div class="checkout-forms">
            <section class="card form-section">
              <h3>📍 Dirección de entrega</h3>
              <div class="address-list">
                @for (addr of userService.user().addresses; track addr.id) {
                  <label class="address-opt" [class.selected]="addressId === addr.id">
                    <input type="radio" name="address" [value]="addr.id" [(ngModel)]="addressId" />
                    <div>
                      <b>{{ addr.label }}</b>
                      <p>{{ addr.street }} · {{ addr.district }}</p>
                      <p class="ref">{{ addr.reference }}</p>
                    </div>
                  </label>
                }
              </div>

              <details class="add-address">
                <summary>+ Agregar nueva dirección</summary>
                <div class="new-address">
                  <input class="input" placeholder="Etiqueta (Casa, Oficina…)" [(ngModel)]="newLabel" name="nl" />
                  <input class="input" placeholder="Calle y número" [(ngModel)]="newStreet" name="ns" />
                  <input class="input" placeholder="Distrito" [(ngModel)]="newDistrict" name="nd" />
                  <input class="input" placeholder="Referencia" [(ngModel)]="newReference" name="nr" />
                  <button class="btn btn-secondary btn-sm" (click)="saveAddress()" [disabled]="!newStreet.trim()">
                    Guardar dirección
                  </button>
                </div>
              </details>
            </section>

            <section class="card form-section">
              <h3>💳 Método de pago</h3>
              <label class="payment-opt" [class.selected]="payment === 'efectivo'">
                <input type="radio" name="payment" value="efectivo" [(ngModel)]="payment" />
                <b>Efectivo</b>
              </label>
              <label class="payment-opt" [class.selected]="payment === 'tarjeta'">
                <input type="radio" name="payment" value="tarjeta" [(ngModel)]="payment" />
                <b>Tarjeta (simulado)</b>
              </label>
              <label class="payment-opt" [class.selected]="payment === 'yape'">
                <input type="radio" name="payment" value="yape" [(ngModel)]="payment" />
                <b>Yape / Plin (simulado)</b>
              </label>
              <p class="payment-note">🔒 No se procesan pagos reales en este prototipo.</p>
            </section>
          </div>

          <aside class="summary card">
            <h3>Tu pedido</h3>
            <ul class="sum-items">
              @for (item of cart.items(); track item.product.id) {
                <li>
                  <span>{{ item.quantity }}× {{ item.product.name }}</span>
                  <span>{{ item.product.price * item.quantity | price }}</span>
                </li>
              }
            </ul>
            <div class="divider"></div>
            <div class="sum-row"><span>Subtotal</span><span>{{ cart.subtotal() | price }}</span></div>
            <div class="sum-row"><span>Delivery</span><span>{{ cart.deliveryFee() === 0 ? 'Gratis' : (cart.deliveryFee() | price) }}</span></div>
            <div class="sum-row total"><span>Total</span><b>{{ cart.total() | price }}</b></div>
            <button class="btn btn-primary w-full mt-sm" (click)="confirm()">
              Confirmar pedido · {{ cart.total() | price }}
            </button>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .checkout-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 28px; align-items: start; }
      .checkout-forms { display: flex; flex-direction: column; gap: 20px; }
      .form-section { display: flex; flex-direction: column; gap: 14px; }
      .form-section h3 { font-size: 1rem; }
      .address-list { display: flex; flex-direction: column; gap: 10px; }
      .address-opt, .payment-opt {
        display: flex; align-items: flex-start; gap: 10px;
        padding: 12px; border: 1px solid var(--border-soft);
        border-radius: var(--radius-sm); cursor: pointer; background: var(--surface-2);
      }
      .address-opt.selected, .payment-opt.selected { border-color: var(--accent); background: var(--accent-soft); }
      .address-opt p { font-size: 0.8rem; color: var(--text-secondary); }
      .ref { color: var(--text-muted) !important; font-size: 0.75rem !important; }
      .add-address summary { font-size: 0.85rem; color: var(--accent-strong); cursor: pointer; margin-top: 4px; }
      .new-address { display: flex; flex-direction: column; gap: 10px; padding-top: 10px; }
      .input {
        width: 100%;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 10px 12px;
        font-size: 0.88rem;
        outline: none;
      }
      .input:focus { border-color: var(--accent); }
      .payment-opt { align-items: center; }
      .payment-note { font-size: 0.75rem; color: var(--text-muted); }
      .summary { position: sticky; top: 88px; display: flex; flex-direction: column; gap: 8px; }
      .sum-items { display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow: auto; }
      .sum-items li { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); }
      .sum-row { display: flex; justify-content: space-between; font-size: 0.92rem; }
      .sum-row.total { font-size: 1.1rem; }
      .sum-row.total b { font-family: var(--font-display); color: var(--accent-strong); }
      .success { max-width: 520px; margin: 40px auto; display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 40px; }
      .success-icon { font-size: 3rem; }
      .success p { font-size: 0.95rem; }
      .order-id { color: var(--accent-strong); }
      .success-actions { display: flex; gap: 12px; margin-top: 8px; flex-wrap: wrap; justify-content: center; }
      .btn[disabled] { cursor: not-allowed; opacity: .6; }
      @media (max-width: 960px) { .checkout-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class CheckoutPage {
  protected readonly cart = inject(CartService);
  protected readonly orderService = inject(OrderService);
  protected readonly userService = inject(UserService);
  private readonly restaurants = inject(RestaurantService);

  protected readonly threshold = APP_CONFIG.freeDeliveryThreshold;

  addressId = '';
  payment = 'efectivo';

  newLabel = '';
  newStreet = '';
  newDistrict = '';
  newReference = '';

  placedSignal: Order | null = null;

  constructor() {
    this.addressId = this.userService.user().addresses[0]?.id ?? '';
  }

  placed(): Order | null {
    return this.placedSignal;
  }

  saveAddress(): void {
    this.userService.addAddress(
      this.newLabel.trim() || 'Nueva dirección',
      this.newStreet.trim(),
      this.newDistrict.trim() || '—',
      this.newReference.trim(),
    );
    this.addressId = this.userService.user().addresses.at(-1)!.id;
    this.newStreet = '';
    this.newLabel = '';
    this.newDistrict = '';
    this.newReference = '';
  }

  confirm(): void {
    const items = this.cart.items();
    if (!items.length) return;
    const restaurantId = items[0].product.restaurantId;
    const restaurant = this.restaurants.getById(restaurantId)!;
    const order = this.orderService.placeOrder({
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        category: restaurant.category,
        image: restaurant.image,
      },
      items,
      subtotal: this.cart.subtotal(),
      deliveryFee: this.cart.deliveryFee(),
      total: this.cart.total(),
    });
    this.placedSignal = order;
    this.cart.clear();
  }
}