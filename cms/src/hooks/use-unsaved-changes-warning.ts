import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ----------------------------------------------------------------------

interface UseUnsavedChangesWarningProps {
  /**
   * When true, blocks navigation and shows warning dialog
   */
  when: boolean;
  /**
   * Optional callback fired when beforeunload event is triggered
   */
  onBeforeUnload?: () => void;
}

interface UseUnsavedChangesWarningReturn {
  /**
   * Whether the navigation blocking dialog should be shown
   */
  showDialog: boolean;
  /**
   * The path user attempted to navigate to (null if no pending navigation)
   */
  pendingPath: string | null;
  /**
   * Handler to close dialog and cancel navigation
   */
  handleDialogClose: () => void;
  /**
   * Handler to confirm dialog and proceed with navigation
   */
  handleDialogConfirm: () => void;
}

/**
 * Custom hook to warn users about unsaved changes before navigation
 *
 * Blocks two types of navigation:
 * 1. Browser navigation (close tab/refresh) - shows browser default warning
 * 2. In-app navigation (clicking links) - shows custom MUI dialog
 *
 * Note: Browser back/forward buttons are not blocked as this is unreliable
 * and can cause browser history navigation issues.
 *
 * @example
 * ```tsx
 * const {
 *   showDialog,
 *   handleDialogClose,
 *   handleDialogConfirm,
 * } = useUnsavedChangesWarning({
 *   when: hasUnsavedChanges,
 * });
 *
 * <Dialog open={showDialog}>
 *   <DialogActions>
 *     <Button onClick={handleDialogClose}>Cancel</Button>
 *     <Button onClick={handleDialogConfirm}>Leave</Button>
 *   </DialogActions>
 * </Dialog>
 * ```
 */
export function useUnsavedChangesWarning({
  when,
  onBeforeUnload,
}: UseUnsavedChangesWarningProps): UseUnsavedChangesWarningReturn {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Block browser navigation (back/forward/close tab)
  useEffect(() => {
    if (!when) return undefined;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Prevent the default behavior (some browsers require returnValue)
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue = '';
      // Call optional callback
      onBeforeUnload?.();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [when, onBeforeUnload]);

  // Block in-app navigation by intercepting Link clicks
  useEffect(() => {
    if (!when) return undefined;

    const handleClick = (event: MouseEvent) => {
      // Find if the click target is a link or within a link
      const target = (event.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;

      if (!target) return;

      const href = target.getAttribute('href');

      // Only block internal navigation (not external links)
      if (href && href.startsWith('/')) {
        // Prevent default navigation
        event.preventDefault();
        // Stop propagation to prevent other handlers
        event.stopPropagation();

        // Store the pending navigation path
        setPendingPath(href);
        // Show the confirmation dialog
        setShowDialog(true);
      }
    };

    // Use capture phase to intercept before React Router's Link onClick
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [when]);

  /**
   * Close dialog and cancel navigation
   */
  const handleDialogClose = () => {
    setShowDialog(false);
    setPendingPath(null);
  };

  /**
   * Confirm dialog and proceed with blocked navigation
   */
  const handleDialogConfirm = () => {
    setShowDialog(false);

    if (pendingPath) {
      // In-app link navigation
      const path = pendingPath;
      setPendingPath(null);

      // Navigate after state update to avoid race conditions
      setTimeout(() => {
        navigate(path);
      }, 0);
    }
  };

  return {
    showDialog,
    pendingPath,
    handleDialogClose,
    handleDialogConfirm,
  };
}
