// Helper utilities to normalize API paginated responses so the frontend can
// consume both legacy array payloads and the new `{ data, pagination }` shape.

const DEFAULT_META = {
  total: 0,
  page: 1,
  per_page: 10,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

function coerceArray(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(raw.results)) return raw.results;
  if (Array.isArray(raw.products)) return raw.products;
  if (Array.isArray(raw.pantries)) return raw.pantries;
  if (Array.isArray(raw.listItems)) return raw.listItems;
  return [];
}

function pickNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

export function normalizePaginatedResponse(raw, defaults = {}) {
  const data = coerceArray(raw);
  const paginationSource = raw?.pagination ?? {};

  const total = pickNumber(
    paginationSource.total ?? paginationSource.totalItems ?? raw?.total ?? raw?.count,
    data.length,
  );
  const page = pickNumber(
    paginationSource.page ?? paginationSource.currentPage ?? raw?.page ?? defaults.page,
    1,
  );
  const perPage = pickNumber(
    paginationSource.per_page ?? paginationSource.perPage ?? raw?.per_page ?? defaults.per_page,
    defaults.per_page ?? DEFAULT_META.per_page,
  );
  const totalPages = pickNumber(
    paginationSource.total_pages ?? paginationSource.totalPages,
    perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1,
  );

  const hasNext =
    paginationSource.has_next ??
    paginationSource.hasNext ??
    (totalPages ? page < totalPages : false);
  const hasPrev =
    paginationSource.has_prev ??
    paginationSource.hasPrev ??
    page > 1;

  const mergedMeta = {
    ...DEFAULT_META,
    ...defaults,
    total,
    page,
    per_page: perPage,
    total_pages: totalPages,
    has_next: Boolean(hasNext),
    has_prev: Boolean(hasPrev),
  };

  // Provide aliases expected by existing components/stores
  mergedMeta.currentPage = mergedMeta.page;
  mergedMeta.perPage = mergedMeta.per_page;
  mergedMeta.totalPages = mergedMeta.total_pages;
  mergedMeta.totalItems = mergedMeta.total;
  mergedMeta.hasNext = mergedMeta.has_next;
  mergedMeta.hasPrev = mergedMeta.has_prev;

  return { data, pagination: mergedMeta };
}

export function unwrapEntityResponse(raw) {
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data !== undefined) {
    return raw.data;
  }
  return raw;
}
