# Agent guide — Mobility Choices

A dependency-free static web app served at `mobility.riverma.com` via GitHub Pages (deploy from the default branch, root). Files live at the repo root; keep all asset paths relative.

## Release discipline — do this on EVERY commit

1. **Pick the SemVer bump** (https://semver.org): `patch` = fix, `minor` = feature, `major` = breaking change.
2. **Update `CHANGELOG.md`** — move items from `[Unreleased]` into a new `vX.Y.Z` section, dated today (Keep a Changelog).
3. **Update the version string so all copies match:**
   - the footer label in `index.html` (`<span class="app-version">vX.Y.Z</span>`),
     - the `[X.Y.Z]` links at the bottom of `CHANGELOG.md`.
4. **Cut a GitHub release on every major or minor bump** (patch optional):

   ```sh
   git commit -am "…"; git push
   gh release create vX.Y.Z --title "vX.Y.Z" --generate-notes
   ```

## Guardrails
- **No third-party CDNs:** self-host libraries. Only live map/route data may be fetched at runtime; no analytics/tracking.
- **Security:** run a security review of the diff before pushing; never commit secrets.
