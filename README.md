# FingguFlux
**Build Interfaces That Flow.**

![Version](https://img.shields.io/badge/version-1.0.0--beta.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tests](https://img.shields.io/badge/tests-65_passing-brightgreen)
![Frameworks](https://img.shields.io/badge/frameworks-React_|_Vue_|_Svelte-blueviolet)

## What is CSS Drift?
**CSS Drift** occurs when design tokens or class names are renamed, removed, or changed without updating the components that rely on them. Over time, this leads to silent UI breakage—components shipping with missing styles, invisible buttons, and inconsistent layouts without throwing a single build error.

## What is FingguFlux?
FingguFlux is a **zero-runtime CSS hardening engine** designed to solve CSS Drift. Rather than relying on trust to keep styles aligned, FingguFlux strictly enforces a contract system at build time. It validates tokens, extracts and hashes used classes, and loudly fails CI/CD pipelines before broken code reaches production. 

FingguFlux operates in 3 distinct modes depending on your environment needs:
- **Dev Mode:** Pass-through readability for rapid prototyping.
- **Optimized Mode:** Strips prefixes and tree-shakes unused styles for production.
- **Extreme Hash Mode:** Deterministic selector obfuscation for maximum security and minimal shipping size.

## Key Features
- **Token Contract System**: Enforces 121 formally tracked tokens.
- **Deterministic Compiler**: Provides block-level tree-shaking and selector hashing.
- **Multi-Framework Adapters**: Headless component wrappers for React, Vue, and Svelte.
- **7 CLI Commands**: Comprehensive tooling for analysis, snapshots, and CI enforcing.
- **Ultra-Lightweight**: Yields highly optimized output that scales up to 99.3% smaller than Bootstrap.
- **Accessibility by Default**: Built-in AST and logic scanners for `aria-*` tags and proper WCAG compliance.
- **Zero Runtime Style Injection**: CSS is static; Javascript only manages specific interaction states (e.g. traps, themes).

## Quick Start (Local Beta)
> **Note:** The `v1.0.0-beta.1` packages are not yet formally published. **npm publish coming with v1.0 stable!** Until then, clone the repository to use FingguFlux locally in your project.

### 1. Clone the Repo Locally
```bash
git clone https://github.com/fingguflux/fingguflux.git
cd fingguflux
npm install
npm run build
```

### 2. Vite Config Setup
Install the raw paths mapped in your workspace. Example Vite mapping:
```typescript
import { defineConfig } from 'vite';
import { fingguCompiler } from '../fingguflux/packages/compiler/index.js';

export default defineConfig({
  plugins: [fingguCompiler({ mode: 'dev' })]
});
```

### 3. Usage Example (React)
```tsx
import { FingguProvider, Button } from '@finggujadhav/react';
import '@finggujadhav/core/dist/index.css';

export default function App() {
  return (
    <FingguProvider mode="dev" theme="system">
      <Button variant="primary" size="md">Flow Interface</Button>
    </FingguProvider>
  );
}
```
*Links to [Vue Minimal](../examples/vue-minimal) and [Svelte Minimal](../examples/svelte-minimal) examples.*

## The 3 Modes

| Mode | Process Behavior | Selector Output Example | Best For |
|:---|:---|:---|:---|
| `dev` | Identity proxy, ignores tree-shaking | `.ff-btn-primary` | Fast local development, inspection |
| `opt` | Strips `ff-` prefix, trims unused | `.btn-primary` | Standard production apps |
| `ext` | FNV-1a Hash map, extreme pruning | `.ff-a1b2c3` | Enterprise, minified outputs |

## 7. CLI Commands
FingguFlux includes a robust CLI for enforcing your design contracts during development and CI automation:
- `init` - Scaffolds a new FingguFlux configuration in your project.
- `build` - Executes the compiler loop: extracts, maps, and writes CSS files.
- `dev` - Alias/Watch mode for live UI mapping validation and hot module replacement.
- `analyze` - Profiles compilation times, cache hit ratios, and class frequency.
- `add` - Interactively installs individual headless components to your workspace.
- `theme-check` - Confirms 100% token usage alignment against the `TOKENS_REGISTRY`. 
- `snapshot` - Guards against implicit breaking changes, preventing drift.
- `a11y` - Scans `.jsx`, `.svelte`, `.vue`, and `.html` for missing ARIA properties.
- `doctor` - Interactive mode verifying structural integrity and AST parser compatibility.


## Project Structure
- `src/` - Pure CSS architecture and source-of-truth metadata registries.
- `packages/compiler/` - Build-time AST scanner, hasher, and intelligence engine.
- `packages/js-helper/` - Framework-agnostic runtime for focus mapping and themes.
- `packages/adapters/react/` - Hardened React components utilizing Provider maps.
- `packages/adapters/vue/` - Hardened Vue components utilizing Plugins/Composables.
- `packages/adapters/svelte/` - Hardened Svelte components leveraging Context definitions.
- `dist/` - PostCSS-generated raw output before compiler interception.

## Framework Support Table

| Framework | Status |
|:---|:---|
| React | ✅ Stable |
| Vue | ✅ Stable |
| Svelte | ✅ Stable (requires Svelte 5) |
| Web Components | 🔄 Coming in v1.1 |

## Documentation Links
- [Roadmap (ROADMAP.md)](ROADMAP.md)
- [Contributing (CONTRIBUTING.md)](CONTRIBUTING.md)
- [Changelog (CHANGELOG.md)](CHANGELOG.md)
- [Governance Policy (GOVERNANCE.md)](GOVERNANCE.md)
- [Versioning Guidelines (VERSION_POLICY.md)](VERSION_POLICY.md)

## Performance
FingguFlux achieves remarkable size savings by strictly hashing and omitting un-invoked keys:

| Framework Strategy | Raw Size | Gzip Size | Savings vs BS |
|:---|:---|:---|:---|
| **FingguFlux (Opt)** | 1.54 KB | 0.54 KB | 99.3% |
| **Tailwind CSS** | 7.70 KB | 2.20 KB | 96.7% |
| **Bootstrap (Full)** | 232.11 KB | 30.82 KB | 0.0% |

---
*MIT License. See [Contributing Guide](CONTRIBUTING.md).*  
*Built by the **Finggu Infotech Team***
