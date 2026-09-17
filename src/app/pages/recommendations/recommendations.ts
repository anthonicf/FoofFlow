import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecommendationService } from '../../services/recommendation.service';
import { PreferenceEditor } from '../../shared/components/preference-editor';
import { RatingStars } from '../../shared/components/rating-stars';
import { fmtDistance, priceLevel } from '../../shared/utils/format';

const SCORE_RULES = [
  '+5 Categoría favorita',
  '+4 Coincidencia de sabores',
  '+3 Dentro del presupuesto',
  '+3 Buena calificación (≥ 4.5)',
  '+2 Tiempo de entrega compatible',
  '+2 Cerca de ti',
];

@Component({
  selector: 'app-recommendations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PreferenceEditor, RatingStars],
  template: `
    <div class="fade-in">
      <header class="page-header">
        <h1>Recomendaciones</h1>
        <p>Basadas en tus preferencias, con reglas simples y transparentes. Sin IA: decides tú.</p>
      </header>

      <div class="rec-grid">
        <div class="rec-main">
          <div class="flex items-center justify-between mb-sm">
            <h2 class="subtitle">Sugeridos para ti</h2>
            <span class="badge badge-accent">{{ results().length }} opciones</span>
          </div>

          @if (results().length) {
            <div class="rec-list">
              @for (rec of results(); track rec.restaurant.id) {
                <article class="card rec-item">
                  <img class="rec-img" [src]="rec.restaurant.image" [alt]="rec.restaurant.name" />
                  <div class="rec-body">
                    <div class="flex items-center justify-between gap-sm">
                      <h3>{{ rec.restaurant.name }}</h3>
                      <span class="score-chip">+{{ rec.score }} pts</span>
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
              <div class="empty-icon">✨</div>
              <h3>Aún no hay sugerencias</h3>
              <p>Guarda tus preferencias para generar recomendaciones.</p>
            </div>
          }
        </div>

        <aside class="rec-side">
          <section class="card prefs-card">
            <div class="flex items-center justify-between">
              <h2 class="subtitle">Tus preferencias</h2>
              @if (saved()) {
                <span class="badge badge-green">Preferencias guardadas ✓</span>
              }
            </div>
            <app-preference-editor (saved)="save()" />
          </section>

          <section class="card rules-card">
            <h3>¿Cómo puntuamos?</h3>
            <ul class="rules">
              @for (rule of rules; track rule) {
                <li>{{ rule }}</li>
              }
            </ul>
            <p class="muted small">La lógica es aislada en <code>RecommendationService</code> y podrá replicarse en el backend.</p>
          </section>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .subtitle { font-size: 1.1rem; }
      .rec-grid { display: grid; grid-template-columns: 1fr 360px; gap: 28px; align-items: start; }
      .rec-list { display: flex; flex-direction: column; gap: 16px; }
      .rec-item { display: flex; gap: 16px; padding: 14px; }
      .rec-img { width: 180px; height: 140px; border-radius: var(--radius-sm); flex-shrink: 0; }
      .rec-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
      .score-chip {
        background: var(--accent-soft);
        color: var(--accent-strong);
        font-weight: 700;
        font-size: 0.8rem;
        padding: 3px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,115,56,.3);
      }
      .muted { font-size: 0.78rem; color: var(--text-muted); }
      .rec-desc { font-size: 0.85rem; color: var(--text-secondary); }
      .reasons { display: flex; flex-wrap: wrap; gap: 6px; }
      .reason-chip {
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--green);
        background: var(--green-soft);
        padding: 2px 8px;
        border-radius: 999px;
      }
      .rec-side { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 88px; }
      .prefs-card { display: flex; flex-direction: column; gap: 12px; }
      .rules { display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; color: var(--text-secondary); }
      .rules-card { display: flex; flex-direction: column; gap: 10px; }
      .rules li { padding-left: 12px; position: relative; }
      .rules li::before { content: '·'; position: absolute; left: 0; color: var(--accent); font-weight: 800; }
      .small { font-size: 0.75rem; }
      code { background: var(--surface-2); padding: 1px 6px; border-radius: 4px; font-size: 0.72rem; }
      @media (max-width: 1100px) { .rec-grid { grid-template-columns: 1fr; } .rec-side { position: static; } }
      @media (max-width: 620px) { .rec-item { flex-direction: column; } .rec-img { width: 100%; height: 160px; } }
    `,
  ],
})
export class RecommendationsPage {
  private readonly recommendation = inject(RecommendationService);

  protected readonly results = computed(() => this.recommendation.topRecommendations(8));
  protected readonly rules = SCORE_RULES;
  protected readonly fmtDistance = fmtDistance;
  protected readonly priceLevel = priceLevel;

  protected readonly saved = signal(false);

  save(): void {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2500);
  }
}