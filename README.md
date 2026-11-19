# QR Studio

A local-first QR code workspace built with React and Vite. Create ten types of QR codes, customize them with high-contrast color presets and optional logos, save them in the browser, and export production-ready PNG or SVG files.

Everything runs on the client. There is no account, backend, cloud sync, or tracking.

## Features

- **Ten QR formats**: website, plain text, Wi-Fi, email, phone, SMS, WhatsApp, contact card (vCard), location, and UPI payment.
- **Live validation and preview**: every field is validated, payloads update as you type, and the QR preview reflects the current design.
- **Customization**: foreground/background colors, eight presets, custom colors, quiet-zone margin, 512/1024/2048 px export sizes, and optional logo badges.
- **Scan safety**: error correction defaults to level H, and designs with a logo are locked to level H. Contrast is checked before download or save, and low-contrast combinations are blocked. Always test a real scan before sharing.
- **Template gallery**: 16 ready-to-use starters across Business, Restaurant, Event, Social Media, Portfolio, Personal, Marketing, and Payment.
- **QR library**: save, search, filter by type, sort, switch between grid/list views, rename, edit, download, and delete codes.
- **Exports**: real vector SVG downloads and PNG rasterization at the selected resolution, with clean filenames.
- **Preferences**: light, dark, or system appearance; default QR color; default export size; reset preferences; clear saved history.
- **Command search**: press `Ctrl+K` (or `Cmd+K`) to jump to pages, saved codes, or QR types.
- **Responsive UI**: tested at 1440, 1024, 768, 390, and 320 px widths.

## Tech stack

- React 19 + Vite
- React Router DOM
- Tailwind CSS v4 with semantic CSS-variable theme tokens
- `qrcode.react` for QR rendering
- `html-to-image` for export fallbacks
- `sonner` for local notifications
- `lucide-react` for icons
- Oxlint

## Getting started

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

### Available scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build
npm run lint     # Run Oxlint
```

## Project structure

```text
src/
  components/
    dashboard/     Dashboard stats and recent-code panels
    layout/        App shell, sidebar, header, mobile navigation, search
    qr/            Generator form, type selector, preview, customization, cards
    templates/     Template gallery cards
    ui/            Buttons, inputs, modals, page headers, toasts, empty states
  data/            QR type definitions, templates, navigation, defaults
  hooks/           Local library and settings providers/hooks
  pages/           Dashboard, Generator, My QR Codes, Templates, Settings, 404
  utils/           Payload builders, validation, exports, storage, formatting
```

## Local data

All app data is stored in this browser's `localStorage`:

- `qrstudio:qrcodes:v1` — saved QR codes and download counts
- `qrstudio:settings:v1` — theme, default color, and default export size

Clearing site data or browser storage removes the library. Nothing is uploaded. If the browser rejects a write—for example, because storage is full—QR Studio keeps your current edits on screen and reports the failed save instead of showing a success message.

## Scan-safety rules

- URLs are normalized to `http://` or `https://` and must have a valid hostname.
- Wi-Fi credentials, vCards, UPI IDs, phone numbers, and email addresses are validated before a payload is generated.
- QR content is capped at 1000 bytes to keep codes reliable.
- Foreground/background pairs must reach a 4.5:1 contrast ratio.
- Uploaded logos are converted to a white rounded badge, capped at 25% of the QR width, and require error correction level H. Level H improves recovery but does not guarantee that every scanner will decode a code.

## Scope and limitations

QR Studio is a frontend-only application. Saved codes are static QR codes that encode their content directly; it does not provide dynamic redirects, scan analytics, or cloud-hosted images. Edits and download counts are local to the current browser profile.
