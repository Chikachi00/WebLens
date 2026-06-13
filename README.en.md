# WebLens

[中文](./README.md)

WebLens is a Chrome browser extension for beginner frontend developers and individual makers. It runs in the Chrome Side Panel, audits the current page locally for common UI, HTML semantics, and accessibility issues, then helps users locate affected elements, understand the reason, ignore false positives, manage rules, and export reports.

Current version: V0.2.0. The project does not include AI, accounts, cloud sync, databases, or backend services.

## Current Features

- Chrome Extension Manifest V3 structure
- Chrome Side Panel interface
- Toolbar icon opens the side panel
- Current-page audit with categorized results
- Filters for critical, warning, and info issues
- Scroll and highlight target elements from results
- Issue explanations, recommendations, and copyable code examples
- Independent toggles for all 8 audit rules
- Page-level issue ignores
- Site-level issue ignores
- Ignored issue management and restore actions
- Markdown report export
- JSON report export
- Local settings persistence
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

## Screenshots

> Screenshot placeholder: after installing V0.2 and running an audit, add side panel, settings panel, ignored issue list, and exported report screenshots here. Do not fake screenshots.

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

Development mode is useful for debugging the side panel UI and frontend code. For full extension testing, load the built `dist` directory.

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

## Project Structure

```text
WebLens/
├── public/
│   ├── icons/
│   └── manifest.json
├── src/
│   ├── background/
│   ├── content/
│   ├── rules/
│   ├── shared/
│   ├── sidepanel/
│   └── styles/
├── sidepanel.html
├── package.json
├── vite.config.ts
└── eslint.config.js
```

## Privacy

- V0.2 does not upload page content.
- Audits run locally in the user’s browser.
- WebLens does not collect browsing history.
- WebLens does not save web form content.
- WebLens does not access pages that the user has not actively analyzed.
- User settings are stored only in `chrome.storage.local`.
- Ignore records store only rule IDs, selectors, ignore scopes, and target page URLs or hostnames.
- Report export is triggered manually by the user.
- Reports are never uploaded automatically.

## Current Limitations

- Automated checks cannot replace manual UI and accessibility testing.
- Some findings may be false positives.
- Selectors may become invalid after dynamic page updates.
- Ignored results depend on URL and selector matching.
- Full cross-iframe auditing is not supported yet.
- Deep Shadow DOM auditing is not supported yet.
- AI-powered fixes are not provided yet.
- WebLens does not automatically modify page code.
- Reports do not represent full accessibility compliance certification.

## Roadmap

- Add more audit rules
- Add real browser end-to-end tests
- Improve iframe and Shadow DOM support
- Add optional fix previews
- Evaluate AI-powered fix explanations in a later version

## License

MIT
