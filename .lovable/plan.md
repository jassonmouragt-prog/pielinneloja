# Plan - Remove specific mentions and elements

The user wants to remove "frete grátis acima de R$199", "5% OFF no PIX", and the "Entrar ou cadastrar" section from the site. Additionally, all other references to 5% PIX discounts should be removed.

## User Review Required

> [!IMPORTANT]
> - The "Entrar ou cadastrar" section is being removed as requested. This removes the login/signup UI.
> - All mentions of "5% OFF no PIX" and "Frete grátis" in the top bar and benefits section will be removed.

## Proposed Changes

### Site Components

#### [SiteHeader](src/components/site/SiteHeader.tsx)
- Remove the spans for "Frete grátis acima de R$199" and "5% OFF no PIX" from the announcement bar.
- Remove the "Entrar ou cadastrar" link and icon from the main navigation bar.

#### [Benefits](src/components/site/Benefits.tsx)
- Remove the "5% de Desconto / Pagando no PIX" item from the `benefits` array.

### Metadata

#### [Home Route](src/routes/index.tsx)
- Update the meta description to remove the mention of "5% de desconto no PIX".

## Technical Details

- **File**: `src/components/site/SiteHeader.tsx`
  - Remove lines 32-39 (announcement bar items).
  - Remove lines 81-91 (Login/Register link).
- **File**: `src/components/site/Benefits.tsx`
  - Remove the object at index 3 in the `benefits` array.
- **File**: `src/routes/index.tsx`
  - Edit the `description` constant to remove "e 5% de desconto no PIX".

## Verification Plan

### Automated Tests
- Build check: `bun run build` to ensure no broken references.

### Manual Verification
- Check the top header to ensure only "PREÇO ÚNICO" remains in the announcement bar.
- Check the main header to ensure the "User" icon and "Entrar" text are gone.
- Check the benefits section (below hero) to ensure only 3 benefits are shown.
- Inspect page source/metadata to ensure the PIX discount mention is removed from the description.
