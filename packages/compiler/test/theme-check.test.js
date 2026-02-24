/**
 * FingguFlux Theme-Check Regression Tests
 * v0.9.6 — Theme Engine Stabilization & Contract Freeze
 *
 * Runner: node --test  packages/compiler/test/theme-check.test.js
 * Zero external dependencies — uses Node ≥18 built-in test runner.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
    extractDefinedTokens,
    extractTokensByScope,
    detectRemovals,
    detectRenames,
    detectAdditions,
    validateThemeCompleteness,
    runThemeCheck,
} from '../theme-check.js';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const LIGHT_CSS = `
:root,
[data-ff-theme="light"] {
  --ff-primary: #2563eb;
  --ff-surface: #ffffff;
  --ff-text:    #0f172a;
  --ff-neutral-0:   #ffffff;
  --ff-neutral-50:  #f8fafc;
  --ff-neutral-900: #0f172a;
  --ff-secondary: #64748b;
  --ff-danger:    #ef4444;
  --ff-success:   #22c55e;
  --ff-warning:   #f59e0b;
  --ff-info:      #06b6d4;
  --ff-success-surface:  #f0fdf4;
  --ff-success-border:   #bbf7d0;
  --ff-success-content:  #166534;
  --ff-warning-surface:  #fffbeb;
  --ff-warning-border:   #fef3c7;
  --ff-warning-content:  #92400e;
  --ff-danger-surface:   #fef2f2;
  --ff-danger-border:    #fecaca;
  --ff-danger-content:   #991b1b;
}
`;

const DARK_EXPLICIT_CSS = `
[data-ff-theme="dark"] {
  --ff-surface: #0f172a;
  --ff-text:    #f8fafc;
  --ff-primary: #60a5fa;
  --ff-neutral-0:   #0f172a;
  --ff-neutral-50:  #1e293b;
  --ff-neutral-900: #f8fafc;
}
`;

const DARK_SYSTEM_CSS = `
@media (prefers-color-scheme: dark) {
  :root:not([data-ff-theme="light"]) {
    --ff-surface: #0f172a;
    --ff-text:    #f8fafc;
    --ff-primary: #60a5fa;
    --ff-neutral-0:   #0f172a;
    --ff-neutral-50:  #1e293b;
    --ff-neutral-900: #f8fafc;
  }
}
`;

/** Minimal registry used for unit tests (avoids filesystem IO). */
const MINIMAL_REGISTRY = {
    categories: {
        colors: {
            description: 'Core colors',
            tokens: ['--ff-primary', '--ff-surface', '--ff-text', '--ff-secondary'],
        },
    },
    theming: {
        light: {
            required: ['--ff-primary', '--ff-surface', '--ff-text'],
        },
        dark: {
            required: ['--ff-primary', '--ff-surface', '--ff-text'],
        },
        system: {
            required: ['--ff-primary', '--ff-surface', '--ff-text'],
        },
    },
    renames: [],
    deprecations: [],
};

/** Full registry that matches LIGHT_CSS + DARK themes for integration tests. */
const FULL_REGISTRY = {
    categories: {
        'color-neutral': {
            description: 'Neutral',
            tokens: [
                '--ff-neutral-0', '--ff-neutral-50', '--ff-neutral-900',
                '--ff-surface', '--ff-text',
            ],
        },
        'color-semantic': {
            description: 'Semantic',
            tokens: [
                '--ff-primary', '--ff-secondary', '--ff-danger',
                '--ff-success', '--ff-warning', '--ff-info',
            ],
        },
        'color-surface-success': {
            tokens: ['--ff-success-surface', '--ff-success-border', '--ff-success-content'],
        },
        'color-surface-warning': {
            tokens: ['--ff-warning-surface', '--ff-warning-border', '--ff-warning-content'],
        },
        'color-surface-danger': {
            tokens: ['--ff-danger-surface', '--ff-danger-border', '--ff-danger-content'],
        },
    },
    theming: {
        light: {
            required: [
                '--ff-primary', '--ff-surface', '--ff-text',
                '--ff-neutral-0', '--ff-neutral-50', '--ff-neutral-900',
                '--ff-secondary', '--ff-danger', '--ff-success', '--ff-warning', '--ff-info',
                '--ff-success-surface', '--ff-success-border', '--ff-success-content',
                '--ff-warning-surface', '--ff-warning-border', '--ff-warning-content',
                '--ff-danger-surface', '--ff-danger-border', '--ff-danger-content',
            ],
        },
        dark: {
            required: [
                '--ff-primary', '--ff-surface', '--ff-text',
                '--ff-neutral-0', '--ff-neutral-50', '--ff-neutral-900',
            ],
        },
        system: {
            required: [
                '--ff-primary', '--ff-surface', '--ff-text',
                '--ff-neutral-0', '--ff-neutral-50', '--ff-neutral-900',
            ],
        },
    },
    renames: [],
    deprecations: [],
};

