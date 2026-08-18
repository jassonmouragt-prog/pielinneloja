---
name: Category Management Enhancements
description: Plan to improve category management in the admin panel and its impact on the "Featured Categories" section.
type: feature
---

The user wants a dedicated area in the admin panel to configure categories, including their icons and colors, and for these changes to reflect in the "Featured Categories" section on the homepage.

## Technical Details

### Database
The `categories` table in the `public` schema already has the necessary columns:
- `name`: string
- `tone`: string (currently stores 'pink' or 'lilac')
- `image_url`: string (stores the signed URL for the icon)

### Admin Panel Improvements (`src/routes/_admin.admin.configuracoes.tsx`)
1. **Edit Functionality**: Currently, categories can only be added or deleted. I will add an "Edit" button to existing categories that opens a pre-filled dialog.
2. **Color Customization**: Refine the "Tom visual" (tone) selection to ensure it's intuitive and maps correctly to the frontend styles.
3. **Icon Management**: Ensure the icon upload process is robust and provides clear feedback.

### Storefront Reflectivity (`src/components/site/Categories.tsx`)
1. **Dynamic Rendering**: Ensure the component fetches and renders categories based on the latest database state, including the custom `tone` and `image_url`.
2. **Styling**: Update the component to use the `tone` from the database to determine the background gradient or color of the category circle.

## User Review Required

> [!IMPORTANT]
> The current system uses a 10-year signed URL for images to bypass bucket privacy restrictions. When you update a category icon, the new signed URL will be generated and saved automatically.

## Proposed Changes

### Admin Settings Page
- Add an `edit` state to the `AdminSettingsPage` to handle both creating and updating categories.
- Update the `onSubmit` handler to perform an `upsert` or a conditional `update`/`insert` based on whether an `editingCategory` exists.
- Add an "Edit" (pencil) icon next to the "Delete" icon in the categories list.

### Featured Categories Component
- The component already fetches categories from Supabase. I will ensure the `tone` logic is correctly applied to the visual presentation as requested.
- I will verify that the category name, icon, and background color all update in real-time (on page refresh or navigation) based on admin changes.
