import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../services/cart.service';

/** Navegación compacta para pantallas pequeñas (<=960px). */
@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="mobile-nav">
      @for (item of NAV_ITEMS.slice(0, 5); track item.path) {
        <a
          class="m-link"
          [routerLink]="item.path"
          routerLinkActive="m-active"
          [routerLinkActiveOptions]="{ exact: item.path === '/' }"
        >
          <span class="m-icon">{{ item.icon }}</span>
          <span class="m-label">{{ item.label }}</span>
        </a>
      }
      <a class="m-link" routerLink="/carrito" routerLinkActive="m-active" [class.has-badge]="count() > 0">
        <span class="m-icon">🛒</span>
        <span class="m-label">Carrito</span>
        @if (count() > 0) {
          <span class="m-count">{{ count() }}</span>
        }
      </a>
    </nav>
  `,
  styles: [
    `
      .mobile-nav {
        display: none;
        position: fixed;
        bottom: 0; left: 0; right: 0;
        z-index: 50;
        background: var(--surface);
        border-top: 1px solid var(--border);
        justify-content: space-around;
        padding-bottom: env(safe-area-inset-bottom, 8px);
      }
      .m-link {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 10px 4px 8px;
        font-size: 0.62rem;
        font-weight: 600;
        color: var(--text-muted);
        position: relative;
      }
      .m-icon { font-size: 1.15rem; }
      .m-link.m-active { color: var(--accent-strong); }
      .m-count {
        position: absolute;
        top: 6px;
        min-width: 16px; height: 16px;
        padding: 0 4px;
        background: var(--accent);
        color: #fff;
        border-radius: 999px;
        font-size: 0.62rem;
        display: flex; align-items: center; justify-content: center;
      }
      @media (max-width: 960px) {
        .mobile-nav { display: flex; }
      }
    `,
  ],
})
export class MobileNav {
  protected readonly NAV_ITEMS: { label: string; path: string; icon: string }[] = [
    { label: 'Inicio', path: '/', icon: '🏠' },
    { label: 'Explorar', path: '/explorar', icon: '🧭' },
    { label: 'Recomend.', path: '/recomendaciones', icon: '✨' },
    { label: 'Pedidos', path: '/pedidos', icon: '🧾' },
    { label: 'Grupo', path: '/pedido-grupal', icon: '👥' },
  ];

  private readonly cartService = inject(CartService);

  protected readonly count = this.cartService.count;
}