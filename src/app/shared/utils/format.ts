import { APP_CONFIG } from '../../core/app.config';

/** Formatea un monto en soles. Ej: 32 -> "S/ 32" */
export function fmtPrice(value: number): string {
  const formatted = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
  return `${APP_CONFIG.currency} ${formatted}`;
}

/** Etiqueta de rango de precios: 1 = $, 2 = $$, 3 = $$$ */
export function priceLevel(value: number): string {
  return '$'.repeat(Math.min(Math.max(value, 1), 3));
}

/** Distancia legible: 1.2 km */
export function fmtDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}