export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', path: '/', icon: '🏠' },
  { label: 'Explorar', path: '/explorar', icon: '🧭' },
  { label: 'Recomendaciones', path: '/recomendaciones', icon: '✨' },
  { label: 'Sorpréndeme', path: '/sorprendeme', icon: '🎲' },
  { label: 'Pedidos', path: '/pedidos', icon: '🧾' },
  { label: 'Pedido grupal', path: '/pedido-grupal', icon: '👥' },
  { label: 'Gamificación', path: '/gamificacion', icon: '🏆' },
  { label: 'Mi perfil', path: '/mi-perfil', icon: '👤' },
];