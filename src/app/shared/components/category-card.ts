import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Router } from '@angular/router';
import type { Category } from '../../models/models';

@Component({
  selector: 'app-category-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="category-card" (click)="open()" [attr.aria-label]="category().name">
      <img [src]="category().image" [alt]="category().name" loading="lazy" />
      <div class="category-overlay"></div>
      <div class="category-body">
        <span class="category-icon">{{ category().icon }}</span>
        <span class="category-name">{{ category().name }}</span>
      </div>
    </button>
  `,
  styles: [
    `
      .category-card {
        position: relative;
        width: 100%;
        aspect-ratio: 4 / 3;
        border-radius: var(--radius);
        overflow: hidden;
        text-align: left;
      }
      .category-card img {
        width: 100%;
        height: 100%;
        transition: transform 0.35s ease;
      }
      .category-card:hover img { transform: scale(1.06); }
      .category-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(8,10,12,0.9) 0%, rgba(8,10,12,0.15) 60%);
      }
      .category-body {
        position: absolute;
        inset: auto 0 0 0;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .category-icon { font-size: 1.2rem; }
      .category-name { font-family: var(--font-display); font-weight: 700; font-size: 0.92rem; color: #fff; }
    `,
  ],
})
export class CategoryCard {
  readonly category = input.required<Category>();

  constructor(private readonly router: Router) {}

  open(): void {
    this.router.navigate(['/explorar'], {
      queryParams: { categoria: this.category().id },
    });
  }
}