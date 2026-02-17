# FingguFlux Theme Engine: Technical Deep Dive

This report details the architectural extensions made to the FingguFlux theme engine to support dynamic runtime switching and scoped isolation.

## 1. Formal Token Registry

We have formalized the token naming convention and established a TypeScript contract (`TOKENS`) in `packages/core/src/tokens.ts`.

- **Convention**: All public FingguFlux variables follow the `--ff-[category]-[name]` pattern.
- **Contract**: This registry provides a single source of truth for adapters and documentation, preventing variable name drift.

## 2. Runtime Theme Switching (data-ff-theme)

The system has moved from a purely static media-query based approach to a dynamic attribute-driven approach.

- **Attributes**: Themes are applied via `[data-ff-theme="light|dark"]`.
- **System Synchronization**: The `js-helper` provides a `watchSystemTheme` utility that allows the application to stay in sync with OS preferences while still allowing manual overrides.
- **CSS Implementation**: `tokens.css` now uses a robust combination of `:root` defaults, `@media (prefers-color-scheme: dark)` fallbacks, and explicit attribute selectors to ensure styles are correct in all states.

## 3. Theme Isolation (Scoped Themes)

FingguFlux now supports "Theme Tunnels" where a specific container can follow a different theme than the rest of the page.

- **Mechanism**: Framework adapters (React, Vue, Svelte) apply the `theme` prop to their provider's container element using `data-ff-theme`.
- **Lexical Scoping**: CSS variables follow the DOM hierarchy. By applying the attribute to a container, all FingguFlux components inside that subtree inherit the local theme tokens.

## 4. Compiler Hardening (Extreme Mode Safety)

A critical hardening measure was implemented in the compiler engine to protect runtime theme functionality.

- **Token Protection**: Even in **Extreme mode** where all class names are hashed (e.g., `.ff-btn` -> `.ff-a1`), the compiler is now hard-coded to **never hash CSS variables** starting with `--ff-`.
- **Rationale**: CSS variables serve as the runtime API for the theme engine. Hashing them would break the connection between the JS theme logic and the CSS styles.

## 5. Bundle Impact

The entire runtime theme logic adds **< 200 bytes** to the JS bundle, maintaining our commitment to ultra-lightweight architecture.
