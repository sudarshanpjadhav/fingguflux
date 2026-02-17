# FingguFlux Compiler: Explicit Class Policy

To ensure 100% reliable tree-shaking and deterministic hashing, developers must adhere to the following class usage policy.

## 1. Explicit Class Strings
The compiler uses static analysis (regex) to identify used classes. It does **not** execute JavaScript. Therefore, class names must appear as full literal strings in your code.

### ❌ Prohibited: Concatenation
```javascript
// This will NOT be detected
const type = 'primary';
const className = 'ff-btn-' + type; 
```

### ✅ Recommended: Explicit Literals
```javascript
// This will be detected correctly
const className = isPrimary ? 'ff-btn-primary' : 'ff-btn-secondary';
```

## 2. Template Literals
Standard template literals are supported as long as the FingguFlux class is a discrete word.

### ✅ Supported
```html
<div class="ff-card ${isActive ? 'ff-shadow-lg' : ''}">
```

## 3. Escape Hatch: Safelist
If you must use dynamic classes (e.g., from a CMS or database), add them to the `safelist` in your build configuration (to be implemented in Phase 7).

Currently, you can force inclusion by adding invisible comments in your template:
```html
<!-- ff-safelist: ff-btn ff-shadow-xl -->
```

## 4. Determinism
Hashes are derived from class names. 
- `ff-btn` will **always** hash to the same value across any project or build.
- Adding new classes does **not** affect existing hashes.
