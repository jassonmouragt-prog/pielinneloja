# Plan - Implement Product Registration and Management Features

The user wants to ensure the product registration (CRUD) functionality is fully operational, specifically focusing on adding new products with name, stock quantity, price, photo, and category.

## User Requirements
- **Product Registration**: Name (text), Stock (integer), Price (decimal/currency), Photo (upload), Category (selection/autocomplete).
- **Validation**: Required fields, numeric formats.
- **Workflow**: Click "Novo produto" -> Show Form -> Fill -> Save -> Handle Upload -> Save to DB.
- **Responsiveness**: Already partially addressed in previous turns, but ensure the new forms work well on mobile.

## Technical Details
- **Frontend**: Update `src/routes/_admin.admin.produtos.tsx` to ensure the existing form handles all required fields and image uploads correctly.
- **Backend**: Supabase `products` and `product_images` tables.
- **Storage**: Supabase Storage bucket `product-images`.
- **Validation**: Zod schema in the form.

## Proposed Changes

### 1. Product Management (`src/routes/_admin.admin.produtos.tsx`)
- Review and refine the `productSchema` to match the user's specific fields.
- Ensure the image upload logic is robust and provides feedback.
- Add a preview for the uploaded image in the form.
- Ensure the category selection is populated correctly from the `categories` table.

### 2. Layout & UI
- Verify that the `Dialog` used for the form is responsive (already has `max-w-2xl max-h-[90vh] overflow-y-auto`).
- Ensure buttons and inputs are touch-friendly.

### 3. Data Integrity
- Ensure `stock_movements` are recorded when a new product is created (initial stock).

## Validation Plan
- Test creating a product with all fields.
- Test editing an existing product.
- Test deleting a product.
- Test image upload functionality.
- Verify mobile layout of the product form.
