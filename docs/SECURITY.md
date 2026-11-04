# Security and data handling

## Current security posture

This repository is a browser-side application. It does not currently implement server-side authentication, authorization, a backend API, or a database. Do not treat the simulation UI as a secure multi-user workspace.

## Secrets

- Never commit API keys, passwords, signing keys, or access tokens.
- Do not expose secrets through `VITE_*` variables; Vite embeds those values in browser assets.
- Treat any browser-delivered AI key as public and abuseable.
- If an AI provider integration is introduced, route it through a server-side service with authentication, authorization, quotas, request validation, and secret storage.
- Rotate any credential that has ever been committed or exposed.

## User data

- Do not enter personal, confidential, regulated, or institutionally sensitive data into this prototype.
- Browser storage is not a backup system and may be cleared by the browser or user.
- Exported files should be handled as user-controlled data and validated before import.
- Do not imply that locally stored worlds are encrypted or backed up.

## Dependency and supply-chain controls

- Keep `bun.lock` committed and use frozen installs in CI.
- Review dependency updates and transitive dependency changes.
- Keep GitHub Actions permissions minimal.
- Use Dependabot for GitHub Actions and npm ecosystem updates.
- Review production build output for accidental secrets before release.

## Reporting a vulnerability

Please do not publish exploitable vulnerabilities with credentials or personal data in a public issue. Contact the repository maintainer privately through GitHub's security reporting feature if it is enabled; otherwise request a private channel before sharing sensitive details.
