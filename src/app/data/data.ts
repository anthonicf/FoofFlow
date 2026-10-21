import { IMG } from './images';
import type {
  Achievement,
  Category,
  Level,
  Mission,
  Product,
  Restaurant,
  User,
} from '../models/models';

/* ------------------------------ Categorías ------------------------------ */

export const CATEGORIES: Category[] = [
  { id: 'criolla', name: 'Comida criolla', icon: '🍲', image: IMG.criollo },
  { id: 'marina', name: 'Marina y cebichería', icon: '🐟', image: IMG.shrimp },
  { id: 'chifa', name: 'Chifa', icon: '🥡', image: IMG.thai },
  { id: 'polleria', name: 'Pollería', icon: '🍗', image: IMG.bbq },
  { id: 'pizzeria', name: 'Pizzería', icon: '🍕', image: IMG.pizza },
  { id: 'nikkei', name: 'Nikkei', icon: '🍣', image: IMG.sushi },
  { id: 'vegana', name: 'Vegana y saludable', icon: '🥗', image: IMG.salad },
  { id: 'cafeteria', name: 'Café y postres', icon: '☕', image: IMG.coffee },
  { id: 'comida-rapida', name: 'Comida rápida', icon: '🍔', image: IMG.burger },
  { id: 'novoandina', name: 'Novoandina', icon: '🥩', image: IMG.steak },
];

/* ------------------------------ Restaurantes ------------------------------ */

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Sabor Criollo',
    description:
      'Sabores del Perú en su máxima expresión. Ceviches frescos, lomo saltado y recetas criollas de la casa.',
    category: 'criolla',
    rating: 4.8,
    ratingCount: 1240,
    deliveryTime: 35,
    priceRange: 2,
    distance: 1.2,
    image: IMG.criollo,
    isOpen: true,
    tags: ['peruano', 'marinos'],
  },
  {
    id: 'r2',
    name: 'Tokyo House',
    description:
      'Sushi, ramen y cocina japonesa contemporánea con ingredientes frescos y presentación de autor.',
    category: 'japonesa',
    rating: 4.7,
    ratingCount: 890,
    deliveryTime: 30,
    priceRange: 3,
    distance: 2.4,
    image: IMG.sushi,
    isOpen: true,
    tags: ['sushi', 'ramen'],
  },
  {
    id: 'r3',
    name: 'Burger Lab',
    description:
      'Hamburguesas artesanales con pan brioche, carnes maduradas y salsas experimentales del laboratorio.',
    category: 'hamburguesas',
    rating: 4.6,
    ratingCount: 2050,
    deliveryTime: 25,
    priceRange: 2,
    distance: 0.8,
    image: IMG.burger,
    isOpen: true,
    tags: ['smash', 'artesanal'],
  },
  {
    id: 'r4',
    name: 'La Trattoria',
    description:
      'Pastas frescas, pizzas al horno de leña y recetas italianas clásicas en un ambiente cálido.',
    category: 'pizza',
    rating: 4.5,
    ratingCount: 1580,
    deliveryTime: 40,
    priceRange: 2,
    distance: 3.1,
    image: IMG.pasta,
    isOpen: true,
    tags: ['italiana', 'pasta'],
  },
  {
    id: 'r5',
    name: 'Green Bowl',
    description:
      'Bowls saludables, wraps y jugos naturales para comer rico sin descuidar el resto.',
    category: 'saludable',
    rating: 4.4,
    ratingCount: 640,
    deliveryTime: 20,
    priceRange: 1,
    distance: 1.9,
    image: IMG.bowl,
    isOpen: true,
    tags: ['veggie', 'fit'],
  },
  {
    id: 'r6',
    name: 'Taco Norte',
    description:
      'Tacos al pastor, burritos y antojitos mexicanos con ese toque norteño y picante.',
    category: 'mexicana',
    rating: 4.6,
    ratingCount: 980,
    deliveryTime: 28,
    priceRange: 1,
    distance: 2.7,
    image: IMG.tacos,
    isOpen: true,
    tags: ['picante', 'tacos'],
  },
  {
    id: 'r7',
    name: 'Dulce Placer',
    description:
      'Postres caseros: tres leches, cheesecakes, brownies y helados artesanales para los golosos.',
    category: 'postres',
    rating: 4.7,
    ratingCount: 730,
    deliveryTime: 22,
    priceRange: 1,
    distance: 1.5,
    image: IMG.cake,
    isOpen: true,
    tags: ['dulce', 'artesanal'],
  },
  {
    id: 'r8',
    name: 'Café Motto',
    description:
      'Café de especialidad, brunch y repostería para empezar el día o tomar un break.',
    category: 'cafe',
    rating: 4.5,
    ratingCount: 410,
    deliveryTime: 18,
    priceRange: 1,
    distance: 0.6,
    image: IMG.coffee,
    isOpen: true,
    tags: ['brunch', 'cafe'],
  },
];

