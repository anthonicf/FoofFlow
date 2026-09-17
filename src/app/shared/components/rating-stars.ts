import { Component, computed, input } from '@angular/core';

const FULL = '★';
const HALF = '◐';
const EMPTY = '☆';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  template: `
    <div class="rating" [class.dim]="dim()">
      @for (s of stars(); track $index) {
        <span class="star">{{ s }}</span>
      }
      @if (showValue()) {
        <span class="value">{{ rating().toFixed(1) }}</span>
      }
    </div>
  `,
  styles: [
    `
      .rating { display: inline-flex; align-items: center; gap: 2px; line-height: 1; }
      .star { color: var(--gold); font-size: 0.85rem; }
      .value { margin-left: 4px; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); }
      .rating.dim .star { opacity: 0.6; }
    `,
  ],
})
export class RatingStars {
  readonly rating = input.required<number>();
  readonly showValue = input(true);
  readonly dim = input(false);

  readonly stars = computed<string[]>(() => {
    const value = this.rating();
    const full = Math.floor(value);
    const fraction = value - full;
    const half = fraction >= 0.25 && fraction < 0.75;
    const hasHalf = fraction >= 0.75;
    const list: string[] = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) list.push(FULL);
      else if (i === full && half) list.push(HALF);
      else if (hasHalf && i === full) list.push(FULL);
      else list.push(EMPTY);
    }
    return list;
  });
}