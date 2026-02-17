/**
 * FingguFlux Theme Helper
 * Provides runtime logic for theme switching and system preference synchronization.
 */

export type FingguTheme = 'light' | 'dark' | 'system';

/**
 * Apply a theme to the document or a specific element.
 */
export function setTheme(theme: FingguTheme, target: HTMLElement = document.documentElement) {
    if (theme === 'system') {
        target.removeAttribute('data-ff-theme');
    } else {
        target.setAttribute('data-ff-theme', theme);
    }
}

/**
 * Watch for system theme changes and sync (if in system mode).
 */
export function watchSystemTheme(callback: (isDark: boolean) => void) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => callback(e.matches);

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
}

/**
 * Get the current effective theme.
 */
export function getEffectiveTheme(target: HTMLElement = document.documentElement): 'light' | 'dark' {
    const manual = target.getAttribute('data-ff-theme') as 'light' | 'dark' | null;
    if (manual) return manual;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
