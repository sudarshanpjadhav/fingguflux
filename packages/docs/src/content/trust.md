# Trust & Security

FingguFlux is built for environments where "generic" is a risk. We provide architecture-level guarantees for security, performance, and stability.

## 1. Deterministic Hashing (Extreme Mode)

In **Extreme Mode**, FingguFlux completely obfuscates the visual implementation of your UI.

- **How it works**: The compiler identifies every class selector (e.g., `.ff-btn-primary`) and replaces it with a deterministic, character-efficient hash (e.g., `.ff-z1`).
- **Why it matters**: This prevents malicious or unintended "CSS scraping" and ensures that external scripts cannot target your UI components based on class name conventions. It also reduces the CSS bundle size by up to 60%.

## 2. Attribute-Driven State (No ID Pollution)

FingguFlux avoids using internal IDs or dynamic class names to manage interactive state.

- **The Pattern**: Components communicate state via data attributes (e.g., `data-ff-open="true"`).
- **Hardening**: CSS selectors target these attributes directly. This means the visual state is always perfectly synced with the DOM state, without requiring complex JS-to-CSS bridges.

## 3. Security + SSR Integrity

- **No eval()**: The compiler and runtime avoid dynamic evaluation.
- **SSR Safety**: All adapters are hardened against "hydration mismatch." Styles are never injected at runtime, meaning search engine crawlers and users see the exact same UI from the first byte.
- **Pure CSS**: Because style is never "generated" on the fly, there is no risk of XSS via CSS-in-JS injection.

## 4. Bundle Size Benchmarks

FingguFlux is designed for the "First Byte" era.

| Component | Standard Library (Avg) | FingguFlux | Delta |
| :--- | :--- | :--- | :--- |
| **Core Layout** | ~40KB | **2.8KB** | -93% |
| **Motion Utils** | ~15KB | **0.4KB** | -97% |
| **React Adapter** | ~12KB | **0.8KB** | -93% |

---

## Compiler Integrity

The FingguFlux compiler performs **Deep Dependency Analysis**. If you use a `Button` with a `variant="primary"` prop, the compiler doesn't just include the button styles—it identifies that `primary` depends on specific color tokens and ensures only **those** tokens are included in the final layer.
