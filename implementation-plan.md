# Signavio Firefox Extension — General Plan

## Goal

Build a Firefox extension for Signavio that provides a fast keyboard-driven favorites picker for commonly used BPMN snippets.

Core workflow:

1. Copy an element/snippet in Signavio
2. Save it as a favorite with a shortcut
3. Give it a custom name
4. Open a Raycast-style overlay with a shortcut
5. Search or navigate favorites
6. Insert selected favorite
7. Overlay closes automatically

---

# Main Features

## Raycast-style overlay

- Opens centered via keyboard shortcut
- Dark translucent backdrop
- Grid layout of favorites with previews
- Keyboard-first interaction

## Save favorite

- Shortcut saves the **last copied Signavio snippet**
- Prompt user to enter a custom name
- Store snippet payload and metadata

Stored data includes:

- name
- payload
- namespace
- order
- created date

## Search

Overlay includes a search field.

Filter favorites by:

- name
- optional tags later

Search updates live while typing.

## Keyboard navigation

While overlay is open:

- Arrow keys → navigate grid
- Enter → insert selected favorite
- Escape → close overlay
- Delete / Backspace → remove favorite
- Shortcut → move favorite up/down

## Insert favorite

### MVP mode

1. Extension writes snippet payload to Signavio clipboard endpoint
2. Overlay closes
3. User presses `Cmd + V`

### Later enhancement

1. Write payload
2. Trigger paste automatically
3. Close overlay

## Remove favorite

Delete selected favorite from the overlay.

## Rearrange favorites

Keyboard shortcut moves favorites up/down in the order.

---

# Technical Base

Signavio uses a **server-side clipboard** instead of the OS clipboard.

Observed endpoint:

POST `/p/clipboard`

Payload contains:

- `value_json`
- `namespace`

The extension should therefore:

1. capture copied snippet payloads
2. store them as favorites
3. replay them to `/p/clipboard` when inserting

No OS clipboard manipulation is required.

---

# Architecture

## Background script

Handles:

- extension commands
- storage access
- communication with content script

## Content script

Handles:

- overlay UI
- keyboard navigation
- inserting favorites
- saving favorites
- search
- ordering

## Injected page script

Required for:

- intercepting Signavio clipboard requests
- capturing payload from `/p/clipboard`

---

# Data Model

Each favorite stores:

- id
- name
- payload
- namespace
- preview
- order
- createdAt
- updatedAt

Example:

```json
{
  "id": "abc123",
  "name": "Approval Task",
  "payload": { "...": "..." },
  "namespace": "http://b3mn.org/stencilset/bpmn2.0#",
  "preview": "",
  "order": 0,
  "createdAt": 1772791210000,
  "updatedAt": 1772791210000
}
```

---

# UX Flow

## Open overlay

Shortcut opens centered modal.

## Save favorite

User copies element in Signavio and presses save shortcut.
User enters name for favorite.

## Search

User types to filter favorites by name.

## Navigate

Arrow keys move selection.

## Insert

Press Enter:

- extension writes payload to `/p/clipboard`
- overlay closes
- user pastes with `Cmd + V`

## Organize

- Delete removes favorite
- Move shortcut reorders favorites

---

# MVP Scope

Build first:

- Firefox extension
- Overlay shortcut
- Save latest copied snippet
- Naming favorites
- Search favorites
- Grid view with simple previews
- Arrow key navigation
- Insert favorite to clipboard
- Close overlay after insert
- Delete favorites
- Reorder favorites

Do not block MVP on:

- auto-paste
- direct selection capture
- complex preview rendering
- tagging system
- cloud sync

---

# Still To Test

- replay payload via `/p/clipboard`
- Signavio ID remapping on paste
- multi-element snippets
- gateways, subprocesses
- lanes / pools
- storage limits for large payloads
- auto-paste reliability

---

# Suggested Build Order

1. Firefox extension scaffold
2. Inject network hook for `/p/clipboard`
3. Capture latest copied payload
4. Save payload as named favorite
5. Store favorites locally
6. Build centered overlay
7. Add search input
8. Add grid navigation
9. Add insert flow
10. Add delete + reorder
11. Improve previews later

---

# Final MVP Experience

1. Copy snippet in Signavio
2. Press save shortcut
3. Name the favorite
4. Open overlay
5. Search favorite
6. Navigate with arrow keys
7. Press Enter
8. Overlay closes
9. Paste into diagram

# Shortcuts

1. Save shortcut: option + shift + s
2. Open overlay: option + shift + d
3. Overlay closes: escape
