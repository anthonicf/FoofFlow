import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { GamificationService } from '../services/gamification.service';
import { UserService } from '../services/user.service';
import { SearchBar } from '../shared/components/search-bar';

@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchBar, RouterLink],
  template: `
    <header class="topbar">
      <div class="topbar-search">
        <app-search-bar
          placeholder="Buscar restaurantes, platos o categorías…"
          (search)="goSearch($event)"
        />
      </div>

      <div class="topbar-actions">
        <div class="xp-pill" title="Puntos de experiencia">
          <span class="xp-icon">⚡</span>
          <b>{{ xp() }}</b> XP
        </div>

        <a routerLink="/carrito" class="cart-btn" aria-label="Abrir carrito">
          <span class="cart-icon">🛒</span>
          @if (count() > 0) {
            <span class="count-badge">{{ count() }}</span>
          }
        </a>

        <a routerLink="/mi-perfil" class="avatar-link">
          <img [src]="user().avatar" alt="{{ user().name }}" />
        </a>
      </div>
    </header>
  `,
  styles: [
    `
      .topbar {
        position: sticky;
        top: 0;
        z-index: 40;
        display: flex;
        align-items: center;
        gap: 16px;
        height: var(--topbar-h);
        padding: 0 32px;
        background: rgba(13,15,18,0.85);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--border-soft);
      }
      .topbar-search { flex: 1; max-width: 520px; }
      .topbar-actions { display: flex; align-items: center; gap: 12px; margin-left: auto; }
      .xp-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--gold);
        color: #1a1203;
        font-size: 0.78rem;
        font-weight: 700;
        padding: 6px 12px;
        border-radius: 999px;
      }
      .xp-icon { font-size: 0.9rem; }
      .cart-btn {
        position: relative;
        width: 42px; height: 42px;
        display: flex; align-items: center; justify-content: center;
        border-radius: var(--radius-sm);
        background: var(--surface);
        border: 1px solid var(--border);
        cursor: pointer;
        transition: all 0.2s;
      }
      .cart-btn:hover { border-color: var(--accent); background: var(--accent-soft); }
      .cart-icon { font-size: 1.05rem; }
      .count-badge {
        position: absolute;
        top: -6px; right: -6px;
        min-width: 20px; height: 20px;
        display: flex; align-items: center; justify-content: center;
        background: var(--accent);
        color: #fff;
        font-size: 0.7rem;
        font-weight: 700;
        border-radius: 999px;
        padding: 0 5px;
        box-shadow: 0 2px 8px rgba(255,115,56,.4);
      }
      .avatar-link img {
        width: 38px; height: 38px;
        border-radius: 50%;
        border: 2px solid var(--border);
      }
      .avatar-link img:hover { border-color: var(--accent); }
    `,
  ],
})
export class Topbar {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly gamification = inject(GamificationService);
  private readonly userService = inject(UserService);

  protected readonly count = this.cartService.count;
  protected readonly xp = this.gamification.xp;
  protected readonly user = this.userService.user;

  goSearch(query: string): void {
    this.router.navigate(['/explorar'], { queryParams: { q: query || null } });
  }
}