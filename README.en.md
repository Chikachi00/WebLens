# WebLens

[中文](./README.md)

WebLens is a Chrome browser extension for beginner frontend developers and individual makers. It runs in the Chrome Side Panel, audits the current page locally for common UI, HTML semantics, and accessibility issues, helps users locate affected elements, ignore false positives, manage rules, export reports, and temporarily preview safe recommended fixes on the current page.

Current version: V0.3.0. The project does not include AI, accounts, cloud sync, databases, or backend services.

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
- Temporary fix previews
- Single-preview revert and revert all
- Before / after preview comparison
- Old reports and preview state are cleared after tab changes
- Light and dark mode support

## Audit Rules

- Images missing the `alt` attribute
- Form controls without accessible labels
- Skipped heading levels
- Interactive targets that may be too small
- Horizontal page overflow
- Buttons without accessible names
- Links without accessible names
- HTML document missing a language declaration

## V0.3 Fix Preview

Fix previews are temporary changes applied only to the current browser page. They do not modify website source code. Refreshing the page, closing the tab, or reverting the preview removes the changes.

Rules that currently support preview:

- Small click targets: temporarily applies `min-width: 44px` and `min-height: 44px`
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

> Screenshot placeholder: after installing V0.3 and running an audit, add screenshots for single fix preview, global preview status bar, before / after comparison, settings panel, and exported reports. Do not fake screenshots.

## Tech Stack

- Chrome Extension Manifest V3
- React
- TypeScript
- Vite
- Tailwind CSS
- ESLint
- Vitest
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

## Manual Chrome Installation

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click “Load unpacked”
4. Select the project `dist` directory
5. Open any regular web page
6. Click the WebLens toolbar icon to open the side panel
7. Click “分析当前页面”

## Privacy And Security

- V0.3 does not upload page content.
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
- Some findings may be false positives.
- Selectors may become invalid after dynamic page updates.
- Dynamic framework re-rendering may invalidate previews.
- Ignored results depend on URL and selector matching.
- Preview does not modify source code.
- Some issues are not suitable for automatic repair.
- Placeholder alt or aria-label values must be replaced by developers.
- Cross-iframe auditing or deep preview is not supported yet.
- Deep Shadow DOM auditing or preview is not supported yet.
- AI-powered fixes are not provided yet.
- Reports do not represent full accessibility compliance certification.

## Roadmap

- Add more audit rules
- Add real browser end-to-end tests
- Improve iframe and Shadow DOM support
- Add more precise fix previews
- Evaluate AI-powered fix explanations in a later version

## License

MIT