const COMBINED_CSS = LIGHT_CSS + DARK_EXPLICIT_CSS + DARK_SYSTEM_CSS;

// ─── Token Extraction ─────────────────────────────────────────────────────────

describe('extractDefinedTokens', () => {
    test('extracts all --ff- variable definitions', () => {
        const tokens = extractDefinedTokens(LIGHT_CSS);
        assert.ok(tokens.has('--ff-primary'), 'should have --ff-primary');
        assert.ok(tokens.has('--ff-surface'), 'should have --ff-surface');
        assert.ok(tokens.has('--ff-text'), 'should have --ff-text');
        assert.ok(tokens.has('--ff-neutral-0'), 'should have --ff-neutral-0');
    });

    test('does NOT include var() references as definitions', () => {
        const css = `:root { --ff-surface: var(--ff-neutral-0); }`;
        const tokens = extractDefinedTokens(css);
        assert.ok(tokens.has('--ff-surface'), 'definition token present');
        // --ff-neutral-0 appears inside var() – NOT a definition in this snippet
        assert.ok(!tokens.has('--ff-neutral-0'), 'var() reference should not be extracted as definition');
    });

    test('returns empty set for CSS with no --ff- tokens', () => {
        const tokens = extractDefinedTokens(`.foo { color: red; }`);
        assert.equal(tokens.size, 0);
    });
});

// ─── Scope Extraction ─────────────────────────────────────────────────────────

describe('extractTokensByScope', () => {
    test('marks tokens inside :root as "light" scope', () => {
        const map = extractTokensByScope(LIGHT_CSS);
        const scopes = map.get('--ff-primary');
        assert.ok(scopes, '--ff-primary should be mapped');
        assert.ok(scopes.has('light'), 'should be in light scope');
    });

    test('marks tokens inside [data-ff-theme="dark"] as "dark" scope', () => {
        const map = extractTokensByScope(DARK_EXPLICIT_CSS);
        const scopes = map.get('--ff-surface');
        assert.ok(scopes, '--ff-surface should be mapped');
        assert.ok(scopes.has('dark'), 'should be in dark scope');
    });

    test('marks tokens inside @media prefers-color-scheme:dark as "system" scope', () => {
        const map = extractTokensByScope(DARK_SYSTEM_CSS);
        const scopes = map.get('--ff-primary');
        assert.ok(scopes, '--ff-primary should be mapped in system media query');
        assert.ok(scopes.has('system'), 'should be in system scope');
    });

    test('handles combined CSS with all three scopes', () => {
        const map = extractTokensByScope(COMBINED_CSS);
        const primaryScopes = map.get('--ff-primary');
        assert.ok(primaryScopes.has('light'), 'primary in light  scope');
        assert.ok(primaryScopes.has('dark'), 'primary in dark   scope');
        assert.ok(primaryScopes.has('system'), 'primary in system scope');
    });
});

// ─── Removal Detection ────────────────────────────────────────────────────────

