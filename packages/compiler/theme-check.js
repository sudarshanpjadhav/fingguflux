/**
 * FingguFlux Theme-Check Engine
 * v0.9.6 – Theme Engine Stabilization & Contract Freeze
 *
 * ZERO RUNTIME OVERHEAD: This module is a pure build-time static analyser.
 * It reads CSS files and the TOKENS_REGISTRY.json contract, then emits
 * structured diagnostics.  It produces NO code that ships to the browser.
 */

import fs from 'fs';
import path from 'path';

// ─── ANSI colour helpers ──────────────────────────────────────────────────────
const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    grey: '\x1b[90m',
};
const clr = (code, text) => `${code}${text}${C.reset}`;

// ─── Token extraction ─────────────────────────────────────────────────────────

/**
 * Parse every `--ff-*` custom-property *definition* from a CSS string.
 * Only captures tokens that appear on the LEFT-hand side of a colon,
 * i.e. actual definitions, not var() references.
 *
 * @param {string} css
 * @returns {Set<string>}
 */
export function extractDefinedTokens(css) {
    const defined = new Set();
    // Match:  --ff-something-here  :  <value>
    const re = /(--ff-[\w-]+)\s*:/g;
    let m;
    while ((m = re.exec(css)) !== null) {
        // Skip tokens that appear inside var(...) — they are references, not definitions
        const before = css.slice(0, m.index);
        const lastVar = before.lastIndexOf('var(');
        const lastClose = before.lastIndexOf(')');
        if (lastVar !== -1 && lastVar > lastClose) continue;
        defined.add(m[1]);
    }
    return defined;
}


/**
 * Build a context map: token → array of CSS at-rule / selector scopes
 * where the token is defined.
 *
 * Scopes we care about:
 *   'light'  — :root or [data-ff-theme="light"]
 *   'dark'   — [data-ff-theme="dark"]
 *   'system' — @media (prefers-color-scheme: dark)
 *   'global' — anything else (e.g. root-level without a theme wrapper)
 *
 * @param {string} css
 * @returns {Map<string, Set<string>>}  token → scopes
 */
