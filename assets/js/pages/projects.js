import { api } from "../utils/api.js";
import { store } from "../store.js";
import { toast } from "../components/toast.js";

function buildHref(path, query) {
  const qs = new URLSearchParams(query).toString();
  return qs ? `#${path}?${qs}` : `#${path}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatBudget(p) {
  if (p.budgetFrom || p.budgetTo) {
    const from = p.budgetFrom != null ? `${p.budgetFrom.toLocaleString("ru-RU")}` : "—";
    const to = p.budgetTo != null ? `${p.budgetTo.toLocaleString("ru-RU")}` : "—";
    return `${from} – ${to} ₸`;
  }
  return "По договорённости";
}

function difficultyBadgeClass(value) {
  const v = String(value || "");
  if (v === "junior") return "badge--success";
  if (v === "middle") return "badge--primary";
  if (v === "senior") return "badge--warning";
  return "badge--primary";
}

function flash(el) {
  if (!(el instanceof HTMLElement)) return;
  el.classList.remove("ui-flash");
  void el.offsetWidth;
  el.classList.add("ui-flash");
}

function readIdSet(storageKey) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const arr = JSON.parse(raw || "[]");
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((x) => String(x)));
  } catch {
    return new Set();
  }
}

function writeIdSet(storageKey, set) {
  const arr = Array.from(set);
  window.localStorage.setItem(storageKey, JSON.stringify(arr));
}

function savedProjectKey(userId) {
  return `hjp:savedProjectIds:${String(userId)}`;
}

function readSavedProjectsForUser(userId) {
  const userKey = savedProjectKey(userId);
  if (window.localStorage.getItem(userKey) != null) {
    return readIdSet(userKey);
  }
  return readIdSet("hjp:savedProjectIds");
}

export function renderProjects(ctx = {}) {
  api.initMockData();
  store.refreshCurrentUser();
  const projects = api.getProjects();

  const userId = store.state.currentUser?.id;
  const savedSet = userId ? readSavedProjectsForUser(userId) : null;

  const q = String(ctx.query?.q || "").trim().toLowerCase();
  const difficulty = String(ctx.query?.difficulty || "");
  const category = String(ctx.query?.category || "");
  const minBudget = String(ctx.query?.minBudget || "");
  const maxBudget = String(ctx.query?.maxBudget || "");
  const savedOnly = String(ctx.query?.saved || "") === "1";

  const categoryOptions = Array.from(
    new Set(projects.map((p) => String(p.category || "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "ru"));

  const filtered = projects.filter((p) => {
    if (savedOnly && savedSet && !savedSet.has(String(p.id))) return false;
    if (difficulty && String(p.difficulty) !== difficulty) return false;
    if (category && String(p.category) !== category) return false;

    const min = Number.parseInt(minBudget, 10);
    const max = Number.parseInt(maxBudget, 10);
    if (Number.isFinite(min) || Number.isFinite(max)) {
      const from = p.budgetFrom != null ? Number(p.budgetFrom) : p.budgetTo != null ? Number(p.budgetTo) : 0;
      const to = p.budgetTo != null ? Number(p.budgetTo) : p.budgetFrom != null ? Number(p.budgetFrom) : Number.POSITIVE_INFINITY;
      if (Number.isFinite(min) && from < min) return false;
      if (Number.isFinite(max) && to > max) return false;
    }
    if (!q) return true;

    const hay = [p.title, p.category, p.deadlineText, p.difficulty, ...(p.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const items = filtered
    .map((p) => {
      const safeTitle = escapeHtml(p.title);
      const safeCategory = escapeHtml(p.category);
      const safeDeadline = escapeHtml(p.deadlineText);
      const safeDifficulty = escapeHtml(p.difficulty);
      const budget = escapeHtml(formatBudget(p));
      const desc = escapeHtml(String(p.description || "").trim()).slice(0, 160);
      const tags = (p.tags || []).slice(0, 6).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
      const saved = Boolean(savedSet && savedSet.has(String(p.id)));

      return `
        <div class="bento-card">
          <div class="bento-card__inner">
            <div class="bento-title">
              <a class="link-plain" href="#/projects/${p.id}">${safeTitle}</a>
            </div>
            <div class="bento-meta">
              <span>${safeCategory}</span>
              <span>${safeDeadline}</span>
              <span class="badge ${difficultyBadgeClass(p.difficulty)}">${safeDifficulty}</span>
              <span>${budget}</span>
            </div>
            <div class="text-small text-muted">${desc}${String(p.description || "").length > 160 ? "…" : ""}</div>
            <div class="tags">${tags}</div>
            <div>
              <a class="btn btn--ghost" href="#/projects/${p.id}">Подробнее</a>
              <button
                class="btn btn--ghost"
                type="button"
                data-save="project"
                data-id="${escapeHtml(p.id)}"
                aria-pressed="${saved ? "true" : "false"}"
              >${saved ? "Сохранено" : "Сохранить"}</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  const activeChips = [];
  if (q) activeChips.push({ key: "q", label: `Поиск: ${q}` });
  if (difficulty) activeChips.push({ key: "difficulty", label: `Уровень: ${difficulty}` });
  if (category) activeChips.push({ key: "category", label: `Категория: ${category}` });
  if (minBudget) activeChips.push({ key: "minBudget", label: `Бюджет от: ${minBudget}` });
  if (maxBudget) activeChips.push({ key: "maxBudget", label: `Бюджет до: ${maxBudget}` });
  if (savedOnly && userId) activeChips.push({ key: "saved", label: "Только сохранённые" });

  const chipsHtml = activeChips.length
    ? `
        <div class="tags mt-12" aria-label="Активные фильтры">
          ${activeChips
            .map(({ key, label }) => {
              const nextQuery = { ...ctx.query };
              delete nextQuery[key];
              return `<a class="tag" href="${buildHref("/projects", nextQuery)}">${escapeHtml(label)}</a>`;
            })
            .join("")}
        </div>
      `
    : ``;

  const filtersOpen = activeChips.length > 0;

  const empty = `
    <div class="empty-state">
      <div class="empty-title">Ничего не найдено</div>
      <div class="text-muted text-small">Попробуй изменить запрос или сбросить фильтры.</div>
      <div class="btn-row">
        <a class="btn btn--ghost" href="#/projects">Сбросить</a>
      </div>
    </div>
  `;

  return `
    <div class="container">
      <div class="page-head">
        <div>
          <h1>Фриланс-проекты</h1>
          <p class="text-muted mt-8">Реалистичные задачи для дизайна, разработки, QA, контента и аналитики.</p>
        </div>
      </div>

      <details class="filters-collapsible section-gap" ${filtersOpen ? "open" : ""}>
        <summary class="filters-summary">Фильтры${activeChips.length ? ` · ${activeChips.length}` : ""}</summary>
        <div class="filters-panel">
        <div class="filters filters-panel__inner">
        <form id="projects-filters" class="grid-12">
          <div class="col-span-12 sm:col-span-6 lg:col-span-4">
            <label class="text-small text-muted">Поиск</label>
            <input name="q" type="text" value="${escapeHtml(q)}" placeholder="Например: Figma, SQL, аудит, лендинг..." />
          </div>
          <div class="col-span-12 sm:col-span-6 lg:col-span-4">
            <label class="text-small text-muted">Уровень</label>
            <select name="difficulty">
              <option value="" ${difficulty === "" ? "selected" : ""}>Любой</option>
              <option value="junior" ${difficulty === "junior" ? "selected" : ""}>junior</option>
              <option value="middle" ${difficulty === "middle" ? "selected" : ""}>middle</option>
              <option value="senior" ${difficulty === "senior" ? "selected" : ""}>senior</option>
              <option value="any" ${difficulty === "any" ? "selected" : ""}>any</option>
            </select>
          </div>
          <div class="col-span-12 sm:col-span-6 lg:col-span-4">
            <label class="text-small text-muted">Категория</label>
            <select name="category">
              <option value="" ${category === "" ? "selected" : ""}>Любая</option>
              ${categoryOptions
                .map((c) => `<option value="${escapeHtml(c)}" ${category === c ? "selected" : ""}>${escapeHtml(c)}</option>`)
                .join("")}
            </select>
          </div>
          <div class="col-span-12 sm:col-span-6 lg:col-span-4">
            <label class="text-small text-muted">Бюджет от (₸)</label>
            <input name="minBudget" type="number" inputmode="numeric" value="${escapeHtml(minBudget)}" placeholder="например 150000" />
          </div>
          <div class="col-span-12 sm:col-span-6 lg:col-span-4">
            <label class="text-small text-muted">Бюджет до (₸)</label>
            <input name="maxBudget" type="number" inputmode="numeric" value="${escapeHtml(maxBudget)}" placeholder="например 900000" />
          </div>
          ${userId ? `
            <div class="col-span-12 sm:col-span-6 lg:col-span-4">
              <label class="text-small text-muted">Показывать</label>
              <label class="toggle">
                <input name="saved" type="checkbox" ${savedOnly ? "checked" : ""} />
                <span class="toggle__ui" aria-hidden="true"></span>
                <span>Только сохранённые</span>
              </label>
            </div>
          ` : ``}
          <div class="col-span-12 lg:col-span-4 actions-row">
            <button type="submit" class="btn btn--primary">Применить</button>
            <a class="btn btn--ghost" href="#/projects">Сбросить</a>
          </div>
        </form>
        </div>
        </div>
      </details>
      ${chipsHtml}

      <div class="cards-grid section-gap">${items || empty}</div>
    </div>
  `;
}

