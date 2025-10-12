export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function createPaginationMeta(total: number, page = 1, per_page = 10): PaginationMeta {
  const safePerPage = per_page && per_page > 0 ? per_page : 10;
  const safePage = page && page > 0 ? page : 1;
  const total_pages = Math.ceil(total / safePerPage) || 1;

  return {
    total,
    page: safePage,
    per_page: safePerPage,
    total_pages,
    has_next: safePage < total_pages,
    has_prev: safePage > 1,
  };
}