export function extractTokensByScope(css) {
    /** @type {Map<string, Set<string>>} */
    const map = new Map();

    /**
     * We parse character-by-character to maintain an accurate scope stack.
     * scopeStack[i] holds the classified scope name for depth i+1.
     *
     * Scopes:
     *   'light'  — :root or [data-ff-theme="light"] (or comma-list containing either)
     *   'dark'   — [data-ff-theme="dark"]
     *   'system' — @media (prefers-color-scheme: dark) { ... }
     *   'global' — anything else
     *
     * Nesting rule: 'system' dominates — any inner selector inside a system
     * @media block stays classified as 'system', even if it contains ':root'.
     */
    const scopeStack = [];   // one entry per open brace depth
    let depth = 0;

    let pending = '';        // text accumulating before the next '{'
    let inString = false;
    let stringChar = '';

    /**
     * @param {string} sel - the raw selector / at-rule text
     * @param {string} parentScope - the scope of the enclosing block ('global', 'system', etc.)
     */
    const classifySelector = (sel, parentScope) => {
        const s = sel.toLowerCase().trim();
        if (!s) return parentScope;

        // @media rule itself
        if (s.includes('@media')) {
            if (s.includes('prefers-color-scheme') && s.includes('dark')) {
                return 'system';
            }
            return 'global';
        }

        // If we're already inside a system (dark media) block, any inner rule is system too
        if (parentScope === 'system') return 'system';

        // Explicit dark theme selector
        if (s.includes('[data-ff-theme="dark"]') || s.includes("[data-ff-theme='dark']")) {
            return 'dark';
        }

        // Light: :root or comma-list like ":root, [data-ff-theme='light']"
        if (
            s.includes(':root') ||
            s.includes('[data-ff-theme="light"]') ||
            s.includes("[data-ff-theme='light']")
        ) {
            return 'light';
        }

        return 'global';
    };

    const addToken = (tok, scope) => {
        if (!map.has(tok)) map.set(tok, new Set());
        map.get(tok).add(scope);
    };

    const extractTokensFromText = (text, scope) => {
        // Match only actual custom-property definitions:
        //   --ff-name  :  <value>
        // We use a regex that matches --ff-name followed by whitespace and colon,
        // then verify it is NOT inside a var() call.
        const re = /(--ff-[\w-]+)\s*:/g;
        let m;
        while ((m = re.exec(text)) !== null) {
            // Exclude matches that are inside var(...) — check what precedes the token
            const before = text.slice(0, m.index);
            const lastVar = before.lastIndexOf('var(');
            const lastClose = before.lastIndexOf(')');
            if (lastVar !== -1 && lastVar > lastClose) {
                continue; // inside a var() call
            }
            addToken(m[1], scope);
        }
    };

    // Determine effective scope from the stack (outermost non-global wins for system)
    const currentScope = () => {
        // 'system' takes absolute priority (outermost) when present anywhere in stack
        if (scopeStack.includes('system')) return 'system';
        // Otherwise find the innermost meaningful scope
        for (let i = scopeStack.length - 1; i >= 0; i--) {
            if (scopeStack[i] !== 'global') return scopeStack[i];
        }
        return 'global';
    };

    const parentScope = () => {
        if (scopeStack.length === 0) return 'global';
        // Same logic as currentScope but without the new entry
        if (scopeStack.includes('system')) return 'system';
        for (let i = scopeStack.length - 1; i >= 0; i--) {
            if (scopeStack[i] !== 'global') return scopeStack[i];
        }
        return 'global';
    };

    for (let i = 0; i < css.length; i++) {
        const ch = css[i];

        // Basic string tracking (to avoid misinterpreting { } inside strings/comments)
        if (!inString && (ch === '"' || ch === "'")) {
            inString = true;
            stringChar = ch;
            pending += ch;
            continue;
        }
        if (inString && ch === stringChar && css[i - 1] !== '\\') {
            inString = false;
            pending += ch;
            continue;
        }
        if (inString) {
            pending += ch;
            continue;
        }

        if (ch === '{') {
            const scope = classifySelector(pending, parentScope());
            scopeStack.push(scope);
            depth++;
            pending = '';
        } else if (ch === '}') {
            // Flush any pending text before closing the block
            if (pending.trim()) {
                extractTokensFromText(pending, currentScope());
            }
            scopeStack.pop();
            depth--;
            pending = '';
        } else {
            pending += ch;
            // Flush at semicolons to keep memory usage bounded
            if (ch === ';' && depth > 0) {
                extractTokensFromText(pending, currentScope());
                pending = '';
            }
        }
    }

    return map;
}



// ─── Registry loader ──────────────────────────────────────────────────────────

/**
 * Locate and parse TOKENS_REGISTRY.json.
 * Searches: CWD, packages/core, ../../packages/core (monorepo root).
 *
 * @returns {{ registry: object, registryPath: string }}
 */
export function loadRegistry() {
    const candidates = [
        path.resolve('./packages/core/TOKENS_REGISTRY.json'),
        path.resolve('../../packages/core/TOKENS_REGISTRY.json'),
        path.resolve('./node_modules/@finggujadhav/core/TOKENS_REGISTRY.json'),
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) {
            try {
                return { registry: JSON.parse(fs.readFileSync(p, 'utf8')), registryPath: p };
            } catch (e) {
                throw new Error(`TOKENS_REGISTRY.json at ${p} is malformed JSON: ${e.message}`);
            }
        }
    }

    throw new Error(
        'TOKENS_REGISTRY.json not found. ' +
        'Expected at packages/core/TOKENS_REGISTRY.json. ' +
        'Run the FingguFlux bootstrap task to regenerate it.'
    );
}

/**
 * Returns the flat set of ALL token names from every category in the registry.
 *
 * @param {object} registry
 * @returns {Set<string>}
 */
