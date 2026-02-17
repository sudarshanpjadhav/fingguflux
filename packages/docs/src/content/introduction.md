# FingguFlux: The Transparent UI Hardening Engine

FingguFlux is a architectural wrapper designed to solve the "CSS Drift" problem in large-scale applications. It forces a complete separation between **Design Tokens**, **Component State**, and **CSS Production**.

## The Philosophy

Most UI libraries prioritize "Developer Velocity" by coupling styles directly to components. This inevitably leads to:
1. **Selector Bloat**: Thousands of unused utility classes.
2. **Reverse Engineering Grief**: Trying to figure out which component uses which class.
3. **Hardening Fragility**: Renaming a class breaks the build without warning.

**FingguFlux flips the script.**

### 1. Transparency as a Constraint
FingguFlux components do not "own" their styles. They own their **Mapping**. A button doesn't know it's "blue"; it knows it uses the `ff-btn-primary` token. The actual value of that token is held in a centralized `mapping.json` that the compiler generates and hardens.

### 2. Zero-Runtime Style Injection
We believe the DOM is for structure, and the CSS is for style. FingguFlux generates pure HTML with static class strings. There is no CSS-in-JS runtime, no style-tag injection, and no performance penalty.

### 3. Deterministic Hardening
In **Extreme Mode**, every class name is hashed into a non-human-readable string (e.g., `.ff-a1`). This prevents "CSS Leaks" where developers accidentally depend on internal implementation details of a UI library.

---

## Technical Pillars

- **Compiler First**: The build engine extracts only the classes you actually use.
- **Framework Agnostic Logic**: Identical behavior in React, Vue, and Svelte.
- **Architectural Parity**: Hardened security and motion standards across all adapters.
- **Token Isolation**: Nested themes that don't bleed.
