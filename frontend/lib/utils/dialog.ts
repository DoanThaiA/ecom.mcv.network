/**
 * Dialog Utility Functions
 * Helper functions for Radix UI Dialog components
 */

/**
 * Prevent dialog from closing when clicking on toast notifications
 * Use this handler with Dialog.Content's onPointerDownOutside prop
 *
 * @param event - The pointer down outside event
 *
 * @example
 * ```tsx
 * import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
 *
 * <Dialog.Content onPointerDownOutside={preventDialogCloseOnToast}>
 *   {children}
 * </Dialog.Content>
 * ```
 *
 * @see https://github.com/radix-ui/primitives/issues/2690
 */
export const preventDialogCloseOnToast = (e: any) => {
  // Don't dismiss dialog when clicking inside a sonner toast
  if (
    e.target instanceof Element &&
    e.target.closest('[data-sonner-toast]')
  ) {
    e.preventDefault();
  }
};

/**
 * Prevent dialog from closing when clicking on nested Radix UI components
 * Use this handler with Dialog.Content's onPointerDownOutside prop
 *
 * Uses multiple detection strategies to handle AlertDialog Cancel button clicks
 * that would otherwise close both the AlertDialog and parent Dialog.
 *
 * @param event - The pointer down outside event
 *
 * @example
 * ```tsx
 * import { preventDialogCloseOnNestedRadix } from '@/lib/utils/dialog';
 *
 * <Dialog.Content onPointerDownOutside={preventDialogCloseOnNestedRadix}>
 *   {children}
 * </Dialog.Content>
 * ```
 */
export const preventDialogCloseOnNestedRadix = (e: any) => {
  if (!(e.target instanceof Element)) return;

  // Don't dismiss dialog when clicking inside a sonner toast
  if (e.target.closest('[data-sonner-toast]')) {
    e.preventDefault();
    return;
  }

  // Check 1: AlertDialog role (existing check)
  if (e.target.closest('[role="alertdialog"]')) {
    e.preventDefault();
    return;
  }

  // Check 2: Radix AlertDialog overlay/content
  // Radix wraps AlertDialog in specific data-radix attributes
  if (
    e.target.closest('[data-radix-alert-dialog-overlay]') ||
    e.target.closest('[data-radix-alert-dialog-content]')
  ) {
    e.preventDefault();
    return;
  }

  // Check 3: Any Radix portal that might contain nested dialogs
  if (e.target.closest('[data-radix-portal]')) {
    // Check if this portal contains an alertdialog
    const portal = e.target.closest('[data-radix-portal]');
    if (portal && portal.querySelector('[role="alertdialog"]')) {
      e.preventDefault();
      return;
    }
  }

  // Check 4: Button inside AlertDialog (failsafe)
  // Check if the target is a button that might be inside an AlertDialog
  const button = e.target.closest('button');
  if (button) {
    // Look for AlertDialog in any portal
    const allPortals = document.querySelectorAll('[data-radix-portal]');
    for (const portal of allPortals) {
      if (portal.querySelector('[role="alertdialog"]') && portal.contains(button)) {
        e.preventDefault();
        return;
      }
    }
  }
};
