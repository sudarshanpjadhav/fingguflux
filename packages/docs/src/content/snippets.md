# Framework Integration Snippets

Hardened UI logic across React, Vue, and Svelte. All examples assume a generated `mapping.json` in your project root.

---

## ⚛️ React Snippet

```tsx
import { FingguProvider, Button } from '@finggu/react';
import mapping from './mapping.json';

export default function App() {
  return (
    <FingguProvider mapping={mapping} mode="opt" version="0.9.0">
      <div className="ff-app-container">
        <Button variant="primary" motion="pop">
          Hardened React
        </Button>
      </div>
    </FingguProvider>
  );
}
```

---

## 🟢 Vue Snippet

```vue
<script setup>
import { FingguPlugin, Button } from '@finggu/vue';
import mapping from './mapping.json';

// In your main.js
// app.use(FingguPlugin, { mapping, mode: 'opt' });
</script>

<template>
  <div class="ff-app-container">
    <Button variant="primary" motion="pop">
      Hardened Vue
    </Button>
  </div>
</template>
```

---

## 🧡 Svelte Snippet

```svelte
<script>
  import { setFingguContext, Button } from '@finggu/svelte';
  import mapping from './mapping.json';

  setFingguContext({ mapping, mode: 'opt', version: '0.9.0' });
</script>

<div class="ff-app-container">
  <Button variant="primary" motion="pop">
    Hardened Svelte
  </Button>
</div>
```

---

## ⚠️ Extreme Mode Warning

In **Extreme Mode**, classes are hashed (e.g., `.ff-btn` -> `.ff-xz1`).

1. **Static Analysis**: The compiler must be able to see the full class string. Do not use dynamic concatenation (e.g., `ff-btn-${variant}`).
2. **DOM Queries**: Never use `document.querySelector('.ff-btn')`. Use `data-ff-*` attributes for script-based DOM selection.
3. **Build Sync**: Ensure your mapping file is always in sync with your CSS build. Mismatched hashes will result in broken styles.