export function registryAllTokens(registry) {
    const all = new Set();
    for (const cat of Object.values(registry.categories)) {
        for (const tok of cat.tokens) all.add(tok);
    }
    return all;
}

// ─── Core checks ─────────────────────────────────────────────────────────────

/**
 * REMOVAL DETECTION
 * Finds tokens present in the registry but ABSENT from the actual CSS.
 *
 * @param {Set<string>} registryTokens
 * @param {Set<string>} definedTokens
 * @returns {string[]} removed token names
 */
export function detectRemovals(registryTokens, definedTokens) {
    const removed = [];
    for (const tok of registryTokens) {
        if (!definedTokens.has(tok)) removed.push(tok);
    }
    return removed.sort();
}

/**
 * RENAME DETECTION
 * Checks the registry's `renames` array for tokens that have been moved
 * but whose *old* name still appears as a definition in the CSS.
 *
 * Registry renames format:
 *   { "from": "--ff-old-name", "to": "--ff-new-name", "since": "0.9.6" }
 *
 * @param {Array<{from:string,to:string,since:string}>} renames
 * @param {Set<string>} definedTokens
 * @returns {Array<{from:string,to:string,since:string}>}
 */
export function detectRenames(renames, definedTokens) {
    return renames.filter(r => definedTokens.has(r.from));
}

/**
 * ADDITION DETECTION
 * Tokens defined in CSS that are NOT present in the registry (undocumented additions).
 *
 * @param {Set<string>} registryTokens
 * @param {Set<string>} definedTokens
 * @returns {string[]}
 */
export function detectAdditions(registryTokens, definedTokens) {
    const added = [];
    for (const tok of definedTokens) {
        if (!registryTokens.has(tok)) added.push(tok);
    }
    return added.sort();
}

/**
 * THEME COMPLETENESS
 * Validates that every token listed under registry.theming[theme].required
 * is defined (has a definition) within the correct CSS scope.
 *
 * @param {object} theming     registry.theming
 * @param {Map<string, Set<string>>} tokensByScope
 * @returns {Object.<string, string[]>}  theme → missing tokens
 */
export function validateThemeCompleteness(theming, tokensByScope) {
    const results = {};

    for (const [theme, config] of Object.entries(theming)) {
        const missing = [];
        const required = config.required || [];

        for (const tok of required) {
            const scopes = tokensByScope.get(tok);
            if (!scopes) {
                missing.push(tok);
                continue;
            }

            let satisfied = false;

            if (theme === 'light') {
                // Light theme: token must be present in 'light' scope (which includes :root)
                satisfied = scopes.has('light');
            } else {
                // Dark / system: token MUST be explicitly overridden in that specific scope.
                // A token that only exists in 'light' scope is NOT considered satisfied
                // for dark/system, because that is precisely what theme-check is enforcing —
                // that the author hasn't forgotten to provide the dark/system overrides.
                satisfied = scopes.has(theme);
            }

            if (!satisfied) missing.push(tok);
        }

        results[theme] = missing;
    }

    return results;
}

// ─── Main runner ──────────────────────────────────────────────────────────────

/**
 * Run the full theme-check suite against a CSS string.
 *
 * @param {string} css  Combined tokens CSS content
 * @param {object} [registryOverride]  Inject registry directly (used in tests)
 * @returns {{
 *   pass: boolean,
 *   removals: string[],
 *   renames: Array,
 *   additions: string[],
 *   themeGaps: Object,
 *   warnings: string[]
 * }}
 */
