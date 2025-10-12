# API v1.0.1 Migration Plan

_Last updated: 14 Oct 2025_

## 1. Summary of upstream changes

- **Unique shopping-list names per owner**
  - Backend enforces a composite unique constraint `unique_list_name_per_owner`.
  - `createListService` now throws `ConflictError` with `ERROR_MESSAGES.CONFLICT.LIST_NAME_EXISTS`.
- **Paginated responses returned from all collection endpoints**
  - `GET` for categories, products, shopping lists, list items, pantries, pantry items and purchases now respond with:
    ```json
    {
      "data": [...results],
      "pagination": {
        "total": <number>,
        "page": <number>,
        "per_page": <number>,
        "total_pages": <number>,
        "has_next": <boolean>,
        "has_prev": <boolean>
      }
    }
    ```
  - New helper `types/pagination.ts` exports `PaginatedResponse<T>` and `createPaginationMeta`.
- **Shared lists bug fix**
  - Service logic now avoids internal server errors when sharing lists (handled inside new service implementations).
- **Docs refresh**
  - Updated `docs/swagger.json` shipped with installer (still labelled 1.0.0 but reflects new structure).

## 2. Impacted backend files

| Area | File(s) | Status |
|------|---------|--------|
| Pagination meta | `src/types/pagination.ts` | ✅ Added shared helper with safe defaults |
| Categories | `src/services/category.service.ts` | ✅ Returns `PaginatedResponse` with meta |
| Products | `src/services/product.service.ts` | ✅ Merged paginator + conflict handling |
| Shopping lists | `src/entities/list.ts`, `src/services/list.service.ts` | ✅ Unique constraint + paginated responses |
| List items | `src/services/listItem.service.ts` | ✅ Normalized to `{ data, pagination }` |
| Pantries & items | `src/services/pantry.service.ts`, `src/services/pantryItem.service.ts` | ✅ Updated queries + meta wrapper |
| Purchases | `src/services/purchase.service.ts`, `src/utils/listNameUtils.ts` | ✅ Paginated data + unique-name helper |
| Error messages | `src/types/errorMessages.ts` | ✅ Added `LIST_NAME_EXISTS` constant |
| Swagger docs | `docs/swagger.json` | ✅ Replaced with installer version |

Retain our local enhancements:
- CORS multi-origin logic + `FRONT_ORIGIN` env.
- Mailer diagnostics and Ethereal credentials.
- Error logging improvements.

## 3. Frontend adjustments

| Area | File(s) | Status |
|------|---------|--------|
| API client helpers | `src/services/**` (categories, products, pantries, lists, listItems, purchases) | ✅ Normalized to `{ data, pagination }` |
| Stores | `src/stores/categories.js`, `products.js`, `pantries.js`, list/listItem stores | ✅ Synced with shared pagination meta |
| UI components | Tables/pagination components relying on `total` | ✅ Reading unified pagination metadata |
| Validation feedback | Toasts/forms handling duplicate list names | ✅ Friendly duplicate-name messaging |

## 4. Migration steps (execution order)

1. **Backup & branch**
  - `git checkout -b feature/api-v1.0.1`
  - ✅ Copied any useful references from `API v1.0.1 Installer/`.
  - ℹ️ After confirming the app runs against v1.0.1, the installer folder can be safely deleted.
2. **Backend upgrade**
  - ✅ Introduce `types/pagination.ts`.
  - ✅ Merge service/entity changes (lists, list items, categories, products, pantries, purchases, error messages, list-name helper).
  - ⏳ Update swagger docs.
3. **Frontend updates**
   - Adjust services/stores to digest `{ data, pagination }` payloads.
   - Handle 409 conflicts for duplicate list names in UI.
4. **Validation**
   - `npm run api` (backend) & `npm run dev` (frontend).
   - Manual QA flows:
     - Register → verify user (sanity check mailer still works).
     - Categories listing & pagination controls.
     - Products listing (filter + pagination).
     - Create shopping list with duplicate name → expect user-friendly error.
     - Fetch list items with pagination.
   - Optional: add unit/integration tests if time allows.
5. **Documentation**
   - Update `README.md` and internal guides with pagination notes.
   - Record conflict handling in `AUTH_ONBOARDING.md` or new doc if relevant.

## 5. Outstanding questions

- Do we need database migration to enforce unique constraint on existing data? (If duplicates exist, pre-cleaning might be required.)
- Should we expose pagination meta for mock mode as well? (Current mocks return arrays; update to mimic real response.)
- Any consumers outside this repo depending on previous response shape? Coordinate if necessary.

---

Use this plan as the checklist while applying the upgrade.
