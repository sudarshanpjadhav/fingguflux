# The FingguFlux Token System

Transparency starts at the variable level. FingguFlux uses a strict, hierarchical token system that eliminates "magic numbers" and style drift.

## Token Hierarchy

1. **Global Tokens**: Primitive values (colors, spacing, typography).
2. **Semantic Tokens**: Contextual bridges (e.g., `--ff-surface` maps to `--ff-neutral-0`).
3. **Component Tokens**: Overrides for specific UI elements.

## Runtime Isolation

FingguFlux supports **Token Tunnels**. You can isolate a theme to a specific container without affecting the rest of the page.

```tsx
<FingguProvider theme="light">
  <Sidebar /> {/* Inherits Light */}
  
  <FingguProvider theme="dark">
    <MainContent /> {/* Isolated Dark Sub-tree */}
  </FingguProvider>
</FingguProvider>
```

---

## Token Registry Contract

Every official token is documented in our **Registry**. 

| Token | Category | Description |
| :--- | :--- | :--- |
| `--ff-primary` | Color | The main brand accent color. |
| `--ff-surface` | Color | The background color of cards/panels. |
| `--ff-space-4` | Spacing | Standard 1rem gutter. |
| `--ff-motion-fast` | Motion | 150ms spring/ease curve. |

> [!IMPORTANT]
> To maintain compiler integrity, never use raw hex values in your components. Always reference the registry.
