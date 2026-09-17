import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="search-wrap">
      <span class="icon">⌕</span>
      <input
        class="search-input"
        type="text"
        [placeholder]="placeholder()"
        [(ngModel)]="query"
        (keydown.enter)="submit()"
        [attr.aria-label]="placeholder()"
      />
      @if (query) {
        <button class="clear" (click)="query = ''; submit()" aria-label="Limpiar búsqueda">✕</button>
      }
    </div>
  `,
  styles: [
    `
      .search-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 0 14px;
        height: 44px;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .search-wrap:focus-within {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-soft);
      }
      .icon { color: var(--text-muted); font-size: 1.15rem; font-weight: 600; line-height: 1; }
      .search-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        font-size: 0.9rem;
      }
      .search-input::placeholder { color: var(--text-muted); }
      .clear {
        color: var(--text-muted);
        font-size: 0.85rem;
        padding: 4px;
        border-radius: var(--radius-xs);
      }
      .clear:hover { color: var(--text); background: var(--surface-3); }
    `,
  ],
})
export class SearchBar {
  readonly placeholder = input('Buscar restaurantes, platos, categorías…');
  readonly value = input('');
  readonly search = output<string>();

  query = '';

  constructor() {
    effect(() => {
      const next = this.value();
      if (this.query !== next) this.query = next;
    });
  }

  submit(): void {
    this.search.emit(this.query.trim());
  }
}