# Changelog

All notable changes to FingguFlux will be documented in this file.
 
## [1.0.0-beta.1] - 2026-03-04
*Stabilization Phase for Public Readiness*

### Fixed & Improved
- **CLI Robustness**: Fully wired all 7 CLI commands (`build`, `analyze`, `doctor`, `a11y`, `theme-check`, `snapshot`, `harden`) into the execution router.
- **Contract Enforcement**: Registered 26 previously orphaned layout and typography tokens, reaching a milestone of 121 unified, contract-enforced CSS tokens.
- **Version Identity**: Aligned all sub-packages, documentation, and internal telemetry to a single source of truth (`v1.0.0-beta.1`).
- **Adapter Reliability**: Updated `@finggujadhav/svelte` peer dependency to accurately reflect the strict `svelte@>=5.0.0` AST requirement.
- **Architecture**: Scaffolded Web Components adapter stub indicating formal `v1.1` roadmap inclusion.

## [0.9.8] - 2026-02-27
### Added
- **Compiler Intelligence**:
  - New `fingguCompiler` Vite plugin bridge for automated, zero-config contract hardening in Vite/Next.js workflows.
  - Standardized entry point `index.js` for `@finggujadhav/compiler` allowing programmatic usage.
- **Documentation**:
  - New "CSS Drift Problem" diagnostic section in README.
  - New interactive `css-drift-demo.html` for visual validation of contract enforcement.
### Fixed
- **API Stability**: Restored accidentally missing `--ff-primary-500` token to `packages/core/tokens.css`, maintaining full backward compatibility and passing drift audit.

## [0.9.7] - 2026-02-24
### Added
- Release Candidate 1 — API Surface Contract & Deprecation Enforcement:
  - `API_SURFACE_SNAPSHOT.json` — machine-readable baseline of the full public API surface (83 CSS tokens, 14 JS exports, 6 CLI commands, 11 component CSS files).
  - `finggu snapshot --write` — CLI command to generate/update the snapshot baseline.
  - `finggu snapshot --compare` — CI breaking-change guard; diffs current API surface against stored baseline, fails on any removal and warns on additions.
  - `DEPRECATION_LOG.json` — formal deprecation ledger published with `@finggujadhav/core`; CI enforces overdue entries as breaking changes.
  - `VERSION_POLICY.md` — canonical versioning policy: semver rules, deprecation lifecycle, release gate checklist, breaking change definitions.
  - 30-test regression suite (`node --test`) covering CSS token extraction, TS export extraction, surface diffing, breaking-change detection, and addition warnings (REG-007, REG-008).
- `finggu snapshot` added as 6th CLI command (alongside: build, analyze, doctor, a11y, theme-check).
- `snapshot.js` published with `@finggujadhav/compiler`.
- No breaking changes; fully backward compatible.
- Contract freeze maintained — `finggu theme-check` and `finggu snapshot --compare` both pass green.

## [0.9.6] - 2026-02-24
### Added
- Theme Engine Stabilization & Contract Freeze:
  - Formal `TOKENS_REGISTRY.json` — 83-token contract frozen across 15 categories (color-primary, color-semantic, color-surface-*, color-neutral, spacing, radius, effects, motion, typography, border, z-index, position, opacity).
  - New CLI command: `finggu theme-check` — validates token completeness for light, dark, and system themes.
  - Token removal detection: flags registry tokens absent from `tokens.css` as breaking changes.
  - Token rename detection: flags stale old names still present after a documented rename.
  - Light/dark/system completeness validation: ensures every required override is explicitly present in the correct CSS scope.
  - 35-test regression suite (`node --test`) covering extraction, detection, completeness, and 6 explicit theme-switching scenarios (REG-001 → REG-006).
- Optimization: Zero runtime overhead — `theme-check` is a pure build-time static analyser; produces no browser-bound code.
- Compiler bundle size unaffected; `theme-check.js` is a CI/dev tool, not part of the CSS output.
- No breaking changes; fully backward compatible.


## [0.9.5] - 2026-02-23
### Added
- Accessibility Hardening & ARIA Formalization:
  - New `a11y` CLI mode for proactive template scanning.
  - ARIA contract validation (Accordion, Tabs, Modal, Dropdown).
  - State consistency checks (aria-expanded vs data-ff-state).
  - Semantic token contrast validation (WCAG 2.1 AA).
- Optimization: Zero runtime overhead for accessibility checks.
- Compliance: Hash stability preserved across extreme-mode builds.

## [0.9.4] - 2026-02-23
### Added
- Compiler Intelligence Upgrade:
  - New `analyze` mode for CSS footprint and tree-shaking insights.
  - New `doctor` mode for project health and architectural compliance checks.
  - Dedicated dead CSS reporting during analysis.
  - Automated `fingguflux-report.json` build artifact generation.
- Optimization: Zero runtime overhead added to the engine.
- Performance: Deterministic hashing and ultra-fast scanning preserved.

## [0.9.3] - 2026-02-22
### Added
- Utility Depth & Layout Polish:
  - Enhanced Flexbox utilities (`ff-flex-row`, `ff-align-start`, etc.)
  - Enhanced Grid utilities (`ff-grid-cols-4`, `ff-col-span-2/3`).
  - Sizing utilities (`ff-w-auto`, `ff-h-full/auto`).
  - Cursor utilities (`ff-cursor-pointer`, `ff-cursor-not-allowed`).
  - Opacity scale (`ff-opacity-0/50/75/100`).
- Optimization: Redundancy cleanup (removed unnecessary defaults like `ff-col-span-1`).
- No breaking changes; fully backward compatible.

## [0.9.2] - 2026-02-22
### Added
- Primitive Components: `Accordion`, `Alert`, `Badge`, `Divider`.
- Additive architecture refactor for better tree-shaking and consistency.
- New semantic tokens for success, warning, and danger surfaces.
- No breaking changes; fully backward compatible.

## [0.9.1] - 2026-02-22
### Added
- Layout Utilities: `ff-container`, `ff-max-w-*`, `ff-min-h-screen`, `ff-w-screen`.
- Position Utilities: `ff-relative`, `ff-absolute`, `ff-fixed`, `ff-top-*`, `ff-left-0`, `ff-right-0`, `ff-bottom-0`, `ff-z-*`.
- Display Utilities: `ff-block`, `ff-inline`, `ff-inline-block`, `ff-hidden`.
- Overflow Utilities: `ff-overflow-hidden`, `ff-overflow-auto`, `ff-overflow-scroll`.
- Aspect Ratio Utilities: `ff-aspect-1`, `ff-aspect-16-9`.
- New design tokens for Z-Index and Position scales.

## [0.9.0] - 2026-02-17
### Added
- **Initial Public Beta Release.**
- Core Compiler Engine with Dev, Optimized, and Extreme modes.
- Hardened adapters for React, Vue, and Svelte.
- Support for Runtime Theme Switching and Isolation.
- Interactive Documentation and Playground.
- Deterministic selector hashing algorithm.
- Multi-framework motion orchestration layer.

### Changed
- Refactored token system to a centralized registry (`--ff-*`).
- Hardened compiler to protect token variables during obfuscation.

## [0.5.0] - 2026-01-15
### Added
- Alpha release: Core CSS engine and initial React adapter.
- Static manifest support (`__ffClasses`).
