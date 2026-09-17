/**
 * Imágenes centralizadas (URLs de Unsplash).
 * Reemplazar aquí en bloque cuando se disponga de imágenes propias.
 */
const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  hero: u('photo-1517248135467-4c7edcad34c4', 1600),
  restaurantInterior: u('photo-1517248135467-4c7edcad34c4'),

  burger: u('photo-1568901346375-23c9450c58cd'),
  burger2: u('photo-1550547660-d9450f859349'),
  burger3: u('photo-1551782450-a2132b4ba21d'),
  burger4: u('photo-1586190848861-99aa4a171e90'),
  fries: u('photo-1573080496219-bb080dd4f877'),

  pizza: u('photo-1513104890138-7c749659a591'),
  pizzaPepperoni: u('photo-1628840042765-356cda07504e'),

  sushi: u('photo-1579871494447-9811cf80d66c'),
  sushiRolls: u('photo-1611143669185-af224c5e3252'),
  ramen: u('photo-1569718212165-3a8278d5f624'),
  ramen2: u('photo-1563612116625-3012372fccce'),
  salmon: u('photo-1467003909585-2f8a72700288'),
  poke: u('photo-1553163147-622ab57be1c7'),

  criollo: u('photo-1540189549336-e6e99c3679fe'),
  steak: u('photo-1504674900247-0877df9cc836'),
  shrimp: u('photo-1559737558-2f5a35f4523b'),
  thai: u('photo-1455619452474-d2be8b1e70cd'),

  tacos: u('photo-1551504734-5ee1c4a1479b'),
  burrito: u('photo-1565299624946-b28f40a0ae38'),

  salad: u('photo-1512621776951-a57141f2eefd'),
  bowl: u('photo-1546069901-ba9599a7e63c'),
  breakfast: u('photo-1482049016688-2d3e1b311543'),

  dessert: u('photo-1551024506-0bccd828d307'),
  cake: u('photo-1578985545062-69928b1d9587'),
  icecream: u('photo-1563805042-7684c019e1cb'),

  pasta: u('photo-1621996346565-e3dbc646d9a9'),
  lasagna: u('photo-1574894709920-11b28e7367e3'),

  coffee: u('photo-1509042239860-f550ce710b93'),
  croissant: u('photo-1555507036-ab1f4038808a'),
  pancakes: u('photo-1567620905732-2d1ec7ab7445'),

  bbq: u('photo-1555939594-58d7cb561ad1'),
  ribs: u('photo-1544025162-d76694265947'),
} as const;

export const IMAGE_POOL: string[] = [
  IMG.burger,
  IMG.burger2,
  IMG.pizza,
  IMG.pizzaPepperoni,
  IMG.sushi,
  IMG.sushiRolls,
  IMG.ramen,
  IMG.criollo,
  IMG.steak,
  IMG.tacos,
  IMG.salad,
  IMG.bowl,
  IMG.dessert,
  IMG.cake,
  IMG.pasta,
  IMG.lasagna,
  IMG.coffee,
  IMG.breakfast,
  IMG.salmon,
  IMG.poke,
  IMG.bbq,
  IMG.shrimp,
  IMG.icecream,
];