export function mountProjects(ctx = {}) {
  const form = document.getElementById("projects-filters");
  if (!form) return;

  const filters = document.querySelector(".filters-collapsible");
  if (filters instanceof HTMLDetailsElement && filters.dataset.animBound !== "1") {
    filters.dataset.animBound = "1";
    const summary = filters.querySelector(".filters-summary");
    const panel = filters.querySelector(".filters-panel");

    if (summary instanceof HTMLElement && panel instanceof HTMLElement) {
      const runOpen = () => {
        panel.classList.add("is-motion");
        panel.style.height = "0px";
        panel.style.opacity = "0";
        panel.style.transform = "translateY(-6px)";

        const h = panel.scrollHeight;
        requestAnimationFrame(() => {
          panel.style.height = `${h}px`;
          panel.style.opacity = "1";
          panel.style.transform = "translateY(0)";
        });

        const onEnd = () => {
          panel.removeEventListener("transitionend", onEnd);
          panel.classList.remove("is-motion");
          panel.style.height = "";
          panel.style.opacity = "";
          panel.style.transform = "";
        };
        panel.addEventListener("transitionend", onEnd);
      };

      const runClose = () => {
        panel.classList.add("is-motion");
        const h = panel.scrollHeight;
        panel.style.height = `${h}px`;
        panel.style.opacity = "1";
        panel.style.transform = "translateY(0)";

        requestAnimationFrame(() => {
          panel.style.height = "0px";
          panel.style.opacity = "0";
          panel.style.transform = "translateY(-6px)";
        });

        const onEnd = () => {
          panel.removeEventListener("transitionend", onEnd);
          filters.open = false;
          filters.classList.remove("is-closing");
          panel.classList.remove("is-motion");
          panel.style.height = "";
          panel.style.opacity = "";
          panel.style.transform = "";
        };
        panel.addEventListener("transitionend", onEnd);
      };

      summary.addEventListener("click", (e) => {
        e.preventDefault();
        if (panel.classList.contains("is-motion")) return;
        if (filters.open) {
          filters.classList.add("is-closing");
          runClose();
          return;
        }
        filters.classList.remove("is-closing");
        filters.open = true;
        runOpen();
      });
    }
  }

  const cards = document.querySelector(".cards-grid");
  if (cards && cards.dataset.saveBound !== "1") {
    cards.dataset.saveBound = "1";

    cards.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const btn = t.closest("button[data-save=\"project\"]");
      if (!(btn instanceof HTMLButtonElement)) return;

      const id = btn.dataset.id;
      if (!id) return;

      const userId = store.state.currentUser?.id;
      if (!userId) {
        toast.info("Войдите, чтобы сохранять проекты");
        window.location.hash = "#/login";
        return;
      }

      const key = savedProjectKey(userId);
      const set = readSavedProjectsForUser(userId);
      const s = String(id);

      if (set.has(s)) {
        set.delete(s);
        writeIdSet(key, set);
        btn.setAttribute("aria-pressed", "false");
        btn.textContent = "Сохранить";
        flash(btn);
        toast.info("Убрано из сохранённых");
        return;
      }

      set.add(s);
      writeIdSet(key, set);
      btn.setAttribute("aria-pressed", "true");
      btn.textContent = "Сохранено";
      flash(btn);
      toast.success("Сохранено");
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const nextQ = String(fd.get("q") || "").trim();
    const nextDifficulty = String(fd.get("difficulty") || "");
    const nextCategory = String(fd.get("category") || "");
    const nextMinBudget = String(fd.get("minBudget") || "").trim();
    const nextMaxBudget = String(fd.get("maxBudget") || "").trim();
    const nextSavedOnly = fd.get("saved") ? "1" : "";

    const query = {};
    if (nextQ) query.q = nextQ;
    if (nextDifficulty) query.difficulty = nextDifficulty;
    if (nextCategory) query.category = nextCategory;
    if (nextMinBudget) query.minBudget = nextMinBudget;
    if (nextMaxBudget) query.maxBudget = nextMaxBudget;
    if (nextSavedOnly) query.saved = nextSavedOnly;

    window.location.hash = buildHref("/projects", query).slice(1);
  });
}
