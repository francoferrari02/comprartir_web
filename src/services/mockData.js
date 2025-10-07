// mockData.js
// Mocks coherentes con los servicios de lists.js y los futuros de pantries.js
// Usa: if (import.meta.env.VITE_USE_MOCKS === 'true') delegá a estos mocks.
// Todos los listados devuelven: { data, pagination }.
// Todos los métodos son síncronos; agregá await delay(ms) desde el servicio para simular red.

export const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/* ----------------------------- utils helpers ----------------------------- */

function nowISO() {
    return new Date().toISOString();
}

function cmp(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

function paginateAndSort(array, {
    page = 1,
    per_page = 10,
    sort_by = 'createdAt',
    order = 'DESC',
} = {}) {
    const data = [...array];

    // sort
    data.sort((x, y) => {
        const dir = (order === 'DESC' || order === 'desc') ? -1 : 1;
        const xv = x?.[sort_by];
        const yv = y?.[sort_by];
        return dir * cmp(xv ?? '', yv ?? '');
    });

    // paginate
    const p = Number(page) || 1;
    const pp = Number(per_page) || 10;
    const start = (p - 1) * pp;
    const end = start + pp;
    const slice = data.slice(start, end);

    return {
        data: slice,
        pagination: {
            currentPage: p,
            perPage: pp,
            totalPages: Math.max(1, Math.ceil(data.length / pp)),
            totalItems: data.length,
        },
    };
}

/* =========================== SHOPPING LISTS MOCK ========================== */

export const mockShoppingLists = {
    _autoId: 4,
    _autoItemId: 6,

    _lists: [
        {
            id: 1,
            name: 'Supermercado',
            recurring: false,
            createdAt: '2025-01-01T10:00:00.000Z',
            updatedAt: '2025-01-01T10:00:00.000Z',
            lastPurchasedAt: null,
            owner: true,
            metadata: {},
            sharedUsers: [{ id: 101, email: 'amigo@example.com' }],
        },
        {
            id: 2,
            name: 'Farmacia',
            recurring: false,
            createdAt: '2025-01-02T10:00:00.000Z',
            updatedAt: '2025-01-02T10:00:00.000Z',
            lastPurchasedAt: null,
            owner: true,
            metadata: {},
            sharedUsers: [],
        },
        {
            id: 3,
            name: 'Verdulería',
            recurring: true,
            createdAt: '2025-01-03T10:00:00.000Z',
            updatedAt: '2025-01-03T10:00:00.000Z',
            lastPurchasedAt: null,
            owner: false, // simulamos una compartida
            metadata: {},
            sharedUsers: [],
        },
    ],

    // items por listId
    _itemsByList: {
        1: [
            { id: 1, product_id: 1001, productName: 'Leche', quantity: 2, unit: 'L', purchased: false, category_id: 11, pantry_id: null, createdAt: '2025-01-04T10:00:00.000Z', updatedAt: '2025-01-04T10:00:00.000Z' },
            { id: 2, product_id: 1002, productName: 'Arroz', quantity: 1, unit: 'kg', purchased: true,  category_id: 12, pantry_id: null, createdAt: '2025-01-04T10:00:00.000Z', updatedAt: '2025-01-05T10:00:00.000Z' },
        ],
        2: [
            { id: 3, product_id: 2001, productName: 'Ibuprofeno', quantity: 1, unit: 'caja', purchased: false, category_id: 21, pantry_id: null, createdAt: '2025-01-04T10:00:00.000Z', updatedAt: '2025-01-04T10:00:00.000Z' },
        ],
        3: [
            { id: 4, product_id: 3001, productName: 'Tomate', quantity: 6, unit: 'u', purchased: false, category_id: 31, pantry_id: null, createdAt: '2025-01-04T10:00:00.000Z', updatedAt: '2025-01-04T10:00:00.000Z' },
            { id: 5, product_id: 3002, productName: 'Lechuga', quantity: 1, unit: 'u', purchased: false, category_id: 31, pantry_id: null, createdAt: '2025-01-04T10:00:00.000Z', updatedAt: '2025-01-04T10:00:00.000Z' },
        ],
    },

    /* ------------------------------- Listado -------------------------------- */
    getAll(params = {}) {
        const {
            owner,        // true | false | undefined
            recurring,    // true | false | undefined
            page = 1,
            per_page = 10,
            sort_by = 'createdAt',
            order = 'DESC',
            search = '',
        } = params;

        let filtered = [...this._lists];

        if (typeof owner === 'boolean') {
            filtered = filtered.filter((l) => l.owner === owner);
        }
        if (typeof recurring === 'boolean') {
            filtered = filtered.filter((l) => l.recurring === recurring);
        }
        if (search) {
            const s = String(search).toLowerCase();
            filtered = filtered.filter((l) => l.name.toLowerCase().includes(s));
        }

        const { data, pagination } = paginateAndSort(filtered, {
            page,
            per_page,
            sort_by,
            order,
        });

        return {
            data,
            pagination,
        };
    },

    /* -------------------------------- Detalle ------------------------------- */
    getById(id) {
        const el = this._lists.find((l) => l.id === Number(id));
        if (!el) throw { response: { status: 404, data: { message: 'Lista no encontrada' } } };
        return el;
    },

    create(body) {
        const item = {
            id: this._autoId++,
            name: (body?.name ?? 'Nueva lista').trim(),
            recurring: !!body?.recurring,
            createdAt: nowISO(),
            updatedAt: nowISO(),
            lastPurchasedAt: null,
            owner: true,
            metadata: body?.metadata ?? {},
            sharedUsers: [],
        };
        this._lists.unshift(item);
        this._itemsByList[item.id] = [];
        return item;
    },

    update(id, body) {
        const i = this._lists.findIndex((l) => l.id === Number(id));
        if (i === -1) throw { response: { status: 404, data: { message: 'Lista no encontrada' } } };
        const merged = {
            ...this._lists[i],
            ...(body?.name !== undefined ? { name: String(body.name).trim() } : {}),
            ...(body?.recurring !== undefined ? { recurring: !!body.recurring } : {}),
            ...(body?.metadata !== undefined ? { metadata: body.metadata } : {}),
            updatedAt: nowISO(),
        };
        this._lists[i] = merged;
        return merged;
    },

    delete(id) {
        const idx = this._lists.findIndex((l) => l.id === Number(id));
        if (idx === -1) throw { response: { status: 404, data: { message: 'Lista no encontrada' } } };
        this._lists.splice(idx, 1);
        delete this._itemsByList[id];
        return { success: true };
    },

    /* -------------------------------- Acciones ------------------------------ */
    purchase(id) {
        const i = this._lists.findIndex((l) => l.id === Number(id));
        if (i === -1) throw { response: { status: 404, data: { message: 'Lista no encontrada' } } };
        this._lists[i].lastPurchasedAt = nowISO();

        // Marcar todos los items como comprados
        const listId = Number(id);
        const items = this._itemsByList[listId] ?? [];
        items.forEach((it) => {
            it.purchased = true;
            it.updatedAt = nowISO();
        });

        return { success: true, purchasedAt: this._lists[i].lastPurchasedAt };
    },

    reset(id) {
        const listId = Number(id);
        const items = this._itemsByList[listId] ?? [];
        items.forEach((it) => { it.purchased = false; it.updatedAt = nowISO(); });
        return { success: true };
    },

    moveToPantry(id, pantryId = null) {
        // en mocks, solo confirmamos acción
        return { success: true, movedToPantryId: pantryId };
    },

    /* -------------------------------- Sharing ------------------------------- */
    share(id, email) {
        const list = this.getById(id);
        const exists = list.sharedUsers.some((u) => u.email === email);
        if (!exists) {
            const newUser = { id: Math.floor(Math.random() * 100000) + 100, email };
            list.sharedUsers.push(newUser);
            list.updatedAt = nowISO();
        }
        return { success: true };
    },

    sharedUsers(id) {
        const list = this.getById(id);
        return { data: [...list.sharedUsers] };
    },

    revokeShare(id, userId) {
        const list = this.getById(id);
        const idx = list.sharedUsers.findIndex((u) => u.id === Number(userId));
        if (idx >= 0) {
            list.sharedUsers.splice(idx, 1);
            list.updatedAt = nowISO();
        }
        return { success: true };
    },

    /* ------------------------------- Items CRUD ----------------------------- */
    getItems(listId, params = {}) {
        const {
            page = 1,
            per_page = 10,
            sort_by = 'createdAt', // también puede venir productName, updatedAt, lastPurchasedAt
            order = 'DESC',
            search = '',
            purchased, // boolean | undefined
            pantry_id,
            category_id,
        } = params;

        const all = this._itemsByList[listId] ?? [];
        let items = [...all];

        if (search) {
            const s = String(search).toLowerCase();
            items = items.filter((it) => (it.productName || '').toLowerCase().includes(s));
        }
        if (typeof purchased === 'boolean') {
            items = items.filter((it) => it.purchased === purchased);
        }
        if (pantry_id != null) {
            items = items.filter((it) => (it.pantry_id ?? null) === Number(pantry_id));
        }
        if (category_id != null) {
            items = items.filter((it) => (it.category_id ?? null) === Number(category_id));
        }

        const { data, pagination } = paginateAndSort(items, {
            page,
            per_page,
            sort_by,
            order,
        });

        return {
            data,
            pagination,
        };
    },

    addItem(listId, body) {
        const list = this.getById(listId);
        const item = {
            id: this._autoItemId++,
            product_id: Number(body?.product_id ?? 0),
            productName: body?.productName ?? body?.product_name ?? body?.name ?? `Producto ${this._autoItemId}`,
            quantity: Number(body?.quantity ?? 1),
            unit: body?.unit ?? 'u',
            purchased: !!body?.purchased,
            category_id: body?.category_id ?? null,
            pantry_id: body?.pantry_id ?? null,
            metadata: body?.metadata ?? {},
            createdAt: nowISO(),
            updatedAt: nowISO(),
        };
        if (!this._itemsByList[list.id]) this._itemsByList[list.id] = [];
        this._itemsByList[list.id].unshift(item);
        return item;
    },

    updateItem(listId, itemId, body) {
        const items = this._itemsByList[listId] ?? [];
        const i = items.findIndex((x) => x.id === Number(itemId));
        if (i === -1) throw { response: { status: 404, data: { message: 'Ítem no encontrado' } } };

        const merged = {
            ...items[i],
            ...(body?.product_id !== undefined ? { product_id: Number(body.product_id) } : {}),
            ...(body?.productName !== undefined ? { productName: String(body.productName) } : {}),
            ...(body?.quantity !== undefined ? { quantity: Number(body.quantity) } : {}),
            ...(body?.unit !== undefined ? { unit: String(body.unit) } : {}),
            ...(body?.purchased !== undefined ? { purchased: !!body.purchased } : {}),
            ...(body?.category_id !== undefined ? { category_id: Number(body.category_id) } : {}),
            ...(body?.pantry_id !== undefined ? { pantry_id: Number(body.pantry_id) } : {}),
            ...(body?.metadata !== undefined ? { metadata: body.metadata } : {}),
            updatedAt: nowISO(),
        };
        items[i] = merged;
        return merged;
    },

    toggleItemPurchased(listId, itemId, purchased) {
        return this.updateItem(listId, itemId, { purchased: !!purchased });
    },

    deleteItem(listId, itemId) {
        const items = this._itemsByList[listId] ?? [];
        const i = items.findIndex((x) => x.id === Number(itemId));
        if (i === -1) throw { response: { status: 404, data: { message: 'Ítem no encontrado' } } };
        items.splice(i, 1);
        return { success: true };
    },
};

/* =============================== PANTRIES MOCK ============================ */

export const mockPantries = {
    _autoId: 3,
    _autoItemId: 5,

    _pantries: [
        {
            id: 1,
            name: 'Casa',
            createdAt: '2025-01-01T10:00:00.000Z',
            updatedAt: '2025-01-01T10:00:00.000Z',
            owner: true,
            metadata: {},
            sharedUsers: [{ id: 201, email: 'roommate@example.com' }],
        },
        {
            id: 2,
            name: 'Trabajo',
            createdAt: '2025-01-02T10:00:00.000Z',
            updatedAt: '2025-01-02T10:00:00.000Z',
            owner: false,
            metadata: {},
            sharedUsers: [],
        },
    ],

    _itemsByPantry: {
        1: [
            { id: 1, product_id: 9001, name: 'Fideos', quantity: 3, unit: 'paqs', category_id: 11, createdAt: '2025-01-04T10:00:00.000Z', updatedAt: '2025-01-04T10:00:00.000Z' },
            { id: 2, product_id: 9002, name: 'Atún',   quantity: 2, unit: 'latas', category_id: 12, createdAt: '2025-01-04T10:00:00.000Z', updatedAt: '2025-01-04T10:00:00.000Z' },
        ],
        2: [
            { id: 3, product_id: 9100, name: 'Café', quantity: 1, unit: 'kg', category_id: 21, createdAt: '2025-01-04T10:00:00.000Z', updatedAt: '2025-01-04T10:00:00.000Z' },
            { id: 4, product_id: 9101, name: 'Azúcar', quantity: 1, unit: 'kg', category_id: 21, createdAt: '2025-01-04T10:00:00.000Z', updatedAt: '2025-01-04T10:00:00.000Z' },
        ],
    },

    /* ------------------------------- Listado -------------------------------- */
    getAll(params = {}) {
        const {
            owner, // true | false | undefined
            page = 1,
            per_page = 10,
            sort_by = 'createdAt',
            order = 'ASC', // ojo: en swagger pantries usa ASC|DESC
            search = '',
        } = params;

        let filtered = [...this._pantries];

        if (typeof owner === 'boolean') {
            filtered = filtered.filter((p) => p.owner === owner);
        }
        if (search) {
            const s = String(search).toLowerCase();
            filtered = filtered.filter((p) => p.name.toLowerCase().includes(s));
        }

        const { data, pagination } = paginateAndSort(filtered, {
            page,
            per_page,
            sort_by,
            order,
        });

        return {
            data,
            pagination,
        };
    },

    /* -------------------------------- Detalle ------------------------------- */
    getById(id) {
        const el = this._pantries.find((p) => p.id === Number(id));
        if (!el) throw { response: { status: 404, data: { message: 'Despensa no encontrada' } } };
        return el;
    },

    create(body) {
        const item = {
            id: this._autoId++,
            name: (body?.name ?? 'Nueva despensa').trim(),
            createdAt: nowISO(),
            updatedAt: nowISO(),
            owner: true,
            metadata: body?.metadata ?? {},
            sharedUsers: [],
        };
        this._pantries.unshift(item);
        this._itemsByPantry[item.id] = [];
        return item;
    },

    update(id, body) {
        const i = this._pantries.findIndex((p) => p.id === Number(id));
        if (i === -1) throw { response: { status: 404, data: { message: 'Despensa no encontrada' } } };
        const merged = {
            ...this._pantries[i],
            ...(body?.name !== undefined ? { name: String(body.name).trim() } : {}),
            ...(body?.metadata !== undefined ? { metadata: body.metadata } : {}),
            updatedAt: nowISO(),
        };
        this._pantries[i] = merged;
        return merged;
    },

    delete(id) {
        const idx = this._pantries.findIndex((p) => p.id === Number(id));
        if (idx === -1) throw { response: { status: 404, data: { message: 'Despensa no encontrada' } } };
        this._pantries.splice(idx, 1);
        delete this._itemsByPantry[id];
        return { success: true };
    },

    /* -------------------------------- Sharing ------------------------------- */
    share(id, email) {
        const pantry = this.getById(id);
        const exists = pantry.sharedUsers.some((u) => u.email === email);
        if (!exists) {
            const newUser = { id: Math.floor(Math.random() * 100000) + 200, email };
            pantry.sharedUsers.push(newUser);
            pantry.updatedAt = nowISO();
        }
        return { success: true };
    },

    sharedUsers(id) {
        const pantry = this.getById(id);
        return { data: [...pantry.sharedUsers] };
    },

    revokeShare(id, userId) {
        const pantry = this.getById(id);
        const idx = pantry.sharedUsers.findIndex((u) => u.id === Number(userId));
        if (idx >= 0) {
            pantry.sharedUsers.splice(idx, 1);
            pantry.updatedAt = nowISO();
        }
        return { success: true };
    },

    /* ------------------------------- Items CRUD ----------------------------- */
    getItems(pantryId, params = {}) {
        const {
            page = 1,
            per_page = 10,
            sort_by = 'createdAt',
            order = 'desc', // ojo: swagger items usa minúsculas asc|desc
            search = '',
            category_id,
        } = params;

        const all = this._itemsByPantry[pantryId] ?? [];
        let items = [...all];

        if (search) {
            const s = String(search).toLowerCase();
            items = items.filter((it) => (it.name || '').toLowerCase().includes(s));
        }
        if (category_id != null) {
            items = items.filter((it) => (it.category_id ?? null) === Number(category_id));
        }

        const { data, pagination } = paginateAndSort(items, {
            page,
            per_page,
            sort_by,
            order,
        });

        return {
            data,
            pagination,
        };
    },

    addItem(pantryId, body) {
        const pantry = this.getById(pantryId);
        const item = {
            id: this._autoItemId++,
            product_id: Number(body?.product_id ?? 0),
            name: body?.name ?? body?.product_name ?? `Producto ${this._autoItemId}`,
            quantity: Number(body?.quantity ?? 1),
            unit: body?.unit ?? 'u',
            category_id: body?.category_id ?? null,
            metadata: body?.metadata ?? {},
            createdAt: nowISO(),
            updatedAt: nowISO(),
        };
        if (!this._itemsByPantry[pantry.id]) this._itemsByPantry[pantry.id] = [];
        this._itemsByPantry[pantry.id].unshift(item);
        return item;
    },

    updateItem(pantryId, itemId, body) {
        const items = this._itemsByPantry[pantryId] ?? [];
        const i = items.findIndex((x) => x.id === Number(itemId));
        if (i === -1) throw { response: { status: 404, data: { message: 'Ítem de despensa no encontrado' } } };

        const merged = {
            ...items[i],
            ...(body?.product_id !== undefined ? { product_id: Number(body.product_id) } : {}),
            ...(body?.name !== undefined ? { name: String(body.name) } : {}),
            ...(body?.quantity !== undefined ? { quantity: Number(body.quantity) } : {}),
            ...(body?.unit !== undefined ? { unit: String(body.unit) } : {}),
            ...(body?.category_id !== undefined ? { category_id: Number(body.category_id) } : {}),
            ...(body?.metadata !== undefined ? { metadata: body.metadata } : {}),
            updatedAt: nowISO(),
        };
        items[i] = merged;
        return merged;
    },

    deleteItem(pantryId, itemId) {
        const items = this._itemsByPantry[pantryId] ?? [];
        const i = items.findIndex((x) => x.id === Number(itemId));
        if (i === -1) throw { response: { status: 404, data: { message: 'Ítem de despensa no encontrado' } } };
        items.splice(i, 1);
        return { success: true };
    },
};
