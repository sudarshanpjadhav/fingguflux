import { setContext, getContext } from 'svelte';
import { writable, derived, type Readable } from 'svelte/store';
import { setTheme, FingguTheme } from '@finggu/js-helper';

export interface FingguMapping {
    _version?: string;
    [key: string]: string | undefined;
}

export interface FingguContextValue {
    mapping: FingguMapping | null;
    mode: 'dev' | 'opt' | 'ext';
    version?: string;
    theme?: FingguTheme;
}

const FINGGU_KEY = Symbol('FingguFlux');

/**
 * Initialize FingguFlux context in a layout or root component.
 */
export function setFingguContext(initial: FingguContextValue & { theme?: FingguTheme }) {
    const theme = initial.theme || 'system';
    const store = writable<FingguContextValue & { theme: FingguTheme }>({
        ...initial,
        theme
    });

    // Version Guard
    if (initial.mapping && initial.version && initial.mapping._version && initial.mapping._version !== initial.version) {
        console.warn(`[FingguFlux] Version Mismatch: mapping.json (${initial.mapping._version}) does not match expected CSS version (${initial.version})`);
    }

    // Apply theme
    if (typeof document !== 'undefined') {
        setTheme(theme);
    }

    setContext(FINGGU_KEY, store);
    return store;
}

/**
 * useFinggu for class resolution within Svelte components.
 */
export function useFinggu() {
    const store = getContext<Readable<FingguContextValue>>(FINGGU_KEY);

    // Fallback if context is missing (SSR safety or misconfiguration)
    const fallback: FingguContextValue = { mapping: null, mode: 'dev' };

    return derived(store || writable(fallback), ($finggu) => {
        const resolve = (className: string): string => {
            if ($finggu.mode === 'dev' || !$finggu.mapping) return className;

            const mapped = $finggu.mapping[className];
            if ($finggu.mode === 'ext' && !mapped && className.startsWith('ff-')) {
                const errorMsg = `[FingguFlux] Critical: Class '${className}' not found in mapping.json in Extreme mode. This will cause broken styles in production.`;

                // SvelteKit dev check
                // @ts-ignore
                const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : (import.meta as any).env?.DEV;

                if (isDev) {
                    throw new Error(errorMsg);
                } else {
                    console.error(errorMsg);
                }
            }
            return mapped || className;
        };

        const resolveAll = (classes: (string | undefined | null | false)[]): string => {
            return classes
                .filter(Boolean)
                .map(c => resolve(c as string))
                .join(' ');
        };

        return { resolve, resolveAll, mode: $finggu.mode, theme: $finggu.theme };
    });
}
