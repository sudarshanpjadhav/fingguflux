import { inject } from 'vue';
import { FingguSymbol, FingguOptions } from './plugin';

/**
 * useFinggu composable to resolve FingguFlux classes.
 */
export function useFinggu() {
    const finggu = inject<FingguOptions>(FingguSymbol, {
        mapping: null,
        mode: 'dev'
    });

    const resolve = (className: string): string => {
        const { mapping, mode } = finggu;
        if (mode === 'dev' || !mapping) return className;

        const mapped = mapping[className];
        if (mode === 'ext' && !mapped && className.startsWith('ff-')) {
            const errorMsg = `[FingguFlux] Critical: Class '${className}' not found in mapping.json in Extreme mode. This will cause broken styles in production.`;
            // @ts-ignore - support vite/nuxt environments
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

    return {
        resolve,
        resolveAll,
        mode: finggu.mode
    };
}
