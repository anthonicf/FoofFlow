import { Injectable, signal } from '@angular/core';
import { INITIAL_USER } from '../data/data';
import type { Address, User, UserPreferences } from '../models/models';

/**
 * Usuario simulado del prototipo.
 * Posteriormente será reemplazado por autenticación real (Spring Security + JWT).
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly userSignal = signal<User>(INITIAL_USER);

  readonly user = this.userSignal.asReadonly();

  readonly preferences = signal<UserPreferences>(INITIAL_USER.preferences);

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