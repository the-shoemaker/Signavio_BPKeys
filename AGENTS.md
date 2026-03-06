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

## Critical Runtime Behavior

- Signavio clipboard uses `POST /p/clipboard` (server-side clipboard model).
- Capture and write should both happen in page context.
- Write path now uses template persistence:
  - Capture stores header template + form param template (excluding `value_json`)
  - Favorites persist template
  - On startup, content script bootstraps template to hook so writes can work after reload without a fresh copy
- Write request strategy:
  - Try raw payload first
  - Retry with sanitized payload on failure

## Keyboard Model

- Overlay has explicit mode state:
  - `search` mode: text entry + delete edits search only
  - `list` mode: navigation/actions on favorites
- Shortcuts in list mode:
  - `Option+Delete` or `Option+Backspace`: delete
  - `Option+Up/Down`: reorder
- On delete, selection moves left neighbor first (or next available if first item deleted)

## UI Notes

- Top search/header fixed; only component area scrolls.
- Panel compact, darker, transparent, thin light border.
- Preview icon system supports multiple BPMN stencil families.
- Main icon now represents only the BPMN element family; context differences are shown as chained top-right badges.
- Badges can stack horizontally (e.g. subtype + content + event/context marker).
- For non-rounded shapes preview background is transparent; only shape itself is yellow-filled.
- Keep SVG viewBox with margin (`-4 -4 148 112`) to avoid stroke clipping at icon edges.

## Validation Notes

- Local checks passing:
  - `npm run typecheck`
  - `npm run build` (Firefox)
- Manual Signavio checks still required for each major model type and after restarts.

## Handoff Checklist

1. Re-test persisted favorites after browser restart
2. If `/p/clipboard` 401 reappears, compare latest successful native copy request headers/body with extension write request
3. Extend icon mapping when encountering unknown stencil ids in real models
