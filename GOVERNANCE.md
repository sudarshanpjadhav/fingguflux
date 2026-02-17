# Project Governance

FingguFlux is a community-driven project with a focused architectural steering committee.

## 1. Decision Making

Technical decisions are guided by the **Finggu Hardening Manifesto**:
- Performance over Convenience.
- Explicit mapping over Implicit injection.
- Security through Obfuscation (in Extreme Mode).

## 2. Maintainers

Maintainers are responsible for:
- Reviewing PRs for architectural parity.
- Maintaining the integrity of the hashing algorithm.
- Ensuring version guard consistency.

## 3. Breaking Changes

We follow a **Strict SemVer** policy.
- Changes to the hashing algorithm are always **Major**.
- Changes to the token naming convention are always **Major**.
- New components or motion hooks are **Minor**.

## 4. Security Policy

Security reports should be sent directly to `security@finggu.io`. Do not open public issues for potential vulnerabilities related to the hashing engine.
