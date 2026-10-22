import { Injectable, computed, inject, signal } from '@angular/core';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export interface UserProfile {
  id_usuario?: number;
  id_cliente?: number;
  auth_id: string;
  email: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  telefono?: string;
  puntosFidelidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  readonly session = signal<Session | null>(null);
  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal<boolean>(true);
  readonly showAuthModal = signal<boolean>(false);

  readonly isAuthenticated = computed(() => !!this.session());
  readonly displayName = computed(() => {
    const p = this.profile();
    if (p?.nombres) return `${p.nombres} ${p.apellidos}`.trim();
    const s = this.session();
    return s?.user?.email?.split('@')[0] ?? 'Usuario';
  });

  constructor() {
    this.initAuth();
  }

  private async initAuth(): Promise<void> {
    try {
      this.loading.set(true);
      // Obtener sesión actual guardada
      const { data: { session } } = await this.supabase.client.auth.getSession();
      this.session.set(session);

      if (session?.user) {
        await this.loadUserProfile(session.user);
      }

      // Escuchar cambios de estado (login, logout, refresh token)
      this.supabase.client.auth.onAuthStateChange(async (event, newSession) => {
        this.session.set(newSession);
        if (newSession?.user) {
          await this.loadUserProfile(newSession.user);
        } else {
          this.profile.set(null);
        }
      });
    } catch (err) {
      console.warn('Error al inicializar sesión en Supabase:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async loadUserProfile(sbUser: SupabaseUser): Promise<void> {
    try {
      const email = sbUser.email ?? '';
      const meta = sbUser.user_metadata || {};

      // Consultar tabla usuario en PostgreSQL
      const { data: usuario } = await this.supabase.client
        .from('usuario')
        .select('id_usuario, nombres, apellido_paterno, apellido_materno, telefono')
        .eq('correo', email)
        .maybeSingle();

      let puntos = 50;
      let idCliente: number | undefined;

      if (usuario?.id_usuario) {
        const { data: cliente } = await this.supabase.client
          .from('cliente')
          .select('id_cliente, puntos_fidelidad')
          .eq('id_usuario', usuario.id_usuario)
          .maybeSingle();

        if (cliente) {
          idCliente = cliente.id_cliente;
          puntos = cliente.puntos_fidelidad ?? 50;
        }
      }

      const nombres = usuario?.nombres || meta['nombres'] || email.split('@')[0];
      const apellidos = usuario?.apellido_paterno || meta['apellido_paterno'] || '';

      this.profile.set({
        id_usuario: usuario?.id_usuario,
        id_cliente: idCliente,
        auth_id: sbUser.id,
        email,
        nombres,
        apellidos,
        nombreCompleto: `${nombres} ${apellidos}`.trim(),
        telefono: usuario?.telefono || meta['telefono'],
        puntosFidelidad: puntos,
      });
    } catch (err) {
      console.warn('Error cargando perfil del usuario:', err);
    }
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    try {
      this.loading.set(true);
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let msg = 'Error al iniciar sesión.';
        if (error.message.includes('Invalid login credentials')) {
          msg = 'Correo electrónico o contraseña incorrectos.';
        } else if (error.message.includes('Email not confirmed')) {
          msg = 'Por favor verifica tu correo electrónico para ingresar.';
        }
        return { error: msg };
      }

      if (data.session) {
        this.session.set(data.session);
        await this.loadUserProfile(data.session.user);
        this.showAuthModal.set(false);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Error de conexión.' };
    } finally {
      this.loading.set(false);
    }
  }

  async signUp(data: {
    email: string;
    password: string;
    nombres: string;
    apellido_paterno: string;
    numero_documento?: string;
    telefono?: string;
  }): Promise<{ error: string | null; emailConfirmationRequired?: boolean }> {
    try {
      this.loading.set(true);
      const { data: resData, error } = await this.supabase.client.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            nombres: data.nombres.trim(),
            apellido_paterno: data.apellido_paterno.trim(),
            numero_documento: data.numero_documento?.trim() || '',
            telefono: data.telefono?.trim() || '',
          },
        },
      });

      if (error) {
        let msg = 'Error al crear la cuenta.';
        if (error.message.includes('User already registered')) {
          msg = 'Este correo electrónico ya se encuentra registrado.';
        } else if (error.message.includes('Password should be at least')) {
          msg = 'La contraseña debe tener al menos 6 caracteres.';
        }
        return { error: msg };
      }

      // Si se logueó de inmediato sin requerir confirmación por correo:
      if (resData.session) {
        this.session.set(resData.session);
        await this.loadUserProfile(resData.session.user);
        this.showAuthModal.set(false);
        return { error: null, emailConfirmationRequired: false };
      }

      return { error: null, emailConfirmationRequired: true };
    } catch (err: any) {
      return { error: err.message || 'Error de conexión.' };
    } finally {
      this.loading.set(false);
    }
  }

  async signOut(): Promise<void> {
    try {
      this.loading.set(true);
      await this.supabase.client.auth.signOut();
      this.session.set(null);
      this.profile.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  openModal(): void {
    this.showAuthModal.set(true);
  }

  closeModal(): void {
    this.showAuthModal.set(false);
  }
}
