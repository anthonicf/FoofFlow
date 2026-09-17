import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CATEGORIES } from '../../data/data';
import type { UserPreferences } from '../../models/models';
import { UserService } from '../../services/user.service';

const FLAVOR_OPTIONS = [
  'sabroso',
  'fresco',
  'ligero',
  'saludable',
  'dulce',
  'picante',
  'cremoso',
  'frito',
  'carnes',
  'marinos',
  'veggie',
  'cafe',
  'italiano',
];

const FLAVOR_LABELS: Record<string, string> = {
  sabroso: 'Sabroso',
  fresco: 'Fresco',
  ligero: 'Ligero',
  saludable: 'Saludable',
  dulce: 'Dulce',
  picante: 'Picante',
  cremoso: 'Cremoso',
  frito: 'Frito',
  carnes: 'Carnes',
  marinos: 'Marinos',
  veggie: 'Veggie',
  cafe: 'Café',
  italiano: 'Italiano',
};

/** Editor de preferencias reutilizable (Recomendaciones y Perfil). */
@Component({
  selector: 'app-preference-editor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="prefs" (ngSubmit)="save()">
      <section>
        <h4 class="pref-title">Categorías favoritas</h4>
        <p class="pref-hint">El sistema priorizará estos tipos de comida.</p>
        <div class="chips-wrap">
          @for (c of categories; track c.id) {
            <button
              type="button"
              class="chip"
              [class.chip-active]="editable.favoriteCategories.includes(c.id)"
              (click)="toggleCategory(c.id)"
            >
              {{ c.icon }} {{ c.name }}
            </button>
          }
        </div>
      </section>

      <section>
        <h4 class="pref-title">Sabores que te encantan</h4>
        <div class="chips-wrap">
          @for (flavor of flavorOptions; track flavor) {
            <button
              type="button"
              class="chip"
              [class.chip-active]="editable.favoriteFlavors.includes(flavor)"
              (click)="toggleFlavor(flavor)"
            >
              {{ flavorLabel(flavor) }}
            </button>
          }
        </div>
      </section>

      <div class="grid grid-2 pref-grid">
        <section>
          <h4 class="pref-title">Presupuesto por plato</h4>
          <select class="select" [(ngModel)]="editable.budgetPerPlate" name="budget">
            <option [ngValue]="15">Hasta S/ 15</option>
            <option [ngValue]="20">Hasta S/ 20</option>
            <option [ngValue]="30">Hasta S/ 30</option>
            <option [ngValue]="40">Hasta S/ 40</option>
            <option [ngValue]="50">Más de S/ 50</option>
          </select>
        </section>

        <section>
          <h4 class="pref-title">Tiempo máximo de espera</h4>
          <select class="select" [(ngModel)]="editable.maxDeliveryTime" name="time">
            <option [ngValue]="20">15–20 min</option>
            <option [ngValue]="30">30 min</option>
            <option [ngValue]="40">40 min</option>
            <option [ngValue]="60">No importa (60+)</option>
          </select>
        </section>
      </div>

      <label class="toggle-row">
        <input type="checkbox" [(ngModel)]="editable.vegetarian" name="veggie" />
        <span class="toggle-box"></span>
        <span>Prefiero opciones vegetarianas</span>
      </label>

      <button type="submit" class="btn btn-primary w-full">Guardar preferencias</button>
    </form>
  `,
  styles: [
    `
      .prefs { display: flex; flex-direction: column; gap: 22px; }
      .pref-title { font-size: 0.9rem; margin-bottom: 4px; }
      .pref-hint { font-size: 0.78rem; color: var(--text-muted); margin-bottom: 10px; }
      .chips-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
      .pref-grid { gap: 16px; }
      .select {
        width: 100%;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 10px 12px;
        font-size: 0.9rem;
        outline: none;
      }
      .select:focus { border-color: var(--accent); }
      .toggle-row { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; cursor: pointer; color: var(--text-secondary); }
      .toggle-row input { display: none; }
      .toggle-box {
        width: 40px; height: 22px;
        background: var(--surface-3);
        border-radius: 999px;
        position: relative;
        transition: background 0.2s;
      }
      .toggle-box::after {
        content: '';
        position: absolute;
        top: 3px; left: 3px;
        width: 16px; height: 16px;
        border-radius: 50%;
        background: var(--text-secondary);
        transition: transform 0.2s, background 0.2s;
      }
      .toggle-row input:checked + .toggle-box { background: var(--accent); }
      .toggle-row input:checked + .toggle-box::after { transform: translateX(18px); background: #fff; }
    `,
  ],
})
export class PreferenceEditor {
  readonly saved = output<void>();

  readonly categories = CATEGORIES;
  readonly flavorOptions = FLAVOR_OPTIONS;

  protected editable: UserPreferences;

  constructor(private readonly user: UserService) {
    this.editable = this.clone(this.user.preferences());
  }

  toggleCategory(id: string): void {
    const list = this.editable.favoriteCategories;
    this.editable.favoriteCategories = list.includes(id)
      ? list.filter((c) => c !== id)
      : [...list, id];
  }

  toggleFlavor(flavor: string): void {
    const list = this.editable.favoriteFlavors;
    this.editable.favoriteFlavors = list.includes(flavor)
      ? list.filter((f) => f !== flavor)
      : [...list, flavor];
  }

  flavorLabel(flavor: string): string {
    return FLAVOR_LABELS[flavor] ?? flavor;
  }

  save(): void {
    this.user.updatePreferences(this.clone(this.editable));
    this.saved.emit();
  }

  private clone(prefs: UserPreferences): UserPreferences {
    return {
      ...prefs,
      favoriteCategories: [...prefs.favoriteCategories],
      favoriteFlavors: [...prefs.favoriteFlavors],
    };
  }
}