/* ------------------------------ Productos ------------------------------ */

const P = (
  id: string,
  restaurantId: string,
  name: string,
  description: string,
  price: number,
  category: string,
  image: string,
  tags: string[] = [],
  available = true,
): Product => ({ id, restaurantId, name, description, price, category, image, available, tags });

export const PRODUCTS: Product[] = [
  // Sabor Criollo
  P('p101', 'r1', 'Ceviche clásico', 'Pescado fresco en leche de tigre con cebolla, camote y choclo.', 28, 'Marinos', IMG.criollo, ['fresco']),
  P('p102', 'r1', 'Lomo saltado', 'Tiras de lomo salteadas con cebolla, tomate y papas fritas.', 32, 'Platos de fondo', IMG.steak, ['carnes']),
  P('p103', 'r1', 'Ají de gallina', 'Pollo deshilachado en crema de ají amarillo con arroz y papas.', 26, 'Platos de fondo', IMG.shrimp, ['criollo']),
  P('p104', 'r1', 'Arroz con mariscos', 'Arroz graneado con calamar, camarón, conchas y ají panca.', 35, 'Marinos', IMG.salmon, ['marinos']),
  P('p105', 'r1', 'Chicha morada', 'Refresco tradicional de maíz morado con piña y canela.', 7, 'Bebidas', IMG.icecream, ['dulce']),

  // Tokyo House
  P('p201', 'r2', 'Maki California', 'Roll de cangrejo, palta y pepino con sésamo tostado (8 piezas).', 24, 'Sushi', IMG.sushiRolls, ['fresco']),
  P('p202', 'r2', 'Nigiri salmón', 'Nigiri de salmón fresco con arroz sazonado (2 piezas).', 18, 'Sushi', IMG.salmon, ['fresco']),
  P('p203', 'r2', 'Ramen tonkotsu', 'Caldo de cerdo, fideos, huevo marinado y chashu.', 30, 'Platos calientes', IMG.ramen, ['picante']),
  P('p204', 'r2', 'Tempura de verduras', 'Verduras crocantes en tempura con salsa tentsuyu.', 16, 'Entrantes', IMG.salad, ['ligero']),
  P('p205', 'r2', 'Poke de atún', 'Base de arroz, atún fresco, palta y edamame.', 26, 'Poke', IMG.poke, ['saludable']),

  // Burger Lab
  P('p301', 'r3', 'Smash Burger', 'Doble carne smash, queso cheddar y salsa secreta del lab.', 22, 'Hamburguesas', IMG.burger, ['sabroso']),
  P('p302', 'r3', 'Bacon Cheese', 'Carne 180g, bacon crocante, doble queso y cebolla caramelizada.', 25, 'Hamburguesas', IMG.burger2, ['carnes']),
  P('p303', 'r3', 'Crispy Chicken', 'Pollo crujiente, coleslaw y mayonesa de ajo.', 19, 'Hamburguesas', IMG.burger3, ['frito']),
  P('p304', 'r3', 'Papas del lab', 'Papas fritas con sal de trufa y parmesano.', 9, 'Acompañamientos', IMG.fries, ['frito']),
  P('p305', 'r3', 'Milkshake de oreo', 'Batido cremoso de vainilla con trozos de oreo.', 12, 'Bebidas', IMG.dessert, ['dulce']),

  // La Trattoria
  P('p401', 'r4', 'Pizza margherita', 'Mozzarella de búfala, tomate san marzano y albahaca.', 32, 'Pizzas', IMG.pizza, ['italiano']),
  P('p402', 'r4', 'Pizza pepperoni', 'Salsa de tomate, doble mozzarella y pepperoni.', 36, 'Pizzas', IMG.pizzaPepperoni, ['sabroso']),
  P('p403', 'r4', 'Pasta carbonara', 'Fettuccine con guanciale, yema y pecorino.', 28, 'Pastas', IMG.pasta, ['cremoso']),
  P('p404', 'r4', 'Lasagna bolognesa', 'Capas de pasta, ragú de res y bechamel gratinada.', 30, 'Pastas', IMG.lasagna, ['carnes']),
  P('p405', 'r4', 'Tiramisú', 'Clásico italiano con mascarpone y café.', 14, 'Postres', IMG.cake, ['dulce']),

  // Green Bowl
  P('p501', 'r5', 'Bowl veggie', 'Quinoa, palta, garbanzos, espinaca y vinagreta de limón.', 18, 'Bowls', IMG.bowl, ['saludable', 'veggie']),
  P('p502', 'r5', 'Chicken bowl', 'Pollo grillado, arroz integral, brócoli y salsa de yogur.', 22, 'Bowls', IMG.breakfast, ['saludable']),
  P('p503', 'r5', 'Wrap de pollo', 'Tortilla integral con pollo, lechuga y hummus.', 16, 'Wraps', IMG.salad, ['ligero']),
  P('p504', 'r5', 'Ensalada mediterránea', 'Lechuga, tomates, aceitunas queso feta.', 17, 'Ensaladas', IMG.salmon, ['veggie']),
  P('p505', 'r5', 'Smoothie verde', 'Manzana, espinaca, jengibre y limón.', 10, 'Bebidas', IMG.poke, ['saludable', 'dulce']),

  // Taco Norte
  P('p601', 'r6', 'Tacos al pastor', '3 tacos con adobo de cerdo, piña, cebolla y cilantro.', 15, 'Tacos', IMG.tacos, ['picante']),
  P('p602', 'r6', 'Burrito norteño', 'Tortilla grande con carne, arroz, frijoles y queso.', 24, 'Burritos', IMG.burrito, ['sabroso']),
  P('p603', 'r6', 'Nachos con queso', 'Totopos con queso fundido, jalapeños y guacamole.', 18, 'Antojitos', IMG.bbq, ['frito']),
  P('p604', 'r6', 'Quesadilla de pollo', 'Tortilla a la plancha con pollo y queso derretido.', 17, 'Antojitos', IMG.burger3, ['sabroso']),
  P('p605', 'r6', 'Agua de horchata', 'Bebida dulce de arroz y canela.', 8, 'Bebidas', IMG.dessert, ['dulce']),

  // Dulce Placer
  P('p701', 'r7', 'Tres leches', 'Clásico pastel bañado en tres leches con merengue.', 14, 'Pasteles', IMG.cake, ['dulce']),
  P('p702', 'r7', 'Cheesecake de fresa', 'Base de galleta con cheesecake cremoso y salsa de fresa.', 16, 'Pasteles', IMG.icecream, ['dulce']),
  P('p703', 'r7', 'Brownie con helado', 'Brownie caliente, helado de vainilla y nueces.', 15, 'Helados', IMG.burger4, ['dulce']),
  P('p704', 'r7', 'Gelato artesanal', '2 bolas de gelato: chocolate, vainilla o lúcuma.', 12, 'Helados', IMG.icecream, ['dulce']),
  P('p705', 'r7', 'Picarones', 'Dona peruana de zapallo con miel de chancaca.', 10, 'Postres peruanos', IMG.dessert, ['dulce']),

  // Café Motto
  P('p801', 'r8', 'Cappuccino', 'Espresso y leche vaporizada con arte latte.', 11, 'Café', IMG.coffee, ['cafe']),
  P('p802', 'r8', 'Flat white', 'Doble shot espresso con microespuma.', 13, 'Café', IMG.croissant, ['cafe']),
  P('p803', 'r8', 'Croissant de almendras', 'Croissant artesanal relleno de crema de almendras.', 12, 'Brunch', IMG.croissant, ['dulce']),
  P('p804', 'r8', 'Pancakes con miel', 'Pancakes esponjosos con miel, frutas y mantequilla.', 18, 'Brunch', IMG.pancakes, ['dulce']),
  P('p805', 'r8', 'Tostadas con palta', 'Pan de masa madre, palta, huevo poché y limón.', 16, 'Brunch', IMG.breakfast, ['saludable']),
];

