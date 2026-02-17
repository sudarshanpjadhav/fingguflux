# FingguFlux Vue Adapter: Technical Deep Dive

This report details the architectural implementation of the @finggu/vue adapter, which mirrors the hardening and safety standards established in the React adapter.

## 1. Mapping Injection Strategy (Provide/Inject)

The `FingguPlugin` uses Vue's **Provide/Inject** API (the equivalent of React Context) for dependency injection.

- **Mechanism**: The plugin is installed via `app.use(FingguPlugin, { mapping, mode, version })`.
- **Reactivity**: The mapping and mode are wrapped in a `reactive` object, allowing components to respond dynamically to mode switches or mapping updates (though mapping is primarily static).
- **Injection**: Components use the `useFinggu()` composable, which internally calls `inject(FingguSymbol)`.

## 2. Extreme Mode Safety & Version Guard

The Vue adapter implements the "Zero-Silent-Failure" policy for production builds.

- **Strict Mapping**: If a class resolution fails in Extreme mode:
  - **Development**: Throws an `Error` to alert the developer.
  - **Production/Nuxt**: Logs a `console.error`.
- **Version Guard**: Validates the `_version` field in `mapping.json` during plugin installation.
- **SSR Strategy**: The `useFinggu` composable uses environment-aware checks (`process.env.NODE_ENV` or `import.meta.env`) to ensure safety in both Vite/Vue and Nuxt environments.

## 3. Component Manifests (`__ffClasses`)

To support deterministic tree-shaking and compiler analysis, every Vue component exports a static manifest.

```ts
export const __ffClasses_Button = [
  'ff-btn',
  'ff-btn-primary',
  'ff-btn-lg',
  ...
];
```

- **Scanner Optimization**: The FingguFlux scanner picks up these exports directly. This ensures that even if a component is consumed as a pre-bundled library, the compiler knows exactly which classes it requires.

## 4. SSR & Functional Safety

- **Nuxt/SSR Compatible**: Hydration is guaranteed to be consistent because class resolution is synchronous and deterministic.
- **Non-Reactive Fallback**: In SSR contexts where provide/inject might be delayed or used in async setups, the composable provides stable defaults to prevent "undefined" class names.
- **No Style Injection**: Continuous adherence to zero-runtime CSS; the adapter only manages class strings.

## 5. Tree-Shakability

The package is structured as a full ESM module with side-effect-free components. If a developer only imports `{ Button }`, the logic for `Modal`, `Tabs`, etc., is excluded from the bundle by the bundler (Vite/Webpack), and subsequently pruned from the CSS by the FingguFlux compiler.
