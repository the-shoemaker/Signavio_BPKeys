import { getPrimaryStencilId } from "../shared/payload";
import type { Favorite } from "../shared/types";

type OverlayActions = {
  onInsert: (favorite: Favorite) => Promise<void>;
  onDelete: (favorite: Favorite) => Promise<void>;
  onMove: (favorite: Favorite, direction: "up" | "down") => Promise<void>;
  onClose: () => void;
};

type InputMode = "search" | "list";

const CARD_MIN_WIDTH = 160;

export class FavoritesOverlay {
  private readonly host: HTMLDivElement;
  private readonly root: ShadowRoot;
  private readonly wrapper: HTMLDivElement;
  private readonly searchInput: HTMLInputElement;
  private readonly grid: HTMLDivElement;
  private readonly emptyState: HTMLDivElement;
  private readonly hintText: HTMLDivElement;
  private readonly actions: OverlayActions;

  private favorites: Favorite[] = [];
  private filtered: Favorite[] = [];
  private selectedId: string | null = null;
  private opened = false;
  private query = "";
  private mode: InputMode = "search";
  private cardById = new Map<string, HTMLButtonElement>();

  constructor(actions: OverlayActions) {
    this.actions = actions;

    this.host = document.createElement("div");
    this.host.id = "bpkeys-overlay-host";
    this.root = this.host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = this.getStyles();

    this.wrapper = document.createElement("div");
    this.wrapper.className = "bpkeys-wrapper";
    this.wrapper.tabIndex = -1;

    const scrim = document.createElement("div");
    scrim.className = "bpkeys-scrim";
    scrim.addEventListener("click", () => this.close());

    const panel = document.createElement("section");
    panel.className = "bpkeys-panel";
    panel.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    const topRow = document.createElement("div");
    topRow.className = "bpkeys-top-row";

    const searchShell = document.createElement("div");
    searchShell.className = "bpkeys-search-shell";

    const searchIcon = document.createElement("span");
    searchIcon.className = "bpkeys-search-icon";
    searchIcon.setAttribute("aria-hidden", "true");
    searchIcon.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.8" stroke="currentColor" stroke-width="1.8"/><path d="M16.1 16.1L21 21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

    this.searchInput = document.createElement("input");
    this.searchInput.className = "bpkeys-search";
    this.searchInput.type = "text";
    this.searchInput.placeholder = "Search Components";
    this.searchInput.setAttribute("aria-label", "Search components");
    this.searchInput.addEventListener("focus", () => {
      this.mode = "search";
    });
    this.searchInput.addEventListener("pointerdown", () => {
      this.mode = "search";
    });
    this.searchInput.addEventListener("input", () => {
      this.mode = "search";
      this.query = this.searchInput.value.trim().toLowerCase();
      this.applyFilter();
      this.renderGrid();
    });

    searchShell.append(searchIcon, this.searchInput);
    topRow.append(searchShell);

    const divider = document.createElement("div");
    divider.className = "bpkeys-divider";

    const listWrap = document.createElement("div");
    listWrap.className = "bpkeys-list-wrap";

    this.grid = document.createElement("div");
    this.grid.className = "bpkeys-grid";

    this.emptyState = document.createElement("div");
    this.emptyState.className = "bpkeys-empty";

    listWrap.append(this.grid, this.emptyState);

    this.hintText = document.createElement("div");
    this.hintText.className = "bpkeys-hints";
    this.hintText.textContent =
      "Enter: insert  Esc: close  Option+Delete: remove  Option+Up/Down: reorder";

    panel.append(topRow, divider, listWrap, this.hintText);
    this.wrapper.append(scrim, panel);
    this.root.append(style, this.wrapper);

    window.addEventListener("keydown", this.onKeyDown, true);

    document.documentElement.appendChild(this.host);
    this.renderGrid();
  }

  public isOpen(): boolean {
    return this.opened;
  }

  public open(favorites: Favorite[]): void {
    this.opened = true;
    this.wrapper.classList.add("open");
    this.query = "";
    this.mode = "search";
    this.searchInput.value = "";
    this.setFavorites(favorites);
    this.searchInput.focus();
  }

