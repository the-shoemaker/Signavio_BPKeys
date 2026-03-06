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
  - Clipboard write performed in page context to `/p/clipboard`
  - Reuses captured auth/CSRF headers and full clipboard form-template fields
  - Persists request template in favorites and latest capture
  - Bootstraps template back into page hook on startup/reload
  - Raw payload first, sanitized payload fallback on failure
- Favorites data model and storage
  - Implemented typed models (`ClipboardCapture`, `Favorite`)
  - Implemented storage helpers for create/read/delete/reorder flows
  - Fixed reorder persistence bug (stored order now reflects UI order)
  - New favorites inserted at beginning of list
- Payload portability for cross-workspace reuse
  - Added payload sanitizer (`src/shared/payload.ts`)
  - Rewrites snippet `resourceId` values and applies default placement when needed
- Overlay UI and interaction stability pass
  - Darker transparent compact panel with thin light outline
  - Fixed search/header area, scroll only on component list
  - Explicit `search` vs `list` input mode model
  - Enter inserts/closes reliably
  - `Option+Delete` removes selected favorite
  - Delete selection now shifts to left neighbor
- Preview rendering
  - Expanded BPMN icon coverage (task/subprocess/gateway variants/event variants/flows/data/pool-lane/annotation/message)
  - Simplified large icon model: big yellow shape reflects BPMN element only (no content/type variation in main icon)
  - Added chained top-right context badges (task subtype/content/event/context markers)
  - Non-rounded shapes render without yellow background container
  - Increased card/icon size and added SVG viewBox safety margin to prevent clipped outlines

## Validation Run (Local)

- `npm install` ✅
- `npm run typecheck` ✅
- `npm run build` ✅ (Firefox output generated in `.output/firefox-mv2`)

## Next

1. Manual Signavio verification with latest build
   - Confirm persisted favorites still insert after extension reload/restart
   - Confirm no 401 on `/p/clipboard` write after restart
2. Verify icon edge cases
   - Additional BPMN stencils not yet mapped use fallback icon
3. Optional enhancement
   - Auto-paste mode toggle after successful clipboard write
