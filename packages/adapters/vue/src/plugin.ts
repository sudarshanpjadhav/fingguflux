import { InjectionKey, App, reactive, watch } from 'vue';
import { setTheme, FingguTheme } from '@finggujadhav/js-helper';

export interface FingguMapping {
    _version?: string;
    [key: string]: string | undefined;
}

export interface FingguOptions {
    mapping?: FingguMapping;
    mode?: 'dev' | 'opt' | 'ext';
    version?: string;
    theme?: FingguTheme;
}

export const FingguSymbol: InjectionKey<FingguOptions> = Symbol('FingguFlux');

/**
 * FingguFlux Vue Plugin
 * Installs mapping, mode, and theme via provide/inject.
 */
export const FingguPlugin = {
    install(app: App, options: FingguOptions = {}) {
        const state = reactive({
            mapping: options.mapping || null,
            mode: options.mode || 'dev',
            version: options.version,
            theme: options.theme || 'system'
        });

        if (state.mapping && state.version && state.mapping._version && state.mapping._version !== state.version) {
            console.warn(`[FingguFlux] Version Mismatch: mapping.json (${state.mapping._version}) does not match expected CSS version (${state.version})`);
        }

        // Global theme application (optional, can be scoped)
        watch(() => state.theme, (newTheme) => {
            setTheme(newTheme as FingguTheme);
        }, { immediate: true });

        app.provide(FingguSymbol, state);
    }
};
