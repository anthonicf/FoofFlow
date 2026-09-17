import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_CONFIG } from '../core/app.config';
import { GamificationService } from '../services/gamification.service';
import { UserService } from '../services/user.service';
import { NAV_ITEMS } from './nav-items';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <a routerLink="/" class="brand">
        <span class="brand-icon">🍜</span>
        <span class="brand-name">{{ appName }}</span>
      </a>

      <nav class="nav">
        @for (item of NAV_ITEMS; track item.path) {
          <a
            class="nav-link"
            [routerLink]="item.path"
            routerLinkActive="nav-active"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="side-spacer"></div>

      <a routerLink="/mi-perfil" class="user-card">
        <img [src]="user().avatar" alt="" class="avatar" />
        <div class="user-info">
          <b>{{ user().name }}</b>
          <span class="level-tag">Nivel {{ level().level.number }} · {{ level().level.title }}</span>
          <div class="mini-xp">
            <div class="mini-fill" [style.width.%]="level().pct"></div>
          </div>
        </div>
      </a>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        height: 100vh;
        position: sticky;
        top: 0;
        display: flex;
        flex-direction: column;
        padding: 20px 14px;
        background: var(--surface);
        border-right: 1px solid var(--border-soft);
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 8px 20px;
      }
      .brand-icon {
        font-size: 1.5rem;
        filter: drop-shadow(0 0 10px rgba(255,115,56,.4));
      }
      .brand-name {
        font-family: var(--font-display);
        font-weight: 800;
        font-size: 1.25rem;
        background: linear-gradient(135deg, var(--accent-strong), var(--gold));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .nav { display: flex; flex-direction: column; gap: 4px; }
      .nav-link {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 600;
        transition: all 0.2s;
      }
      .nav-link:hover { color: var(--text); background: var(--surface-2); }
      .nav-link.nav-active {
        color: var(--accent-strong);
        background: var(--accent-soft);
        box-shadow: inset 0 0 0 1px rgba(255,115,56,.25);
      }
      .nav-icon { font-size: 1.05rem; width: 22px; text-align: center; }
      .side-spacer { flex: 1; }
      .user-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: var(--radius);
        background: var(--bg-soft);
        border: 1px solid var(--border-soft);
        transition: border-color 0.2s;
      }
      .user-card:hover { border-color: var(--border); }
      .avatar {
        width: 42px; height: 42px;
        border-radius: 50%;
        border: 2px solid var(--accent);
      }
      .user-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .user-info b { font-size: 0.88rem; }
      .level-tag { font-size: 0.72rem; color: var(--text-muted); }
      .mini-xp {
        height: 5px;
        background: var(--surface-3);
        border-radius: 999px;
        overflow: hidden;
        margin-top: 4px;
      }
      .mini-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent), var(--gold));
        border-radius: 999px;
      }
    `,
  ],
})
export class Sidebar {
  protected readonly appName = APP_CONFIG.name;
  protected readonly NAV_ITEMS = NAV_ITEMS;

  private readonly userService = inject(UserService);
  private readonly gamification = inject(GamificationService);

  protected readonly user = this.userService.user;
  protected readonly level = this.gamification.levelInfo;
}