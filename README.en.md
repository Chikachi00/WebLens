# WebLens

[![CI](https://github.com/Chikachi00/WebLens/actions/workflows/ci.yml/badge.svg)](https://github.com/Chikachi00/WebLens/actions/workflows/ci.yml)

[中文](./README.md)

WebLens is a Chrome browser extension for beginner frontend developers and individual makers. It runs in the Chrome Side Panel, audits the current page locally for common UI, HTML semantics, and accessibility issues, and helps users locate affected elements, ignore false positives, toggle rules, export reports, and temporarily preview safe recommended fixes.

Current version: V0.4.0. The project does not include AI, accounts, cloud sync, databases, or backend services.

## Current Features

- Chrome Extension Manifest V3 structure
- Chrome Side Panel interface
- 8 local audit rules
- Independent rule toggles with `chrome.storage.local` persistence
- Page-level and site-level issue ignores
- Ignored issue management and restore actions
- Markdown / JSON report export
- Element location and highlight
- Recommendations and copyable code examples
- Temporary fix previews, single revert, and revert all
- Findings grouped by rule
- Diagnostics with evidence, measurements, reason codes, and confidence
- Fixture pages, Vitest unit tests, and Playwright browser tests
- GitHub Actions CI and installable ZIP packaging

## Audit Rules

- Images missing the `alt` attribute
- Form controls without accessible labels
- Skipped heading levels
- Target size or spacing issues
- Horizontal page overflow
- Buttons without accessible names
- Links without accessible names
- HTML document missing a language declaration

## V0.4 Accuracy Improvements

- Click target detection no longer uses a fixed 40px threshold.
- 24 x 24 CSS px is the base candidate size. A warning is reported only when the target is undersized and neighboring target spacing is also insufficient.
- 44 x 44px is only a touch or narrow-screen comfort recommendation. It is reported as info and is not called a WCAG violation.
- Inline text links in normal paragraphs are treated as exceptions by default.
- Small targets with enough spacing do not produce the base warning.
- Horizontal overflow checks combine `html`, `body`, `window.innerWidth`, and `visualViewport`.
- Overflow candidates are sorted by overflow amount, deduplicated, and local horizontal scroller children are ignored when the scroller itself is reasonable.

Spacing detection is a geometric approximation, and confidence is not a compliance grade. A WebLens report only reflects the page state at audit time and does not represent full WCAG certification.

## Fix Preview

Fix previews are temporary changes applied only to the current browser page. They do not modify website source code. Refreshing the page, closing the tab, or reverting the preview removes the changes.

Rules that currently support preview:

- Target size or spacing issues: temporarily applies `min-width` / `min-height`
- Missing HTML language: temporarily sets `lang`
- Missing image alt: temporarily adds placeholder alt text or an empty decorative alt
- Button without accessible name: temporarily adds `aria-label`
- Link without accessible name: temporarily adds `aria-label`

Rules that do not support preview yet:

- Form controls without labels
- Skipped heading levels
- Horizontal overflow

These issues usually require understanding page structure, creating nodes, or addressing layout root causes, so they are not safe to preview mechanically.

## Screenshots

> Screenshot placeholder: after installing and running V0.4, add real screenshots for the Side Panel, grouped findings, diagnostics, single fix preview, global preview status bar, before / after comparison, settings panel, exported reports, and fixture pages. Do not fake screenshots.

## Tech Stack

- Chrome Extension Manifest V3
- React
- TypeScript
- Vite
- Tailwind CSS
- ESLint
- Vitest
- Playwright
- Chrome Side Panel API
- `chrome.storage.local`

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build output is generated in `dist/` and can be loaded directly as an unpacked Chrome extension.

## Fixture Pages

```bash
npm run fixtures
```

Open `http://127.0.0.1:4174/clean.html`, or visit `touch-targets.html`, `overflow.html`, `accessibility.html`, and `mixed.html`.

## Tests

```bash
npm run lint
npm run test
npm run build
npm run test:browser
```

## Packaging

```bash
npm run package
```

Output: `release/weblens-v0.4.0.zip`. After extraction, the ZIP root directly contains `manifest.json`, `sidepanel.html`, `assets/`, and `icons/`.

## Manual Chrome Installation

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the project `dist` directory
5. Open any regular web page
6. Click the WebLens toolbar icon to open the side panel
7. Click "Analyze current page"

## Project Structure

```text
public/              Chrome manifest and icons
src/background/      service worker
src/content/         content script, audit engine, highlight, and preview manager
src/rules/           independent audit rules
src/shared/          types, settings, URL helpers, export, and rule metadata
src/sidepanel/       React Side Panel UI
fixtures/            repeatable test pages
tests/browser/       Playwright browser integration tests
scripts/             release packaging scripts
```

## Privacy And Security

- V0.4 does not upload page content.
- Audits and previews run locally in the current tab.
- WebLens does not collect browsing history.
- WebLens does not save user form values.
- WebLens does not access pages that the user has not actively analyzed.
- User settings are stored only in `chrome.storage.local`.
- Ignore records store only rule IDs, selectors, scopes, and target URLs or hostnames.
- Report export is triggered manually and never uploaded automatically.
- WebLens does not execute arbitrary page scripts.
- Preview changes are limited to allowlisted styles and attributes.
- A preview does not mean the source code has been permanently fixed.

## Current Limitations

- Automated checks cannot replace manual UI and accessibility testing.
- Some real pages may still produce false positives.
- Spacing detection is a geometric approximation.
- Confidence is not a compliance grade.
- The Side Panel reduces available viewport width, which may reveal responsive layout issues.
- Selectors may become invalid after dynamic page updates.
- Ignored results depend on URL and selector matching.
- Dynamic framework re-rendering may invalidate previews.
- Preview does not modify source code.
- Placeholder alt or aria-label values must be replaced by developers.
- Cross-iframe deep scanning or preview is not supported yet.
- Deep Shadow DOM scanning or preview is not supported yet.
- AI-powered fixes are not provided yet.
- Exported reports only reflect the page state at audit time and do not represent full accessibility compliance certification.

## Roadmap

- Add more audit rules
- Add real browser end-to-end tests
- Improve iframe and Shadow DOM support
- Add optional fix previews
- Evaluate AI-powered fix explanations in a later version

## License

MIT