  public close(): void {
    if (!this.opened) {
      return;
    }

    this.opened = false;
    this.wrapper.classList.remove("open");
    this.actions.onClose();
  }

  public toggle(favorites: Favorite[]): void {
    if (this.opened) {
      this.close();
      return;
    }

    this.open(favorites);
  }

  public refreshFavorites(favorites: Favorite[]): void {
    this.setFavorites(favorites);
  }

  private setFavorites(favorites: Favorite[]): void {
    this.favorites = [...favorites].sort((a, b) => a.order - b.order);

    if (!this.selectedId && this.favorites.length > 0) {
      this.selectedId = this.favorites[0]?.id ?? null;
    }

    this.applyFilter();
    this.renderGrid();
  }

  private applyFilter(): void {
    if (!this.query) {
      this.filtered = [...this.favorites];
    } else {
      this.filtered = this.favorites.filter((favorite) =>
        favorite.name.toLowerCase().includes(this.query),
      );
    }

    if (this.filtered.length === 0) {
      this.selectedId = null;
      return;
    }

    if (!this.selectedId || !this.filtered.some((favorite) => favorite.id === this.selectedId)) {
      this.selectedId = this.filtered[0]?.id ?? null;
    }
  }

  private getSelectedFavorite(): Favorite | null {
    if (!this.selectedId) {
      return null;
    }

    return this.filtered.find((favorite) => favorite.id === this.selectedId) ?? null;
  }

  private enterSearchMode(append?: string): void {
    this.mode = "search";
    this.searchInput.focus();

    if (append) {
      this.searchInput.value += append;
      this.query = this.searchInput.value.trim().toLowerCase();
      this.applyFilter();
      this.renderGrid();
    }
  }

  private enterListMode(): void {
    this.mode = "list";
    this.searchInput.blur();
    this.wrapper.focus();
  }

  private renderGrid(): void {
    this.cardById.clear();
    this.grid.innerHTML = "";

    const items = this.filtered;
    this.emptyState.style.display = items.length === 0 ? "block" : "none";

    if (this.favorites.length === 0) {
      this.emptyState.textContent =
        "No favorites yet. Copy a shape in Signavio and use Option+Shift+S to save one.";
      this.hintText.style.opacity = "0.75";
      return;
    }

    if (items.length === 0) {
      this.emptyState.textContent = "No favorites match your search.";
      this.hintText.style.opacity = "0.85";
      return;
    }

    this.hintText.style.opacity = "1";

    for (const favorite of items) {
      const card = document.createElement("button");
      card.className = "bpkeys-card";
      card.type = "button";
      card.dataset.favoriteId = favorite.id;

      card.addEventListener("click", () => {
        this.selectedId = favorite.id;
        this.enterListMode();
        this.updateSelectedCardClasses();
      });

      card.addEventListener("dblclick", () => {
        this.close();
        void this.actions.onInsert(favorite);
      });

      const preview = this.createPreview(favorite);

      const label = document.createElement("div");
      label.className = "bpkeys-card-label";
      label.textContent = favorite.name;

      card.append(preview, label);
      this.grid.appendChild(card);
      this.cardById.set(favorite.id, card);
    }

    this.updateSelectedCardClasses();
  }

  private updateSelectedCardClasses(): void {
    for (const [id, card] of this.cardById.entries()) {
      card.classList.toggle("selected", id === this.selectedId);
    }
  }

