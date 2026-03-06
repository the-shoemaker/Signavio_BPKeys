const START_X = 180;
const START_Y = 180;
const COL_GAP = 260;
const ROW_GAP = 190;

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null;
};

const getStencilId = (shape: unknown): string => {
  if (!isRecord(shape) || !isRecord(shape.stencil) || typeof shape.stencil.id !== "string") {
    return "";
  }

  return shape.stencil.id;
};

const isEdgeStencil = (stencilId: string): boolean => {
  const normalized = stencilId.toLowerCase();
  return (
    normalized.includes("flow") ||
    normalized.includes("association") ||
    normalized.includes("connection") ||
    normalized.includes("link")
  );
};

const getChildShapeArray = (payload: unknown): unknown[] => {
  if (!isRecord(payload) || !Array.isArray(payload.childShapes)) {
    return [];
  }

  return payload.childShapes;
};

const collectAllShapes = (shapes: unknown[]): UnknownRecord[] => {
  const results: UnknownRecord[] = [];
  const stack = [...shapes];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!isRecord(current)) {
      continue;
    }

    results.push(current);

    if (Array.isArray(current.childShapes)) {
      for (const child of current.childShapes) {
        stack.push(child);
      }
    }
  }

  return results;
};

const clone = <T>(value: T): T => structuredClone(value);

const collectResourceIds = (shapes: UnknownRecord[]): Set<string> => {
  const ids = new Set<string>();
  for (const shape of shapes) {
    if (typeof shape.resourceId === "string" && shape.resourceId.trim()) {
      ids.add(shape.resourceId);
    }
  }

  return ids;
};

const createIdMap = (ids: Set<string>): Map<string, string> => {
  const map = new Map<string, string>();
  for (const id of ids) {
    const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    map.set(id, `sid-${suffix}`);
  }

  return map;
};

const rewriteReferences = (value: unknown, idMap: Map<string, string>): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteReferences(item, idMap));
  }

  if (!isRecord(value)) {
    return value;
  }

  const output: UnknownRecord = {};

  for (const [key, raw] of Object.entries(value)) {
    if (key === "resourceId" && typeof raw === "string" && idMap.has(raw)) {
      output[key] = idMap.get(raw) as string;
      continue;
    }

    output[key] = rewriteReferences(raw, idMap);
  }

  return output;
};

const applyDefaultTopLevelPlacement = (payload: UnknownRecord): void => {
  if (!Array.isArray(payload.childShapes)) {
    return;
  }

  let nodeIndex = 0;

  for (const candidate of payload.childShapes) {
    if (!isRecord(candidate)) {
      continue;
    }

    const stencilId = getStencilId(candidate);
    if (isEdgeStencil(stencilId)) {
      continue;
    }

    if (!isRecord(candidate.bounds)) {
      continue;
    }

    const bounds = candidate.bounds;
    if (!isRecord(bounds.upperLeft) || !isRecord(bounds.lowerRight)) {
      continue;
    }

    const upperLeft = bounds.upperLeft;
    const lowerRight = bounds.lowerRight;
    const width =
      typeof lowerRight.x === "number" && typeof upperLeft.x === "number"
        ? Math.max(40, lowerRight.x - upperLeft.x)
        : 120;
    const height =
      typeof lowerRight.y === "number" && typeof upperLeft.y === "number"
        ? Math.max(40, lowerRight.y - upperLeft.y)
        : 80;

    const x = START_X + (nodeIndex % 3) * COL_GAP;
    const y = START_Y + Math.floor(nodeIndex / 3) * ROW_GAP;

    bounds.upperLeft = { x, y };
    bounds.lowerRight = { x: x + width, y: y + height };

    nodeIndex += 1;
  }
};

export function getPrimaryStencilId(payload: unknown): string {
  const childShapes = getChildShapeArray(payload);
  for (const candidate of childShapes) {
    const stencilId = getStencilId(candidate);
    if (!stencilId) {
      continue;
    }

    if (!isEdgeStencil(stencilId)) {
      return stencilId;
    }
  }

  return getStencilId(childShapes[0]);
}

export function getSuggestedFavoriteName(payload: unknown): string {
  const stencilId = getPrimaryStencilId(payload);
  return stencilId || "Favorite snippet";
}

export function sanitizePayloadForReuse(payload: unknown): unknown {
  if (!isRecord(payload) || !Array.isArray(payload.childShapes)) {
    return clone(payload);
  }

  const cloned = clone(payload) as UnknownRecord;
  const shapes = collectAllShapes(getChildShapeArray(cloned));
  const ids = collectResourceIds(shapes);
  const idMap = createIdMap(ids);

  const rewritten = rewriteReferences(cloned, idMap);
  if (!isRecord(rewritten)) {
    return rewritten;
  }

  // Ensure paste lands predictably in a visible default location.
  rewritten.useOffset = false;

  applyDefaultTopLevelPlacement(rewritten);

  return rewritten;
}
