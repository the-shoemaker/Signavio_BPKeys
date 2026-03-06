(() => {
  const FLAG = "__bpkeysClipboardHookInstalled";
  if (window[FLAG]) {
    return;
  }

  window[FLAG] = true;

  const MESSAGE_SOURCE = "signavio-bpkeys-hook";
  const CONTENT_SOURCE = "signavio-bpkeys-content";
  const CLIPBOARD_PATH = "/p/clipboard";
  const BPMN_NAMESPACE = "http://b3mn.org/stencilset/bpmn2.0#";

  let lastClipboardHeaders = {};
  let lastClipboardParams = null;

  const nativeFetch = window.fetch.bind(window);
  const nativeOpen = XMLHttpRequest.prototype.open;
  const nativeSend = XMLHttpRequest.prototype.send;
  const nativeSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

  const isClipboardUrl = (inputUrl) => {
    if (!inputUrl) {
      return false;
    }

    try {
      const resolvedUrl = new URL(inputUrl, window.location.origin);
      return resolvedUrl.pathname === CLIPBOARD_PATH;
    } catch {
      return false;
    }
  };

  const asSearchParams = (body) => {
    if (!body) {
      return null;
    }

    if (typeof body === "string") {
      return new URLSearchParams(body);
    }

    if (body instanceof URLSearchParams) {
      return body;
    }

    if (body instanceof FormData) {
      const params = new URLSearchParams();
      for (const [key, value] of body.entries()) {
        if (typeof value === "string") {
          params.append(key, value);
        }
      }
      return params;
    }

    if (Array.isArray(body)) {
      return new URLSearchParams(body);
    }

    return null;
  };

  const safeParseJson = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const normalizeHeaders = (headers) => {
    if (!headers) {
      return {};
    }

    if (headers instanceof Headers) {
      const output = {};
      for (const [key, value] of headers.entries()) {
        output[key.toLowerCase()] = String(value);
      }
      return output;
    }

    if (Array.isArray(headers)) {
      const output = {};
      for (const entry of headers) {
        if (Array.isArray(entry) && entry.length >= 2) {
          output[String(entry[0]).toLowerCase()] = String(entry[1]);
        }
      }
      return output;
    }

    if (typeof headers === "object") {
      const output = {};
      for (const [key, value] of Object.entries(headers)) {
        if (value != null) {
          output[key.toLowerCase()] = String(value);
        }
      }
      return output;
    }

    return {};
  };

  const pickForwardHeaders = (headers) => {
    const normalized = normalizeHeaders(headers);
    const output = {};

    for (const [name, value] of Object.entries(normalized)) {
      if (
        name === "content-length" ||
        name === "host" ||
        name === "origin" ||
        name === "referer" ||
        name === "cookie" ||
        name.startsWith("sec-") ||
        name.startsWith(":")
      ) {
        continue;
      }

      output[name] = value;
    }

    return output;
  };

  const cloneSearchParams = (params) => {
    const next = new URLSearchParams();
    for (const [key, value] of params.entries()) {
      next.append(key, value);
    }
    return next;
  };

  const paramsToTemplateEntries = (params) => {
    const entries = [];
    for (const [key, value] of params.entries()) {
      if (key === "value_json") {
        continue;
      }

      entries.push([key, value]);
    }

    return entries;
  };

  const templateEntriesToParams = (entries) => {
    const params = new URLSearchParams();
    if (!Array.isArray(entries)) {
      return params;
    }

    for (const entry of entries) {
      if (Array.isArray(entry) && entry.length >= 2) {
        params.append(String(entry[0]), String(entry[1]));
      }
    }

    return params;
  };

  const getCookieValue = (name) => {
    const all = document.cookie || "";
    const parts = all.split(";");

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith(`${name}=`)) {
        return decodeURIComponent(trimmed.slice(name.length + 1));
      }
    }

    return "";
  };

  const getCsrfToken = () => {
    const meta = document.querySelector('meta[name="csrf-token"], meta[name="_csrf"]');
    if (meta && typeof meta.content === "string" && meta.content.trim()) {
      return meta.content.trim();
    }

    return (
      getCookieValue("XSRF-TOKEN") ||
      getCookieValue("CSRF-TOKEN") ||
      getCookieValue("_csrf") ||
      ""
    );
  };

  const emitCapture = (valueJsonText, namespace, source, requestTemplate) => {
    if (!valueJsonText) {
      return;
    }

    const valueJson = safeParseJson(valueJsonText);
    if (!valueJson) {
      return;
    }

    window.postMessage(
      {
        source: MESSAGE_SOURCE,
        type: "clipboard-captured",
        payload: {
          valueJson,
          namespace: namespace || BPMN_NAMESPACE,
          capturedAt: Date.now(),
          source,
          requestTemplate,
        },
      },
      window.location.origin,
    );
  };

  const parseAndEmit = (url, method, body, source, headers) => {
    const normalizedMethod = String(method || "GET").toUpperCase();
    if (normalizedMethod !== "POST" || !isClipboardUrl(url)) {
      return;
    }

    lastClipboardHeaders = pickForwardHeaders(headers);

    const params = asSearchParams(body);
    if (!params) {
      return;
    }

    lastClipboardParams = cloneSearchParams(params);
    emitCapture(params.get("value_json"), params.get("namespace"), source, {
      headers: { ...lastClipboardHeaders },
      params: paramsToTemplateEntries(params),
    });
  };

  const writeClipboard = async (requestId, valueJson, namespace, requestTemplate) => {
    try {
      const templateParams =
        requestTemplate && Array.isArray(requestTemplate.params)
          ? templateEntriesToParams(requestTemplate.params)
          : null;

      const params = templateParams
        ? templateParams
        : lastClipboardParams
          ? cloneSearchParams(lastClipboardParams)
          : new URLSearchParams();

      params.set("value_json", JSON.stringify(valueJson));
      params.set("namespace", namespace || BPMN_NAMESPACE);

      const csrfToken = getCsrfToken();
      const headers = {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
        ...(requestTemplate && typeof requestTemplate.headers === "object"
          ? requestTemplate.headers
          : {}),
        ...lastClipboardHeaders,
      };

      if (csrfToken && !headers["x-csrf-token"]) {
        headers["x-csrf-token"] = csrfToken;
      }

      const response = await nativeFetch(new URL(CLIPBOARD_PATH, window.location.origin).toString(), {
        method: "POST",
        credentials: "include",
        headers,
        body: params.toString(),
      });

      let errorText = "";
      if (!response.ok) {
        try {
          errorText = (await response.text()).slice(0, 180);
        } catch {
          errorText = "";
        }
      }

      window.postMessage(
        {
          source: MESSAGE_SOURCE,
          type: "clipboard-write-result",
          requestId,
          ok: response.ok,
          status: response.status,
          error: errorText,
        },
        window.location.origin,
      );
    } catch (error) {
      window.postMessage(
        {
          source: MESSAGE_SOURCE,
          type: "clipboard-write-result",
          requestId,
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        },
        window.location.origin,
      );
    }
  };

  window.fetch = function patchedFetch(input, init) {
    try {
      const method =
        init?.method ||
        (typeof input === "object" && input && "method" in input ? input.method : "GET");
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : typeof input === "object" && input && "url" in input
              ? input.url
              : "";
      const body =
        init?.body || (typeof input === "object" && input && "body" in input ? input.body : null);
      const headers =
        init?.headers ||
        (typeof input === "object" && input && "headers" in input ? input.headers : undefined);

      parseAndEmit(url, method, body, "fetch", headers);
    } catch {
      // Ignore parse errors and preserve native request behavior.
    }

    return nativeFetch(input, init);
  };

  XMLHttpRequest.prototype.open = function patchedOpen(method, url, ...rest) {
    this.__bpkeysMethod = method;
    this.__bpkeysUrl = url;
    this.__bpkeysHeaders = {};
    return nativeOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.setRequestHeader = function patchedSetRequestHeader(name, value) {
    if (!this.__bpkeysHeaders) {
      this.__bpkeysHeaders = {};
    }

    this.__bpkeysHeaders[String(name).toLowerCase()] = String(value);
    return nativeSetRequestHeader.call(this, name, value);
  };

  XMLHttpRequest.prototype.send = function patchedSend(body) {
    try {
      parseAndEmit(this.__bpkeysUrl, this.__bpkeysMethod, body, "xhr", this.__bpkeysHeaders);
    } catch {
      // Ignore parse errors and preserve native request behavior.
    }

    return nativeSend.call(this, body);
  };

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== window.location.origin) {
      return;
    }

    const data = event.data;
    if (!data || data.source !== CONTENT_SOURCE || typeof data.type !== "string") {
      return;
    }

    if (data.type === "clipboard-template-bootstrap" && data.template) {
      if (data.template.headers && typeof data.template.headers === "object") {
        lastClipboardHeaders = { ...data.template.headers };
      }

      if (Array.isArray(data.template.params)) {
        lastClipboardParams = templateEntriesToParams(data.template.params);
      }
      return;
    }

    if (
      data.type === "clipboard-write-request" &&
      typeof data.requestId === "string" &&
      data.payload
    ) {
      writeClipboard(
        data.requestId,
        data.payload.valueJson,
        data.payload.namespace,
        data.payload.requestTemplate,
      );
    }
  });
})();
