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
