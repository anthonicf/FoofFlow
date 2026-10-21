import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
    );
  }

  /**
   * Instancia principal del cliente Supabase para consultas a la base de datos,
   * autenticación y suscripciones Realtime.
   */
  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Helper directo para autenticación
   */
  get auth() {
    return this.supabase.auth;
  }
}
