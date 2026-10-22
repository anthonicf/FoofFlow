/**
 * Modelo de dominio del prototipo (mock).
 * Estas interfaces se trasladarán al backend (Spring Boot + JPA) en una etapa futura.
 */

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  ratingCount: number;
  deliveryTime: number; // minutos estimados
  priceRange: number; // 1 = $, 2 = $$, 3 = $$$
  distance: number; // km
  image: string;
  isOpen: boolean;
  tags: string[];
}

export interface Product {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserPreferences {
  favoriteCategories: string[];
  favoriteFlavors: string[];
  budgetPerPlate: number; // presupuesto en S/
  maxDeliveryTime: number; // minutos
  vegetarian: boolean;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  district: string;
  reference: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  preferences: UserPreferences;
  addresses: Address[];
}

export type OrderStatus = 'Preparando' | 'En camino' | 'Entregado' | 'Cancelado';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantCategory: string;
  restaurantImage: string;
  date: string; // ISO
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  rating?: number;
  xpEarned: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface Level {
  number: number;
  title: string;
  minXp: number;
}

export interface GroupOrderParticipant {
  id: string;
  name: string;
  items: OrderItem[];
}

export interface GroupOrder {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  participants: GroupOrderParticipant[];
  total: number;
  active: boolean;
}

export interface Recommendation {
  restaurant: Restaurant;
  score: number;
  reasons: string[];
}

export interface XpEvent {
  amount: number;
  reason: string;
  date: string;
}