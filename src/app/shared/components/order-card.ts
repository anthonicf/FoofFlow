import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PricePipe } from '../pipes/price.pipe';
import { RatingStars } from './rating-stars';
import type { Order, OrderStatus } from '../../models/models';

const STATUS_ORDER = ['Preparando', 'En camino'];
const XP_RATE = 25;

@Component({
  selector: 'app-order-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PricePipe, RatingStars, DatePipe],
  template: `
    <article class="card order-card">
      <header class="order-head">
        <div class="flex items-center gap-sm">
          <img class="rthumb" [src]="order().restaurantImage" [alt]="order().restaurantName" />
          <div>
            <h3>{{ order().restaurantName }}</h3>
            <p class="order-date">{{ order().date | date: 'dd MMM yyyy, h:mm a' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-sm">
          <span [class]="statusBadge(order().status)">{{ order().status }}</span>
          @if (isInProgress()) {
            <button class="btn btn-ghost btn-sm" (click)="advance.emit(order().id)">
              ⏭ Avanzar
            </button>
          }
        </div>
      </header>

      <ul class="items">
        @for (item of order().items; track item.productId) {
          <li class="item">
            <img class="ithumb" [src]="item.image" alt="" />
            <span class="i-name">{{ item.name }} <b>×{{ item.quantity }}</b></span>
            <span class="i-price">{{ item.price * item.quantity | price }}</span>
          </li>
        }
      </ul>

      <footer class="order-foot">
        <div class="flex items-center justify-between">
          <div>
            @if (order().rating === undefined) {
              @if (canRate()) {
                <div class="rate-box">
                  <span class="rate-hint">Valora tu pedido (+{{ XP_RATE }} XP)</span>
                  <div class="stars">
                    @for (star of [1, 2, 3, 4, 5]; track star) {
                      <button
                        class="star-btn"
                        [class.on]="star <= hover()"
                        (mouseenter)="hover.set(star)"
                        (mouseleave)="hover.set(0)"
                        (click)="rate.emit({ id: order().id, rating: star })"
                      >★</button>
                    }
                  </div>
                </div>
              } @else {
                @if (order().status === 'Cancelado') {
                  <span class="rate-hint">Pedido cancelado</span>
                } @else {
                  <span class="badge badge-accent">+{{ XP_RATE }} XP al valorar</span>
                }
              }
            } @else {
              <app-rating-stars [rating]="order().rating ?? 0" [dim]="true" />
            }
          </div>
          <b class="order-total">{{ order().total | price }}</b>
        </div>
      </footer>
    </article>
  `,
  styles: [
    `
      .order-card { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
      .order-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
      .rthumb { width: 48px; height: 48px; border-radius: var(--radius-sm); }
      .order-date { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
      .items { display: flex; flex-direction: column; gap: 8px; }
      .item { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; }
      .ithumb { width: 34px; height: 34px; border-radius: var(--radius-xs); flex-shrink: 0; }
      .i-name { flex: 1; color: var(--text-secondary); }
      .i-name b { color: var(--text); }
      .i-price { font-weight: 600; color: var(--text-secondary); white-space: nowrap; }
      .order-foot { border-top: 1px solid var(--border); padding-top: 12px; }
      .order-head h3 { font-size: 1rem; }
      .rate-box { display: flex; align-items: center; gap: 8px; }
      .rate-hint { font-size: 0.78rem; color: var(--text-muted); }
      .stars { display: flex; gap: 2px; }
      .star-btn { font-size: 1.15rem; color: var(--surface-3); transition: transform 0.1s; }
      .star-btn.on { color: var(--gold); }
      .star-btn:hover { transform: scale(1.2); }
      .order-total { font-family: var(--font-display); font-size: 1.05rem; color: var(--accent-strong); }
    `,
  ],
})
export class OrderCard {
  readonly order = input.required<Order>();
  readonly advance = output<string>();
  readonly rate = output<{ id: string; rating: number }>();

  readonly hover = signal(0);

  protected readonly XP_RATE = XP_RATE;

  protected readonly isInProgress = () =>
    STATUS_ORDER.includes(this.order().status);

  protected readonly canRate = () => this.order().status === 'Entregado';

  protected statusBadge(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      Preparando: 'badge badge-gold',
      'En camino': 'badge badge-blue',
      Entregado: 'badge badge-green',
      Cancelado: 'badge badge-red',
    };
    return map[status];
  }
}