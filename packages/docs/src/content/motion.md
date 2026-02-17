# Motion System

FingguFlux converts complex motion orchestration into predictable architectural tokens. We prioritize "Reduced Motion" by default and ensure ultra-low bundle impact.

## The Approach

We avoid heavy animation libraries. Instead, we use a combination of **Hardened CSS Transitions** and **Data-Attribute State Toggles**.

### 1. Motion Tokens

All animations are tied to the `--ff-motion-*` token set.

| Token | Curve | Timing |
| :--- | :--- | :--- |
| `ff-motion-fast` | cubic-bezier(0.4, 0, 0.2, 1) | 150ms |
| `ff-motion-medium` | cubic-bezier(0.4, 0, 0.2, 1) | 300ms |
| `ff-motion-slow` | cubic-bezier(0.4, 0, 0.2, 1) | 500ms |

### 2. Utility Classes

FingguFlux provides a set of performance-optimized motion utilities.

- `ff-motion-pop`: A subtle scale-up on entry.
- `ff-motion-slide-up`: Upward translate with opacity fade.
- `ff-motion-fade`: Simple opacity transition.

## Accessibility First

FingguFlux automatically respects the `prefers-reduced-motion` media query.

- When enabled, all timing tokens default to `0ms`.
- Transition curves are flattened to avoid dizziness or tracking issues.
- Interactive states (hover/active) remain tactile but non-animated.

---

## Example Usage

```tsx
<Button motion="pop">
  Click Me
</Button>

<Modal motion="slide-up" isOpen={isOpen}>
  Hardened Transition
</Modal>
```
