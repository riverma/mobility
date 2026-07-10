<!-- markdownlint-disable MD033 MD041 -->
<div align="center">

# Mobility Choices

**Compare driving, cycling, e-biking, and walking — cost, time, CO₂, and health.**

[Open it live](https://mobility.riverma.com) · [Report a bug](https://github.com/riverma/mobility/issues/new?template=bug_report.md) · [Request a feature](https://github.com/riverma/mobility/issues/new?template=feature_request.md)

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](./LICENSE)

</div>

## Privacy

**We don’t collect or track your data. Maps and routes are fetched from third-party map services.** There is no analytics and no tracking.

## About

- Self-hosted libraries (no third-party CDNs); live map/route data is fetched on demand.

## Quick start

It's a static site — no build step.

```sh
git clone https://github.com/riverma/mobility.git
cd mobility
python3 -m http.server 8000   # then open http://localhost:8000
```

Serve over HTTP (not `file://`).

## Contributing

Issues and pull requests welcome — see the templates under [`.github/`](./.github). Please keep the app dependency-free (no third-party CDNs).

## Versioning & changelog

Uses [Semantic Versioning](https://semver.org). See [CHANGELOG.md](./CHANGELOG.md).

## License

[GNU Affero General Public License v3.0](./LICENSE) © Rishi Verma. Bundled third-party assets retain their own licenses.