describe('detectRemovals', () => {
    test('returns empty array when all registry tokens are present', () => {
        const defined = new Set(['--ff-primary', '--ff-surface', '--ff-text', '--ff-secondary']);
        const registry = new Set(['--ff-primary', '--ff-surface', '--ff-text', '--ff-secondary']);
        assert.deepEqual(detectRemovals(registry, defined), []);
    });

    test('detects a single removed token', () => {
        const defined = new Set(['--ff-primary', '--ff-surface']);
        const registry = new Set(['--ff-primary', '--ff-surface', '--ff-text']);
        assert.deepEqual(detectRemovals(registry, defined), ['--ff-text']);
    });

    test('detects multiple removed tokens in sorted order', () => {
        const defined = new Set(['--ff-primary']);
        const registry = new Set(['--ff-primary', '--ff-surface', '--ff-text']);
        assert.deepEqual(
            detectRemovals(registry, defined),
            ['--ff-surface', '--ff-text']   // sorted alphabetically
        );
    });

    test('returns empty when CSS defines MORE tokens than registry', () => {
        const defined = new Set(['--ff-primary', '--ff-surface', '--ff-extra']);
        const registry = new Set(['--ff-primary', '--ff-surface']);
        assert.deepEqual(detectRemovals(registry, defined), []);
    });
});

// ─── Rename Detection ─────────────────────────────────────────────────────────

describe('detectRenames', () => {
    test('returns empty when no renames exist', () => {
        const defined = new Set(['--ff-primary']);
        assert.deepEqual(detectRenames([], defined), []);
    });

    test('flags stale old names still present in CSS', () => {
        const renames = [
            { from: '--ff-old-primary', to: '--ff-primary', since: '0.9.6' },
        ];
        const defined = new Set(['--ff-primary', '--ff-old-primary']); // old name still there!
        const found = detectRenames(renames, defined);
        assert.equal(found.length, 1);
        assert.equal(found[0].from, '--ff-old-primary');
    });

    test('does NOT flag renames whose old name is already gone', () => {
        const renames = [
            { from: '--ff-old-primary', to: '--ff-primary', since: '0.9.6' },
        ];
        const defined = new Set(['--ff-primary']); // old name removed – clean!
        assert.deepEqual(detectRenames(renames, defined), []);
    });

    test('handles multiple renames correctly', () => {
        const renames = [
            { from: '--ff-col-a', to: '--ff-neutral-50', since: '0.9.6' },
            { from: '--ff-col-b', to: '--ff-neutral-100', since: '0.9.6' },
        ];
        // Only old-b is still in CSS
        const defined = new Set(['--ff-neutral-50', '--ff-col-b']);
        const found = detectRenames(renames, defined);
        assert.equal(found.length, 1);
        assert.equal(found[0].from, '--ff-col-b');
    });
});

// ─── Addition Detection ───────────────────────────────────────────────────────

describe('detectAdditions', () => {
    test('returns empty when CSS has exactly the registry tokens', () => {
        const registry = new Set(['--ff-primary', '--ff-surface']);
        const defined = new Set(['--ff-primary', '--ff-surface']);
        assert.deepEqual(detectAdditions(registry, defined), []);
    });

    test('detects tokens in CSS not in registry', () => {
        const registry = new Set(['--ff-primary']);
        const defined = new Set(['--ff-primary', '--ff-custom-brand']);
        assert.deepEqual(detectAdditions(registry, defined), ['--ff-custom-brand']);
    });

    test('returns sorted results', () => {
        const registry = new Set(['--ff-primary']);
        const defined = new Set(['--ff-primary', '--ff-z-new', '--ff-a-new']);
        assert.deepEqual(detectAdditions(registry, defined), ['--ff-a-new', '--ff-z-new']);
    });
});

// ─── Theme Completeness ───────────────────────────────────────────────────────

