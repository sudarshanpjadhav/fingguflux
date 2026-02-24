# Changelog

All notable changes to FingguFlux will be documented in this file.

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
