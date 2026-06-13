# WebLens

[中文](./README.md)

WebLens is a Chrome browser extension for beginner frontend developers and individual makers. It runs in the Chrome Side Panel, audits the current page locally for common UI, HTML semantics, and accessibility issues, then helps users locate affected elements, understand the reason, and copy basic fix examples.

V0.1 does not include AI, accounts, cloud sync, databases, or backend services.

## Current Features

- Chrome Extension Manifest V3 structure
- Chrome Side Panel interface
- Toolbar icon opens the side panel
- Current-page audit with categorized results
- Filters for critical, warning, and info issues
- Scroll and highlight target elements from results
- Issue explanations, recommendations, and copyable code examples
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

> Screenshot placeholder: after installing V0.1 and running an audit, add side panel screenshots and element-highlight screenshots here.

## Tech Stack

- Chrome Extension Manifest V3
- React
- TypeScript
- Vite
- Tailwind CSS
- ESLint
- Vitest
- Chrome Side Panel API

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

- V0.1 does not upload page content.
- Audits run locally in the user’s browser.
- WebLens does not collect browsing history.
- WebLens does not save web form content.
- WebLens does not access pages that the user has not actively analyzed.

## Current Limitations

- Automated checks cannot replace manual UI and accessibility testing.
- Some findings may be false positives.
- Full cross-iframe auditing is not supported yet.
- Deep Shadow DOM auditing is not supported yet.
- AI-powered fixes are not provided yet.
- WebLens does not automatically modify page code.

## Roadmap

- Add rule configuration and ignore lists
- Add result export
- Add more layout, accessibility, and semantic rules
- Improve iframe and Shadow DOM support
- Add broader browser end-to-end validation

## License

MIT
