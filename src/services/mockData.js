// Mock data for testing without real API
export const mockCategories = [
  {
    id: 1,
    name: 'Supermercado',
    metadata: { color: 'green', icon: 'cart' },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Farmacia',
    metadata: { color: 'red', icon: 'medical' },
    createdAt: '2024-01-14T09:20:00Z',
    updatedAt: '2024-01-16T14:45:00Z',
  },
  {
    id: 3,
    name: 'Verdulería',
    metadata: { color: 'orange', icon: 'carrot' },
    createdAt: '2024-01-13T08:15:00Z',
    updatedAt: '2024-01-13T08:15:00Z',
  },
  {
    id: 4,
    name: 'Ferretería',
    metadata: { color: 'gray', icon: 'tools' },
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-14T16:30:00Z',
  },
  {
    id: 5,
    name: 'Librería',
    metadata: { color: 'blue', icon: 'book' },
    createdAt: '2024-01-11T13:45:00Z',
    updatedAt: '2024-01-11T13:45:00Z',
  },
]

// Mock API delay
export const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock responses
export const mockApiResponses = {
  getAll: (params = {}) => {
    const { page = 1, per_page = 10, name = '', sortBy = 'createdAt', order = 'ASC' } = params
    
    // Filter by name
    let filtered = name 
      ? mockCategories.filter(cat => cat.name.toLowerCase().includes(name.toLowerCase()))
      : [...mockCategories]
    
    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      if (order === 'ASC') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
    
    // Paginate
    const start = (page - 1) * per_page
    const end = start + per_page
    const paginated = filtered.slice(start, end)
    
    return {
      data: paginated,
      pagination: {
        currentPage: page,
        perPage: per_page,
        totalPages: Math.ceil(filtered.length / per_page),
        totalItems: filtered.length,
      }
    }
  },
  
  getById: (id) => {
    const category = mockCategories.find(cat => cat.id === Number(id))
    if (!category) {
      throw { response: { status: 404, data: { message: 'Categoría no encontrada' } } }
    }
    return category
  },
  
  create: (data) => {
    const newCategory = {
      id: Math.max(...mockCategories.map(c => c.id)) + 1,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockCategories.unshift(newCategory)
    return newCategory
  },
  
  update: (id, data) => {
    const index = mockCategories.findIndex(cat => cat.id === Number(id))
    if (index === -1) {
      throw { response: { status: 404, data: { message: 'Categoría no encontrada' } } }
    }
    mockCategories[index] = {
      ...mockCategories[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockCategories[index]
  },
  
  delete: (id) => {
    const index = mockCategories.findIndex(cat => cat.id === Number(id))
    if (index === -1) {
      throw { response: { status: 404, data: { message: 'Categoría no encontrada' } } }
    }
    mockCategories.splice(index, 1)
    return { success: true }
  },
}

/** SHOPPING LISTS MOCK DATA **/

// Mock shopping lists data
const mockListsData = [
  {
    id: 1,
    name: 'Supermercado - Semana',
    description: 'Compras para toda la semana',
    owner: 'user@example.com',
    recurring: true,
    lastPurchasedAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    metadata: { color: 'green', icon: 'cart' }
  },
  {
    id: 2,
    name: 'Verdulería',
    description: 'Frutas y verduras frescas',
    owner: 'user@example.com',
    recurring: false,
    lastPurchasedAt: null,
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
    metadata: { color: 'orange' }
  },
  {
    id: 3,
    name: 'Farmacia',
    description: 'Medicamentos y productos de higiene',
    owner: 'user@example.com',
    recurring: false,
    lastPurchasedAt: null,
    createdAt: '2024-01-13T07:00:00Z',
    updatedAt: '2024-01-13T07:00:00Z',
    metadata: {}
  },
  {
    id: 4,
    name: 'Cumple Emma',
    description: 'Decoración y comida para el cumpleaños',
    owner: 'user@example.com',
    recurring: false,
    lastPurchasedAt: null,
    createdAt: '2024-01-12T11:00:00Z',
    updatedAt: '2024-01-12T11:00:00Z',
    metadata: { color: 'pink' }
  },
  {
    id: 5,
    name: 'Ferretería',
    description: 'Herramientas y materiales para el hogar',
    owner: 'user@example.com',
    recurring: false,
    lastPurchasedAt: null,
    createdAt: '2024-01-11T13:00:00Z',
    updatedAt: '2024-01-11T13:00:00Z',
    metadata: {}
  }
]

// Mock list items data (keyed by listId)
const mockItemsData = {
  1: [
    { id: 1, listId: 1, productId: 101, productName: 'Leche', quantity: 2, unit: 'litros', purchased: true, categoryId: 1, pantryId: null, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-15T10:00:00Z', lastPurchasedAt: '2024-01-15T10:00:00Z', metadata: {} },
    { id: 2, listId: 1, productId: 102, productName: 'Pan', quantity: 1, unit: 'unidad', purchased: false, categoryId: 1, pantryId: null, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-10T08:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 3, listId: 1, productId: 103, productName: 'Huevos', quantity: 12, unit: 'unidades', purchased: false, categoryId: 1, pantryId: null, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-10T08:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 4, listId: 1, productId: 104, productName: 'Queso', quantity: 1, unit: 'kg', purchased: false, categoryId: 1, pantryId: null, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-10T08:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 5, listId: 1, productId: 105, productName: 'Arroz', quantity: 1, unit: 'kg', purchased: false, categoryId: 1, pantryId: null, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-10T08:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 6, listId: 1, productId: 106, productName: 'Fideos', quantity: 500, unit: 'gramos', purchased: false, categoryId: 1, pantryId: null, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-10T08:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 7, listId: 1, productId: 107, productName: 'Tomate', quantity: 1, unit: 'kg', purchased: true, categoryId: 3, pantryId: null, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-15T10:00:00Z', lastPurchasedAt: '2024-01-15T10:00:00Z', metadata: {} },
    { id: 8, listId: 1, productId: 108, productName: 'Aceite', quantity: 1, unit: 'litro', purchased: false, categoryId: 1, pantryId: null, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-10T08:00:00Z', lastPurchasedAt: null, metadata: {} }
  ],
  2: [
    { id: 9, listId: 2, productId: 201, productName: 'Tomates', quantity: 1, unit: 'kg', purchased: true, categoryId: 3, pantryId: null, createdAt: '2024-01-14T09:00:00Z', updatedAt: '2024-01-14T09:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 10, listId: 2, productId: 202, productName: 'Lechuga', quantity: 1, unit: 'unidad', purchased: false, categoryId: 3, pantryId: null, createdAt: '2024-01-14T09:00:00Z', updatedAt: '2024-01-14T09:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 11, listId: 2, productId: 203, productName: 'Zanahoria', quantity: 500, unit: 'gramos', purchased: false, categoryId: 3, pantryId: null, createdAt: '2024-01-14T09:00:00Z', updatedAt: '2024-01-14T09:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 12, listId: 2, productId: 204, productName: 'Cebolla', quantity: 500, unit: 'gramos', purchased: false, categoryId: 3, pantryId: null, createdAt: '2024-01-14T09:00:00Z', updatedAt: '2024-01-14T09:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 13, listId: 2, productId: 205, productName: 'Papa', quantity: 2, unit: 'kg', purchased: true, categoryId: 3, pantryId: null, createdAt: '2024-01-14T09:00:00Z', updatedAt: '2024-01-14T09:00:00Z', lastPurchasedAt: null, metadata: {} }
  ],
  3: [
    { id: 14, listId: 3, productId: 301, productName: 'Ibuprofeno', quantity: 1, unit: 'caja', purchased: true, categoryId: 2, pantryId: null, createdAt: '2024-01-13T07:00:00Z', updatedAt: '2024-01-13T07:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 15, listId: 3, productId: 302, productName: 'Algodón', quantity: 1, unit: 'paquete', purchased: false, categoryId: 2, pantryId: null, createdAt: '2024-01-13T07:00:00Z', updatedAt: '2024-01-13T07:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 16, listId: 3, productId: 303, productName: 'Alcohol', quantity: 1, unit: 'litro', purchased: false, categoryId: 2, pantryId: null, createdAt: '2024-01-13T07:00:00Z', updatedAt: '2024-01-13T07:00:00Z', lastPurchasedAt: null, metadata: {} }
  ],
  4: [
    { id: 17, listId: 4, productId: 401, productName: 'Globos', quantity: 20, unit: 'unidades', purchased: true, categoryId: 5, pantryId: null, createdAt: '2024-01-12T11:00:00Z', updatedAt: '2024-01-12T11:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 18, listId: 4, productId: 402, productName: 'Torta', quantity: 1, unit: 'unidad', purchased: false, categoryId: 1, pantryId: null, createdAt: '2024-01-12T11:00:00Z', updatedAt: '2024-01-12T11:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 19, listId: 4, productId: 403, productName: 'Velas', quantity: 10, unit: 'unidades', purchased: false, categoryId: 5, pantryId: null, createdAt: '2024-01-12T11:00:00Z', updatedAt: '2024-01-12T11:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 20, listId: 4, productId: 404, productName: 'Bebidas', quantity: 6, unit: 'litros', purchased: true, categoryId: 1, pantryId: null, createdAt: '2024-01-12T11:00:00Z', updatedAt: '2024-01-12T11:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 21, listId: 4, productId: 405, productName: 'Snacks', quantity: 5, unit: 'paquetes', purchased: true, categoryId: 1, pantryId: null, createdAt: '2024-01-12T11:00:00Z', updatedAt: '2024-01-12T11:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 22, listId: 4, productId: 406, productName: 'Piñata', quantity: 1, unit: 'unidad', purchased: false, categoryId: 5, pantryId: null, createdAt: '2024-01-12T11:00:00Z', updatedAt: '2024-01-12T11:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 23, listId: 4, productId: 407, productName: 'Decoración', quantity: 1, unit: 'set', purchased: false, categoryId: 5, pantryId: null, createdAt: '2024-01-12T11:00:00Z', updatedAt: '2024-01-12T11:00:00Z', lastPurchasedAt: null, metadata: {} }
  ],
  5: [
    { id: 24, listId: 5, productId: 501, productName: 'Martillo', quantity: 1, unit: 'unidad', purchased: false, categoryId: 4, pantryId: null, createdAt: '2024-01-11T13:00:00Z', updatedAt: '2024-01-11T13:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 25, listId: 5, productId: 502, productName: 'Clavos', quantity: 100, unit: 'unidades', purchased: false, categoryId: 4, pantryId: null, createdAt: '2024-01-11T13:00:00Z', updatedAt: '2024-01-11T13:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 26, listId: 5, productId: 503, productName: 'Destornillador', quantity: 1, unit: 'unidad', purchased: false, categoryId: 4, pantryId: null, createdAt: '2024-01-11T13:00:00Z', updatedAt: '2024-01-11T13:00:00Z', lastPurchasedAt: null, metadata: {} },
    { id: 27, listId: 5, productId: 504, productName: 'Cinta aisladora', quantity: 1, unit: 'rollo', purchased: false, categoryId: 4, pantryId: null, createdAt: '2024-01-11T13:00:00Z', updatedAt: '2024-01-11T13:00:00Z', lastPurchasedAt: null, metadata: {} }
  ]
}

// Mock shared users data (keyed by listId)
const mockSharedUsersData = {
  1: [
    { id: 1, userId: 10, email: 'sofia@example.com', name: 'Sofía', sharedAt: '2024-01-11T10:00:00Z' },
    { id: 2, userId: 11, email: 'juan@example.com', name: 'Juan', sharedAt: '2024-01-12T14:00:00Z' }
  ],
  3: [
    { id: 3, userId: 12, email: 'maria@example.com', name: 'María', sharedAt: '2024-01-13T09:00:00Z' }
  ],
  4: [
    { id: 4, userId: 13, email: 'emma@example.com', name: 'Emma', sharedAt: '2024-01-12T12:00:00Z' },
    { id: 5, userId: 14, email: 'carlos@example.com', name: 'Carlos', sharedAt: '2024-01-12T13:00:00Z' }
  ]
}

// Shopping Lists Mock API
export const mockShoppingLists = {
  getAll: (params = {}) => {
    const { page = 1, per_page = 10, name = '', owner = '', recurring = null, sort_by = 'createdAt', order = 'DESC' } = params

    let filtered = [...mockListsData]

    // Filter by name
    if (name) {
      filtered = filtered.filter(list =>
        list.name.toLowerCase().includes(name.toLowerCase()) ||
        list.description?.toLowerCase().includes(name.toLowerCase())
      )
    }

    // Filter by owner
    if (owner) {
      filtered = filtered.filter(list => list.owner.toLowerCase().includes(owner.toLowerCase()))
    }

    // Filter by recurring
    if (recurring !== null && recurring !== undefined && recurring !== '') {
      const isRecurring = recurring === 'true' || recurring === true
      filtered = filtered.filter(list => list.recurring === isRecurring)
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sort_by] || ''
      const bVal = b[sort_by] || ''
      if (order === 'ASC') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    // Paginate
    const start = (page - 1) * per_page
    const end = start + per_page
    const paginated = filtered.slice(start, end)

    return {
      data: paginated,
      pagination: {
        currentPage: Number(page),
        perPage: Number(per_page),
        totalPages: Math.ceil(filtered.length / per_page),
        totalItems: filtered.length
      }
    }
  },

  getById: (id) => {
    const list = mockListsData.find(l => l.id === Number(id))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }
    return list
  },

  create: (body) => {
    const maxId = mockListsData.length > 0 ? Math.max(...mockListsData.map(l => l.id)) : 0
    const newList = {
      id: maxId + 1,
      name: body.name,
      description: body.description || '',
      owner: 'user@example.com',
      recurring: body.recurring || false,
      lastPurchasedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: body.metadata || {}
    }
    mockListsData.unshift(newList)
    mockItemsData[newList.id] = []
    return newList
  },

  update: (id, body) => {
    const index = mockListsData.findIndex(l => l.id === Number(id))
    if (index === -1) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }
    mockListsData[index] = {
      ...mockListsData[index],
      ...body,
      updatedAt: new Date().toISOString()
    }
    return mockListsData[index]
  },

  delete: (id) => {
    const index = mockListsData.findIndex(l => l.id === Number(id))
    if (index === -1) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }
    mockListsData.splice(index, 1)
    delete mockItemsData[id]
    delete mockSharedUsersData[id]
    return { success: true, message: 'Lista eliminada' }
  },

  purchase: (id, metadata = {}) => {
    const list = mockListsData.find(l => l.id === Number(id))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }
    list.lastPurchasedAt = new Date().toISOString()
    list.updatedAt = new Date().toISOString()

    // Mark all items as purchased
    const items = mockItemsData[id] || []
    items.forEach(item => {
      item.purchased = true
      item.lastPurchasedAt = new Date().toISOString()
      item.updatedAt = new Date().toISOString()
    })

    return { success: true, message: 'Lista marcada como comprada', data: list }
  },

  reset: (id) => {
    const list = mockListsData.find(l => l.id === Number(id))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }
    list.updatedAt = new Date().toISOString()

    // Mark all items as not purchased
    const items = mockItemsData[id] || []
    items.forEach(item => {
      item.purchased = false
      item.updatedAt = new Date().toISOString()
    })

    return { success: true, message: 'Lista reseteada', data: list }
  },

  moveToPantry: (id) => {
    const list = mockListsData.find(l => l.id === Number(id))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }

    // Simulate moving purchased items to pantry
    const items = mockItemsData[id] || []
    const movedItems = items.filter(item => item.purchased)

    return {
      success: true,
      message: `${movedItems.length} ítems movidos a la despensa`,
      movedCount: movedItems.length
    }
  },

  share: (id, email) => {
    const list = mockListsData.find(l => l.id === Number(id))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }

    if (!mockSharedUsersData[id]) {
      mockSharedUsersData[id] = []
    }

    // Check if already shared
    const existing = mockSharedUsersData[id].find(u => u.email === email)
    if (existing) {
      throw { response: { status: 400, data: { message: 'Usuario ya tiene acceso a esta lista' } } }
    }

    const newSharedUser = {
      id: Math.max(...Object.values(mockSharedUsersData).flat().map(u => u.id), 0) + 1,
      userId: Math.floor(Math.random() * 1000) + 100,
      email,
      name: email.split('@')[0],
      sharedAt: new Date().toISOString()
    }

    mockSharedUsersData[id].push(newSharedUser)

    return { success: true, message: 'Lista compartida exitosamente', data: newSharedUser }
  },

  getSharedUsers: (id) => {
    const list = mockListsData.find(l => l.id === Number(id))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }

    return { data: mockSharedUsersData[id] || [] }
  },

  revokeShare: (id, userId) => {
    const list = mockListsData.find(l => l.id === Number(id))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }

    if (!mockSharedUsersData[id]) {
      throw { response: { status: 404, data: { message: 'Usuario no encontrado' } } }
    }

    const index = mockSharedUsersData[id].findIndex(u => u.userId === Number(userId))
    if (index === -1) {
      throw { response: { status: 404, data: { message: 'Usuario no tiene acceso a esta lista' } } }
    }

    mockSharedUsersData[id].splice(index, 1)
    return { success: true, message: 'Acceso revocado' }
  },

  // Items operations
  getItems: (listId, params = {}) => {
    const list = mockListsData.find(l => l.id === Number(listId))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }

    const {
      page = 1,
      per_page = 50,
      search = '',
      purchased = null,
      category_id = null,
      pantry_id = null,
      sort_by = 'createdAt',
      order = 'ASC'
    } = params

    let items = mockItemsData[listId] || []

    // Filter by search
    if (search) {
      items = items.filter(item =>
        item.productName.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filter by purchased
    if (purchased !== null && purchased !== undefined && purchased !== '') {
      const isPurchased = purchased === 'true' || purchased === true
      items = items.filter(item => item.purchased === isPurchased)
    }

    // Filter by category
    if (category_id) {
      items = items.filter(item => item.categoryId === Number(category_id))
    }

    // Filter by pantry
    if (pantry_id) {
      items = items.filter(item => item.pantryId === Number(pantry_id))
    }

    // Sort
    items = [...items].sort((a, b) => {
      const aVal = a[sort_by] || ''
      const bVal = b[sort_by] || ''
      if (order === 'ASC') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    // Paginate
    const start = (page - 1) * per_page
    const end = start + per_page
    const paginated = items.slice(start, end)

    return {
      data: paginated,
      pagination: {
        currentPage: Number(page),
        perPage: Number(per_page),
        totalPages: Math.ceil(items.length / per_page),
        totalItems: items.length
      }
    }
  },

  addItem: (listId, body) => {
    const list = mockListsData.find(l => l.id === Number(listId))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }

    if (!mockItemsData[listId]) {
      mockItemsData[listId] = []
    }

    const allItems = Object.values(mockItemsData).flat()
    const newItem = {
      id: Math.max(...allItems.map(i => i.id), 0) + 1,
      listId: Number(listId),
      productId: body.product_id || Math.floor(Math.random() * 10000),
      productName: body.product_name || body.name || 'Producto',
      quantity: body.quantity || 1,
      unit: body.unit || 'unidad',
      purchased: false,
      categoryId: body.category_id || null,
      pantryId: body.pantry_id || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastPurchasedAt: null,
      metadata: body.metadata || {}
    }

    mockItemsData[listId].push(newItem)
    list.updatedAt = new Date().toISOString()

    return newItem
  },

  updateItem: (listId, itemId, body) => {
    const list = mockListsData.find(l => l.id === Number(listId))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }

    const items = mockItemsData[listId] || []
    const index = items.findIndex(i => i.id === Number(itemId))
    if (index === -1) {
      throw { response: { status: 404, data: { message: 'Ítem no encontrado' } } }
    }

    items[index] = {
      ...items[index],
      ...body,
      updatedAt: new Date().toISOString()
    }

    list.updatedAt = new Date().toISOString()

    return items[index]
  },

  toggleItem: (listId, itemId, purchased) => {
    const list = mockListsData.find(l => l.id === Number(listId))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }

    const items = mockItemsData[listId] || []
    const item = items.find(i => i.id === Number(itemId))
    if (!item) {
      throw { response: { status: 404, data: { message: 'Ítem no encontrado' } } }
    }

    item.purchased = purchased
    item.updatedAt = new Date().toISOString()
    if (purchased) {
      item.lastPurchasedAt = new Date().toISOString()
    }

    list.updatedAt = new Date().toISOString()

    return item
  },

  deleteItem: (listId, itemId) => {
    const list = mockListsData.find(l => l.id === Number(listId))
    if (!list) {
      throw { response: { status: 404, data: { message: 'Lista no encontrada' } } }
    }

    const items = mockItemsData[listId] || []
    const index = items.findIndex(i => i.id === Number(itemId))
    if (index === -1) {
      throw { response: { status: 404, data: { message: 'Ítem no encontrado' } } }
    }

    items.splice(index, 1)
    list.updatedAt = new Date().toISOString()

    return { success: true, message: 'Ítem eliminado' }
  }
}