export function runThemeCheck(css, registryOverride) {
    const { registry } = registryOverride
        ? { registry: registryOverride }
        : loadRegistry();

    const definedTokens = extractDefinedTokens(css);
    const tokensByScope = extractTokensByScope(css);
    const registryTokens = registryAllTokens(registry);

    const removals = detectRemovals(registryTokens, definedTokens);
    const renames = detectRenames(registry.renames || [], definedTokens);
    const additions = detectAdditions(registryTokens, definedTokens);
    const themeGaps = validateThemeCompleteness(registry.theming || {}, tokensByScope);

    const warnings = [];
    if (additions.length > 0) {
        warnings.push(
            `${additions.length} token(s) defined in CSS but absent from TOKENS_REGISTRY.json. ` +
            'Add them to the registry to freeze the contract.'
        );
    }

    const pass =
        removals.length === 0 &&
        renames.length === 0 &&
        Object.values(themeGaps).every(arr => arr.length === 0);

    return { pass, removals, renames, additions, themeGaps, warnings };
}

// ─── Pretty-printer ───────────────────────────────────────────────────────────

/**
 * Print a human-readable theme-check report to stdout.
 *
 * @param {{ pass: boolean, removals: string[], renames: Array, additions: string[], themeGaps: Object, warnings: string[] }} result
 * @param {{ verbose?: boolean }} [opts]
 */
export function printThemeCheckReport(result, opts = {}) {
    const { pass, removals, renames, additions, themeGaps, warnings } = result;
    const verbose = opts.verbose || false;

    console.log('');
    console.log(clr(C.bold + C.cyan, '🎨 FingguFlux Theme-Check – Contract Freeze Audit'));
    console.log(clr(C.grey, '─'.repeat(54)));

    // ── Removals ──────────────────────────────────────────────
    if (removals.length === 0) {
        console.log(clr(C.green, '✅ No token removals detected.'));
    } else {
        console.log(clr(C.red, `❌ ${removals.length} token(s) REMOVED (breaking change!):`));
        removals.forEach(t => console.log(clr(C.red, `   – ${t}`)));
    }

    // ── Renames ───────────────────────────────────────────────
    if (renames.length === 0) {
        console.log(clr(C.green, '✅ No stale renamed tokens in CSS.'));
    } else {
        console.log(clr(C.yellow, `⚠️  ${renames.length} stale rename(s) found:`));
        renames.forEach(r =>
            console.log(clr(C.yellow, `   ${r.from}  →  ${r.to}  (since v${r.since})`))
        );
    }

    // ── Unregistered additions ────────────────────────────────
    if (additions.length === 0) {
        console.log(clr(C.green, '✅ All defined tokens are registered.'));
    } else if (verbose) {
        console.log(clr(C.yellow, `⚠️  ${additions.length} unregistered token(s):`));
        additions.forEach(t => console.log(clr(C.grey, `   + ${t}`)));
    } else {
        console.log(clr(C.yellow, `⚠️  ${additions.length} unregistered token(s). Use --verbose to list.`));
    }

    // ── Theme completeness ────────────────────────────────────
    console.log('');
    console.log(clr(C.bold, '  Theme Completeness'));
    console.log(clr(C.grey, '  ' + '─'.repeat(40)));

    for (const [theme, missing] of Object.entries(themeGaps)) {
        const icon = missing.length === 0 ? clr(C.green, '✅') : clr(C.red, '❌');
        const label = theme.padEnd(8);
        if (missing.length === 0) {
            console.log(`  ${icon} ${label} — all required tokens present`);
        } else {
            console.log(`  ${icon} ${label} — ${missing.length} missing:`);
            missing.forEach(t => console.log(clr(C.red, `        – ${t}`)));
        }
    }

    // ── Warnings ──────────────────────────────────────────────
    if (warnings.length > 0) {
        console.log('');
        warnings.forEach(w => console.log(clr(C.yellow, `  ⚡ ${w}`)));
    }

    // ── Final verdict ─────────────────────────────────────────
    console.log('');
    console.log(clr(C.grey, '─'.repeat(54)));
    if (pass) {
        console.log(clr(C.bold + C.green, '✨ Theme contract STABLE. No issues found.'));
    } else {
        console.log(clr(C.bold + C.red, '💥 Theme contract UNSTABLE. Fix the issues above.'));
    }
    console.log('');
}
