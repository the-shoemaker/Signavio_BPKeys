import type { ClipboardCapture, Favorite } from "./types";

const FAVORITES_KEY = "favorites";
const LAST_CAPTURE_KEY = "lastCapture";

type StorageShape = {
  favorites?: Favorite[];
  lastCapture?: ClipboardCapture;
};

const clone = <T>(value: T): T => structuredClone(value);

const normalizeName = (value: string): string => {
  return value.trim().replace(/\s+/g, " ");
};

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const makeUniqueFavoriteName = (proposedName: string, favorites: Favorite[]): string => {
  const cleaned = normalizeName(proposedName);
  if (!cleaned) {
    return "Favorite";
  }

  const hasExactDuplicate = favorites.some(
    (favorite) => normalizeName(favorite.name).toLowerCase() === cleaned.toLowerCase(),
  );
  if (!hasExactDuplicate) {
    return cleaned;
  }

  const baseMatch = cleaned.match(/^(.*?)(?:\s+(\d+))?$/);
  const base = normalizeName(baseMatch?.[1] ?? cleaned);
  const suffixPattern = new RegExp(`^${escapeRegExp(base)}(?:\\s+(\\d+))?$`, "i");
  const usedNumbers = new Set<number>();

  for (const favorite of favorites) {
    const normalized = normalizeName(favorite.name);
    const match = normalized.match(suffixPattern);
    if (!match) {
      continue;
    }

    if (match[1]) {
      usedNumbers.add(Number(match[1]));
    }
  }

  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) {
    nextNumber += 1;
  }

  return `${base} ${nextNumber}`;
};

const sortFavorites = (favorites: Favorite[]): Favorite[] => {
  return [...favorites].sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }

    return a.createdAt - b.createdAt;
  });
};

const normalizeFavorites = (favorites: Favorite[]): Favorite[] => {
  return sortFavorites(favorites).map((favorite, index) => ({
    ...favorite,
    order: index,
  }));
};

export async function getFavorites(): Promise<Favorite[]> {
  const data = (await browser.storage.local.get(FAVORITES_KEY)) as StorageShape;
  const favorites = Array.isArray(data.favorites) ? data.favorites : [];
  return normalizeFavorites(favorites);
}

export async function setFavorites(favorites: Favorite[]): Promise<Favorite[]> {
  const normalized = favorites.map((favorite, index) => ({
    ...favorite,
    order: index,
  }));
  await browser.storage.local.set({ [FAVORITES_KEY]: normalized });
  return normalized;
}

export async function getLatestCapture(): Promise<ClipboardCapture | null> {
  const data = (await browser.storage.local.get(LAST_CAPTURE_KEY)) as StorageShape;
  if (!data.lastCapture) {
    return null;
  }

  return clone(data.lastCapture);
}

export async function setLatestCapture(capture: ClipboardCapture): Promise<void> {
  await browser.storage.local.set({
    [LAST_CAPTURE_KEY]: clone(capture),
  });
}

export async function addFavorite(
  name: string,
  capture: ClipboardCapture,
): Promise<Favorite> {
  const favorites = await getFavorites();
  const now = Date.now();
  const uniqueName = makeUniqueFavoriteName(name, favorites);
  const favorite: Favorite = {
    id: crypto.randomUUID(),
    name: uniqueName,
    payload: clone(capture.valueJson),
    namespace: capture.namespace,
    requestTemplate: capture.requestTemplate ? clone(capture.requestTemplate) : undefined,
    order: favorites.length,
    createdAt: now,
    updatedAt: now,
  };

  favorites.unshift(favorite);
  await setFavorites(favorites);
  return favorite;
}

export async function deleteFavorite(id: string): Promise<Favorite[]> {
  const favorites = await getFavorites();
  const filtered = favorites.filter((favorite) => favorite.id !== id);

  if (filtered.length === favorites.length) {
    return favorites;
  }

  return setFavorites(filtered);
}

export async function moveFavorite(
  id: string,
  direction: "up" | "down",
): Promise<Favorite[]> {
  const favorites = await getFavorites();
  const index = favorites.findIndex((favorite) => favorite.id === id);

  if (index === -1) {
    return favorites;
  }

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= favorites.length) {
    return favorites;
  }

  const reordered = [...favorites];
  const current = reordered[index];
  const destination = reordered[target];
  if (!current || !destination) {
    return favorites;
  }

  reordered[index] = destination;
  reordered[target] = current;
  const now = Date.now();

  reordered[index] = { ...destination, updatedAt: now };
  reordered[target] = { ...current, updatedAt: now };

  return setFavorites(reordered);
}