/* ------------------------------ Gamificación ------------------------------ */

export const LEVELS: Level[] = [
  { number: 1, title: 'Novato', minXp: 0 },
  { number: 2, title: 'Aprendiz', minXp: 150 },
  { number: 3, title: 'Explorador', minXp: 350 },
  { number: 4, title: 'Gourmet', minXp: 600 },
  { number: 5, title: 'Foodie', minXp: 900 },
  { number: 6, title: 'Crítico', minXp: 1300 },
  { number: 7, title: 'Leyenda', minXp: 1800 },
];

export const MISSIONS: Mission[] = [
  {
    id: 'm1',
    completed: false,
    title: 'Descubre 3 restaurantes nuevos',
    description: 'Visita el menú de restaurantes que aún no conoces.',
    icon: '🧭',
    target: 3,
    progress: 0,
    reward: 100,
    claimed: false,
  },
  {
    id: 'm2',
    completed: false,
    title: 'Realiza tu primer pedido',
    description: 'Completa tu primer checkout exitoso.',
    icon: '📦',
    target: 1,
    progress: 0,
    reward: 150,
    claimed: false,
  },
  {
    id: 'm3',
    completed: false,
    title: 'Valora 2 pedidos',
    description: 'Deja tu calificación en dos pedidos entregados.',
    icon: '⭐',
    target: 2,
    progress: 0,
    reward: 100,
    claimed: false,
  },
  {
    id: 'm4',
    completed: false,
    title: 'Prueba una nueva categoría',
    description: 'Pide en una categoría que no está en tus favoritas.',
    icon: '🍽️',
    target: 1,
    progress: 0,
    reward: 150,
    claimed: false,
  },
  {
    id: 'm5',
    completed: false,
    title: 'Completa 3 pedidos',
    description: 'Acumula tres pedidos confirmados.',
    icon: '🏆',
    target: 3,
    progress: 0,
    reward: 200,
    claimed: false,
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'Primer pedido', description: 'Realiza tu primer pedido en la plataforma.', icon: '🥇', unlockedAt: null },
  { id: 'a2', title: 'Explorador', description: 'Descubre 3 restaurantes.', icon: '🧭', unlockedAt: null },
  { id: 'a3', title: 'Crítico gastronómico', description: 'Valora 2 pedidos.', icon: '✍️', unlockedAt: null },
  { id: 'a4', title: 'Gourmet nivel 3', description: 'Alcanza el nivel 3.', icon: '⭐', unlockedAt: null },
  { id: 'a5', title: 'En equipo', description: 'Participa en un pedido grupal.', icon: '👥', unlockedAt: null },
  { id: 'a6', title: 'Aventurero', description: 'Usa la función Sorpréndeme.', icon: '🎲', unlockedAt: null },
];

/* ------------------------------ Usuario simulado ------------------------------ */

export const INITIAL_USER: User = {
  id: 'u1',
  name: 'Nicolas',
  email: 'nicolas@ejemplo.com',
  avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Nick',
  preferences: {
    favoriteCategories: ['hamburguesas', 'japonesa', 'criolla'],
    favoriteFlavors: ['sabroso', 'fresco', 'dulce'],
    budgetPerPlate: 30,
    maxDeliveryTime: 40,
    vegetarian: false,
  },
  addresses: [
    { id: 'ad1', label: 'Casa', street: 'Av. Los Tallares 123, Dpto 302', district: 'San Miguel', reference: 'Tercer piso' },
    { id: 'ad2', label: 'Trabajo', street: 'Jr. de la Unión 456', district: 'Centro de Lima', reference: 'Oficina 12' },
  ],
};

/* ------------------------------ Niveles de XP ------------------------------ */

export const XP_RULES = {
  orderPlaced: 50,
  orderRated: 25,
  restaurantDiscovered: 100,
  missionClaimed: 150,
  missionClaimedBonus: 150,
  surpriseUsed: 20,
} as const;