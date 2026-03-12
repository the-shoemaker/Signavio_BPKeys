# Sigtastic Extension — Execution Plan (WXT + Firefox)

Date: 2026-03-06

## 1. Framework Choice

Use **WXT** (Web eXtension Tools) as the extension framework.

Why:
- Common and actively used extension framework for MV3 projects
- Good Firefox support
- Clear entrypoint model (`background`, `content`, shared modules)
- Vite-based tooling for fast iteration and production builds

## 2. Architecture

- `background` service worker
  - Listens to extension commands
  - Forwards command intents to Signavio tabs
- `content` script
  - Injects a page-context network hook to capture Signavio clipboard writes
  - Persists latest clipboard payload
  - Renders overlay UI and handles keyboard/mouse interaction
  - Replays selected payload to `/p/clipboard`
- `shared` modules
  - Typed models
  - Storage read/write helpers

## 3. Feature Scope (MVP)

1. Capture latest copied snippet payload from Signavio clipboard API calls
2. Save as named favorite via shortcut
3. Open Raycast-style overlay via shortcut
4. Search favorites by name
5. Keyboard grid navigation (arrows + enter + escape)
6. Insert selected favorite by writing payload to `/p/clipboard`
7. Delete selected favorite
8. Reorder selected favorite up/down

## 4. Implementation Milestones

### Milestone A — Scaffold
- Initialize WXT project files and scripts
- Add manifest config for Signavio host matching
- Add command definitions

Validation:
- Project files present and consistent
- TypeScript compiles once deps are installed

### Milestone B — Clipboard Capture
- Inject page script that observes `fetch` and `XMLHttpRequest` POSTs to `/p/clipboard`
- Parse `value_json` + `namespace`
- Forward payload to content script via `window.postMessage`
- Save as latest captured payload

Validation:
- Message flow works in content context
- Latest payload is persisted in extension storage

### Milestone C — Favorites Data Flow
- Save favorite from latest captured payload
- Store list with `id`, `name`, `payload`, timestamps, `order`
- Implement delete and reorder operations

Validation:
- Storage state updates correctly after save/delete/reorder

### Milestone D — Overlay UI
- Full-screen backdrop + centered rounded panel
- Search row + divider + card grid
- Visual style close to provided reference screenshot
- Selection state for keyboard navigation

Validation:
- Open/close behavior stable
- Search filtering and card rendering correct

### Milestone E — Insert Flow
- On select/enter: POST favorite payload to `/p/clipboard`
- Close overlay and show hint to paste (`Cmd/Ctrl + V`)

Validation:
- Request body format correct (`application/x-www-form-urlencoded`)
- Clipboard replacement completes without runtime errors

### Milestone F — QA pass
- Keyboard shortcuts and navigation checks
- Error-state handling for missing payload/favorites
- Final doc updates (status + agent notes)

Validation:
- Manual smoke checklist completed

## 5. Test Strategy

Because Signavio is an authenticated app and network capture is integration-heavy, testing is split:

- Local static checks:
  - Type checking/build scripts
  - Lint/syntax sanity
- Manual integration checks in Signavio:
  1. Copy shape in Signavio
  2. Trigger save shortcut
  3. Name favorite
  4. Open overlay
  5. Search + select favorite
  6. Press Enter
  7. Paste in canvas and verify insertion

## 6. Known Risks / Mitigations

- Page CSP may block injected script variants
  - Mitigation: inject via extension URL file + manifest web accessible resources
- API format drift (`/p/clipboard`) in future Signavio versions
  - Mitigation: defensive parsing + logging
- Large payload storage size
  - Mitigation: initial MVP local storage with future compression option

## 7. Out of Scope (for this pass)

- Automatic paste trigger after clipboard write
- Rich thumbnail previews of BPMN snippets
- Cross-device sync
- Tagging and categorization
