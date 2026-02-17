# FingguFlux Svelte Adapter: Technical Deep Dive

This report details the architectural implementation of the @finggu/svelte adapter, which mirrors the hardening and safety standards established in the React and Vue adapters.

## 1. Mapping Injection Strategy (Context + Stores)

The Svelte adapter leverages **Svelte Context** combined with **Writable/Derived Stores** for reactive and efficient mapping injection.

- **Initialization**: `setFingguContext({ mapping, mode, version })` creates a writable store and provides it using `setContext`.
- **Consumption**: `useFinggu()` retrieves the store via `getContext` and returns a `derived` store.
- **Reactivity Check**: Svelte's reactive declarations (`$:`) in components ensure that class names update instantly whenever props or the global context changes.

## 2. Extreme Mode Safety & Version Guard

- **Strict Mapping**: Resolution logic in the derived store performs a safety check. 
  - In `ext` (Extreme) mode, missing mappings for `ff-` classes trigger a `throw` in development.
- **Version Guard**: The `_version` in `mapping.json` is validated during context setup, issuing a warning if it mismatches the application's target version.
- **SSR Safety**: Resolution is synchronous and deterministic. Environment checks (`import.meta.env.DEV`) ensure internal logic behaves correctly in SvelteKit or standard Vite setups.

## 3. Component Manifests (`__ffClasses`)

Every Svelte component utilizes the `<script context="module">` block to export static manifests.

```html
<script lang="ts" context="module">
  export const __ffClasses_Button = [
    'ff-btn',
    'ff-btn-primary',
    ...
  ];
</script>
```

- **Static Analysis**: These manifests allow the FingguFlux compiler to identify all possible classes used by a component without requiring runtime execution or complex heuristics.

## 4. SSR & SvelteKit Compatibility

- **Hydration Safety**: No DOM access occurs during the component's setup phase. All class resolution is done via store derivation, which is safe for Svelte's server-side rendering.
- **Lifecycle Discipline**: Interactions like scroll-locking in the `Modal` are strictly guarded by `onMount` or `typeof document !== 'undefined'` checks.

## 5. Tree-Shakability

The package is a side-effect-free ESM module. Components like `Input`, `Button`, and the context logic are independent, allowing bundlers to prune unused code while the FingerFlux compiler handles the CSS pruning.