describe('validateThemeCompleteness', () => {
    test('passes when all light required tokens are present', () => {
        const map = extractTokensByScope(LIGHT_CSS);
        const gaps = validateThemeCompleteness(MINIMAL_REGISTRY.theming, map);
        // light required: --ff-primary, --ff-surface, --ff-text  — all in LIGHT_CSS
        assert.deepEqual(gaps.light, []);
    });

    test('fails when a required dark token is absent', () => {
        // CSS only has light scope, no dark overrides
        const map = extractTokensByScope(LIGHT_CSS);
        const theming = {
            dark: { required: ['--ff-surface', '--ff-text', '--ff-primary'] },
        };
        const gaps = validateThemeCompleteness(theming, map);
        // None of the tokens appear in dark scope
        assert.ok(gaps.dark.length > 0, 'should report missing dark tokens');
    });

    test('passes dark check when explicit dark tokens are present', () => {
        const map = extractTokensByScope(COMBINED_CSS);
        const theming = {
            dark: { required: ['--ff-surface', '--ff-text', '--ff-primary'] },
        };
        const gaps = validateThemeCompleteness(theming, map);
        assert.deepEqual(gaps.dark, []);
    });

    test('passes system check when @media prefers-color-scheme tokens present', () => {
        const map = extractTokensByScope(COMBINED_CSS);
        const theming = {
            system: { required: ['--ff-surface', '--ff-text', '--ff-primary'] },
        };
        const gaps = validateThemeCompleteness(theming, map);
        assert.deepEqual(gaps.system, []);
    });

    test('handles empty required list gracefully', () => {
        const map = new Map();
        const gaps = validateThemeCompleteness({ light: { required: [] } }, map);
        assert.deepEqual(gaps.light, []);
    });
});

// ─── runThemeCheck Integration ────────────────────────────────────────────────

describe('runThemeCheck (integration)', () => {
    test('returns pass=true for a fully correct token set', () => {
        const result = runThemeCheck(COMBINED_CSS, FULL_REGISTRY);
        assert.equal(result.pass, true, 'should pass: ' + JSON.stringify(result));
    });

    test('returns pass=false when a registry token is removed from CSS', () => {
        // Omit --ff-success-surface (only in LIGHT_CSS, not in dark/system)
        const css = LIGHT_CSS.replace('--ff-success-surface:  #f0fdf4;', '') + DARK_EXPLICIT_CSS + DARK_SYSTEM_CSS;
        const result = runThemeCheck(css, FULL_REGISTRY);
        assert.equal(result.pass, false);
        assert.ok(result.removals.includes('--ff-success-surface'), 'success-surface removal should be detected');
    });


    test('reports stale renamed tokens', () => {
        const registryWithRename = {
            ...FULL_REGISTRY,
            renames: [
                { from: '--ff-surface', to: '--ff-bg', since: '0.9.6' },
            ],
        };
        // COMBINED_CSS still has --ff-surface (the old name)
        const result = runThemeCheck(COMBINED_CSS, registryWithRename);
        assert.ok(result.renames.length > 0, 'should detect stale rename');
    });

    test('reports additions for unregistered tokens', () => {
        const css = COMBINED_CSS + `:root { --ff-brand-red: #ff0000; }`;
        const result = runThemeCheck(css, FULL_REGISTRY);
        assert.ok(result.additions.includes('--ff-brand-red'), 'should report unregistered token');
    });

    test('reports missing dark tokens as themeGaps', () => {
        // Use full registry but provide only light CSS
        const result = runThemeCheck(LIGHT_CSS, FULL_REGISTRY);
        assert.ok(result.themeGaps.dark.length > 0, 'dark tokens should be missing');
        assert.ok(result.themeGaps.system.length > 0, 'system tokens should be missing');
        assert.equal(result.themeGaps.light.length, 0, 'light should be complete');
    });

    test('result has expected shape', () => {
        const result = runThemeCheck(COMBINED_CSS, FULL_REGISTRY);
        assert.ok(typeof result.pass === 'boolean');
        assert.ok(Array.isArray(result.removals));
        assert.ok(Array.isArray(result.renames));
        assert.ok(Array.isArray(result.additions));
        assert.ok(typeof result.themeGaps === 'object');
        assert.ok(Array.isArray(result.warnings));
    });
});

// ─── Theme Switching Regression Tests ────────────────────────────────────────

