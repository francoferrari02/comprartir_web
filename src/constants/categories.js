export const CATEGORY_DEFINITIONS = [
  {
    key: 'lacteos',
    name: 'Lácteos',
    icon: 'mdi-bottle-milk-outline',
  },
  {
    key: 'verduras',
    name: 'Verduras',
    icon: 'mdi-carrot',
  },
  {
    key: 'frutas',
    name: 'Frutas',
    icon: 'mdi-fruit-cherries',
  },
  {
    key: 'limpieza',
    name: 'Limpieza',
    icon: 'mdi-spray-bottle',
  },
  {
    key: 'higiene',
    name: 'Higiene',
    icon: 'mdi-toothbrush-paste',
  },
  {
    key: 'ferreteria',
    name: 'Ferretería',
    icon: 'mdi-hammer-wrench',
  },
  {
    key: 'carnes',
    name: 'Carnes',
    icon: 'mdi-food-steak',
  },
  {
    key: 'pescados',
    name: 'Pescados',
    icon: 'mdi-fish',
  },
  {
    key: 'panaderia',
    name: 'Panadería',
    icon: 'mdi-baguette',
  },
  {
    key: 'bebidas',
    name: 'Bebidas',
    icon: 'mdi-bottle-soda-classic',
  },
  {
    key: 'congelados',
    name: 'Congelados',
    icon: 'mdi-snowflake',
  },
  {
    key: 'snacks',
    name: 'Snacks',
    icon: 'mdi-food-variant',
  },
  {
    key: 'despensa',
    name: 'Despensa',
    icon: 'mdi-silverware-fork-knife',
  },
  {
    key: 'enlatados',
    name: 'Enlatados',
    icon: 'mdi-food-can',
  },
  {
    key: 'condimentos',
    name: 'Condimentos',
    icon: 'mdi-shaker',
  },
  {
    key: 'aceites',
    name: 'Aceites y Vinagres',
    icon: 'mdi-oil',
  },
  {
    key: 'cereales',
    name: 'Cereales',
    icon: 'mdi-corn',
  },
  {
    key: 'pastas',
    name: 'Pastas',
    icon: 'mdi-noodles',
  },
  {
    key: 'legumbres',
    name: 'Legumbres',
    icon: 'mdi-food-pea',
  },
  {
    key: 'desayunos',
    name: 'Desayunos e Infusiones',
    icon: 'mdi-coffee',
  },
  {
    key: 'reposteria',
    name: 'Repostería',
    icon: 'mdi-cupcake',
  },
  {
    key: 'frutosSecos',
    name: 'Frutos Secos',
    icon: 'mdi-peanut-outline',
  },
  {
    key: 'mascotas',
    name: 'Mascotas',
    icon: 'mdi-paw',
  },
  {
    key: 'bebes',
    name: 'Bebés',
    icon: 'mdi-baby-face-outline',
  },
  {
    key: 'bazar',
    name: 'Bazar y Utensilios',
    icon: 'mdi-saucepan',
  },
  {
    key: 'cuidadoRopa',
    name: 'Cuidado de la Ropa',
    icon: 'mdi-tshirt-crew-outline',
  },
]

export const CATEGORY_BY_KEY = CATEGORY_DEFINITIONS.reduce((acc, category) => {
  acc[category.key] = category
  return acc
}, {})

export const CATEGORY_ICON_BY_NAME = CATEGORY_DEFINITIONS.reduce((acc, category) => {
  acc[category.name.toLowerCase()] = category.icon
  return acc
}, {})

export const CATEGORY_ICON_BY_KEY = CATEGORY_DEFINITIONS.reduce((acc, category) => {
  acc[category.key] = category.icon
  return acc
}, {})

export const CATEGORY_KEY_BY_NAME = CATEGORY_DEFINITIONS.reduce((acc, category) => {
  acc[category.name.toLowerCase()] = category.key
  return acc
}, {})
