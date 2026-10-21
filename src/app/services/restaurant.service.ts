import { Injectable, signal } from '@angular/core';
import { RESTAURANTS } from '../data/data';
import { IMG } from '../data/images';
import type { Restaurant } from '../models/models';
import { GamificationService } from './gamification.service';
import { SupabaseService } from './supabase.service';

function resolveRestaurantImage(slug: string, id: number): string {
  switch (slug) {
    case 'criolla':
    case 'novoandina':
      return IMG.criollo;
    case 'marina':
    case 'cebicheria':
      return IMG.shrimp;
    case 'chifa':
      return IMG.thai;
    case 'polleria':
      return IMG.bbq;
    case 'pizzeria':
      return IMG.pizza;
    case 'nikkei':
      return IMG.sushi;
    case 'vegana':
      return IMG.salad;
    case 'cafeteria':
      return IMG.cake;
    default:
      return id % 2 === 0 ? IMG.burger : IMG.steak;
  }
}

/**
 * Servicio de Restaurantes conectado a Supabase (PostgreSQL).
 */
@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private readonly all = signal<Restaurant[]>(RESTAURANTS);
  readonly restaurants = this.all.asReadonly();
  readonly loading = signal<boolean>(false);

  constructor(
    private readonly gamification: GamificationService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.loadFromSupabase();
  }

  async loadFromSupabase(): Promise<void> {
    try {
      this.loading.set(true);
      const { data, error } = await this.supabaseService.client
        .from('restaurante')
        .select(`
          id_restaurante,
          nombre_comercial,
          descripcion,
          rango_precio,
          logo_url,
          situacion,
          verificado,
          restaurante_tipo_cocina(
            es_principal,
            tipo_cocina(id_tipo_cocina, nombre_tipo_cocina, slug_web)
          ),
          restaurante_etiqueta(
            etiqueta(nombre_etiqueta)
          )
        `)
        .eq('estado_registro', true);

      if (error) {
        console.warn('Error cargando restaurantes desde Supabase (usando datos locales):', error);
        return;
      }

      if (data && data.length > 0) {
        const mapped: Restaurant[] = data.map((r: any) => {
          // Obtener tipo de cocina principal
          const tipos = (r.restaurante_tipo_cocina || [])
            .map((tc: any) => tc.tipo_cocina)
            .filter(Boolean);
          const principal = tipos.find((tc: any) => tc.es_principal) || tipos[0];
          const categorySlug = principal?.slug_web || 'criolla';

          // Etiquetas
          const tags = (r.restaurante_etiqueta || [])
            .map((re: any) => re.etiqueta?.nombre_etiqueta)
            .filter(Boolean);

          const idNum = Number(r.id_restaurante) || 1;

          return {
            id: String(r.id_restaurante),
            name: r.nombre_comercial,
            description: r.descripcion || 'Especialidades preparadas al momento con ingredientes frescos.',
            category: categorySlug,
            rating: Number((4.6 + (idNum % 4) * 0.1).toFixed(1)),
            ratingCount: 150 + idNum * 65,
            deliveryTime: 25 + (idNum % 3) * 5,
            priceRange: r.rango_precio || 2,
            distance: Number((0.8 + (idNum * 0.4)).toFixed(1)),
            image: resolveRestaurantImage(categorySlug, idNum),
            isOpen: r.situacion === 'ACTIVO',
            tags: tags.length > 0 ? tags : [categorySlug],
          };
        });

        this.all.set(mapped);
      }
    } catch (err) {
      console.warn('Error inesperado al consultar Supabase:', err);
    } finally {
      this.loading.set(false);
    }
  }

  getById(id: string): Restaurant | undefined {
    return this.all().find((r) => r.id === id);
  }

  getByCategory(category: string): Restaurant[] {
    return this.all().filter((r) => r.category === category);
  }

  byIds(ids: string[]): Restaurant[] {
    return this.all().filter((r) => ids.includes(r.id));
  }

  /** Búsqueda por nombre / descripción / categoría / tags. */
  search(query: string): Restaurant[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.all();
    return this.all().filter((r) =>
      [r.name, r.description, r.category, ...r.tags].join(' ').toLowerCase().includes(q),
    );
  }

  /** Abrir el menú de un restaurante: cuenta como descubierto. */
  discover(restaurantId: string): void {
    this.gamification.markDiscovered(restaurantId);
  }
}