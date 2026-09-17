import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { RestaurantService } from '../../services/restaurant.service';
import { GroupOrderService } from '../../services/group-order.service';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-group-order',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PricePipe, DatePipe],
  template: `
    <div class="fade-in">
      <header class="page-header">
        <h1>Pedido grupal</h1>
        <p>Reúne a tu grupo, cada uno elige y todos piden juntos.</p>
      </header>

      @if (!active()) {
        <!-- Crear pedido -->
        <div class="create-wrap">
          <div class="card create-card">
            <div class="create-icon">👥</div>
            <h2>Crear pedido grupal</h2>
            <p>Genera un código y compártelo con tu grupo.</p>

            <div class="create-form">
              <input class="input" placeholder="Nombre del pedido (ej. Almuerzo de la U)" [(ngModel)]="groupName" />
              <div class="participants-input">
                <input class="input" placeholder="Nombre del participante (ej. Andrea)" [(ngModel)]="participantInput" />
                <button class="btn btn-secondary btn-sm" (click)="addParticipantName()">+ Agregar</button>
              </div>
            </div>

            <div class="chips-wrap">
              @for (n of participants; track n) {
                <span class="chip person-chip">{{ n }}</span>
              }
            </div>

            <button class="btn btn-primary w-full mt-sm" [disabled]="!groupName.trim()" (click)="create()">
              Generar pedido grupal →
            </button>
          </div>

          @if (history().length) {
            <section class="card history-card">
              <h2>Pedidos grupales anteriores</h2>
              <ul class="hlist">
                @for (g of history(); track g.id) {
                  <li>
                    <span class="code">{{ g.code }}</span>
                    <b>{{ g.name }}</b>
                    <span>{{ g.participants.length }} participantes</span>
                    <span>{{ g.total | price }}</span>
                  </li>
                }
              </ul>
            </section>
          }
        </div>
      } @else {
        @if (active(); as group) {
          <!-- Vista activa -->
          <section class="card group-header">
            <div class="flex items-center justify-between flex-wrap gap-sm">
              <div>
                <h2>{{ group.name }}</h2>
                <p class="created">Creado {{ group.createdAt | date: 'HH:mm' }} · simulación local</p>
              </div>
              <div class="code-box">
                <span class="code-label">Código del grupo</span>
                <b class="code">{{ group.code }}</b>
              </div>
            </div>
            <div class="participants-summary">
              @for (p of group.participants; track p.id) {
                <span class="chip person-chip">{{ p.name }} ({{ p.items.length }})</span>
              }
            </div>
          </section>

          <div class="group-grid">
            <div class="group-panel">
              <h3 class="panel-title">Participantes</h3>
              <div class="participants-list">
                @for (p of group.participants; track p.id) {
                  <div class="participant card" [class.selected]="selected() === p.id" (click)="selected.set(p.id)">
                    <div class="flex items-center justify-between w-full">
                      <b>{{ p.name }}</b>
                      <span class="subtotal">{{ participantTotal(p.id) | price }}</span>
                    </div>
                    <ul class="p-items">
                      @for (item of p.items; track item.productId) {
                        <li>
                          <span>{{ item.quantity }}× {{ item.name }}</span>
                          <button class="x" (click)="removeItem(p.id, item.productId)">✕</button>
                        </li>
                      } @empty {
                        <li class="empty-line">Sin productos</li>
                      }
                    </ul>
                  </div>
                } @empty {
                  <p class="muted">Agrega participantes para empezar.</p>
                }
              </div>

              <div class="add-participant">
                <input class="input" placeholder="Nombre" [(ngModel)]="participantInput" (keydown.enter)="addParticipantName()" />
                <button class="btn btn-secondary btn-sm" (click)="addParticipantName()">Agregar</button>
              </div>
            </div>

            <div class="group-panel">
              <h3 class="panel-title">Agregar productos {{ selectedParticipant() ? 'para ' + selectedParticipant()!.name : '' }}</h3>
              @if (selected()) {
                <div class="add-controls">
                  <select class="select" [value]="productRestaurant()" (change)="onRestaurantChange($event)">
                    <option value="" disabled>Elige el restaurante</option>
                    @for (r of restaurants(); track r.id) {
                      <option [value]="r.id">{{ r.name }}</option>
                    }
                  </select>
                  <select class="select" [(ngModel)]="selectedProduct">
                    <option value="" disabled>Elige el producto</option>
                    @for (p of productsFor(); track p.id) {
                      <option [value]="p.id">{{ p.name }} — {{ p.price | price }}</option>
                    }
                  </select>
                  <button class="btn btn-primary btn-sm" [disabled]="!selectedProduct()" (click)="addToSelected(selectedProduct())">
                    Añadir al pedido
                  </button>
                </div>

                <div class="quick-products">
                  @for (p of productsFor().slice(0, 6); track p.id) {
                    <button class="quick-chip" (click)="addToSelected(p.id)">
                      {{ p.name }} · {{ p.price | price }}
                    </button>
                  }
                </div>
              } @else {
                <p class="muted">Selecciona un participante para asignarle productos.</p>
              }
            </div>
          </div>

          <section class="card total-card">
            <div class="flex items-center justify-between flex-wrap gap-sm">
              <div>
                <h3>Total del grupo</h3>
                <p class="muted">{{ group.participants.length }} participante(s)</p>
              </div>
              <b class="group-total">{{ groupTotal() | price }}</b>
            </div>
            <button class="btn btn-primary w-full mt-sm" [disabled]="group.total === 0" (click)="finalize()">
              Finalizar pedido grupal ✓
            </button>
            <p class="muted mt-xs" style="text-align:start;">Al finalizar se archiva el pedido. No hay pago real ni comunicación en tiempo real en este prototipo.</p>
          </section>
        }
      }
    </div>
  `,
  styles: [
    `
      .create-wrap { display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px; align-items: start; }
      .create-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 36px; }
      .create-icon { font-size: 3rem; }
      .create-card p { font-size: 0.88rem; }
      .create-form { width: 100%; display: flex; flex-direction: column; gap: 12px; margin-top: 8px; }
      .participants-input { display: flex; gap: 10px; }
      .participants-input .input { flex: 1; }
      .input {
        width: 100%;
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 11px 14px;
        font-size: 0.9rem;
        outline: none;
        color: var(--text);
      }
      .input:focus { border-color: var(--accent); }
      .chips-wrap { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
      .person-chip { background: var(--accent-soft); color: var(--accent-strong); border-color: rgba(255,115,56,.3); }
      .btn[disabled] { background: var(--surface-3); color: var(--text-muted); box-shadow: none; cursor: not-allowed; }

      .history-card { display: flex; flex-direction: column; gap: 12px; }
      .hlist { display: flex; flex-direction: column; gap: 10px; }
      .hlist li { display: flex; align-items: center; gap: 10px; font-size: 0.84rem; color: var(--text-secondary); padding: 10px; background: var(--surface-2); border-radius: var(--radius-sm); }
      .code { font-family: var(--font-display); font-weight: 800; color: var(--gold); background: rgba(255,180,84,.12); padding: 2px 8px; border-radius: 6px; }
      .hlist li b { color: var(--text); }
      .hlist li span:last-child { margin-left: auto; font-weight: 700; color: var(--accent-strong); }

      .group-header { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }
      .created { font-size: 0.78rem; color: var(--text-muted); }
      .code-box { display: flex; flex-direction: column; align-items: flex-end; background: var(--accent-soft); border: 1px dashed rgba(255,115,56,.4); padding: 10px 18px; border-radius: var(--radius-sm); }
      .code-label { font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .08em; }
      .code { font-family: var(--font-display); font-size: 1.5rem; letter-spacing: .12em; color: var(--accent-strong); }
      .participants-summary { display: flex; flex-wrap: wrap; gap: 8px; }

      .group-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; margin-bottom: 24px; }
      .group-panel { display: flex; flex-direction: column; gap: 12px; }
      .panel-title { font-size: 1rem; }
      .participants-list { display: flex; flex-direction: column; gap: 10px; }
      .participant { cursor: pointer; display: flex; flex-direction: column; gap: 8px; padding: 14px; }
      .participant.selected { border-color: var(--accent); }
      .subtotal { color: var(--accent-strong); font-weight: 700; }
      .p-items { display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: var(--text-secondary); }
      .p-items li { display: flex; justify-content: space-between; gap: 8px; }
      .x { color: var(--red); font-size: 0.75rem; font-weight: 700; padding: 2px 4px; }
      .empty-line { color: var(--text-muted); font-style: italic; }
      .add-participant { display: flex; gap: 10px; }
      .muted { color: var(--text-muted); font-size: 0.82rem; }
      .add-controls { display: flex; flex-direction: column; gap: 10px; }
      .select { width: 100%; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 0.85rem; outline: none; color: var(--text); }
      .select:focus { border-color: var(--accent); }
      .quick-products { display: flex; flex-wrap: wrap; gap: 8px; }
      .quick-chip {
        background: var(--surface-2);
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 7px 12px;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-secondary);
      }
      .quick-chip:hover { border-color: var(--accent); color: var(--accent-strong); background: var(--accent-soft); }
      .total-card { display: flex; flex-direction: column; gap: 8px; }
      .group-total { font-family: var(--font-display); font-size: 1.6rem; color: var(--accent-strong); }
      @media (max-width: 960px) { .create-wrap, .group-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class GroupOrderPage {
  private readonly groupService = inject(GroupOrderService);
  private readonly products = inject(ProductService);
  private readonly restaurantService = inject(RestaurantService);

  protected readonly active = this.groupService.active;
  protected readonly history = this.groupService.history;
  protected readonly groupTotal = this.groupService.groupTotal;

  protected readonly restaurants = computed(() => this.restaurantService.restaurants());

  groupName = '';
  participantInput = '';
  participants: string[] = [];

  readonly selected = signal<string>('');
  readonly productRestaurant = signal('');
  readonly selectedProduct = signal('');

  protected readonly productsFor = () =>
    this.productRestaurant()
      ? this.products.byRestaurant(this.productRestaurant(), true)
      : [];

  addParticipantName(): void {
    const name = this.participantInput.trim();
    if (!name) return;
    if (this.active()) {
      this.groupService.addParticipant(name);
    } else {
      this.participants = [...this.participants, name];
    }
    this.participantInput = '';
  }

  create(): void {
    const group = this.groupService.create(this.groupName, this.participants);
    this.selected.set(group.participants[0]?.id ?? '');
    this.participants = [];
  }

  participantTotal(participantId: string): number {
    return this.groupService.participantTotal(participantId);
  }

  removeItem(participantId: string, productId: string): void {
    this.groupService.removeItem(participantId, productId);
  }

  onRestaurantChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.productRestaurant.set(value);
    this.selectedProduct.set('');
  }

  addToSelected(productId: string): void {
    const participantId = this.selected();
    const product = this.products.getById(productId);
    if (!participantId || !product) return;
    this.groupService.addItem(participantId, product);
  }

  finalize(): void {
    this.groupService.finalize();
    this.selected.set('');
  }

  selectedParticipant(): { id: string; name: string } | null {
    const group = this.active();
    if (!group) return null;
    return group.participants.find((p) => p.id === this.selected()) ?? null;
  }
}