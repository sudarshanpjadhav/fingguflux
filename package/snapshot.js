/**
 * FingguFlux API Surface Snapshot Engine
 * v0.9.7-RC – Release Candidate Preparation
 *
 * Generates an authoritative, machine-readable snapshot of the ENTIRE
 * public API surface and diffs it against a stored baseline to detect:
 *   • BREAKING: removed CSS tokens
 *   • BREAKING: removed JS exports
 *   • BREAKING: removed CLI commands
 *   • BREAKING: removed component CSS files
 *   • WARNING:  added tokens (unregistered additions)
 *   • WARNING:  deprecated APIs approaching removal date
 *
 * Zero runtime overhead — this module is a build/CI tool only.
 * It produces no browser-bound code.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Paths ────────────────────────────────────────────────────────────────────

const CORE_DIR = path.resolve(__dirname, '../core');
const COMPILER_DIR = path.resolve(__dirname, '../compiler');
const JS_HELPER_DIR = path.resolve(__dirname, '../js-helper');
const SNAPSHOT_PATH = path.resolve(CORE_DIR, 'API_SURFACE_SNAPSHOT.json');
const REGISTRY_PATH = path.resolve(CORE_DIR, 'TOKENS_REGISTRY.json');
const DEPRECATION_PATH = path.resolve(CORE_DIR, 'DEPRECATION_LOG.json');

// ─── CSS token extractor ──────────────────────────────────────────────────────

/**
 * Extract all --ff-* CSS custom property definitions from a CSS string.
 * Excludes var() references (same logic as theme-check.js).
 * @param {string} css
 * @returns {string[]} sorted token names
 */
export function extractCSSTokens(css) {
    const tokens = new Set();
    const re = /(--ff-[\w-]+)\s*:/g;
    let m;
    while ((m = re.exec(css)) !== null) {
        const before = css.slice(0, m.index);
        const lastVar = before.lastIndexOf('var(');
        const lastClose = before.lastIndexOf(')');
        if (lastVar !== -1 && lastVar > lastClose) continue;
        tokens.add(m[1]);
    }
    return [...tokens].sort();
}

/**
 * Collect all --ff-* CSS tokens from tokens.css (includes dark overrides).
 * @returns {string[]}
 */
export function collectCSSTokens() {
    const tokensCss = path.join(CORE_DIR, 'tokens.css');
    if (!fs.existsSync(tokensCss)) return [];
    return extractCSSTokens(fs.readFileSync(tokensCss, 'utf8'));
}

// ─── Component surface collector ─────────────────────────────────────────────

/**
 * Collect all component CSS filenames published in @finggujadhav/core.
 * @returns {string[]} sorted list of component file basenames (e.g. "button.css")
 */
export function collectComponentFiles() {
    const compDir = path.join(CORE_DIR, 'components');
    if (!fs.existsSync(compDir)) return [];
    return fs.readdirSync(compDir)
        .filter(f => f.endsWith('.css'))
        .sort();
}

// ─── JS export collector ─────────────────────────────────────────────────────

/**
 * Extract named exports from a TypeScript source file.
 * Handles: export function/class/const/type/interface/enum declarations
 * and `export { ... }` re-export blocks.
 * @param {string} src  file content
 * @returns {string[]} sorted export names
 */
export function extractTSExports(src) {
    const names = new Set();

    // Named declarations: export function foo / export const foo / export type Foo / etc.
    const declRe = /^export\s+(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+([\w$]+)/gm;
    let m;
    while ((m = declRe.exec(src)) !== null) names.add(m[1]);

    // Re-export blocks: export { foo, bar as baz }
    const blockRe = /export\s*\{([^}]+)\}/g;
    while ((m = blockRe.exec(src)) !== null) {
        m[1].split(',').forEach(part => {
            const alias = part.trim().split(/\s+as\s+/);
            const name = (alias[1] || alias[0]).trim();
            if (name) names.add(name);
        });
    }

    return [...names].sort();
}

/**
 * Collect all public JS exports from @finggujadhav/js-helper src.
 * @returns {string[]}
 */
export function collectJSExports() {
    const srcDir = path.join(JS_HELPER_DIR, 'src');
    if (!fs.existsSync(srcDir)) return [];

    const allExports = new Set();
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

    for (const file of files) {
        const src = fs.readFileSync(path.join(srcDir, file), 'utf8');
        extractTSExports(src).forEach(e => allExports.add(e));
    }
    return [...allExports].sort();
}

// ─── CLI command surface collector ───────────────────────────────────────────

