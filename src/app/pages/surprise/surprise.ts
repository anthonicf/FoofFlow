import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamificationService } from '../../services/gamification.service';
import { RecommendationService, type Craving } from '../../services/recommendation.service';
import { RatingStars } from '../../shared/components/rating-stars';
import { fmtDistance, priceLevel } from '../../shared/utils/format';

type CravingOption = { id: Craving | 'unsure'; label: string; icon: string };
type BudgetOption = { id: string; label: string; maxPriceRange: number };
type TimeOption = { id: string; label: string; minutes: number };

const CRAVINGS: CravingOption[] = [
  { id: 'salado', label: 'Salado', icon: '🍜' },
  { id: 'dulce', label: 'Dulce', icon: '🍰' },
  { id: 'picante', label: 'Picante', icon: '🌶️' },
  { id: 'ligero', label: 'Ligero', icon: '🥗' },
  { id: 'unsure', label: 'No estoy seguro', icon: '🤷' },
];

const BUDGETS: BudgetOption[] = [
  { id: '20', label: 'Hasta S/ 20', maxPriceRange: 1 },
  { id: '30', label: 'S/ 20 – 30', maxPriceRange: 2 },
  { id: '50', label: 'S/ 30 – 50', maxPriceRange: 2 },
  { id: '50+', label: 'Más de S/ 50', maxPriceRange: 3 },
  { id: 'any', label: 'No importa', maxPriceRange: 3 },
];

const TIMES: TimeOption[] = [
  { id: '15', label: '15 minutos', minutes: 20 },
  { id: '30', label: '30 minutos', minutes: 30 },
  { id: '45', label: '45 minutos', minutes: 40 },
  { id: 'any', label: 'No importa', minutes: 120 },
];

