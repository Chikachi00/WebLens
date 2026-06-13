# WebLens Fixtures

These pages provide repeatable local samples for V0.4 audit accuracy checks.

- `clean.html`: expected to produce 0 issues with the default V0.4 rules.
- `touch-targets.html`: target size, spacing exceptions, inline text links, disabled controls, and injected WebLens element skips.
- `overflow.html`: fixed-width overflow, wide media, long tokens, transform overflow, negative margin, and valid local horizontal scrollers.
- `accessibility.html`: examples for the existing accessibility and semantic rules.
- `mixed.html`: a compact product-like page with both valid UI and intentional issues.

Run locally:

```bash
npm run fixtures
```

Open `http://127.0.0.1:4174/clean.html` or another fixture path in Chrome.

Notes:

- The target spacing check is a geometric approximation and should be manually verified on real pages.
- Side Panel width can reduce the available viewport and reveal responsive overflow that is not visible in a full-width tab.
- Fixtures use stable `data-testid` attributes for browser integration tests.
