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
