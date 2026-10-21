import { Injectable, signal } from '@angular/core';
import { PRODUCTS } from '../data/data';
import { IMG, IMAGE_POOL } from '../data/images';
import type { Product } from '../models/models';
import { SupabaseService } from './supabase.service';

function resolveProductImage(name: string, category: string, id: number): string {
  const n = (name + ' ' + category).toLowerCase();
  if (n.includes('papa') || n.includes('causa') || n.includes('crioll') || n.includes('seco') || n.includes('ají') || n.includes('aji')) return IMG.criollo;
  if (n.includes('arroz') || n.includes('chaufa') || n.includes('tallar')) return IMG.thai;
  if (n.includes('ceviche') || n.includes('cebiche') || n.includes('mar') || n.includes('pescad') || n.includes('tiradito')) return IMG.shrimp;
  if (n.includes('pollo') || n.includes('brasa') || n.includes('alita') || n.includes('parrilla')) return IMG.bbq;
  if (n.includes('pizza') || n.includes('focaccia')) return IMG.pizza;
  if (n.includes('sushi') || n.includes('roll') || n.includes('ramen') || n.includes('maki')) return IMG.sushi;
  if (n.includes('ensalada') || n.includes('vegano') || n.includes('bowl')) return IMG.salad;
  if (n.includes('burger') || n.includes('hamburguesa')) return IMG.burger;
  if (n.includes('bebida') || n.includes('chicha') || n.includes('jugo') || n.includes('gaseosa') || n.includes('cafe') || n.includes('café')) return IMG.coffee;
  if (n.includes('postre') || n.includes('torta') || n.includes('tarta') || n.includes('helado') || n.includes('dulce') || n.includes('pie')) return IMG.cake;
  return IMAGE_POOL[id % IMAGE_POOL.length] || IMG.steak;
}

/**
 * Servicio de Productos y Carta conectado a Supabase (PostgreSQL).
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly all = signal<Product[]>(PRODUCTS);
  readonly products = this.all.asReadonly();
  readonly loading = signal<boolean>(false);

  constructor(private readonly supabaseService: SupabaseService) {
    this.loadFromSupabase();
  }

  async loadFromSupabase(): Promise<void> {
    try {
      this.loading.set(true);
      const { data, error } = await this.supabaseService.client
        .from('producto')
        .select(`
          id_producto,
          nombre_producto,
          descripcion,
          precio_actual,
          disponible,
          es_vegetariano,
          nivel_picante,
          categoria_carta (
            id_restaurante,
            nombre_categoria
          )
        `)
        .eq('estado_registro', true);

      if (error) {
        console.warn('Error cargando carta desde Supabase (usando datos locales):', error);
        return;
      }

      if (data && data.length > 0) {
        const mapped: Product[] = data.map((p: any) => {
          const cat = p.categoria_carta;
          const restId = cat ? String(cat.id_restaurante) : '1';
          const catName = cat?.nombre_categoria || 'Platos';
          const idNum = Number(p.id_producto) || 1;

          const tags: string[] = [];
          if (p.es_vegetariano) tags.push('Vegano');
          if (p.nivel_picante && p.nivel_picante > 0) tags.push('Picante');

          return {
            id: String(p.id_producto),
            restaurantId: restId,
            name: p.nombre_producto,
            description: p.descripcion || 'Preparado con insumos frescos de primera calidad.',
            price: Number(p.precio_actual) || 0,
            category: catName,
            image: resolveProductImage(p.nombre_producto, catName, idNum),
            available: p.disponible !== false,
            tags,
          };
        });

        this.all.set(mapped);
      }
    } catch (err) {
      console.warn('Error inesperado al consultar productos en Supabase:', err);
    } finally {
      this.loading.set(false);
    }
  }

  getById(id: string): Product | undefined {
    return this.all().find((p) => p.id === id);
  }

  byRestaurant(restaurantId: string, availableOnly = false): Product[] {
    return this.all()
      .filter((p) => p.restaurantId === restaurantId)
      .filter((p) => !availableOnly || p.available);
  }

  /** Productos destacados de un restaurante (por calificación implícita). */
  featuredByRestaurant(restaurantId: string, count = 4): Product[] {
    return this.byRestaurant(restaurantId, true).slice(0, count);
  }

  byRestaurants(restaurantIds: string[]): Product[] {
    return this.all().filter((p) => restaurantIds.includes(p.restaurantId));
  }
}