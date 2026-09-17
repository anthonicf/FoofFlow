import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GamificationService } from '../../services/gamification.service';
import { RestaurantService } from '../../services/restaurant.service';
import { MissionCard } from '../../shared/components/mission-card';
import { ProgressBar } from '../../shared/components/progress-bar';

@Component({
  selector: 'app-gamification',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MissionCard, ProgressBar, DatePipe],
  template: `
    <div class="fade-in">
      <header class="page-header">
        <h1>Gamificación</h1>
        <p>Gana XP, completa misiones y descubre restaurantes.</p>
      </header>

      <div class="gam-grid">
        <!-- Nivel -->
        <section class="card level-banner">
          <div class="level-left">
            <div class="level-badge">
              <span class="level-num">{{ level().level.number }}</span>
            </div>
            <div>
              <span class="text-muted" style="font-size:.8rem;">Nivel</span>
              <h2 class="level-name">{{ level().level.title }}</h2>
            </div>
          </div>
          <div class="level-right">
            <div class="flex items-center justify-between">
              <span class="xp-total">⚡ {{ xp() }} XP</span>
              <span class="next-hint">
                @if (level().next) {
                  Faltan {{ xpToNext() }} XP para Nivel {{ nextLevelNumber() }}
                } @else {
                  ¡Nivel máximo alcanzado!
                }
              </span>
            </div>
            <app-progress-bar class="mt-xs" [value]="level().pct" />
            <p class="range-hint">{{ level().level.minXp }} → {{ level().next?.minXp ?? '—' }} XP</p>
          </div>
        </section>

        <!-- XP reciente -->
        <section class="card xp-feed">
          <h3>Actividad reciente</h3>
          @if (events().length) {
            <ul class="feed">
              @for (e of events(); track $index) {
                <li>
                  <span class="feed-xp">+{{ e.amount }}</span>
                  <span class="feed-reason">{{ e.reason }}</span>
                  <span class="feed-date">{{ e.date | date: 'HH:mm' }}</span>
                </li>
              }
            </ul>
          } @else {
            <p class="muted">Realiza acciones para ganar XP. Empieza explorando restaurantes ✨</p>
          }
        </section>

        <!-- Misiones -->
        <section class="section missions">
          <h2 class="section-title">Misiones</h2>
          <div class="missions-grid">
            @for (mission of missions(); track mission.id) {
              <app-mission-card [mission]="mission" (claim)="claimMission($event)" />
            }
          </div>
        </section>

        <!-- Logros -->
        <section class="section achievements">
          <h2 class="section-title">Logros</h2>
          <div class="ach-grid">
            @for (ach of achievements(); track ach.id) {
              <div class="ach card" [class.locked]="!ach.unlockedAt">
                <span class="ach-icon">{{ ach.icon }}</span>
                <div>
                  <h3>{{ ach.title }}</h3>
                  <p>{{ ach.description }}</p>
                </div>
                @if (ach.unlockedAt) {
                  <span class="badge badge-green">Desbloqueado</span>
                }
              </div>
            }
          </div>
        </section>

        <!-- Descubiertos -->
        <section class="section">
          <h2 class="section-title">Restaurantes descubiertos</h2>
          @if (discovered().length) {
            <div class="discovered">
              @for (r of discoveredRestaurants(); track r.id) {
                <a [routerLink]="['/restaurante', r.id]" class="disc-item">
                  <img [src]="r.image" [alt]="r.name" />
                </a>
              }
            </div>
          } @else {
            <p class="muted">Aún no descubres restaurantes. Visita el menú de alguno para empezar 🧭</p>
          }
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .gam-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; }
      .section { grid-column: 1 / -1; margin-top: 8px; }
      .section-title { font-size: 1.15rem; margin-bottom: 14px; }

      .level-banner {
        display: flex;
        align-items: center;
        gap: 24px;
        background:
          radial-gradient(400px 200px at 0% 0%, var(--accent-soft), transparent 60%),
          var(--surface);
        border: 1px solid rgba(255,115,56,.3);
      }
      .level-left { display: flex; align-items: center; gap: 16px; }
      .level-badge {
        width: 84px; height: 84px;
        display: flex; align-items: center; justify-content: center;
        background: linear-gradient(135deg, var(--accent), var(--gold));
        border-radius: 24px;
        box-shadow: 0 8px 24px rgba(255,115,56,.4);
      }
      .level-num { font-family: var(--font-display); font-size: 2.2rem; font-weight: 800; color: #fff; }
      .level-name { font-size: 1.4rem; }
      .level-right { flex: 1; }
      .xp-total { font-family: var(--font-display); font-weight: 700; color: var(--gold); font-size: 1.05rem; }
      .next-hint { font-size: 0.78rem; color: var(--text-muted); }
      .range-hint { font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; }

      .xp-feed { display: flex; flex-direction: column; gap: 10px; }
      .feed { display: flex; flex-direction: column; gap: 8px; }
      .feed li { display: flex; align-items: center; gap: 10px; font-size: 0.84rem; }
      .feed-xp { font-weight: 700; color: var(--green); background: var(--green-soft); padding: 2px 8px; border-radius: 999px; font-size: 0.75rem; white-space: nowrap; }
      .feed-reason { flex: 1; color: var(--text-secondary); }
      .feed-date { font-size: 0.7rem; color: var(--text-muted); }
      .muted { color: var(--text-muted); font-size: 0.85rem; }

      .missions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
      .ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
      .ach { display: flex; align-items: center; gap: 12px; padding: 14px; }
      .ach.locked { opacity: 0.5; }
      .ach.locked .ach-icon { filter: grayscale(1); }
      .ach-icon { font-size: 1.6rem; }
      .ach h3 { font-size: 0.9rem; }
      .ach p { font-size: 0.75rem; color: var(--text-muted); }
      .discovered { display: flex; flex-wrap: wrap; gap: 12px; }
      .disc-item { position: relative; width: 110px; height: 110px; border-radius: var(--radius-sm); overflow: hidden; }
      .disc-item img { width: 100%; height: 100%; transition: transform .3s; }
      .disc-item:hover img { transform: scale(1.08); }
      .disc-count { position: absolute; top: 6px; left: 6px; background: rgba(10,12,15,.8); color: var(--gold); font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
      @media (max-width: 960px) { .gam-grid { grid-template-columns: 1fr; } .level-banner { flex-direction: column; align-items: flex-start; } }
    `,
  ],
})
export class GamificationPage {
  protected readonly gamification = inject(GamificationService);
  private readonly restaurants = inject(RestaurantService);

  protected readonly xp = this.gamification.xp;
  protected readonly level = this.gamification.levelInfo;
  protected readonly events = this.gamification.events;
  protected readonly missions = this.gamification.missions;
  protected readonly achievements = this.gamification.achievements;
  protected readonly discovered = this.gamification.discoveredRestaurantIds;

  protected readonly xpToNext = computed(() =>
    this.level().next ? this.level().next!.minXp - this.xp() : 0,
  );

  protected readonly nextLevelNumber = computed(() => this.level().next?.number ?? 0);

  protected readonly discoveredRestaurants = computed(() =>
    this.restaurants.byIds(this.discovered()),
  );

  claimMission(missionId: string): void {
    this.gamification.claimMission(missionId);
  }
}