/**
 * Extract CLI command names from cli.js by scanning the switch statement.
 * @returns {string[]} sorted command names
 */
export function collectCLICommands() {
    const cliPath = path.join(COMPILER_DIR, 'cli.js');
    if (!fs.existsSync(cliPath)) return [];

    const src = fs.readFileSync(cliPath, 'utf8');
    const commands = new Set();
    const re = /case\s+'([\w:-]+)'\s*:/g;
    let m;
    while ((m = re.exec(src)) !== null) commands.add(m[1]);
    return [...commands].sort();
}

// ─── Snapshot builder ─────────────────────────────────────────────────────────

/**
 * Generate a complete API surface snapshot object.
 * @returns {{ generatedAt: string, version: string, surface: object }}
 */
export function generateSnapshot() {
    // Read version from core package.json
    const corePkg = JSON.parse(fs.readFileSync(path.join(CORE_DIR, 'package.json'), 'utf8'));

    return {
        $schema: 'https://fingguflux.dev/schemas/api-surface-snapshot.json',
        generatedAt: new Date().toISOString(),
        version: corePkg.version,
        surface: {
            cssTokens: collectCSSTokens(),
            jsExports: collectJSExports(),
            cliCommands: collectCLICommands(),
            componentFiles: collectComponentFiles(),
        },
    };
}

/**
 * Write the snapshot to disk at packages/core/API_SURFACE_SNAPSHOT.json.
 * @param {object} [snapshotOverride]  optionally pass a pre-built snapshot
 * @returns {object} the written snapshot
 */
export function writeSnapshot(snapshotOverride) {
    const snap = snapshotOverride ?? generateSnapshot();
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snap, null, 4), 'utf8');
    return snap;
}

// ─── Snapshot comparator ──────────────────────────────────────────────────────

/**
 * Compare two API surface sets and produce structured diff.
 * @param {string[]} baseline  items in the stored snapshot
 * @param {string[]} current   items in the freshly generated snapshot
 * @param {string}   label     human-readable label for reporting
 * @returns {{ removed: string[], added: string[] }}
 */
export function diffSurface(baseline, current, label) {
    const baseSet = new Set(baseline);
    const currentSet = new Set(current);

    const removed = [...baseSet].filter(x => !currentSet.has(x)).sort();
    const added = [...currentSet].filter(x => !baseSet.has(x)).sort();

    return { label, removed, added };
}

/**
 * Load the deprecation log.
 * @returns {Array<{name:string, type:string, since:string, until:string, replacement:string|null, reason:string}>}
 */
export function loadDeprecationLog() {
    if (!fs.existsSync(DEPRECATION_PATH)) return [];
    return JSON.parse(fs.readFileSync(DEPRECATION_PATH, 'utf8')).deprecations ?? [];
}

/**
 * Check for deprecated items that are past their `until` version and
 * should have been removed — these are breaking-change guards.
 * @param {string} currentVersion  e.g. "0.9.7"
 * @returns {Array} overdue deprecations
 */
export function detectOverdueDeprecations(currentVersion) {
    const log = loadDeprecationLog();
    return log.filter(d => {
        if (!d.until) return false;
        return compareVersions(d.until, currentVersion) < 0;
    });
}

/** Simple semver comparator (major.minor.patch only). */
function compareVersions(a, b) {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
        if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
    }
    return 0;
}

// ─── Snapshot comparison runner ───────────────────────────────────────────────

/**
 * Full snapshot comparison pipeline.
 * Loads the stored baseline, generates a fresh snapshot, diffs all surface
 * dimensions, detects overdue deprecations, and returns a structured report.
 *
 * @param {object} [opts]
 * @param {object} [opts.currentSnapshot]   override the live snapshot (for tests)
 * @param {object} [opts.baselineSnapshot]  override the stored baseline (for tests)
 * @param {string} [opts.currentVersion]    override version string (for tests)
 * @returns {{
 *   pass: boolean,
 *   breakingChanges: string[],
 *   warnings: string[],
 *   diffs: object[],
 *   overdueDeprecations: object[]
 * }}
 */
