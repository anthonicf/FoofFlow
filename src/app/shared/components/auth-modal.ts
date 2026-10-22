import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    @if (auth.showAuthModal()) {
      <div class="modal-backdrop" (click)="close()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="close()" aria-label="Cerrar modal">✕</button>

          <!-- Encabezado -->
          <div class="modal-header">
            <div class="brand-badge">🍔 FoodFlow Auth</div>
            <h2>{{ isLogin() ? 'Bienvenido de nuevo' : 'Crea tu cuenta' }}</h2>
            <p>{{ isLogin() ? 'Ingresa para gestionar tus pedidos y direcciones.' : 'Regístrate para pedir en los mejores restaurantes.' }}</p>
          </div>

          <!-- Selector de Pestañas -->
          <div class="tabs">
            <button
              class="tab-btn"
              [class.active]="isLogin()"
              (click)="setTab(true)"
            >
              Iniciar sesión
            </button>
            <button
              class="tab-btn"
              [class.active]="!isLogin()"
              (click)="setTab(false)"
            >
              Registrarse
            </button>
          </div>

          <!-- Mensajes de feedback -->
          @if (errorMessage()) {
            <div class="alert alert-error">
              <span>⚠️</span> {{ errorMessage() }}
            </div>
          }

          @if (successMessage()) {
            <div class="alert alert-success">
              <span>✉️</span> {{ successMessage() }}
            </div>
          }

          <!-- Formulario de Iniciar Sesión -->
          @if (isLogin()) {
            <form (ngSubmit)="handleLogin()" class="auth-form">
              <div class="form-group">
                <label for="login-email">Correo electrónico</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  [(ngModel)]="loginEmail"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>

              <div class="form-group">
                <label for="login-password">Contraseña</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  [(ngModel)]="loginPassword"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary w-full mt-sm"
                [disabled]="auth.loading()"
              >
                {{ auth.loading() ? 'Ingresando…' : 'Iniciar sesión' }}
              </button>
            </form>
          } @else {
            <!-- Formulario de Registro -->
            <form (ngSubmit)="handleRegister()" class="auth-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="reg-nombres">Nombres</label>
                  <input
                    id="reg-nombres"
                    type="text"
                    name="nombres"
                    [(ngModel)]="regNombres"
                    placeholder="Juan"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="reg-apellidos">Apellidos</label>
                  <input
                    id="reg-apellidos"
                    type="text"
                    name="apellidos"
                    [(ngModel)]="regApellidos"
                    placeholder="Pérez"
                    required
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="reg-dni">DNI / Documento</label>
                  <input
                    id="reg-dni"
                    type="text"
                    name="dni"
                    [(ngModel)]="regDni"
                    placeholder="70123456"
                    maxlength="15"
                  />
                </div>
                <div class="form-group">
                  <label for="reg-telefono">Teléfono</label>
                  <input
                    id="reg-telefono"
                    type="tel"
                    name="telefono"
                    [(ngModel)]="regTelefono"
                    placeholder="956000111"
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="reg-email">Correo electrónico</label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  [(ngModel)]="regEmail"
                  placeholder="tucorreo@ejemplo.com"
                  required
                />
              </div>

              <div class="form-group">
                <label for="reg-password">Contraseña (mínimo 6 caracteres)</label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  [(ngModel)]="regPassword"
                  placeholder="••••••••"
                  required
                  minlength="6"
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary w-full mt-sm"
                [disabled]="auth.loading()"
              >
                {{ auth.loading() ? 'Creando cuenta…' : 'Registrarme' }}
              </button>
            </form>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 999;
        background: rgba(8, 10, 13, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: fadeIn 0.2s ease-out;
      }

      .modal-card {
        position: relative;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        width: 100%;
        max-width: 440px;
        padding: 32px 28px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        color: var(--text);
        animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .close-btn {
        position: absolute;
        top: 18px;
        right: 18px;
        background: transparent;
        border: none;
        color: var(--text-muted);
        font-size: 1.2rem;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
      }
      .close-btn:hover { color: var(--text); background: var(--surface-2); }

      .brand-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--accent);
        background: var(--accent-soft);
        padding: 4px 10px;
        border-radius: 999px;
        margin-bottom: 8px;
      }

      .modal-header h2 { font-size: 1.4rem; margin-bottom: 4px; }
      .modal-header p { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 18px; }

      .tabs {
        display: flex;
        background: var(--bg);
        border-radius: var(--radius-xs);
        padding: 4px;
        margin-bottom: 20px;
        gap: 4px;
      }

      .tab-btn {
        flex: 1;
        padding: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        border-radius: var(--radius-xs);
        cursor: pointer;
        transition: all 0.2s;
      }
      .tab-btn.active {
        background: var(--surface-2);
        color: var(--text);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .alert {
        padding: 10px 14px;
        border-radius: var(--radius-xs);
        font-size: 0.85rem;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .alert-error { background: rgba(242, 82, 104, 0.15); color: #ff8595; border: 1px solid rgba(242, 82, 104, 0.3); }
      .alert-success { background: rgba(52, 199, 123, 0.15); color: #5ee6a0; border: 1px solid rgba(52, 199, 123, 0.3); }

      .auth-form { display: flex; flex-direction: column; gap: 14px; }
      .form-row { display: flex; gap: 12px; }
      .form-row .form-group { flex: 1; }

      .form-group { display: flex; flex-direction: column; gap: 6px; }
      .form-group label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
      .form-group input {
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 10px 12px;
        border-radius: var(--radius-xs);
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s;
      }
      .form-group input:focus { border-color: var(--accent); }

      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    `,
  ],
})
export class AuthModalComponent {
  readonly auth = inject(AuthService);

  readonly isLogin = signal<boolean>(true);
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');

  loginEmail = '';
  loginPassword = '';

  regNombres = '';
  regApellidos = '';
  regDni = '';
  regTelefono = '';
  regEmail = '';
  regPassword = '';

  setTab(login: boolean): void {
    this.isLogin.set(login);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  close(): void {
    this.auth.closeModal();
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  async handleLogin(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage.set('Completa tu correo y contraseña.');
      return;
    }

    const { error } = await this.auth.signIn(this.loginEmail, this.loginPassword);
    if (error) {
      this.errorMessage.set(error);
    }
  }

  async handleRegister(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.regEmail || !this.regPassword || !this.regNombres || !this.regApellidos) {
      this.errorMessage.set('Completa todos los campos obligatorios.');
      return;
    }

    const { error, emailConfirmationRequired } = await this.auth.signUp({
      email: this.regEmail,
      password: this.regPassword,
      nombres: this.regNombres,
      apellido_paterno: this.regApellidos,
      numero_documento: this.regDni,
      telefono: this.regTelefono,
    });

    if (error) {
      this.errorMessage.set(error);
    } else if (emailConfirmationRequired) {
      this.successMessage.set('¡Cuenta creada! Revisa tu correo electrónico para confirmar tu cuenta antes de ingresar.');
    }
  }
}
