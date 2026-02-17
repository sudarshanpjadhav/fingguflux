# Component System

FingguFlux components are hardened shells. They represent structural blueprints that allow styles to be mapped and hardened at build time.

## Core Components

### 1. Button
The workhorse of any UI. Supports variants, sizes, and motion.
- **Hardening**: Prevents direct style overrides via inline styles.
- **Modes**: Classes are hashed in Extreme mode.

### 2. Modal
A complex interactive component with built-in accessibility.
- **Portals**: Uses native teleport/portal patterns.
- **Scroll Locking**: Deterministic body locking.
- **Exit Logic**: Handles transition completion before DOM removal.

### 3. Tabs
Composite component for complex layout switching.
- **Context Driven**: Syncs state between `TabList` and `TabContent`.
- **ARIA**: Automatically manages `role="tablist"`, `aria-selected`, etc.

## Composition API

FingguFlux components are designed to be composed.

```tsx
<Card padding="lg">
  <Tabs>
    <TabList>
      <TabTrigger id="1">Overview</TabTrigger>
    </TabList>
    <TabContent id="1">
      <Button variant="primary">Action</Button>
    </TabContent>
  </Tabs>
</Card>
```

---

## Static Manifests (`__ffClasses`)

To ensure tree-shakability and compiler speed, every component exports a static list of all possible classes it can use.

```typescript
export const __ffClasses_Button = [
  'ff-btn',
  'ff-btn-primary',
  'ff-btn-secondary',
  'ff-btn-md',
  'ff-btn-lg'
];
```
