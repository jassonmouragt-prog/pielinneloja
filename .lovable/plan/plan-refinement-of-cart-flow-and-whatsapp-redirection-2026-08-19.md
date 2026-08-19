# Plan - Refinement of Cart Flow and WhatsApp Redirection

The goal is to improve the user experience in the cart by ensuring that users provide their name before attempting to finalize the purchase. Additionally, the sale will only be registered in the administrative dashboard after the user is redirected to WhatsApp, avoiding "abandoned" or incomplete registrations.

## Proposed Changes

### Frontend - Cart Drawer

#### [CartDrawer.tsx](src/components/site/CartDrawer.tsx)
- Update `handleCheckout` to separate name validation from the redirect process.
- Remove the server call `registerSale` from the initial step of `handleCheckout`.
- Implement a logic where the sale is registered in the background (or only after a successful redirect trigger) if necessary, but the primary focus is to ensure the redirect happens only when valid data is present.
- **Wait**: The user wants to register the sale *only* when it's sent to WhatsApp. However, `window.open` is a client-side action that we can't fully guarantee "sent" (as it just opens the app).
- **Refinement**: I will move the `registerSale` call to happen *after* the `window.open` call or keep it right before but ensure the name validation is robust and provides immediate feedback if missing.
- **Clarification based on user request**: "don't redirect this information to the dashboard, only when the order is really sent to WhatsApp". I will ensure the server function is called only at the moment of redirection.

### Validation
- Ensure the name input has a visual error state if empty when clicking the checkout button.
- Maintain the current toast messages but ensure they are triggered correctly.

## Technical Details
- Using `zod` validation already present in `registerPendingSale` function.
- `CartDrawer` uses `zustand` for state management and `sonner` for notifications.
- The flow will be: Validate Name -> Trigger `window.open` (WhatsApp) -> Call `registerSale` (Dashboard registration).

## Steps
1. Modify `src/components/site/CartDrawer.tsx` to refine the `handleCheckout` function.
2. Add a visual validation state (optional, or just ensure toast is clear).
3. Verify that `registerSale` is only called if all client-side conditions are met.
