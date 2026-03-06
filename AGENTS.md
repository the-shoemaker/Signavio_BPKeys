# AGENTS Notes — Signavio BPKeys

Updated: 2026-03-06

## Purpose

This file records odd/tricky implementation details for future agents.

## Current Architecture

- Framework: WXT
- Entrypoints:
  - `entrypoints/background.ts`
  - `entrypoints/content.ts`
- Page-context hook:
  - `public/clipboard-hook.js`
- Overlay UI and interactions:
  - `src/content/overlay.ts`
- Clipboard messaging helper:
  - `src/content/signavio-clipboard.ts`
- Payload portability logic:
  - `src/shared/payload.ts`
- Shared models/storage:
  - `src/shared/types.ts`, `src/shared/storage.ts`

## Tricky Behaviors

- Signavio clipboard is server-side (`POST /p/clipboard`) and not browser clipboard based.
- Capture needs page-context interception (content script alone cannot observe app internals reliably).
- Clipboard writes should run in page context; content-context writes can 401.
- Hook now stores headers from successful copy requests and reuses auth/CSRF-related headers on write.
- CSRF fallback sources added (`meta csrf token`, `XSRF-TOKEN`/`CSRF-TOKEN`/`_csrf` cookies).
- Write path retries:
  - first attempt with sanitized payload
  - fallback attempt with raw payload if first is rejected
- Overlay key handling must stop propagation so Signavio editor shortcuts never fire under overlay.

## Keyboard Model

- Mode model in overlay:
  - `search` mode: typing + delete/backspace edits search text only
  - `list` mode: navigation and actions on favorites
- Transition rules:
  - Arrow/Enter while in search mode switches to list actions
  - Typing in list mode switches back to search mode
- Deletion/reorder shortcuts in list mode:
  - `Option+Delete` removes selected favorite
  - `Option+Up/Down` reorders selected favorite

## Portability / Positioning

- Favorites now store raw captured payload.
- Sanitization is applied during insert request generation (not at save-time), allowing raw fallback.
- Sanitizer currently:
  - remaps resource IDs
  - forces default top-level placement
  - keeps structure otherwise conservative

## Validation Notes

- Local checks passing:
  - `npm run typecheck`
  - `npm run build` (Firefox)
- Must be validated manually in Signavio:
  - No-401 clipboard write
  - Single-shape replay
  - Multi-shape replay
  - Lane/pool snippets
