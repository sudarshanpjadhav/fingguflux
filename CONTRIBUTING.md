# Contributing to FingguFlux

Thank you for your interest in FingguFlux! We welcome contributions that maintain our core focus on **Architectural Hardening** and **Zero-Runtime Efficiency**.

## 🛡 Our Philosophy

FingguFlux is not a generic UI library. Every contribution must adhere to:
1. **Transparency**: Components must not "own" their styles; they must map to tokens.
2. **Hardening**: Styles must be compatible with the deterministic hashing engine.
3. **Parity**: New features must be implemented with identical behavior across all supported adapters (React, Vue, Svelte).

## 🚀 Getting Started

1. **Fork the Repository**: FingguFlux is a pnpm monorepo.
2. **Install Dependencies**: `pnpm install`
3. **Run Dev Environment**: `pnpm dev`

## 📝 Pull Request Guidelines

- **Atomic Changes**: Keep PRs focused on a single component or utility.
- **Verification**: Include logic tests in `packages/*/test/`.
- **Documentation**: Update the relevant `technical_report.md` or docs content.
- **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/).

## 🐛 Reporting Bugs

Please use the provided Issue Templates. Provide a minimal reproduction using the `packages/docs` playground if possible.

## 📜 Code of Conduct

All contributors are expected to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md).
