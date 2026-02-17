# Framework Adapters

FingguFlux provides **Architectural Parity**. Whether you use React, Vue, or Svelte, the hardening logic, bundle impact, and motion behavior are identical.

## React Adapter

- **Provider**: `FingguProvider` manages the mapping context.
- **Hooks**: `useFinggu` for manual class resolution.
- **SSR**: Zero-config compatibility with Next.js (App & Pages).

## Vue Adapter

- **Plugin**: `FingguPlugin` provides global configuration.
- **Composables**: `useFinggu` mirrors the React behavior.
- **SSR**: Nuxt-ready with hydration safety.

## Svelte Adapter

- **Stores**: Utilizes Svelte's reactive stores for instant class updates.
- **Context API**: `setFingguContext` and `useFinggu` for prop-to-class resolution.
- **SvelteKit**: High-performance SSR by default.

---

## Parity Table

| Feature | React | Vue | Svelte |
| :--- | :---: | :---: | :---: |
| **Strict Extreme Mode** | ✅ | ✅ | ✅ |
| **Motion Utilities** | ✅ | ✅ | ✅ |
| **Version Guard** | ✅ | ✅ | ✅ |
| **Static Manifests** | ✅ | ✅ | ✅ |
| **SSR Support** | ✅ | ✅ | ✅ |
