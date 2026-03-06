import {
  getContextBadgeKinds,
  getPrimaryShapeInfo,
  type ContextBadgeKind,
} from "../shared/payload";
import type { Favorite } from "../shared/types";

type OverlayActions = {
  onInsert: (favorite: Favorite) => Promise<void>;
  onDelete: (favorite: Favorite) => Promise<void>;
  onMove: (favorite: Favorite, direction: "up" | "down") => Promise<void>;
  onClose: () => void;
};

type InputMode = "search" | "list";

const CARD_MIN_WIDTH = 172;

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

    if (
      !this.selectedId ||
      !this.filtered.some((favorite) => favorite.id === this.selectedId)
    ) {
      this.selectedId = this.filtered[0]?.id ?? null;
    }
  }

  private getSelectedFavorite(): Favorite | null {
    if (!this.selectedId) {
      return null;
    }

    return (
      this.filtered.find((favorite) => favorite.id === this.selectedId) ?? null
    );
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
    const shapeInfo = getPrimaryShapeInfo(favorite.payload);
    const stencil = shapeInfo.stencilId.toLowerCase();
    const iconKind = this.getIconKind(stencil);
    const roundedBackground = this.hasRoundedBackground(iconKind);

    if (roundedBackground) {
      preview.classList.add("rounded-bg");
    } else {
      preview.classList.add("shape-only");
    }

    preview.classList.add(shapeInfo.hasContent ? "has-content" : "is-empty");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // Add a small safety margin in the viewBox so stroke outlines do not clip.
    svg.setAttribute("viewBox", "-4 -4 148 112");
    svg.classList.add("bpkeys-preview-svg");
    svg.innerHTML = this.getIconSvg(iconKind);

    preview.appendChild(svg);

    const badgeKinds = getContextBadgeKinds(favorite.payload);
    if (badgeKinds.length > 0) {
      const badgeRow = document.createElement("div");
      badgeRow.className = "bpkeys-badge-row";

      for (const kind of badgeKinds) {
        badgeRow.appendChild(this.getBadge(kind));
      }

      preview.appendChild(badgeRow);
    }

    return preview;
  }

  private getBadge(kind: ContextBadgeKind): HTMLSpanElement {
    const badge = document.createElement("span");
    badge.className = "bpkeys-badge";

    const icons: Record<ContextBadgeKind, string> = {
      content: '<text x="12" y="15.5" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" font-family="Segoe UI, sans-serif">T</text>',
      "task-user": '<circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M5 20 C5 15 8 13 12 13 C16 13 19 15 19 20" fill="currentColor"/>',
      "task-service": '<circle cx="12" cy="12" r="6.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/>',
      "task-manual": '<path d="M6 19 V11 C6 9.5 7 8.5 8.3 8.5 C9.5 8.5 10.4 9.5 10.4 11 V14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.4 14 V8 C10.4 6.8 11.2 6 12.3 6 C13.4 6 14.2 6.8 14.2 8 V14" fill="none" stroke="currentColor" stroke-width="2"/>',
      "task-script": '<path d="M6 4 H14 L18 8 V20 H6 Z" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8.5" y1="12" x2="15.5" y2="12" stroke="currentColor" stroke-width="1.8"/>',
      "task-send": '<rect x="4.5" y="7" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="17.5" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2"/><polygon points="22,12 19.2,10 19.2,14" fill="currentColor"/>',
      "task-receive": '<rect x="7.5" y="7" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="2" y1="12" x2="7" y2="12" stroke="currentColor" stroke-width="2"/><polygon points="2,12 4.8,10 4.8,14" fill="currentColor"/>',
      "task-business-rule": '<rect x="4" y="5" width="16" height="14" fill="none" stroke="currentColor" stroke-width="2"/><line x1="4" y1="10" x2="20" y2="10" stroke="currentColor" stroke-width="2"/><line x1="9.3" y1="5" x2="9.3" y2="19" stroke="currentColor" stroke-width="2"/>',
      "task-call-activity": '<rect x="4" y="6" width="16" height="12" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="7" y="9" width="10" height="6" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/>',
      "task-automatic": '<polygon points="8,5 5,13 10,13 8,20 17,10 12,10 14,5" fill="currentColor"/>',
      timer: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="12" x2="12" y2="7" stroke="currentColor" stroke-width="2"/><line x1="12" y1="12" x2="16" y2="14" stroke="currentColor" stroke-width="2"/>',
      message: '<rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 8 L12 13 L20 8" fill="none" stroke="currentColor" stroke-width="1.8"/>',
      signal: '<polygon points="12,4 20,19 4,19" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="9" x2="12" y2="15" stroke="currentColor" stroke-width="2"/>',
      error: '<polygon points="12,4 20,19 4,19" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="9" x2="16" y2="17" stroke="currentColor" stroke-width="2"/><line x1="16" y1="9" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>',
      escalation: '<line x1="12" y1="20" x2="12" y2="6" stroke="currentColor" stroke-width="2"/><polygon points="12,4 18,10 6,10" fill="currentColor"/>',
      conditional: '<rect x="5" y="5" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" stroke-width="1.8"/>',
      compensation: '<polygon points="9,12 15,8 15,16" fill="currentColor"/><polygon points="5,12 11,8 11,16" fill="currentColor"/>',
      terminate: '<rect x="7" y="7" width="10" height="10" fill="currentColor"/>',
      link: '<path d="M8 12 C8 9 10 7 13 7 H16" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 7 L14 5 M16 7 L14 9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 12 C16 15 14 17 11 17 H8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 17 L10 15 M8 17 L10 19" fill="none" stroke="currentColor" stroke-width="2"/>',
      multiple: '<circle cx="8" cy="12" r="2.2" fill="currentColor"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="16" cy="12" r="2.2" fill="currentColor"/>',
      loop: '<path d="M17 10 A6 6 0 1 0 18 13" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="18,8 21,10 18,12" fill="currentColor"/>',
      "mi-parallel": '<line x1="7" y1="7" x2="7" y2="17" stroke="currentColor" stroke-width="2.4"/><line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" stroke-width="2.4"/><line x1="17" y1="7" x2="17" y2="17" stroke="currentColor" stroke-width="2.4"/>',
      "mi-sequential": '<line x1="7" y1="7" x2="7" y2="17" stroke="currentColor" stroke-width="2.4"/><line x1="12" y1="9" x2="12" y2="17" stroke="currentColor" stroke-width="2.4"/><line x1="17" y1="11" x2="17" y2="17" stroke="currentColor" stroke-width="2.4"/>',
      adhoc: '<path d="M4 14 C6 10 8 18 10 14 C12 10 14 18 16 14 C18 10 20 18 22 14" fill="none" stroke="currentColor" stroke-width="2"/>',
      "non-interrupting": '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="2.5 2.5"/>',
      transaction: '<rect x="5" y="5" width="14" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="8" y="8" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>',
    };

    badge.setAttribute("title", kind);
    badge.innerHTML = `<svg viewBox="0 0 24 24" fill="none">${icons[kind]}</svg>`;
    return badge;
  }

  private getIconKind(stencil: string):
    | "task"
    | "subprocess"
    | "call-activity"
    | "transaction"
    | "gateway-exclusive"
    | "gateway-parallel"
    | "gateway-inclusive"
    | "gateway-event"
    | "gateway-complex"
    | "event-start"
    | "event-end"
    | "event-intermediate"
    | "event-boundary"
    | "sequence-flow"
    | "message-flow"
    | "association"
    | "data-object"
    | "data-store"
    | "pool-lane"
    | "annotation"
    | "group"
    | "conversation"
    | "choreography-task"
    | "message"
    | "generic" {
    if (stencil.includes("transaction")) return "transaction";
    if (stencil.includes("callactivity")) return "call-activity";
    if (stencil.includes("subprocess")) return "subprocess";
    if (stencil.includes("parallelgateway")) return "gateway-parallel";
    if (stencil.includes("inclusivegateway")) return "gateway-inclusive";
    if (stencil.includes("eventbasedgateway")) return "gateway-event";
    if (stencil.includes("complexgateway")) return "gateway-complex";
    if (stencil.includes("gateway")) return "gateway-exclusive";
    if (stencil.includes("boundaryevent")) return "event-boundary";
    if (stencil.includes("startevent")) return "event-start";
    if (stencil.includes("endevent")) return "event-end";
    if (stencil.includes("event")) return "event-intermediate";
    if (stencil.includes("messageflow")) return "message-flow";
    if (stencil.includes("sequenceflow")) return "sequence-flow";
    if (stencil.includes("association")) return "association";
    if (stencil.includes("dataobject")) return "data-object";
    if (stencil.includes("datastore")) return "data-store";
    if (stencil.includes("group")) return "group";
    if (stencil.includes("conversation")) return "conversation";
    if (stencil.includes("choreography")) return "choreography-task";
    if (
      stencil.includes("pool") ||
      stencil.includes("lane") ||
      stencil.includes("participant")
    )
      return "pool-lane";
    if (stencil.includes("annotation")) return "annotation";
    if (stencil.includes("message")) return "message";
    if (
      stencil.includes("task") ||
      stencil.includes("activity") ||
      stencil.includes("callactivity")
    )
      return "task";
    return "generic";
  }

  private hasRoundedBackground(
    iconKind: ReturnType<FavoritesOverlay["getIconKind"]>,
  ): boolean {
    return (
      iconKind === "task" ||
      iconKind === "subprocess" ||
      iconKind === "call-activity" ||
      iconKind === "transaction" ||
      iconKind === "generic"
    );
  }

  private getIconSvg(
    iconKind: ReturnType<FavoritesOverlay["getIconKind"]>,
  ): string {
    const taskBase =
      '<rect x="16" y="18" width="108" height="68" rx="16" fill="#f6f4d4" stroke="#575757" stroke-width="3"/>';

    switch (iconKind) {
      case "task":
        return taskBase;
      case "subprocess":
        return '<rect x="20" y="18" width="100" height="68" rx="15" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><line x1="64" y1="74" x2="76" y2="74" stroke="#666" stroke-width="2.4"/><line x1="70" y1="68" x2="70" y2="80" stroke="#666" stroke-width="2.4"/>';
      case "call-activity":
        return '<rect x="16" y="18" width="108" height="68" rx="16" fill="#f6f4d4" stroke="#505050" stroke-width="4"/><rect x="22" y="24" width="96" height="56" rx="12" fill="none" stroke="#646464" stroke-width="2"/>';
      case "transaction":
        return '<rect x="16" y="18" width="108" height="68" rx="16" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><rect x="24" y="26" width="92" height="52" rx="10" fill="none" stroke="#666" stroke-width="2.2"/>';
      case "gateway-exclusive":
        return '<polygon points="70,12 120,52 70,92 20,52" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><line x1="55" y1="38" x2="85" y2="66" stroke="#636363" stroke-width="3"/><line x1="85" y1="38" x2="55" y2="66" stroke="#636363" stroke-width="3"/>';
      case "gateway-parallel":
        return '<polygon points="70,12 120,52 70,92 20,52" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><line x1="70" y1="33" x2="70" y2="71" stroke="#636363" stroke-width="3.2"/><line x1="51" y1="52" x2="89" y2="52" stroke="#636363" stroke-width="3.2"/>';
      case "gateway-inclusive":
        return '<polygon points="70,12 120,52 70,92 20,52" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><circle cx="70" cy="52" r="17" fill="none" stroke="#666" stroke-width="3"/>';
      case "gateway-event":
        return '<polygon points="70,12 120,52 70,92 20,52" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><circle cx="70" cy="52" r="14" fill="none" stroke="#666" stroke-width="2.6"/><polygon points="70,38 76,50 70,64 64,50" fill="#666"/>';
      case "gateway-complex":
        return '<polygon points="70,12 120,52 70,92 20,52" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><line x1="70" y1="32" x2="70" y2="72" stroke="#666" stroke-width="2.6"/><line x1="50" y1="52" x2="90" y2="52" stroke="#666" stroke-width="2.6"/><line x1="55" y1="37" x2="85" y2="67" stroke="#666" stroke-width="2.4"/><line x1="85" y1="37" x2="55" y2="67" stroke="#666" stroke-width="2.4"/>';
      case "event-start":
        return '<circle cx="70" cy="52" r="31" fill="#f6f4d4" stroke="#575757" stroke-width="3"/>';
      case "event-end":
        return '<circle cx="70" cy="52" r="31" fill="#f6f4d4" stroke="#4d4d4d" stroke-width="5"/>';
      case "event-intermediate":
        return '<circle cx="70" cy="52" r="31" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><circle cx="70" cy="52" r="24" fill="none" stroke="#666" stroke-width="2"/>';
      case "event-boundary":
        return '<circle cx="70" cy="52" r="31" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><circle cx="70" cy="52" r="24" fill="none" stroke="#666" stroke-width="2"/><circle cx="70" cy="52" r="6" fill="#737373"/>';
      case "sequence-flow":
        return '<line x1="18" y1="52" x2="120" y2="52" stroke="#5a5a5a" stroke-width="4" stroke-linecap="round"/><polygon points="120,52 102,42 102,62" fill="#5a5a5a"/>';
      case "message-flow":
        return '<line x1="16" y1="52" x2="120" y2="52" stroke="#6a6a6a" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/><polygon points="120,52 103,42 103,62" fill="#6a6a6a"/><rect x="52" y="35" width="34" height="24" rx="2" fill="#f6f4d4" stroke="#666" stroke-width="2"/>';
      case "association":
        return '<line x1="18" y1="52" x2="120" y2="52" stroke="#737373" stroke-width="3" stroke-dasharray="5 5" stroke-linecap="round"/>';
      case "data-object":
        return '<path d="M32 18 H90 L108 36 V86 H32 Z" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><path d="M90 18 V36 H108" fill="none" stroke="#575757" stroke-width="3"/>';
      case "data-store":
        return '<ellipse cx="70" cy="28" rx="34" ry="11" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><path d="M36 28 V76 C36 83 51 88 70 88 C89 88 104 83 104 76 V28" fill="#f6f4d4" stroke="#575757" stroke-width="3"/>';
      case "pool-lane":
        return '<rect x="16" y="16" width="108" height="72" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><line x1="42" y1="16" x2="42" y2="88" stroke="#666" stroke-width="2.6"/><line x1="42" y1="52" x2="124" y2="52" stroke="#666" stroke-width="2.2"/>';
      case "annotation":
        return '<path d="M44 20 H112 M44 20 V84 M44 84 H112" fill="none" stroke="#666" stroke-width="3"/>';
      case "group":
        return '<rect x="18" y="18" width="104" height="68" rx="10" fill="none" stroke="#666" stroke-width="3" stroke-dasharray="7 6"/>';
      case "conversation":
        return '<polygon points="70,14 116,38 116,66 70,90 24,66 24,38" fill="#f6f4d4" stroke="#575757" stroke-width="3"/>';
      case "choreography-task":
        return '<rect x="16" y="18" width="108" height="68" rx="10" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><rect x="16" y="18" width="108" height="14" rx="10" fill="none" stroke="#666" stroke-width="2"/><rect x="16" y="72" width="108" height="14" rx="10" fill="none" stroke="#666" stroke-width="2"/>';
      case "message":
        return '<rect x="24" y="24" width="92" height="56" rx="8" fill="#f6f4d4" stroke="#575757" stroke-width="3"/><path d="M24 28 L70 58 L116 28" fill="none" stroke="#666" stroke-width="2.8"/>';
      case "generic":
      default:
        return taskBase;
    }
  }

  private moveSelectionByKey(key: string): void {
    const currentIndex = this.filtered.findIndex(
      (favorite) => favorite.id === this.selectedId,
    );
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

  private moveSelectionToLeftNeighborOnDelete(): void {
    const currentIndex = this.filtered.findIndex(
      (favorite) => favorite.id === this.selectedId,
    );
    if (currentIndex < 0) {
      return;
    }

    if (currentIndex > 0) {
      this.selectedId = this.filtered[currentIndex - 1]?.id ?? null;
      return;
    }

    this.selectedId = this.filtered[1]?.id ?? null;
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
        this.moveSelectionToLeftNeighborOnDelete();
        void this.actions.onDelete(selected);
      }
      return;
    }

    const isArrow = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ].includes(event.key);
    const isPrintable =
      event.key.length === 1 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey;

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

    if (
      event.altKey &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
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
        padding: 2px;
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
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 14px;
        align-content: start;
        width: 100%;
        padding: 2px;
      }

      .bpkeys-card {
        border: 1px solid transparent;
        display: grid;
        place-items: center;
        grid-template-rows: 1fr auto;
        gap: 9px;
        height: 170px;
        border-radius: 22px;
        background: radial-gradient(circle at 40% 30%, #31353d 0%, #1c2026 72%);
        color: #ececec;
        cursor: pointer;
        transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
        outline: none;
        overflow: visible;
      }

      .bpkeys-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
      }

      .bpkeys-card.selected {
        border-color: rgba(236, 236, 236, 0.72);
        box-shadow: 0 0 0 1px rgba(236, 236, 236, 0.18) inset;
      }

      .bpkeys-preview {
        width: 138px;
        height: 108px;
        border-radius: 16px;
        background: transparent;
        border: 1px solid transparent;
        margin-top: 11px;
        display: grid;
        place-items: center;
        overflow: visible;
        position: relative;
      }

      .bpkeys-preview.rounded-bg {
        background: linear-gradient(145deg, #f6f4d4, #ebe8b6);
        border-color: rgba(43, 43, 43, 0.28);
      }

      .bpkeys-preview.shape-only {
        border: none;
      }

      .bpkeys-preview.has-content {
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08) inset;
      }

      .bpkeys-preview.is-empty {
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
      }

      .bpkeys-preview-svg {
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      .bpkeys-preview.is-empty .bpkeys-preview-svg {
        opacity: 0.94;
      }

      .bpkeys-badge-row {
        position: absolute;
        top: -6px;
        right: -6px;
        display: flex;
        gap: 4px;
      }

      .bpkeys-badge {
        width: 23px;
        height: 23px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: rgba(19, 24, 32, 0.95);
        border: 1px solid rgba(244, 244, 244, 0.46);
        color: #f1f1f1;
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.32);
      }

      .bpkeys-badge svg {
        width: 16px;
        height: 16px;
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
          grid-template-columns: repeat(auto-fill, minmax(146px, 1fr));
          gap: 10px;
        }

        .bpkeys-card {
          height: 148px;
          border-radius: 18px;
        }

        .bpkeys-preview {
          width: 112px;
          height: 86px;
          border-radius: 14px;
        }

        .bpkeys-card-label {
          font-size: 13px;
        }
      }
    `;
  }
}
