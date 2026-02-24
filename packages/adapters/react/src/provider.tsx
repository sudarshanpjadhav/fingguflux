import React, { createContext, useContext, useMemo, useEffect, useRef } from 'react';
import { setTheme, FingguTheme } from '@finggujadhav/js-helper';

export interface FingguMapping {
    _version?: string;
    [key: string]: string | undefined;
}

interface FingguContextValue {
    mapping: FingguMapping | null;
    mode: 'dev' | 'opt' | 'ext';
    version?: string;
    theme?: FingguTheme;
}

const FingguContext = createContext<FingguContextValue>({
    mapping: null,
    mode: 'dev'
});

export interface FingguProviderProps {
    children: React.ReactNode;
    mapping?: FingguMapping;
    mode?: 'dev' | 'opt' | 'ext';
    version?: string; // Target CSS version to validate against
    theme?: FingguTheme;
}

/**
 * Provides FingguFlux class mapping to the component tree.
 */
export const FingguProvider: React.FC<FingguProviderProps> = ({
    children,
    mapping = null,
    mode = 'dev',
    version,
    theme = 'system'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useMemo(() => {
        if (mapping && version && mapping._version && mapping._version !== version) {
            console.warn(`[FingguFlux] Version Mismatch: mapping.json (${mapping._version}) does not match expected CSS version (${version})`);
        }
    }, [mapping, version]);

    // Apply theme to container for isolation
    useEffect(() => {
        if (containerRef.current) {
            setTheme(theme, containerRef.current);
        }
    }, [theme]);

    const value = useMemo(() => ({ mapping, mode, version, theme }), [mapping, mode, version, theme]);

    return (
        <FingguContext.Provider value={value}>
            <div ref={containerRef} style={{ display: 'contents' }}>
                {children}
            </div>
        </FingguContext.Provider>
    );
};

/**
 * Hook to resolve FingguFlux classes to their mapped versions.
 */
export const useFinggu = () => {
    const { mapping, mode, theme } = useContext(FingguContext);

    const resolve = (className: string): string => {
        if (mode === 'dev' || !mapping) return className;

        const mapped = mapping[className];
        if (mode === 'ext' && !mapped && className.startsWith('ff-')) {
            const errorMsg = `[FingguFlux] Critical: Class '${className}' not found in mapping.json in Extreme mode. This will cause broken styles in production.`;
            if (process.env.NODE_ENV === 'development') {
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

    return { resolve, resolveAll, mode, theme };
};
