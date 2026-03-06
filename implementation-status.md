# Implementation Status

Updated: 2026-03-06

## Implemented

- Planning and tracking docs
  - Added robust execution plan in `execution-plan.md`
  - Added `AGENTS.md` handoff log for tricky findings
  - Maintained this status tracker
- Extension framework
  - Set up **WXT** project targeting Firefox (`wxt build --browser firefox`)
  - Added typed project config (`package.json`, `tsconfig.json`, `wxt.config.ts`)
- Clipboard capture integration
  - Injected page-context hook (`public/clipboard-hook.js`)
  - Intercepts both `fetch` and `XMLHttpRequest` POST calls to `/p/clipboard`
  - Captures and persists latest `value_json` + `namespace` payload
- Clipboard write reliability updates
  - Clipboard write performed in page context
  - Reuses auth/CSRF headers observed from successful copy calls
  - Adds CSRF fallback token sources
  - Retries with raw payload if sanitized payload write fails
- Favorites data model and storage
  - Implemented typed models (`ClipboardCapture`, `Favorite`)
  - Implemented storage helpers for create/read/delete/reorder flows
  - Fixed reorder persistence bug (stored order now reflects UI order)
  - Favorites now store raw payload (sanitize deferred to insert)
- Payload portability for cross-workspace reuse
  - Added payload sanitizer (`src/shared/payload.ts`)
  - Rewrites snippet `resourceId` values
  - Applies default top-level placement
- Overlay UI and interaction stability pass
  - Darker transparent panel with thin light outline
  - Reduced blur intensity and more compact layout
  - Search icon + fixed top search area
  - Scrollable components list area only
  - Explicit `search` vs `list` input mode model
  - Enter closes panel and inserts in list actions
  - `Option+Delete` removes selected favorite (to avoid search conflicts)
  - `Option+Up/Down` reorders selected favorite

## Validation Run (Local)

- `npm install` ✅
- `npm run typecheck` ✅
- `npm run build` ✅ (Firefox output generated in `.output/firefox-mv2`)

## Next

1. Manual Signavio verification with latest build
   - Confirm `/p/clipboard` insert no longer returns 401
   - Confirm insert then `Cmd/Ctrl+V` works for saved favorites
2. Validate behavior matrix
   - Search-mode delete does not affect canvas
   - List-mode `Option+Delete` delete works
   - List-mode `Option+Up/Down` reorder works
3. Validate portability
   - Same favorite across at least 2 workspaces
   - Single-shape and multi-shape snippets
4. Optional enhancement
   - Optional direct auto-paste mode after successful clipboard write
