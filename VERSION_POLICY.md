# FingguFlux Versioning Policy

> **Document version:** 0.9.6  
> **Status:** Adopted  
> **Effective from:** v0.9.7-RC  
> **Owner:** Finggu Architecture Team

---

## 1. Overview

FingguFlux follows **Semantic Versioning 2.0.0** ([semver.org](https://semver.org)) with additional
rules enforced by automated tooling (`finggu theme-check`, `finggu snapshot`).

This document is the canonical reference for:
- What constitutes a **breaking change**
- How **deprecations** work
- What **each version segment** means for this project
- The **release gate** requirements before any version bump

---

## 2. Version Segments

```
MAJOR . MINOR . PATCH
  │       │       └─ Backward-compatible bug fixes only.
  │       └───────── Backward-compatible additions (new tokens, exports, CLI commands).
  └───────────────── Breaking changes. Reserved for the 1.0.0 stable milestone.
```

### 2.1 MAJOR (currently: 0)

The major version `0` signals that FingguFlux is in active pre-stable development.
During `0.x.y`, **minor** bumps MAY include removals with a prior deprecation cycle of at
least **one minor version** (see §4).

The `1.0.0` milestone will be declared when:
- All public CSS token names, JS exports, and CLI commands are production-hardened.
- The `API_SURFACE_SNAPSHOT.json` baseline passes with no warnings for two consecutive minor releases.
- A public migration guide exists for every breaking change since `0.9.0`.

### 2.2 MINOR

A minor version bump (`0.9.x → 0.10.0`) indicates:
- New CSS tokens, JS exports, CLI commands, or component files.
- No removals of existing public APIs.
- Any _additions_ must be registered in `TOKENS_REGISTRY.json` (CSS tokens)
  or documented in `CHANGELOG.md` (JS/CLI).

### 2.3 PATCH

A patch version bump (`0.9.6 → 0.9.7`) indicates:
- Bug fixes only.
- No API additions or removals.
- Re-exports, internal refactors, and documentation are patch-safe.

---

## 3. Public API Surface

The following items constitute the **public API** of FingguFlux and are protected by
`finggu snapshot --compare` in CI:

| Surface Dimension         | Source of Truth                                  | Tracked By              |
|---------------------------|--------------------------------------------------|-------------------------|
| CSS Custom Properties     | `packages/core/tokens.css`                       | `API_SURFACE_SNAPSHOT`  |
| JS/TS Named Exports       | `packages/js-helper/src/*.ts`                    | `API_SURFACE_SNAPSHOT`  |
| CLI Commands              | `packages/compiler/cli.js` — `case` statements   | `API_SURFACE_SNAPSHOT`  |
| Component CSS Files       | `packages/core/components/*.css`                 | `API_SURFACE_SNAPSHOT`  |
| Design Token Contract     | `packages/core/TOKENS_REGISTRY.json`             | `finggu theme-check`    |
| Deprecated APIs           | `packages/core/DEPRECATION_LOG.json`             | `finggu snapshot`       |

---

## 4. Deprecation Policy

### 4.1 Lifecycle

```
Active  ──(deprecate)──▶  Deprecated  ──(until expired)──▶  Removed
```

1. **Deprecate**: Add the token/export to `DEPRECATION_LOG.json` with `since` and `until` fields.
2. **Warn**: `finggu snapshot` emits a CI warning every run while the item is in the deprecated window.
3. **Remove**: When `until` version is reached, remove the item from the codebase.
   `finggu snapshot` will then flag the overdue entry as a **breaking change** until the
   entry is also removed from `DEPRECATION_LOG.json`.

### 4.2 Deprecation Window Requirements

| Scope      | Minimum Window                                                   |
|------------|------------------------------------------------------------------|
| CSS token  | 1 minor release (e.g. deprecated in 0.9.x, removable in 0.10.0) |
| JS export  | 1 minor release                                                  |
| CLI command| 1 minor release                                                  |

### 4.3 DEPRECATION_LOG.json Entry Format

```json
{
  "name":        "--ff-old-token-name",
  "type":        "css-token | js-export | cli-command | component-file",
  "since":       "0.9.7",
  "until":       "0.10.0",
  "replacement": "--ff-new-token-name | null",
  "reason":      "Human-readable explanation."
}
```

---

## 5. Breaking Change Definition

The following actions are **always breaking** under FingguFlux policy:

| Action                                                         | Classification |
|----------------------------------------------------------------|----------------|
| Remove a CSS custom property from `tokens.css`                 | BREAKING       |
| Remove a named JS export from `@finggujadhav/js-helper`        | BREAKING       |
| Remove a CLI command from `@finggujadhav/compiler`             | BREAKING       |
| Remove a component CSS file from `@finggujadhav/core`          | BREAKING       |
| Rename a token without a deprecation entry                     | BREAKING       |
| Violate a `TOKENS_REGISTRY.json` required-token rule           | BREAKING       |
| Fail to provide dark/system overrides for required tokens      | BREAKING       |
| Allow an overdue deprecation to persist past its `until` ver.  | BREAKING       |

The following actions are **NOT breaking**:

| Action                                                         | Classification |
|----------------------------------------------------------------|----------------|
| Add a new CSS token (must be registered)                       | MINOR          |
| Add a new JS export                                            | MINOR (WARN)   |
| Add a new CLI command                                          | MINOR          |
| Add a new component CSS file                                   | MINOR          |
| Modify a token's _value_ without changing its _name_           | PATCH          |
| Refactor internals with no public surface change               | PATCH          |
| Update documentation or CHANGELOG                              | PATCH          |

---

## 6. Release Gate Checklist

Before **any** version bump the following automated gates must pass:

```
[ ]  finggu theme-check          → ✨ Theme contract STABLE
[ ]  finggu snapshot --compare   → ✨ API surface STABLE
[ ]  node --test packages/compiler/test/theme-check.test.js   → 35/35 pass
[ ]  node --test packages/compiler/test/snapshot.test.js      → all pass
[ ]  npm pack --dry-run (@finggujadhav/core, @finggujadhav/compiler)
[ ]  CHANGELOG.md updated with the new version entry
```

All gates are encoded in the `scripts.release-check` workspace script.

---

## 7. Pre-stable (0.x) Exception

During the `0.x` series, a breaking change MAY be shipped in a **minor** release IF:

1. The breaking item was formally deprecated for at least **one published minor version**.
2. A migration guide entry exists in `CHANGELOG.md`.
3. The `until` field in `DEPRECATION_LOG.json` matches the release version.

This exception expires at `1.0.0`. After stable release, **all breaking changes require a MAJOR bump**.

---

## 8. Enforcement

| Gate                        | Command                             | Failure Mode         |
|-----------------------------|-------------------------------------|----------------------|
| Theme token contract        | `finggu theme-check`                | Non-zero exit        |
| API surface drift           | `finggu snapshot --compare`         | Non-zero exit        |
| Regression suite            | `npm run test`                      | Non-zero exit        |
| Overdue deprecation         | `finggu snapshot --compare`         | BREAKING result      |
| Pack validation             | `npm pack --dry-run`                | Manual review        |

CI must run all gates on every pull request targeting `main`.

---

*© Finggu Architecture Team. This policy is itself versioned under the FingguFlux CHANGELOG.*
