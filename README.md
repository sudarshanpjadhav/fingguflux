# FingguFlux

### The Transparent UI Hardening Engine

FingguFlux is a specialized architectural wrapper designed to solve "CSS Drift" in high-trust, large-scale applications. It enforces a strict separation between Design Tokens, Component State, and CSS Production through a deterministic hardening compiler.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-v0.9.0--beta-blue)](https://github.com/finggu/FingguFlux)

---

## 🚀 Why FingguFlux?

- **Zero-Runtime Overhead**: No CSS-in-JS injection. Pure, static CSS.
- **Extreme Hardening**: Deterministic hashing of selectors (e.g., `.ff-btn` → `.ff-a1`) for security and minification.
- **Architectural Parity**: Identical behavior and hardening across **React**, **Vue**, and **Svelte**.
- **Token Isolation**: Nested themes ("Token Tunnels") that prevent style bleeding.
- **Motion Orchestration**: Performance-optimized, accessible motion tokens.

## 📦 Quick Start (2 Minutes)

### 1. Install
```bash
npm install @finggu/core @finggu/react
```

### 2. Configure Compiler (Vite)
```typescript
import { fingguCompiler } from '@finggu/compiler';

export default {
  plugins: [fingguCompiler({ mode: 'opt' })]
}
```

### 3. Usage
```tsx
import { Button, FingguProvider } from '@finggu/react';
import mapping from './finggu-mapping.json';

export default function App() {
  return (
    <FingguProvider mapping={mapping} mode="opt">
      <Button variant="primary" motion="pop">Hardened UI</Button>
    </FingguProvider>
  );
}
```

## 🛠 Project Structure

- `packages/core`: Standardized tokens, CSS reset, and fundamental components.
- `packages/compiler`: The build-time engine for tree-shaking and hashing.
- `packages/adapters`: Framework integrations (React, Vue, Svelte).
- `packages/js-helper`: Shared runtime logic for themes and motion.

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with 🧠 by the Finggu Infotech Team.