describe('Theme switching contract regression', () => {
    /**
     * These tests simulate what would happen if a developer:
     * (a) accidentally deletes a dark-mode override, or
     * (b) only updates one theme (light) but forgets dark.
     */

    test('REG-001: switching from light → dark requires at least surface + text overrides', () => {
        // Simulate: dark CSS missing --ff-text override
        const brokenDark = `[data-ff-theme="dark"] {
            --ff-surface: #0f172a;
            --ff-neutral-0:   #0f172a;
            --ff-neutral-50:  #1e293b;
            --ff-neutral-900: #f8fafc;
            --ff-primary: #60a5fa;
        }`;
        // Note: --ff-text is missing from dark
        const css = LIGHT_CSS + brokenDark + DARK_SYSTEM_CSS;
        const theming = {
            dark: { required: ['--ff-surface', '--ff-text', '--ff-primary'] },
        };
        const map = extractTokensByScope(css);
        const gaps = validateThemeCompleteness(theming, map);
        assert.ok(gaps.dark.includes('--ff-text'), 'REG-001: --ff-text must be required in dark');
    });

    test('REG-002: system (prefers-color-scheme) must mirror explicit dark overrides', () => {
        // System CSS is missing --ff-primary
        const brokenSystem = `@media (prefers-color-scheme: dark) {
            :root:not([data-ff-theme="light"]) {
                --ff-surface: #0f172a;
                --ff-text:    #f8fafc;
                --ff-neutral-0:   #0f172a;
                --ff-neutral-50:  #1e293b;
                --ff-neutral-900: #f8fafc;
            }
        }`;
        const css = LIGHT_CSS + DARK_EXPLICIT_CSS + brokenSystem;
        const theming = {
            system: { required: ['--ff-surface', '--ff-text', '--ff-primary'] },
        };
        const map = extractTokensByScope(css);
        const gaps = validateThemeCompleteness(theming, map);
        assert.ok(gaps.system.includes('--ff-primary'), 'REG-002: primary must be overridden in system');
    });

    test('REG-003: removing a neutral scale token breaks the contract', () => {
        // Remove --ff-neutral-900 from CSS
        const css = COMBINED_CSS.replace(/--ff-neutral-900:[^;]+;/g, '');
        const registry = new Set(['--ff-neutral-900']);
        const defined = extractDefinedTokens(css);
        const removals = detectRemovals(registry, defined);
        assert.ok(removals.includes('--ff-neutral-900'), 'REG-003: neutral-900 removal must be detected');
    });

    test('REG-004: renaming --ff-primary to --ff-brand without deprecating old name is caught', () => {
        // Developer renamed the token in registry but old name still in CSS
        const renames = [{ from: '--ff-primary', to: '--ff-brand', since: '0.9.7' }];
        const css = `:root { --ff-primary: #2563eb; --ff-brand: #2563eb; }`; // both present during transition
        const defined = extractDefinedTokens(css);
        const found = detectRenames(renames, defined);
        assert.equal(found.length, 1, 'REG-004: stale old name must appear in renames list');
        assert.equal(found[0].from, '--ff-primary');
    });

    test('REG-005: full happy path — COMBINED_CSS passes all checks against FULL_REGISTRY', () => {
        const result = runThemeCheck(COMBINED_CSS, FULL_REGISTRY);
        assert.equal(result.pass, true, 'full contract should pass');
        assert.equal(result.removals.length, 0, 'no removals');
        assert.equal(result.renames.length, 0, 'no stale renames');
        assert.equal(result.themeGaps.light.length, 0, 'light complete');
        assert.equal(result.themeGaps.dark.length, 0, 'dark complete');
        assert.equal(result.themeGaps.system.length, 0, 'system complete');
    });

    test('REG-006: light-only CSS must fail dark and system completeness checks', () => {
        const result = runThemeCheck(LIGHT_CSS, FULL_REGISTRY);
        assert.equal(result.pass, false, 'light-only CSS must fail overall');
        assert.equal(result.themeGaps.light.length, 0, 'light is complete within itself');
        assert.ok(result.themeGaps.dark.length > 0, 'dark must be flagged as incomplete');
        assert.ok(result.themeGaps.system.length > 0, 'system must be flagged as incomplete');
    });
});