  private createPreview(favorite: Favorite): HTMLDivElement {
    const preview = document.createElement("div");
    preview.className = "bpkeys-preview";

    const stencil = getPrimaryStencilId(favorite.payload).toLowerCase();
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 120 92");
    svg.classList.add("bpkeys-preview-svg");

    if (stencil.includes("gateway")) {
      svg.innerHTML = '<polygon points="60,12 102,46 60,80 18,46" fill="#f6f4d4" stroke="#585858" stroke-width="2"/>';
    } else if (stencil.includes("event")) {
      svg.innerHTML = '<circle cx="60" cy="46" r="31" fill="#f6f4d4" stroke="#585858" stroke-width="2"/>';
    } else if (stencil.includes("flow") || stencil.includes("association")) {
      svg.innerHTML = '<line x1="16" y1="46" x2="100" y2="46" stroke="#4e4e4e" stroke-width="3"/><polygon points="100,46 88,39 88,53" fill="#4e4e4e"/>';
    } else if (stencil.includes("subprocess")) {
      svg.innerHTML = '<rect x="18" y="18" width="84" height="56" rx="12" fill="#f6f4d4" stroke="#585858" stroke-width="2"/><line x1="52" y1="64" x2="68" y2="64" stroke="#666" stroke-width="2"/><line x1="60" y1="56" x2="60" y2="72" stroke="#666" stroke-width="2"/>';
    } else {
      svg.innerHTML = '<rect x="14" y="14" width="92" height="64" rx="12" fill="#f6f4d4" stroke="#585858" stroke-width="2"/>';
    }

    preview.appendChild(svg);
    return preview;
  }

  private moveSelectionByKey(key: string): void {
    const currentIndex = this.filtered.findIndex((favorite) => favorite.id === this.selectedId);
    if (currentIndex < 0) {
      return;
    }

    const columns = this.getColumnCount();

    let nextIndex = currentIndex;
    if (key === "ArrowLeft") {
      nextIndex = currentIndex - 1;
    } else if (key === "ArrowRight") {
      nextIndex = currentIndex + 1;
    } else if (key === "ArrowUp") {
      nextIndex = currentIndex - columns;
    } else if (key === "ArrowDown") {
      nextIndex = currentIndex + columns;
    }

    nextIndex = Math.max(0, Math.min(this.filtered.length - 1, nextIndex));
    this.selectedId = this.filtered[nextIndex]?.id ?? this.selectedId;
    this.updateSelectedCardClasses();
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (!this.opened) {
      return;
    }

    // Always block Signavio editor shortcuts while overlay is open.
    event.stopPropagation();

    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
      return;
    }

    const selected = this.getSelectedFavorite();
    if (event.altKey && (event.key === "Delete" || event.key === "Backspace")) {
      event.preventDefault();
      if (selected) {
        this.enterListMode();
        void this.actions.onDelete(selected);
      }
      return;
    }

