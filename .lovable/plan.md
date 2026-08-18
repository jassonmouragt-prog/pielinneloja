# Plan: Make Low Stock Section Clickable and Informative

The user wants to make the "Low Stock" (Estoque Baixo) section in the admin dashboard clickable. When clicked, it should show which items have low stock, and clicking an item should lead to its details/edit view.

## User Review Required

> [!IMPORTANT]
> I will modify the dashboard to show a specific list of products with low stock when the "Estoque Baixo" card is clicked. Each item in this list will link to the Products page and automatically open the edit form for that specific item.

## Proposed Changes

### Dashboard Enhancements
- Update `src/routes/_admin.admin.dashboard.tsx` to:
    - Fetch the actual list of products with low stock (stock <= 5).
    - Add a "Low Stock" list section (or modal) that appears when clicking the card.
    - Each item in the list will be a link to `/admin/produtos` with a search parameter containing the product ID.

### Products Page Integration
- Update `src/routes/_admin.admin.produtos.tsx` to:
    - Listen for a search parameter (e.g., `editId`).
    - Automatically open the edit dialog for the product matching that ID when the page loads or the parameter changes.

## Technical Details

### `src/routes/_admin.admin.dashboard.tsx`
- Modify the `useQuery` `queryFn` to select `id, name, stock_quantity` for low stock products.
- Use state to toggle the visibility of the "Low Stock" details list.
- Use `@tanstack/react-router`'s `Link` to navigate to the products page with search parameters.

### `src/routes/_admin.admin.produtos.tsx`
- Define a search schema to accept `editId`.
- Use `useEffect` to trigger `handleEdit` if `editId` is present in the URL and the products list is loaded.

## Verification Plan

### Automated Tests
- Use Playwright to:
    1. Navigate to `/admin/dashboard`.
    2. Click on the "Estoque Baixo" card.
    3. Verify a list of products appears.
    4. Click on one of the products.
    5. Verify navigation to `/admin/produtos`.
    6. Verify the edit dialog for that product is open.

### Manual Verification
- Check the dashboard for the new clickable behavior.
- Ensure the list UI is responsive and clearly identifies multiple items.
