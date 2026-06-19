# New Tab, New Window Reloaded

A Chrome extension (Manifest V3) that automatically opens every new tab in its
own separate window — for people who prefer managing windows over tabs.

Independently reimplemented in TypeScript. See [NOTICE](NOTICE) for attribution
to the original "New Tab, New Window" concept by Ozawa Masayuki.

## Features

- Opens new tabs as new windows automatically.
- Toggle on/off from the toolbar button.
- Configurable options:
  - **Position** — cascade, same as the parent window, or maximized.
  - **Size** — inherit, or a custom width × height.
  - **Focus** the new window on open (or open it in the background).
  - **Only act on tabs opened from a link/page** (ignore blank `Ctrl+T` tabs).
  - **Exclude pinned tabs** from being moved.
  - **Minimum tab count** — only split a tab out once the window has at least N tabs.
  - **Excluded URLs** — substring/wildcard patterns that stay as tabs.

## Project layout

```
public/      Static assets copied verbatim into the build (manifest, HTML, icons, locales)
src/         TypeScript sources (bundled by esbuild)
build.mjs    Build script (copy public/ + bundle src/ into dist/)
dist/        Build output — this is the loadable/unpackable extension (git-ignored)
```

## Develop

```sh
npm install
npm run build      # one-off build into dist/
npm run watch      # rebuild on change
npm run typecheck  # tsc --noEmit
```

Then load the unpacked extension:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the **`dist/`** folder.

## Package for the Chrome Web Store

```sh
npm run package    # builds dist/ then zips it to new-tab-new-window-reloaded-v<version>.zip
```

Upload the resulting zip in the Chrome Web Store developer dashboard.

## License

[MIT](LICENSE). See [NOTICE](NOTICE) for attribution.
