import { sanitizePayloadForReuse } from "../shared/payload";
import type { ClipboardRequestTemplate } from "../shared/types";

export const CONTENT_SOURCE = "signavio-bpkeys-content";

export type ClipboardWriteRequestMessage = {
  source: typeof CONTENT_SOURCE;
  type: "clipboard-write-request";
  requestId: string;
  payload: {
    valueJson: unknown;
    namespace: string;
    requestTemplate?: ClipboardRequestTemplate;
  };
};

export type ClipboardWriteResultMessage = {
  source: "signavio-bpkeys-hook";
  type: "clipboard-write-result";
  requestId: string;
  ok: boolean;
  status?: number;
  error?: string;
};

export function isClipboardWriteResultMessage(
  value: unknown,
): value is ClipboardWriteResultMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate.source === "signavio-bpkeys-hook" &&
    candidate.type === "clipboard-write-result" &&
    typeof candidate.requestId === "string" &&
    typeof candidate.ok === "boolean"
  );
}

export function buildClipboardWriteRequest(
  input: {
    payload: unknown;
    namespace: string;
    requestTemplate?: ClipboardRequestTemplate;
  },
  options?: {
    sanitize?: boolean;
  },
): ClipboardWriteRequestMessage {
  const requestId = crypto.randomUUID();
  const useSanitizedPayload = options?.sanitize ?? true;

  return {
    source: CONTENT_SOURCE,
    type: "clipboard-write-request",
    requestId,
    payload: {
      valueJson: useSanitizedPayload ? sanitizePayloadForReuse(input.payload) : input.payload,
      namespace: input.namespace,
      requestTemplate: input.requestTemplate,
    },
  };
}
