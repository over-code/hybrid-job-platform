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

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const letters = parts.map((p) => p[0]).join("");
  return (letters || "HH").toUpperCase();
}

function formatSalary(v) {
  if (v.salaryFrom || v.salaryTo) {
    const from = v.salaryFrom != null ? `${v.salaryFrom.toLocaleString("ru-RU")}` : "—";
    const to = v.salaryTo != null ? `${v.salaryTo.toLocaleString("ru-RU")}` : "—";
    return `${from} – ${to} ₸`;
  }
  return "По договорённости";
}

function getWorkMode(v) {
  const mode = String(v.workMode || "");
  if (mode === "remote" || mode === "hybrid" || mode === "office") return mode;
  return v.remote ? "remote" : "office";
}

function workModeLabel(mode) {
  if (mode === "remote") return "Remote";
  if (mode === "hybrid") return "Hybrid";
  return "Office";
}

function employmentTypeLabel(value) {
  const v = String(value || "");
  if (v === "part_time") return "Частичная";
  if (v === "contract") return "Контракт";
  if (v === "internship") return "Стажировка";
  return "Полная";
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

function savedVacancyKey(userId) {
  return `hjp:savedVacancyIds:${String(userId)}`;
}

function readSavedVacanciesForUser(userId) {
  const userKey = savedVacancyKey(userId);
  if (window.localStorage.getItem(userKey) != null) {
    return readIdSet(userKey);
  }
  return readIdSet("hjp:savedVacancyIds");
}

export function renderVacancies(ctx = {}) {
  api.initMockData();
  store.refreshCurrentUser();
  const vacancies = api.getVacancies();
  const q = String(ctx.query?.q || "").trim().toLowerCase();
  const mode = String(ctx.query?.mode || "");
  const city = String(ctx.query?.city || "");
  const employmentType = String(ctx.query?.employmentType || "");
  const minSalary = String(ctx.query?.minSalary || "");
  const maxSalary = String(ctx.query?.maxSalary || "");
  const savedOnly = String(ctx.query?.saved || "") === "1";

  const userId = store.state.currentUser?.id;
  const savedSet = userId ? readSavedVacanciesForUser(userId) : null;

  const cityOptions = Array.from(new Set(vacancies.map((v) => String(v.city || "").trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "ru"));

  const employmentTypeOptions = [
    { value: "full_time", label: "Полная занятость" },
    { value: "part_time", label: "Частичная" },
    { value: "contract", label: "Контракт" },
    { value: "internship", label: "Стажировка" },
  ];

  const filtered = vacancies.filter((v) => {
    if (savedOnly && savedSet && !savedSet.has(String(v.id))) return false;
    if (mode) {
      const currentMode = getWorkMode(v);
      if (mode === "remote" && currentMode !== "remote") return false;
      if (mode === "hybrid" && currentMode !== "hybrid") return false;
      if (mode === "office" && currentMode !== "office") return false;
    }

    if (city && String(v.city || "") !== city) return false;
    if (employmentType && String(v.employmentType || "") !== employmentType) return false;

    const min = Number.parseInt(minSalary, 10);
    const max = Number.parseInt(maxSalary, 10);
    if (Number.isFinite(min) || Number.isFinite(max)) {
      const from = v.salaryFrom != null ? Number(v.salaryFrom) : v.salaryTo != null ? Number(v.salaryTo) : 0;
      const to = v.salaryTo != null ? Number(v.salaryTo) : v.salaryFrom != null ? Number(v.salaryFrom) : Number.POSITIVE_INFINITY;
      if (Number.isFinite(min) && from < min) return false;
      if (Number.isFinite(max) && to > max) return false;
    }

    if (!q) return true;

    const hay = [v.title, v.companyName, v.city, employmentTypeLabel(v.employmentType), ...(v.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const totalCount = vacancies.length;
  const shownCount = filtered.length;

  const items = filtered
    .map((v) => {
      const safeTitle = escapeHtml(v.title);
      const safeCompany = escapeHtml(v.companyName);
      const safeCity = escapeHtml(v.city);
      const modeLabel = workModeLabel(getWorkMode(v));
      const empLabel = employmentTypeLabel(v.employmentType);
      const salary = formatSalary(v);
      const desc = escapeHtml(String(v.description || "").trim()).slice(0, 160);
      const tags = (v.tags || []).slice(0, 6).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
      const saved = Boolean(savedSet && savedSet.has(String(v.id)));

      return `
        <div class="bento-card">
          <div class="bento-card__inner">
            <div class="bento-top">
              <div class="logo-badge" aria-hidden="true">${initials(v.companyName)}</div>
              <div class="min-w-0">
                <div class="bento-title">
                  <a class="link-plain" href="#/vacancies/${v.id}">${safeTitle}</a>
                </div>
                <div class="bento-subtitle">${safeCompany}</div>
              </div>
            </div>

            <div class="bento-meta">
              <span>${safeCity}</span>
              <span class="badge badge--primary">${escapeHtml(modeLabel)}</span>
              <span class="badge badge--success">${escapeHtml(empLabel)}</span>
              <span>${escapeHtml(salary)}</span>
            </div>

            <div class="text-small text-muted">${desc}${String(v.description || "").length > 160 ? "…" : ""}</div>
            <div class="tags">${tags}</div>

            <div>
              <a class="btn btn--ghost" href="#/vacancies/${v.id}">Подробнее</a>
              <button
                class="btn btn--ghost"
                type="button"
                data-save="vacancy"
                data-id="${escapeHtml(v.id)}"
                aria-pressed="${saved ? "true" : "false"}"
              >${saved ? "Сохранено" : "Сохранить"}</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  const empty = `
    <div class="empty-state">
      <div class="empty-title">Ничего не найдено</div>
      <div class="text-muted text-small">Попробуй изменить запрос или сбросить фильтры.</div>
      <div class="btn-row">
        <a class="btn btn--ghost" href="#/vacancies">Сбросить</a>
      </div>
    </div>
  `;

  const activeChips = [];
  if (q) activeChips.push({ key: "q", label: `Поиск: ${q}` });
  if (mode) activeChips.push({ key: "mode", label: `Формат: ${workModeLabel(mode)}` });
  if (city) activeChips.push({ key: "city", label: `Город: ${city}` });
  if (employmentType) {
    const label = employmentTypeOptions.find((x) => x.value === employmentType)?.label || employmentType;
    activeChips.push({ key: "employmentType", label: `Занятость: ${label}` });
  }
  if (minSalary) activeChips.push({ key: "minSalary", label: `ЗП от: ${minSalary}` });
  if (maxSalary) activeChips.push({ key: "maxSalary", label: `ЗП до: ${maxSalary}` });
  if (savedOnly && userId) activeChips.push({ key: "saved", label: "Только сохранённые" });

  const chipsHtml = activeChips.length
    ? `
        <div class="tags mt-12" aria-label="Активные фильтры">
          ${activeChips
            .map(({ key, label }) => {
              const nextQuery = { ...ctx.query };
              delete nextQuery[key];
              return `<a class="tag" href="${buildHref("/vacancies", nextQuery)}">${escapeHtml(label)}</a>`;
            })
            .join("")}
        </div>
      `
    : ``;

  const filtersOpen = activeChips.length > 0;

  return `
    <div class="container">
      <div class="page-head">
        <div>
          <h1>Вакансии в IT</h1>
          <p class="text-muted mt-8">Подборка ролей не только для разработчиков: дизайн, QA, DevOps, аналитика, менеджмент и контент.</p>
          <div class="text-muted text-small mt-8">Показано: ${shownCount} из ${totalCount}</div>
        </div>
      </div>

      <details class="filters-collapsible section-gap" ${filtersOpen ? "open" : ""}>
        <summary class="filters-summary">Фильтры${activeChips.length ? ` · ${activeChips.length}` : ""}</summary>
        <div class="filters-panel">
        <div class="filters filters-panel__inner">
        <form id="vacancies-filters" class="grid-12">
          <div class="col-span-12 sm:col-span-6 lg:col-span-4">
            <label class="text-small text-muted">Поиск</label>
            <input name="q" type="text" value="${escapeHtml(q)}" placeholder="Например: React, Figma, QA, Алматы..." />
          </div>
          <div class="col-span-12 sm:col-span-6 lg:col-span-4">
            <label class="text-small text-muted">Формат</label>
            <select name="mode">
              <option value="" ${mode === "" ? "selected" : ""}>Любой</option>
              <option value="remote" ${mode === "remote" ? "selected" : ""}>Remote</option>
              <option value="hybrid" ${mode === "hybrid" ? "selected" : ""}>Hybrid</option>
              <option value="office" ${mode === "office" ? "selected" : ""}>Office</option>
            </select>
          </div>
          <div class="col-span-12 sm:col-span-6 lg:col-span-4">
            <label class="text-small text-muted">Город</label>
            <select name="city">
              <option value="" ${city === "" ? "selected" : ""}>Любой</option>
              ${cityOptions
                .map((c) => `<option value="${escapeHtml(c)}" ${city === c ? "selected" : ""}>${escapeHtml(c)}</option>`)
                .join("")}
            </select>
          </div>
          <div class="col-span-12 sm:col-span-6 lg:col-span-4">
            <label class="text-small text-muted">Занятость</label>
            <select name="employmentType">
              <option value="" ${employmentType === "" ? "selected" : ""}>Любая</option>
              ${employmentTypeOptions
                .map(
                  (o) =>
                    `<option value="${o.value}" ${employmentType === o.value ? "selected" : ""}>${o.label}</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="col-span-12 sm:col-span-6 lg:col-span-4">
            <label class="text-small text-muted">Зарплата от (₸)</label>
            <input name="minSalary" type="number" inputmode="numeric" value="${escapeHtml(minSalary)}" placeholder="например 500000" />
          </div>
          <div class="col-span-12 sm:col-span-6 lg:col-span-4">
            <label class="text-small text-muted">Зарплата до (₸)</label>
            <input name="maxSalary" type="number" inputmode="numeric" value="${escapeHtml(maxSalary)}" placeholder="например 1200000" />
          </div>
          ${userId ? `
            <div class="col-span-12 sm:col-span-6 lg:col-span-4">
              <label class="text-small text-muted">Показывать</label>
              <label class="toggle mt-8">
                <input name="saved" type="checkbox" ${savedOnly ? "checked" : ""} />
                <span class="toggle__ui" aria-hidden="true"></span>
                <span>Только сохранённые</span>
              </label>
            </div>
          ` : ``}
          <div class="col-span-12 lg:col-span-4 actions-row">
            <button type="submit" class="btn btn--primary">Применить</button>
            <a class="btn btn--ghost" href="#/vacancies">Сбросить</a>
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

export function mountVacancies(ctx = {}) {
  const form = document.getElementById("vacancies-filters");
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
      const btn = t.closest("button[data-save=\"vacancy\"]");
      if (!(btn instanceof HTMLButtonElement)) return;

      const id = btn.dataset.id;
      if (!id) return;

      const userId = store.state.currentUser?.id;
      if (!userId) {
        toast.info("Войдите, чтобы сохранять вакансии");
        window.location.hash = "#/login";
        return;
      }

      const key = savedVacancyKey(userId);
      const set = readSavedVacanciesForUser(userId);
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
    const nextMode = String(fd.get("mode") || "");
    const nextCity = String(fd.get("city") || "");
    const nextEmploymentType = String(fd.get("employmentType") || "");
    const nextMinSalary = String(fd.get("minSalary") || "").trim();
    const nextMaxSalary = String(fd.get("maxSalary") || "").trim();
    const nextSavedOnly = fd.get("saved") ? "1" : "";

    const query = {};
    if (nextQ) query.q = nextQ;
    if (nextMode) query.mode = nextMode;
    if (nextCity) query.city = nextCity;
    if (nextEmploymentType) query.employmentType = nextEmploymentType;
    if (nextMinSalary) query.minSalary = nextMinSalary;
    if (nextMaxSalary) query.maxSalary = nextMaxSalary;
    if (nextSavedOnly) query.saved = nextSavedOnly;

    window.location.hash = buildHref("/vacancies", query).slice(1);
  });
}
