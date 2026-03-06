export type ClipboardSource = "fetch" | "xhr" | "manual";

export type ClipboardCapture = {
  valueJson: unknown;
  namespace: string;
  capturedAt: number;
  source: ClipboardSource;
};

export type Favorite = {
  id: string;
  name: string;
  payload: unknown;
  namespace: string;
  order: number;
  createdAt: number;
  updatedAt: number;
};

export type ContentMessage =
  | { type: "BPKEYS_TOGGLE_OVERLAY" }
  | { type: "BPKEYS_SAVE_FAVORITE" };
