# Advanced Architecture

FingguFlux is built on the principle of **Hardened Transparency**. This section covers internal patterns that maintain system integrity.

## 1. State via Attributes

We never use class names for component state.
- **Bad**: `.is-open`, `.active`
- **FingguFlush**: `[data-ff-open="true"]`, `[data-ff-active="true"]`

This ensures that even in Extreme Mode, the state selectors remain stable and readable for testing tools, while the visual implementation (classes) is obfuscated.

## 2. Token Tunnels (Isolation)

Theme isolation is achieved via CSS variable scoping. By applying `data-ff-theme` to a container, we create a new lexical scope for all `--ff-*` variables.

## 3. The Lifecycle of an `ff-` Class

1. **Definition**: Defined in `core/tokens.css` or component files.
2. **Registration**: Added to the `__ffClasses` manifest.
3. **Consumption**: Used in a framework component (React/Vue/Svelte).
4. **Resolution**: Mapped at runtime via `useFinggu`.
5. **Hardening**: Hashed by the compiler during the production build.

---

## CLI Integration

FingguFlux provides a lightweight CLI for auditing your implementation.

```bash
npx finggu-audit --mode ext
```

- Verifies all classes are mapped.
- Checks for version mismatches.
- Measures bundle impact.
