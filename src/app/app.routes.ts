import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.HomePage),
  },
  {
    path: 'explorar',
    loadComponent: () =>
      import('./pages/explore/explore').then((m) => m.ExplorePage),
  },
  {
    path: 'restaurante/:id',
    loadComponent: () =>
      import('./pages/restaurant-detail/restaurant-detail').then((m) => m.RestaurantDetailPage),
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.CartPage),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout').then((m) => m.CheckoutPage),
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('./pages/orders/orders').then((m) => m.OrdersPage),
  },
  {
    path: 'pedido-grupal',
    loadComponent: () =>
      import('./pages/group-order/group-order').then((m) => m.GroupOrderPage),
  },
  {
    path: 'recomendaciones',
    loadComponent: () =>
      import('./pages/recommendations/recommendations').then((m) => m.RecommendationsPage),
  },
  {
    path: 'sorprendeme',
    loadComponent: () =>
      import('./pages/surprise/surprise').then((m) => m.SurprisePage),
  },
  {
    path: 'gamificacion',
    loadComponent: () =>
      import('./pages/gamification/gamification').then((m) => m.GamificationPage),
  },
  {
    path: 'mi-perfil',
    loadComponent: () =>
      import('./pages/profile/profile').then((m) => m.ProfilePage),
  },
  { path: '**', redirectTo: '' },
];