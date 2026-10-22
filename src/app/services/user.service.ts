import { Injectable, effect, inject, signal } from '@angular/core';
import { INITIAL_USER } from '../data/data';
import type { Address, User, UserPreferences } from '../models/models';
import { AuthService } from './auth.service';

/**
 * Servicio de Usuario conectado a Supabase Auth y PostgreSQL.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly auth = inject(AuthService);
  private readonly userSignal = signal<User>(INITIAL_USER);

  readonly user = this.userSignal.asReadonly();
  readonly preferences = signal<UserPreferences>(INITIAL_USER.preferences);

  constructor() {
    // Sincronizar automáticamente con el perfil de Supabase Auth
    effect(() => {
      const prof = this.auth.profile();
      if (prof) {
        this.userSignal.update((u) => ({
          ...u,
          id: String(prof.id_usuario || prof.auth_id),
          name: prof.nombreCompleto || prof.email.split('@')[0],
          email: prof.email,
          phone: prof.telefono || u.phone,
        }));
      } else {
        // Si cierra sesión, vuelve al usuario base
        this.userSignal.set(INITIAL_USER);
      }
    });
  }

  updatePreferences(preferences: UserPreferences): void {
    this.preferences.set(preferences);
    this.userSignal.update((u) => ({ ...u, preferences }));
  }

  addAddress(label: string, street: string, district: string, reference: string): void {
    const address: Address = {
      id: `ad${Date.now()}`,
      label,
      street,
      district,
      reference,
    };
    this.userSignal.update((u) => ({ ...u, addresses: [...u.addresses, address] }));
  }
}