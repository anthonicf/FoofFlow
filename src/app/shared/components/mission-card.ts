import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Mission } from '../../models/models';
import { ProgressBar } from './progress-bar';

@Component({
  selector: 'app-mission-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressBar],
  template: `
    <div class="card mission-card">
      <div class="flex items-center justify-between gap-sm">
        <div class="flex items-center gap-sm">
          <span class="mission-icon">{{ mission().icon }}</span>
          <div>
            <h3 class="mission-title">{{ mission().title }}</h3>
            <p class="mission-desc">{{ mission().description }}</p>
          </div>
        </div>
        <span class="badge badge-gold">+{{ mission().reward }} XP</span>
      </div>

      <app-progress-bar
        [value]="progressPct"
        [label]="progressLabel"
        [showPercent]="false"
      />

      @if (mission().completed && !mission().claimed) {
        <button class="btn btn-primary btn-sm w-full" (click)="claim.emit(mission().id)">
          Reclamar recompensa
        </button>
      } @else if (mission().claimed) {
        <button class="btn btn-secondary btn-sm w-full" disabled>Recompensa reclamada ✓</button>
      }
    </div>
  `,
  styles: [
    `
      .mission-card { display: flex; flex-direction: column; gap: 12px; }
      .mission-icon {
        width: 44px; height: 44px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.3rem;
        background: var(--surface-2);
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }
      .mission-title { font-size: 0.95rem; }
      .mission-desc { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
      .btn[disabled] { cursor: not-allowed; opacity: 0.7; }
    `,
  ],
})
export class MissionCard {
  readonly mission = input.required<Mission>();
  readonly claim = output<string>();

  get progressPct(): number {
    const m = this.mission();
    return Math.min(100, (m.progress / m.target) * 100);
  }

  get progressLabel(): string {
    const m = this.mission();
    return `${m.progress} / ${m.target}`;
  }
}