    const isArrow = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key);
    const isPrintable = event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey;

    if (this.mode === "search") {
      if (event.key === "Delete" || event.key === "Backspace") {
        // Keep delete scoped to search text while typing.
        return;
      }

      if (isArrow || event.key === "Enter") {
        event.preventDefault();
        this.enterListMode();

        if (isArrow) {
          this.moveSelectionByKey(event.key);
          return;
        }

        if (selected) {
          this.close();
          void this.actions.onInsert(selected);
        }
        return;
      }

      // Normal typing in search mode.
      return;
    }

    // List mode
    if (isPrintable) {
      event.preventDefault();
      this.enterSearchMode(event.key);
      return;
    }

    if (!selected) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      this.close();
      void this.actions.onInsert(selected);
      return;
    }

    if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      const direction = event.key === "ArrowUp" ? "up" : "down";
      void this.actions.onMove(selected, direction);
      return;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      // Prevent browser navigation or page-level delete actions.
      event.preventDefault();
      return;
    }

    if (!isArrow) {
      return;
    }

    event.preventDefault();
    this.moveSelectionByKey(event.key);
  };

  private getColumnCount(): number {
    const width = this.grid.clientWidth;
    if (width <= 0) {
      return 4;
    }

    return Math.max(1, Math.floor(width / CARD_MIN_WIDTH));
  }

  private getStyles(): string {
    return `
      :host {
        all: initial;
      }

      :host, :host * {
        box-sizing: border-box;
      }

      .bpkeys-wrapper {
        position: fixed;
        inset: 0;
        z-index: 2147483600;
        display: none;
        align-items: center;
        justify-content: center;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
      }

      .bpkeys-wrapper.open {
        display: flex;
      }

      .bpkeys-scrim {
        position: absolute;
        inset: 0;
        background: rgba(10, 12, 14, 0.4);
        backdrop-filter: blur(5px);
      }

      .bpkeys-panel {
        position: relative;
        width: min(900px, 72vw);
        min-height: min(520px, 74vh);
        max-height: 80vh;
        padding: 20px;
        border-radius: 30px;
        background: rgba(26, 28, 33, 0.78);
        backdrop-filter: blur(14px) saturate(120%);
        box-shadow: 0 22px 54px rgba(0, 0, 0, 0.62);
        display: grid;
        grid-template-rows: auto auto 1fr auto;
        gap: 12px;
        border: 1px solid rgba(255, 255, 255, 0.24);
        overflow: hidden;
      }

      .bpkeys-top-row {
        display: flex;
        align-items: center;
      }

      .bpkeys-search-shell {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 9px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 8px 11px;
      }

      .bpkeys-search-icon {
        width: 18px;
        height: 18px;
        color: rgba(236, 236, 236, 0.88);
        display: inline-flex;
        flex: 0 0 auto;
      }

      .bpkeys-search-icon svg {
        width: 100%;
        height: 100%;
      }

      .bpkeys-search {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        color: #ececec;
        font-size: 17px;
        font-weight: 500;
        line-height: 1.1;
        letter-spacing: 0.01em;
      }

      .bpkeys-search::placeholder {
        color: rgba(236, 236, 236, 0.88);
      }

      .bpkeys-divider {
        height: 1px;
        border-radius: 999px;
        background: rgba(246, 246, 246, 0.22);
      }

      .bpkeys-list-wrap {
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 4px;
      }

      .bpkeys-list-wrap::-webkit-scrollbar {
        width: 8px;
      }

      .bpkeys-list-wrap::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.16);
        border-radius: 999px;
      }

      .bpkeys-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
        gap: 14px;
        align-content: start;
        width: 100%;
      }

      .bpkeys-card {
        border: none;
        display: grid;
        place-items: center;
        grid-template-rows: 1fr auto;
        gap: 9px;
        height: 154px;
        border-radius: 22px;
        background: radial-gradient(circle at 40% 30%, #31353d 0%, #1c2026 72%);
        color: #ececec;
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease, outline-color 120ms ease;
        outline: 1px solid transparent;
      }

      .bpkeys-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
      }

      .bpkeys-card.selected {
        outline-color: rgba(236, 236, 236, 0.62);
        box-shadow: 0 0 0 1px rgba(236, 236, 236, 0.26) inset;
      }

      .bpkeys-preview {
        width: 112px;
        height: 84px;
        border-radius: 16px;
        background: linear-gradient(145deg, #f6f4d4, #ebe8b6);
        border: 1px solid rgba(43, 43, 43, 0.28);
        margin-top: 11px;
        display: grid;
        place-items: center;
      }

      .bpkeys-preview-svg {
        width: 100%;
        height: 100%;
      }

      .bpkeys-card-label {
        padding-bottom: 10px;
        font-size: 14px;
        font-weight: 600;
        color: #f3f3f3;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 92%;
      }

      .bpkeys-empty {
        display: none;
        font-size: 14px;
        color: rgba(243, 243, 243, 0.86);
        padding: 6px 2px;
      }

      .bpkeys-hints {
        align-self: end;
        font-size: 12px;
        letter-spacing: 0.02em;
        color: rgba(243, 243, 243, 0.82);
        padding-top: 2px;
      }

      @media (max-width: 1000px) {
        .bpkeys-panel {
          width: min(900px, calc(100vw - 20px));
          min-height: min(500px, calc(100vh - 20px));
          border-radius: 24px;
          padding: 16px;
          gap: 10px;
        }

        .bpkeys-search {
          font-size: 15px;
        }

        .bpkeys-grid {
          grid-template-columns: repeat(auto-fill, minmax(138px, 1fr));
          gap: 10px;
        }

        .bpkeys-card {
          height: 138px;
          border-radius: 18px;
        }

        .bpkeys-preview {
          width: 94px;
          height: 72px;
          border-radius: 14px;
        }

        .bpkeys-card-label {
          font-size: 13px;
        }
      }
    `;
  }
}
