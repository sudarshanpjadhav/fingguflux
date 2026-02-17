# The FingguFlux Compiler

The FingguFlux compiler is a strategic bottleneck designed to ensure only hardened, used classes reach production.

## 1. Static Analysis (`__ffClasses`)

Unlike dynamic scanners, the FingguFlux compiler relies on static manifests exported by components. This makes the build process $O(n)$ where $n$ is the number of components used, rather than scanning the entire codebase for regex matches.

## 2. Tree-Shaking Policy

FingguFlux applies a **Strict Block Pruning** strategy.

1. **Selector Extraction**: Identify every `.ff-` selector in the source CSS.
2. **Usage Filtering**: Match against the `usedClasses` set provided by the adapter manifests.
3. **Dead Code Elimination**: Entire CSS blocks are removed if they are not explicitly referenced.

## 3. Dependency Tracking

The compiler understands architectural dependencies.

- If you use `ff-btn-primary`, the compiler automatically preserves the base `.ff-btn` and all related tokens.
- If you use `Tabs`, it preserves `TabList`, `TabTrigger`, and `TabContent` automatically.

## 4. Hardening (Extreme Mode)

```javascript
// Internal Compiler Logic
if (this.mode === 'ext') {
  const hash = this.getHash(className);
  this.mapping[className] = `ff-${hash}`;
}
```

The compiler generates a short, character-efficient hash for every class. This mapping is then provided to the framework adapters to ensure correct runtime resolution.

---

## Performance

- **Build Speed**: < 50ms for most component libraries.
- **CSS Savings**: Typically 70-90% reduction compared to monolithic UI libraries.
- **Memory Usage**: Minimal, as it operates on a single pass.
