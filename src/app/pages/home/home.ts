import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../core/app.config';
import { CATEGORIES } from '../../data/data';
import { IMG } from '../../data/images';
import { GamificationService } from '../../services/gamification.service';
import { RecommendationService } from '../../services/recommendation.service';
import { RestaurantService } from '../../services/restaurant.service';
import { UserService } from '../../services/user.service';
import { CategoryCard } from '../../shared/components/category-card';
import { MissionCard } from '../../shared/components/mission-card';
import { ProgressBar } from '../../shared/components/progress-bar';
import { RestaurantCard } from '../../shared/components/restaurant-card';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CategoryCard, RestaurantCard, MissionCard, ProgressBar],
  template: `
    <div class="fade-in">
      <!-- Bienvenida -->
      <section class="hero">
        <div class="hero-copy">
          <p class="hero-greet">Hola, {{ user().name }} 👋</p>
          <h1 class="hero-title">¿Qué se te antoja hoy?</h1>
          <p class="hero-sub">
            Descubre restaurantes, deja que {{ appName }} te sorprenda y suma XP por cada bocado.
          </p>
          <div class="hero-actions">
            <a routerLink="/sorprendeme" class="btn btn-primary">🎲 Sorpréndeme</a>
            <a routerLink="/recomendaciones" class="btn btn-secondary">✨ Ver recomendaciones</a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-ring ring-1"></div>
          <div class="hero-ring ring-2"></div>
          <img class="hero-img" [src]="heroImage" alt="Plato gastronómico" />
        </div>
      </section>

      <!-- Categorías -->
      <section class="section">
        <h2 class="section-title">Categorías</h2>
        <div class="categories-scroll">
          @for (c of categories; track c.id) {
            <app-category-card [category]="c" />
          }
        </div>
      </section>

      <div class="home-grid">
        <div class="home-main">
          <!-- Recomendaciones -->
          <section class="section">
            <div class="flex items-center justify-between mb-sm">
              <h2 class="section-title">Recomendado para ti</h2>
              <a routerLink="/recomendaciones" class="link-more">Ver todos →</a>
            </div>
            @if (recommended().length) {
              <div class="grid grid-2">
                @for (rec of recommended(); track rec.restaurant.id) {
                  <app-restaurant-card [restaurant]="rec.restaurant" />
                }
              </div>
            }
          </section>

          <!-- Populares -->
          <section class="section">
            <div class="flex items-center justify-between mb-sm">
              <h2 class="section-title">Populares cerca de ti</h2>
              <a routerLink="/explorar" class="link-more">Explorar →</a>
            </div>
            <div class="grid grid-2">
              @for (r of popular(); track r.id) {
                <app-restaurant-card [restaurant]="r" />
              }
            </div>
          </section>
        </div>

        <!-- Columna contextual -->
        <aside class="home-aside">
          <section class="card level-card">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-muted" style="font-size:.78rem;">Tu progreso</span>
                <h3 class="level-title">Nivel {{ level().level.number }} · {{ level().level.title }}</h3>
              </div>
              <span class="badge badge-gold">⚡ {{ xp() }} XP</span>
            </div>
            <app-progress-bar class="mt-sm" [value]="level().pct" [label]="xpLabel()" [showPercent]="true" />
            <a routerLink="/gamificacion" class="btn btn-secondary btn-sm w-full mt-sm">Ver gamificación</a>
          </section>

          @if (activeMission()) {
            <section class="card mission-card-side">
              <div class="flex items-center justify-between">
                <h3 class="level-title">Misión activa</h3>
                <span class="badge badge-accent mt-xs">+{{ activeMission()!.reward }} XP</span>
              </div>
              <app-mission-card [mission]="activeMission()!" (claim)="claim($event)" />
            </section>
          }

          <section class="card promo-card">
            <div class="promo-text">
              <h3>¿Sin hambre decidir?</h3>
              <p>Elige un antojo y deja que el sistema te recomiende.</p>
              <a routerLink="/sorprendeme" class="btn btn-primary btn-sm">Empezar 🎲</a>
            </div>
          </section>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .hero {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 24px;
        align-items: center;
        padding: 36px 32px 40px;
        border-radius: var(--radius);
        background:
          radial-gradient(600px 300px at 15% 0%, var(--accent-soft), transparent 60%),
          radial-gradient(500px 260px at 90% 10%, rgba(255,180,84,0.08), transparent 60%),
          var(--surface);
        border: 1px solid var(--border-soft);
        position: relative;
        overflow: hidden;
      }
      .hero-greet { font-weight: 700; color: var(--accent-strong); font-size: 0.95rem; }
      .hero-title { font-size: clamp(1.6rem, 3vw, 2.4rem); margin: 8px 0 10px; }
      .hero-sub { max-width: 440px; font-size: 0.95rem; }
      .hero-actions { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
      .hero-visual { position: relative; display: flex; justify-content: center; align-items: center; height: 220px; }
      .hero-img {
        width: 230px; height: 230px;
        border-radius: 50%;
        object-fit: cover;
        border: 6px solid var(--surface-2);
        box-shadow: 0 20px 50px rgba(0,0,0,.5);
        z-index: 2;
      }
      .hero-ring { position: absolute; border-radius: 50%; }
      .ring-1 { width: 300px; height: 300px; border: 1px dashed var(--border); animation: spin 40s linear infinite; }
      .ring-2 { width: 220px; height: 220px; border: 1px solid rgba(255,115,56,.25); animation: spin 30s linear infinite reverse; }
      @keyframes spin { to { transform: rotate(360deg); } }

      .section { margin-bottom: 32px; }
      .section-title { font-size: 1.25rem; margin-bottom: 16px; }
      .link-more { font-size: 0.85rem; color: var(--accent-strong); font-weight: 600; }
      .link-more:hover { text-decoration: underline; }

      .categories-scroll {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: 190px;
        gap: 14px;
        overflow-x: auto;
        padding-bottom: 8px;
        scroll-snap-type: x mandatory;
      }

      .home-grid { display: grid; grid-template-columns: 1fr 320px; gap: 28px; align-items: start; }
      .home-aside { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 88px; }
      .level-card { display: flex; flex-direction: column; gap: 4px; }
      .level-title { font-size: 1rem; }
      .mission-card-side { display: flex; flex-direction: column; gap: 12px; }

      .promo-card {
        background:
          linear-gradient(135deg, rgba(255,115,56,.18), transparent 60%),
          var(--surface);
        border: 1px dashed rgba(255,115,56,.4);
      }
      .promo-text { display: flex; flex-direction: column; gap: 8px; }
      .promo-text p { font-size: 0.85rem; }

      @media (max-width: 1100px) {
        .home-grid { grid-template-columns: 1fr; }
        .home-aside { position: static; flex-direction: row; flex-wrap: wrap; }
        .home-aside > * { flex: 1 1 240px; }
      }
      @media (max-width: 760px) {
        .hero { grid-template-columns: 1fr; padding: 24px 20px; }
        .hero-visual { display: none; }
      }
    `,
  ],
})
export class HomePage {
  private readonly userService = inject(UserService);
  private readonly gamification = inject(GamificationService);
  private readonly restaurants = inject(RestaurantService);
  private readonly recommendations = inject(RecommendationService);

  protected readonly appName = APP_CONFIG.name;
  protected readonly heroImage = IMG.hero;
  protected readonly user = this.userService.user;
  protected readonly xp = this.gamification.xp;
  protected readonly level = this.gamification.levelInfo;
  protected readonly missions = this.gamification.missions;

  protected readonly categories = CATEGORIES;

  protected readonly recommended = computed(() => this.recommendations.topRecommendations(4));

  protected readonly popular = computed(() =>
    this.restaurants.restaurants().filter((r) => r.isOpen).slice(0, 4),
  );

  protected readonly activeMission = computed(() =>
    this.missions().find((m) => !m.completed),
  );

  protected readonly xpLabel = computed(() => {
    const info = this.level();
    return info.next ? `${info.level.minXp} → ${info.next.minXp} XP` : 'Nivel máximo';
  });

  claim(missionId: string): void {
    this.gamification.claimMission(missionId);
  }
}