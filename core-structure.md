# Signavio Clipboard Reverse Engineering Notes

Author: Investigation Session  
Date: 2026-03-06

---

# 1. Goal

Create a browser extension that allows **favorite BPMN elements/snippets** to be inserted quickly into the Signavio editor without navigating the sidebar each time.

Desired UX:

1. User stores commonly used elements/snippets as **Favorites**
2. Extension UI shows a **Favorites panel**
3. Clicking a favorite inserts the element(s) into the diagram
4. Ideally behaves like native paste (`Cmd + V`)

---

# 2. Key Discovery

Signavio **does not rely on the OS clipboard** for BPMN copy/paste.

Instead it uses a **server-side clipboard API**.

Observed behavior:

Copy action triggers:

POST /p/clipboard

Payload format:

application/x-www-form-urlencoded

Key field:

value_json

Example payload structure:

{
"childShapes": [...],
"useOffset": true,
"linked": {},
"stencilset": {
"namespace": "http://b3mn.org/stencilset/bpmn2.0#"
}
}

This JSON describes the BPMN element(s) that were copied.

---

# 3. Evidence Supporting Server Clipboard

Observed during investigation:

### 3.1 Browser Clipboard Empty

Clipboard events fired but contained:

clipboardData.types = []

Meaning Signavio did not populate the browser clipboard.

---

### 3.2 Copy Triggers Network Request

Network tab showed:

POST /p/clipboard

Payload contained serialized BPMN objects.

---

### 3.3 Paste Works After Reload

Reload page → paste still works.

This means clipboard state persists outside the page memory.

---

### 3.4 Paste Works Across Tabs

Copy in Tab A → paste in Tab B works.

This confirms clipboard state is stored **server side per session**.

---

# 4. Clipboard Data Format

The payload uses a **Signavio/Oryx stencil JSON model**.

Important fields:

| Field       | Meaning                        |
| ----------- | ------------------------------ |
| childShapes | array of copied BPMN elements  |
| resourceId  | unique element ID              |
| properties  | BPMN properties                |
| stencil.id  | BPMN type (Task, Gateway, etc) |
| bounds      | position                       |
| dockers     | edge routing                   |
| outgoing    | connections                    |
| parent      | diagram container              |

Example:

```
{
  "childShapes":[
    {
      "resourceId":"sid-XXXX",
      "stencil":{"id":"Task"},
      "properties":{...},
      "bounds":{...},
      "outgoing":[]
    }
  ]
}
```

Multi-element selections produce **multiple entries in childShapes** and may include connection objects.

---

# 5. Clipboard API Endpoints

Observed endpoints:

### Write clipboard

POST

/p/clipboard

Body:

value_json=<JSON>

namespace=http://b3mn.org/stencilset/bpmn2.0#

---

### Clipboard state check

GET

/p/clipboard?head=true

Purpose unclear but likely a metadata check.

---

# 6. Proposed Extension Architecture

Recommended architecture:

Extension stores **favorite BPMN snippets** and writes them into the Signavio clipboard.

Workflow:

1. User copies element once
2. Extension captures `value_json`
3. User saves as Favorite
4. Later clicking Favorite:

Extension sends:

POST /p/clipboard

with stored payload

5. User presses `Cmd + V` in editor

Signavio pastes the snippet normally.

---

# 7. Why This Is Better Than OS Clipboard

Advantages:

- No need to manipulate browser clipboard
- Uses native Signavio paste pipeline
- Supports complex BPMN structures
- Works across reloads and tabs

---

# 8. Minimal Viable Extension Flow

### Save Favorite

1. User copies element in Signavio
2. Extension reads last `/p/clipboard` payload
3. Store payload locally

Example structure:

```
{
  name: "Service Task Template",
  payload: <value_json>
}
```

---

### Insert Favorite

When user clicks favorite:

```javascript
fetch("/p/clipboard", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
  },
  body: new URLSearchParams({
    value_json: JSON.stringify(payload),
    namespace: "http://b3mn.org/stencilset/bpmn2.0#",
  }),
});
```

Then user pastes normally.

---

# 9. Extension Components

Recommended structure:

background

- storage of favorites

content script

- runs inside Signavio editor
- sends clipboard POST

popup / sidebar UI

- favorites list
- add / remove snippets

---

# 10. Data Storage

Possible options:

- localStorage
- chrome.storage.local
- sync storage

Example:

```
favorites = [
  {
    id: uuid,
    name: "Approval Task",
    payload: value_json
  }
]
```

---

# 11. Open Questions / Tests Needed

Before full implementation several behaviors should be verified.

### 1. Payload Replay Test

Send previously captured payload to `/p/clipboard` and paste.

Expected result:

element appears in diagram.

---

### 2. ID Collision Handling

Check whether Signavio automatically rewrites:

resourceId

during paste.

If not, IDs may need regeneration.

---

### 3. Multi-Element Snippets

Verify copying:

- multiple tasks
- tasks + sequence flows
- gateways
- subprocesses

Check payload structure.

---

### 4. Lane / Pool Handling

Pools and lanes might require additional structure.

Needs testing.

---

### 5. Position Offset Behavior

Payload contains:

useOffset: true

Need to verify how placement works.

---

### 6. Clipboard Overwrite

Confirm that posting to `/p/clipboard` replaces existing clipboard.

---

### 7. Authentication

Requests rely on session cookies.

Ensure extension uses:

credentials: include

---

# 12. Security Note

DevTools screenshots revealed active session cookies and tokens.

Those should not be shared publicly and sessions should be rotated if exposed.

---

# 13. Implementation Recommendation

Start with **small proof of concept**:

1. Hardcode one payload
2. Button that sends POST `/p/clipboard`
3. Paste in editor

If successful:

Implement favorites storage + UI.

---

# 14. Estimated Complexity

Low–Medium.

Most work is:

- UI for favorites
- payload storage
- POST clipboard injection

Core integration appears simple.

---

# 15. Summary

The critical discovery:

Signavio uses a **server-side clipboard endpoint**.

This enables a clean extension strategy:

Favorites → POST payload → native paste.

No OS clipboard manipulation required.
