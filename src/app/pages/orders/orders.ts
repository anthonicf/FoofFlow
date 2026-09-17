import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderCard } from '../../shared/components/order-card';

@Component({
  selector: 'app-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, OrderCard],
  template: `
    <div class="fade-in">
      <header class="page-header">
        <h1>Mis pedidos</h1>
        <p>Sigue tus pedidos activos y revisa tu historial.</p>
      </header>

      <div class="tabs">
        <button class="tab" [class.tab-active]="tab() === 'activos'" (click)="tab.set('activos')">
          Activos @if (orderService.activeOrders().length) { <b>{{ orderService.activeOrders().length }}</b> }
        </button>
        <button class="tab" [class.tab-active]="tab() === 'historial'" (click)="tab.set('historial')">
          Historial
        </button>
      </div>

      @if (tab() === 'activos') {
        @if (orderService.activeOrders().length) {
          <div class="orders-list">
            @for (entry of orderService.activeOrders(); track entry.order.id) {
              <app-order-card
                [order]="entry.order"
                (advance)="orderService.advanceStatus($event)"
              />
            }
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No tienes pedidos activos</h3>
            <p>Haz un pedido y sigue su estado aquí.</p>
            <a routerLink="/explorar" class="btn btn-primary mt-md">Hacer un pedido</a>
          </div>
        }
      }

      @if (tab() === 'historial') {
        @if (orderService.history().length) {
          <div class="orders-list">
            @for (entry of orderService.history(); track entry.order.id) {
              <app-order-card
                [order]="entry.order"
                (rate)="rate($event.id, $event.rating)"
              />
            }
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-icon">🗂️</div>
            <h3>Tu historial está vacío</h3>
            <p>Los pedidos completados aparecerán aquí.</p>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .tabs { display: flex; gap: 8px; margin-bottom: 22px; }
      .tab {
        padding: 10px 18px;
        border-radius: var(--radius-sm);
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--text-secondary);
        background: var(--surface);
        border: 1px solid var(--border-soft);
      }
      .tab b { color: var(--accent-strong); margin-left: 4px; }
      .tab-active { color: var(--text); border-color: var(--accent); background: var(--accent-soft); }
      .orders-list { display: flex; flex-direction: column; gap: 16px; }
    `,
  ],
})
export class OrdersPage {
  protected readonly orderService = inject(OrderService);
  protected readonly tab = signal<'activos' | 'historial'>('activos');

  rate(orderId: string, rating: number): void {
    this.orderService.rateOrder(orderId, rating);
  }
}