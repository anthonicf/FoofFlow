import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="progress-wrap">
      @if (label()) {
        <div class="progress-head">
          <span class="progress-label">{{ label() }}</span>
          @if (showPercent()) {
            <b class="progress-value">{{ value() }}%</b>
          }
        </div>
      }
      <div class="progress-track">
        <div
          class="progress-fill progress-animate"
          [class.accent]="!color()"
          [style.width.%]="clamped()"
          [style.background]="color() || null"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      .progress-wrap { display: flex; flex-direction: column; gap: 6px; }
      .progress-head { display: flex; justify-content: space-between; align-items: baseline; }
      .progress-label { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); }
      .progress-value { font-size: 0.78rem; color: var(--text-muted); }
      .progress-track {
        height: 8px;
        background: var(--surface-2);
        border-radius: 999px;
        overflow: hidden;
        border: 1px solid var(--border-soft);
      }
      .progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--accent), var(--gold));
        transition: width 0.5s ease;
      }
    `,
  ],
})
export class ProgressBar {
  readonly value = input.required<number>();
  readonly label = input<string>();
  readonly showPercent = input(false);
  readonly color = input<string>();

  readonly clamped = computed(() => Math.max(0, Math.min(100, this.value())));
}