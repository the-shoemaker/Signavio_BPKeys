import {
  addFavorite,
  deleteFavorite,
  getFavorites,
  getLatestCapture,
  moveFavorite,
  setLatestCapture,
} from "../src/shared/storage";
import {
  buildClipboardWriteRequest,
  isClipboardWriteResultMessage,
  type ClipboardWriteResultMessage,
} from "../src/content/signavio-clipboard";
import { FavoritesOverlay } from "../src/content/overlay";
import type { ClipboardCapture, ContentMessage } from "../src/shared/types";
import { getSuggestedFavoriteName } from "../src/shared/payload";

const MESSAGE_SOURCE = "signavio-bpkeys-hook";
let overlay: FavoritesOverlay | null = null;
const pendingClipboardWrites = new Map<
  string,
  {
    resolve: () => void;
    reject: (reason?: unknown) => void;
    timer: number;
  }
>();

const toast = (() => {
  let node: HTMLDivElement | null = null;
  let timer: number | null = null;

  return (message: string) => {
    if (!node) {
      node = document.createElement("div");
      node.style.position = "fixed";
      node.style.right = "20px";
      node.style.bottom = "20px";
      node.style.zIndex = "2147483647";
      node.style.padding = "10px 14px";
      node.style.background = "rgba(31, 31, 31, 0.92)";
      node.style.color = "#f3f3f3";
      node.style.border = "1px solid rgba(255, 255, 255, 0.2)";
      node.style.borderRadius = "12px";
      node.style.fontFamily = "system-ui, sans-serif";
      node.style.fontSize = "13px";
      node.style.boxShadow = "0 8px 28px rgba(0, 0, 0, 0.35)";
      node.style.backdropFilter = "blur(3px)";
      document.body.appendChild(node);
    }

    node.textContent = message;
    node.style.opacity = "1";

    if (timer) {
      window.clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      if (node) {
        node.style.opacity = "0";
      }
    }, 2500);
  };
})();

const isClipboardCapture = (value: unknown): value is ClipboardCapture => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.namespace === "string" &&
    typeof candidate.capturedAt === "number" &&
    (candidate.source === "fetch" || candidate.source === "xhr" || candidate.source === "manual") &&
    "valueJson" in candidate
  );
};

const injectClipboardHook = () => {
  if (document.getElementById("bpkeys-clipboard-hook")) {
    return;
  }

  const script = document.createElement("script");
  script.id = "bpkeys-clipboard-hook";
  script.src = browser.runtime.getURL("clipboard-hook.js");
  script.async = false;
  script.onload = () => {
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
};

const resolvePendingWrite = (data: ClipboardWriteResultMessage): void => {
  const pending = pendingClipboardWrites.get(data.requestId);
  if (!pending) {
    return;
  }

  window.clearTimeout(pending.timer);
  pendingClipboardWrites.delete(data.requestId);

  if (data.ok) {
    pending.resolve();
    return;
  }

  pending.reject(new Error(data.error || `Clipboard write failed (${data.status ?? "unknown"})`));
};

const writeFavoriteToClipboard = async (favorite: {
  payload: unknown;
  namespace: string;
}): Promise<void> => {
  const sendWriteRequest = async (sanitize: boolean): Promise<void> => {
    const request = buildClipboardWriteRequest(
      {
        payload: favorite.payload,
        namespace: favorite.namespace,
      },
      { sanitize },
    );

    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        pendingClipboardWrites.delete(request.requestId);
        reject(new Error("Timed out waiting for page clipboard write result"));
      }, 5000);

      pendingClipboardWrites.set(request.requestId, { resolve, reject, timer });
      window.postMessage(request, window.location.origin);
    });
  };

  try {
    await sendWriteRequest(true);
  } catch (firstError) {
    // Fallback: retry with raw payload if sanitized payload is rejected by server.
    await sendWriteRequest(false).catch((secondError) => {
      throw new Error(
        `Clipboard write failed (sanitized + raw). First: ${String(firstError)}. Second: ${String(secondError)}`,
      );
    });
  }
};

const ensureOverlay = (): FavoritesOverlay => {
  if (overlay) {
    return overlay;
  }

  overlay = new FavoritesOverlay({
    onInsert: async (favorite) => {
      try {
        await writeFavoriteToClipboard(favorite);
        toast(`Loaded favorite: ${favorite.name}. Press Cmd/Ctrl+V to paste.`);
      } catch (error) {
        console.error("[BPKeys] Failed to write favorite payload", error);
        const message = error instanceof Error ? error.message : String(error);
        toast(`Clipboard write failed: ${message.slice(0, 120)}`);
      }
    },
    onDelete: async (favorite) => {
      const nextFavorites = await deleteFavorite(favorite.id);
      overlay?.refreshFavorites(nextFavorites);
      toast(`Deleted favorite: ${favorite.name}`);
    },
    onMove: async (favorite, direction) => {
      const nextFavorites = await moveFavorite(favorite.id, direction);
      overlay?.refreshFavorites(nextFavorites);
    },
    onClose: () => {
      // Intentionally empty; close state is managed inside overlay.
    },
  });

  return overlay;
};

const handleSaveFavorite = async () => {
  const latestCapture = await getLatestCapture();
  if (!latestCapture) {
    toast("No copied Signavio snippet found yet.");
    return;
  }

  const fallbackName = getSuggestedFavoriteName(latestCapture.valueJson);
  const enteredName = window.prompt("Name this favorite snippet:", fallbackName);
  if (!enteredName) {
    return;
  }

  const name = enteredName.trim();
  if (!name) {
    toast("Favorite name cannot be empty.");
    return;
  }

  await addFavorite(name, latestCapture);
  if (overlay?.isOpen()) {
    const favorites = await getFavorites();
    overlay.refreshFavorites(favorites);
  }
  toast(`Saved favorite: ${name}`);
};

const handleToggleOverlay = async () => {
  const favorites = await getFavorites();
  const instance = ensureOverlay();
  instance.toggle(favorites);
};

const handleBackgroundMessage = async (message: ContentMessage) => {
  if (message.type === "BPKEYS_SAVE_FAVORITE") {
    await handleSaveFavorite();
    return;
  }

  if (message.type === "BPKEYS_TOGGLE_OVERLAY") {
    await handleToggleOverlay();
  }
};

export default defineContentScript({
  matches: ["*://*.signavio.com/*"],
  runAt: "document_idle",
  main() {
    injectClipboardHook();

    window.addEventListener("message", async (event: MessageEvent) => {
      if (event.source !== window || event.origin !== window.location.origin) {
        return;
      }

      const data = event.data as Record<string, unknown> | null;
      if (!data || data.source !== MESSAGE_SOURCE || typeof data.type !== "string") {
        return;
      }

      if (data.type === "clipboard-captured" && isClipboardCapture(data.payload)) {
        await setLatestCapture(data.payload);
        return;
      }

      if (data.type === "clipboard-write-result" && isClipboardWriteResultMessage(data)) {
        resolvePendingWrite(data);
      }
    });

    browser.runtime.onMessage.addListener((message: unknown) => {
      if (!message || typeof message !== "object" || !("type" in message)) {
        return;
      }

      return handleBackgroundMessage(message as ContentMessage);
    });
  },
});