@Component({
  selector: 'app-surprise',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RatingStars],
  template: `
    <div class="fade-in">
      <header class="page-header">
        <h1>Sorpréndeme 🎲</h1>
        <p>Un pequeño asistente te hace 3 preguntas y te muestra opciones. El sistema recomienda, tú decides.</p>
      </header>

      <div class="surprise-wrap">
        <div class="steps">
          @for (s of [1, 2, 3]; track s) {
            <div class="step" [class.done]="s < step()" [class.current]="s === step()">
              <span class="step-num">{{ s }}</span>
              <span class="step-label">{{ stepLabel(s) }}</span>
            </div>
          }
        </div>

        <div class="card wizard card-flat">
          @if (step() === 1) {
            <div class="wiz-page">
              <h2>¿Qué se te antoja?</h2>
              <div class="option-grid">
                @for (c of cravings; track c.id) {
                  <button class="option-card" [class.selected]="craving() === c.id" (click)="craving.set(c.id)">
                    <span class="option-icon">{{ c.icon }}</span>
                    <span>{{ c.label }}</span>
                  </button>
                }
              </div>
              <button class="btn btn-primary" [disabled]="!craving()" (click)="next()">Siguiente →</button>
            </div>
          }

          @if (step() === 2) {
            <div class="wiz-page">
              <h2>¿Cuánto quieres gastar?</h2>
              <div class="option-list">
                @for (b of budgets; track b.id) {
                  <button class="option-row" [class.selected]="budget() === b.id" (click)="budget.set(b.id)">
                    {{ b.label }}
                  </button>
                }
              </div>
              <div class="wiz-nav">
                <button class="btn btn-ghost" (click)="prev()">← Atrás</button>
                <button class="btn btn-primary" [disabled]="!budget()" (click)="next()">Siguiente →</button>
              </div>
            </div>
          }

          @if (step() === 3) {
            <div class="wiz-page">
              <h2>¿Cuánto tiempo tienes?</h2>
              <div class="option-list">
                @for (t of times; track t.id) {
                  <button class="option-row" [class.selected]="time() === t.id" (click)="time.set(t.id)">
                    ⏱ {{ t.label }}
                  </button>
                }
              </div>
              <div class="wiz-nav">
                <button class="btn btn-ghost" (click)="prev()">← Atrás</button>
                <button class="btn btn-primary" [disabled]="!time()" (click)="finish()">Ver opciones ✨</button>
              </div>
            </div>
          }

          @if (step() === 4) {
            <div class="results">
              <div class="flex items-center justify-between">
                <h2>Encontramos estas opciones para ti</h2>
                <button class="btn btn-ghost btn-sm" (click)="reset()">↺ Empezar de nuevo</button>
              </div>
              <p class="result-hint">Recuerda: el sistema recomienda, tú decides.</p>

              @if (results().length) {
                <div class="rec-list">
                  @for (rec of results(); track rec.restaurant.id) {
                    <article class="rec-item card">
                      <img class="rec-img" [src]="rec.restaurant.image" [alt]="rec.restaurant.name" />
                      <div class="rec-body">
                        <div class="flex items-center justify-between gap-sm">
                          <h3>{{ rec.restaurant.name }}</h3>
                          <span class="score-chip">+{{ rec.score }}</span>
                        </div>
                        <div class="flex items-center gap-sm">
                          <app-rating-stars [rating]="rec.restaurant.rating" />
                          <span class="muted">{{ rec.restaurant.deliveryTime }} min · {{ fmtDistance(rec.restaurant.distance) }} · {{ priceLevel(rec.restaurant.priceRange) }}</span>
                        </div>
                        <p class="rec-desc">{{ rec.restaurant.description }}</p>
                        <div class="reasons">
                          @for (reason of rec.reasons; track reason) {
                            <span class="reason-chip">✓ {{ reason }}</span>
                          }
                        </div>
                        <a [routerLink]="['/restaurante', rec.restaurant.id]" class="btn btn-primary btn-sm">Ver menú</a>
                      </div>
                    </article>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <div class="empty-icon">🤔</div>
                  <h3>No encontramos opciones con esos filtros</h3>
                  <p>Amplía el presupuesto o el tiempo e inténtalo de nuevo.</p>
                  <button class="btn btn-secondary mt-md" (click)="reset()">Volver a intentar</button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .surprise-wrap { max-width: 880px; margin: 0 auto; }
      .steps { display: flex; gap: 10px; margin-bottom: 18px; }
      .step { flex: 1; display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface); border: 1px solid var(--border-soft); border-radius: var(--radius-sm); opacity: .45; }
      .step.done, .step.current { opacity: 1; }
      .step.current { border-color: var(--accent); background: var(--accent-soft); }
      .step-num {
        width: 26px; height: 26px;
        display: flex; align-items: center; justify-content: center;
        background: var(--surface-3); color: var(--text);
        border-radius: 50%; font-size: 0.8rem; font-weight: 700;
      }
      .step.done .step-num { background: var(--green); }
      .step.current .step-num { background: var(--accent); }
      .step-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }

      .wizard { padding: 28px; min-height: 380px; display: flex; align-items: center; }
      .wiz-page { width: 100%; display: flex; flex-direction: column; gap: 22px; }
      .wiz-page h2 { font-size: 1.35rem; }
      .option-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
      .option-card {
        display: flex; flex-direction: column; align-items: center; gap: 8px;
        padding: 20px 12px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        font-weight: 600;
        color: var(--text-secondary);
        transition: all .2s;
      }
      .option-card:hover { border-color: var(--text-muted); color: var(--text); transform: translateY(-2px); }
      .option-card.selected { border-color: var(--accent); background: var(--accent-soft); color: var(--accent-strong); }
      .option-icon { font-size: 2rem; }
      .option-list { display: flex; flex-direction: column; gap: 10px; }
      .option-row {
        text-align: left;
        padding: 14px 16px;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        font-weight: 600;
        color: var(--text-secondary);
      }
      .option-row:hover { color: var(--text); border-color: var(--text-muted); }
      .option-row.selected { border-color: var(--accent); background: var(--accent-soft); color: var(--accent-strong); }
      .wiz-nav { display: flex; justify-content: space-between; }
      .btn[disabled] { background: var(--surface-3); color: var(--text-muted); box-shadow: none; cursor: not-allowed; }

      .results { width: 100%; display: flex; flex-direction: column; gap: 14px; }
      .result-hint { font-size: 0.85rem; color: var(--text-muted); }
      .rec-list { display: flex; flex-direction: column; gap: 14px; }
      .rec-item { display: flex; gap: 14px; padding: 14px; }
      .rec-img { width: 160px; height: 130px; border-radius: var(--radius-sm); flex-shrink: 0; }
      .rec-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
      .score-chip { background: var(--accent-soft); color: var(--accent-strong); font-weight: 700; padding: 3px 10px; border-radius: 999px; }
      .muted { font-size: 0.78rem; color: var(--text-muted); }
      .rec-desc { font-size: 0.84rem; }
      .reasons { display: flex; flex-wrap: wrap; gap: 6px; }
      .reason-chip { font-size: 0.72rem; font-weight: 600; color: var(--green); background: var(--green-soft); padding: 2px 8px; border-radius: 999px; }
      @media (max-width: 600px) { .rec-item { flex-direction: column; } .rec-img { width: 100%; height: 150px; } }
    `,
  ],
})
export class SurprisePage {
  private readonly recommendation = inject(RecommendationService);
  private readonly gamification = inject(GamificationService);

  protected readonly cravings = CRAVINGS;
  protected readonly budgets = BUDGETS;
  protected readonly times = TIMES;

  readonly step = signal(1);
  readonly craving = signal<Craving | 'unsure' | null>(null);
  readonly budget = signal<string | null>(null);
  readonly time = signal<string | null>(null);

  protected readonly results = signal<ReturnType<RecommendationService['getRecommendations']>>([]);

  protected readonly fmtDistance = fmtDistance;
  protected readonly priceLevel = priceLevel;

  stepLabel(step: number): string {
    return ['Antojo', 'Presupuesto', 'Tiempo'][step - 1];
  }

  next(): void {
    this.step.update((s) => Math.min(3, s + 1));
  }

  prev(): void {
    this.step.update((s) => Math.max(1, s - 1));
  }

  finish(): void {
    const craving = this.craving() === 'unsure' ? null : (this.craving() as Craving | null);
    const budgetOption = this.budgets.find((b) => b.id === this.budget());
    const timeOption = this.times.find((t) => t.id === this.time());

    const list = this.recommendation.getRecommendations({
      craving,
      maxTime: timeOption?.minutes ?? null,
      count: 6,
    });

    const filtered = budgetOption
      ? list.filter((r) => r.restaurant.priceRange <= budgetOption.maxPriceRange)
      : list;

    this.results.set(filtered);
    this.step.set(4);
    this.gamification.completeSurprise();
  }

  reset(): void {
    this.step.set(1);
    this.craving.set(null);
    this.budget.set(null);
    this.time.set(null);
    this.results.set([]);
  }
}