export function runSnapshotCompare(opts = {}) {
    // --- Load baseline ---
    const baseline = opts.baselineSnapshot ?? (() => {
        if (!fs.existsSync(SNAPSHOT_PATH)) {
            throw new Error(
                'API_SURFACE_SNAPSHOT.json not found. ' +
                "Run 'finggu snapshot --write' to generate the initial baseline."
            );
        }
        return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
    })();

    // --- Generate current state ---
    const current = opts.currentSnapshot ?? generateSnapshot();

    // --- Diff each surface dimension ---
    const diffs = [
        diffSurface(baseline.surface.cssTokens, current.surface.cssTokens, 'CSS Tokens'),
        diffSurface(baseline.surface.jsExports, current.surface.jsExports, 'JS Exports'),
        diffSurface(baseline.surface.cliCommands, current.surface.cliCommands, 'CLI Commands'),
        diffSurface(baseline.surface.componentFiles, current.surface.componentFiles, 'Component Files'),
    ];

    const breakingChanges = [];
    const warnings = [];

    for (const diff of diffs) {
        // Removals are BREAKING
        for (const item of diff.removed) {
            breakingChanges.push(`[BREAKING] ${diff.label}: '${item}' was removed from the public API surface.`);
        }
        // Additions are warnings (undocumented surface growth)
        for (const item of diff.added) {
            warnings.push(`[WARN] ${diff.label}: '${item}' is new — ensure it is intentional and documented.`);
        }
    }

    // --- Overdue deprecations (items past their `until` date are breaking) ---
    const currentVersion = opts.currentVersion ?? current.version;
    const overdue = detectOverdueDeprecations(currentVersion);
    for (const d of overdue) {
        breakingChanges.push(
            `[BREAKING] Deprecation overdue: '${d.name}' (${d.type}) was scheduled for removal in v${d.until} ` +
            `but is still present. Remove it or extend the deprecation window.`
        );
    }

    return {
        pass: breakingChanges.length === 0,
        breakingChanges,
        warnings,
        diffs,
        overdueDeprecations: overdue,
        baselineVersion: baseline.version,
        currentVersion,
    };
}

// ─── CLI printer ──────────────────────────────────────────────────────────────

const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
};

const line = (ch = '─', n = 54) => ch.repeat(n);

export function printSnapshotReport(report, verbose = false) {
    const { pass, breakingChanges, warnings, diffs, overdueDeprecations,
        baselineVersion, currentVersion } = report;

    console.log('');
    console.log(`${C.bold}${C.cyan}📸 FingguFlux API Surface Snapshot — Drift Audit${C.reset}`);
    console.log(C.gray + line() + C.reset);
    console.log(`  Baseline : ${C.bold}v${baselineVersion}${C.reset}`);
    console.log(`  Current  : ${C.bold}v${currentVersion}${C.reset}`);
    console.log('');

    // Surface summary
    for (const diff of diffs) {
        const removedCount = diff.removed.length;
        const addedCount = diff.added.length;
        const icon = removedCount ? C.red + '✖' :
            addedCount ? C.yellow + '⚠' :
                C.green + '✔';
        console.log(`  ${icon}${C.reset}  ${diff.label.padEnd(18)} ` +
            `${removedCount ? C.red + removedCount + ' removed' + C.reset : '—'} ` +
            `${addedCount ? C.yellow + addedCount + ' added' + C.reset : ''}`);
    }

    // Breaking changes
    if (breakingChanges.length > 0) {
        console.log('');
        console.log(C.red + C.bold + `  ⛔ ${breakingChanges.length} Breaking Change(s) Detected` + C.reset);
        for (const msg of breakingChanges) {
            console.log(`  ${C.red}${msg}${C.reset}`);
        }
    }

    // Warnings
    if (warnings.length > 0 && (verbose || breakingChanges.length === 0)) {
        console.log('');
        console.log(C.yellow + C.bold + `  ⚠  ${warnings.length} Warning(s)` + C.reset);
        for (const msg of warnings) {
            console.log(`  ${C.yellow}${msg}${C.reset}`);
        }
    }

    // Overdue deprecations
    if (overdueDeprecations.length > 0) {
        console.log('');
        console.log(C.red + C.bold + `  🚨 ${overdueDeprecations.length} Overdue Deprecation(s)` + C.reset);
        for (const d of overdueDeprecations) {
            console.log(`  ${C.red}• ${d.name} (${d.type}) — scheduled removal: v${d.until}${C.reset}`);
            if (d.replacement) console.log(`    ${C.gray}→ replacement: ${d.replacement}${C.reset}`);
        }
    }

    console.log('');
    console.log(C.gray + line() + C.reset);

    if (pass) {
        console.log(`${C.green}${C.bold}✨ API surface STABLE. No breaking changes detected.${C.reset}`);
    } else {
        console.log(`${C.red}${C.bold}🚫 API surface has BREAKING CHANGES. Release blocked.${C.reset}`);
        console.log(`${C.gray}  Fix all [BREAKING] issues before bumping version.${C.reset}`);
    }
    console.log('');
}
