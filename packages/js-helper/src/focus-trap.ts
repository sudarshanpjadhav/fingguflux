/**
 * Focus Trap Utility
 * Ensures tab focus remains within a specific container.
 */
export const focusTrap = (container: HTMLElement) => {
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableElements = container.querySelectorAll(focusableSelectors) as NodeListOf<HTMLElement>;
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTrap = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) { // Back tab
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else { // Forward tab
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener('keydown', handleTrap);

  // Return cleanup function
  return () => container.removeEventListener('keydown', handleTrap);
};
