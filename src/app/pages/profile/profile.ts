import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamificationService } from '../../services/gamification.service';
import { OrderService } from '../../services/order.service';
import { RestaurantService } from '../../services/restaurant.service';
import { UserService } from '../../services/user.service';
import { OrderCard } from '../../shared/components/order-card';
import { PreferenceEditor } from '../../shared/components/preference-editor';
import { ProgressBar } from '../../shared/components/progress-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PreferenceEditor, ProgressBar, OrderCard],
  template: `
    <div class="fade-in">
      <header class="profile-hero">
        <img class="hero-avatar" [src]="user().avatar" alt="" />
        <div class="hero-info">
          <h1>{{ user().name }}</h1>
          <p>{{ user().email }}</p>
          <div class="hero-stats">
            <div class="stat"><b>{{ level().level.number }}</b><span>Nivel · {{ level().level.title }}</span></div>
            <div class="stat"><b>{{ xp() }}</b><span>XP</span></div>
            <div class="stat"><b>{{ orderService.orders().length }}</b><span>Pedidos</span></div>
            <div class="stat"><b>{{ discovered().length }}</b><span>Descubiertos</span></div>
          </div>
        </div>
      </header>

      <div class="profile-grid">
        <div class="profile-main">
          <section class="card prefs">
            <h2 class="card-title">Preferencias</h2>
            <app-preference-editor (saved)="save()" />
            @if (saved()) {
              <p class="saved-note mt-xs">✓ Preferencias guardadas</p>
            }
          </section>
        </div>

        <aside class="profile-side">
          <section class="card">
            <div class="flex items-center justify-between">
              <h2 class="card-title">Progreso</h2>
              <span class="badge badge-gold">⚡ {{ xp() }} XP</span>
            </div>
            <app-progress-bar class="mt-sm" [value]="level().pct" [label]="level().level.title" [showPercent]="true" />
            <p class="mt-xs muted">{{ progressHint() }}</p>
            <a routerLink="/gamificacion" class="btn btn-secondary btn-sm w-full mt-sm">Ver gamificación</a>
          </section>

          <section class="card">
            <h2 class="card-title">Direcciones</h2>
            <ul class="address-list">
              @for (addr of user().addresses; track addr.id) {
                <li>
                  <b>{{ addr.label }}</b>
                  <p>{{ addr.street }} · {{ addr.district }}</p>
                </li>
              }
            </ul>
          </section>

          <section class="card">
            <h2 class="card-title">Restaurantes descubiertos</h2>
            @if (discoveredRestaurants().length) {
              <div class="disc-grid">
                @for (r of discoveredRestaurants(); track r.id) {
                  <a [routerLink]="['/restaurante', r.id]" class="disc-chip">
                    <span class="disc-name">{{ r.name }}</span>
                  </a>
                }
              </div>
            } @else {
              <p class="muted">Descubre restaurantes para verlos aquí 🧭</p>
            }
          </section>
        </aside>
      </div>

      <section class="card mt-md order-history">
        <div class="flex items-center justify-between mb-sm">
          <h2 class="card-title">Historial de pedidos</h2>
          <a routerLink="/pedidos" class="link-more">Ver todos →</a>
        </div>
        @if (history().length) {
          <div class="history-list">
            @for (entry of history().slice(0, 3); track entry.order.id) {
              <app-order-card [order]="entry.order" (rate)="rate($event.id, $event.rating)" />
            }
          </div>
        } @else {
          <p class="muted">Aún no tienes pedidos registrados.</p>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .profile-hero {
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 28px;
        border-radius: var(--radius);
        background:
          radial-gradient(500px 200px at 10% 0%, var(--accent-soft), transparent 60%),
          var(--surface);
        border: 1px solid var(--border-soft);
        margin-bottom: 24px;
      }
      .hero-avatar {
        width: 96px; height: 96px;
        border-radius: 50%;
        border: 4px solid var(--accent);
        box-shadow: 0 8px 24px rgba(255,115,56,.3);
      }
      .hero-info h1 { font-size: 1.6rem; }
      .hero-info p { font-size: 0.85rem; }
      .hero-stats { display: flex; gap: 24px; margin-top: 14px; flex-wrap: wrap; }
      .stat { display: flex; flex-direction: column; align-items: center; }
      .stat b { font-family: var(--font-display); font-size: 1.3rem; color: var(--accent-strong); }
      .stat span { font-size: 0.72rem; color: var(--text-muted); }

      .profile-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 24px; align-items: start; }
      .card-title { font-size: 1.05rem; margin-bottom: 12px; }
      .profile-side { display: flex; flex-direction: column; gap: 20px; }
      .muted { color: var(--text-muted); font-size: 0.82rem; }
      .saved-note { color: var(--green); font-weight: 600; font-size: 0.85rem; }
      .address-list { display: flex; flex-direction: column; gap: 10px; }
      .address-list li { padding: 10px 12px; background: var(--surface-2); border-radius: var(--radius-sm); border: 1px solid var(--border-soft); }
      .address-list p { font-size: 0.78rem; }
      .disc-grid { display: flex; flex-wrap: wrap; gap: 8px; }
      .disc-chip { background: var(--surface-2); border: 1px solid var(--border); padding: 8px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
      .disc-chip:hover { border-color: var(--accent); color: var(--accent-strong); }
      .history-list { display: flex; flex-direction: column; gap: 14px; }
      .link-more { font-size: 0.85rem; color: var(--accent-strong); font-weight: 600; }
      .link-more:hover { text-decoration: underline; }
      @media (max-width: 960px) {
        .profile-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class ProfilePage {
  private readonly userService = inject(UserService);
  private readonly gamification = inject(GamificationService);
  protected readonly orderService = inject(OrderService);
  private readonly restaurants = inject(RestaurantService);

  protected readonly user = this.userService.user;
  protected readonly xp = this.gamification.xp;
  protected readonly level = this.gamification.levelInfo;
  protected readonly discovered = this.gamification.discoveredRestaurantIds;

  protected readonly history = this.orderService.history;

  protected readonly discoveredRestaurants = computed(() =>
    this.restaurants.byIds(this.discovered()),
  );

  protected readonly progressHint = computed(() =>
    this.level().next
      ? `Faltan ${this.level().next!.minXp - this.xp()} XP para el siguiente nivel`
      : 'Nivel máximo',
  );

  protected readonly saved = signal(false);

  save(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }

  rate(orderId: string, rating: number): void {
    this.orderService.rateOrder(orderId, rating);
  }
}