import { api } from "../utils/api.js";
import { store } from "../store.js";
import { toast } from "../components/toast.js";

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
    const from = p.budgetFrom != null ? `${Number(p.budgetFrom).toLocaleString("ru-RU")}` : "—";
    const to = p.budgetTo != null ? `${Number(p.budgetTo).toLocaleString("ru-RU")}` : "—";
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

function renderBullets(items) {
  const arr = Array.isArray(items) ? items.filter(Boolean) : [];
  if (arr.length === 0) return "<div class=\"text-muted text-small\">Нет данных</div>";
  return `<ul class="mt-10">${arr.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
}

function scoreSimilarProject(a, b) {
  if (!a || !b) return 0;
  let score = 0;
  if (String(a.category || "") && String(a.category || "") === String(b.category || "")) score += 2;
  if (String(a.difficulty || "") && String(a.difficulty || "") === String(b.difficulty || "")) score += 1;
  const aTags = new Set((a.tags || []).map((t) => String(t).toLowerCase()));
  const bTags = (b.tags || []).map((t) => String(t).toLowerCase());
  for (const t of bTags) {
    if (aTags.has(t)) score += 1;
  }
  return score;
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

function isProjectSaved(id, userId) {
  if (!userId) return false;
  return readSavedProjectsForUser(userId).has(String(id));
}

export function renderProjectDetails(ctx = {}) {
  api.initMockData();

  const id = ctx.params?.id;
  const project = api.getProjectById(id);

  if (!project) {
    return `
      <div class="container">
        <div class="bento-card">
          <div class="bento-card__inner">
          <h1>Проект не найден</h1>
          <p class="text-muted mt-10">Проверь ссылку или открой каталог проектов.</p>
          <div class="btn-row mt-14">
            <a class="btn btn--ghost" href="#/projects">К списку проектов</a>
          </div>
          </div>
        </div>
      </div>
    `;
  }

  const title = escapeHtml(project.title);
  const category = escapeHtml(project.category);
  const deadlineText = escapeHtml(project.deadlineText);
  const difficulty = escapeHtml(project.difficulty);
  const budget = escapeHtml(formatBudget(project));
  const tags = (project.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  const description = escapeHtml(String(project.description || "").trim());
  const saved = isProjectSaved(id, store.state.currentUser?.id);

  const communication = project.communication || {};
  const channels = Array.isArray(communication.channels) ? communication.channels : [];
  const timezone = escapeHtml(communication.timezone || "—");
  const responseTime = escapeHtml(communication.responseTime || "—");
  const paymentTerms = escapeHtml(project.paymentTerms || "—");

  const clientAbout = project.clientAbout || {};
  const clientType = escapeHtml(clientAbout.type || "—");
  const clientDomain = escapeHtml(clientAbout.domain || "—");
  const clientText = escapeHtml(clientAbout.about || "");

  const all = api.getProjects();
  const similar = all
    .filter((p) => p && String(p.id) !== String(id))
    .map((p) => ({ p, s: scoreSimilarProject(project, p) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(({ p }) => p);

  const similarHtml = similar.length
    ? `
        <div class="section-gap">
          <h2>Похожие проекты</h2>
          <div class="cards-grid mt-12">
            ${similar
              .map((p) => {
                const t = escapeHtml(p.title);
                const c = escapeHtml(p.category);
                const d = escapeHtml(p.deadlineText);
                return `
                  <div class="bento-card">
                    <div class="bento-card__inner">
                      <div class="bento-title"><a class="link-plain" href="#/projects/${escapeHtml(p.id)}">${t}</a></div>
                      <div class="bento-meta mt-12"><span>${c}</span><span>${d}</span></div>
                      <div class="mt-14"><a class="btn btn--ghost" href="#/projects/${escapeHtml(p.id)}">Открыть</a></div>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      `
    : ``;

  return `
    <div class="container">
      <div class="bento-card bento-card--static">
        <div class="bento-card__inner">
        <h1>${title}</h1>

        <div class="bento-meta mt-12">
          <span>${category}</span>
          <span>${deadlineText}</span>
          <span class="badge ${difficultyBadgeClass(project.difficulty)}">${difficulty}</span>
          <span>${budget}</span>
        </div>

        <div class="tags mt-12">${tags}</div>
        <p class="mt-14">${description}</p>

        <div class="section-gap">
          <h2>Результаты (deliverables)</h2>
          ${renderBullets(project.deliverables)}
        </div>

        <div class="section-gap">
          <h2>Этапы работы</h2>
          ${renderBullets(project.milestones)}
        </div>

        <div class="section-gap">
          <h2>Критерии приёмки</h2>
          ${renderBullets(project.acceptanceCriteria)}
        </div>

        <div class="section-gap">
          <h2>Коммуникация и процесс</h2>
          <div class="bento-meta mt-12">
            <span>Таймзона: ${timezone}</span>
            <span>Ответ: ${responseTime}</span>
          </div>
          ${channels.length ? `<div class="tags mt-12">${channels.map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join("")}</div>` : `<div class="text-muted text-small mt-12">Нет данных</div>`}
        </div>

        <div class="section-gap">
          <h2>Оплата</h2>
          <p class="mt-12">${paymentTerms}</p>
        </div>

        <div class="section-gap">
          <h2>О клиенте</h2>
          <div class="bento-meta mt-12">
            <span>Тип: ${clientType}</span>
            <span>Домен: ${clientDomain}</span>
          </div>
          ${clientText ? `<p class="mt-14">${clientText}</p>` : `<div class="text-muted text-small mt-14">Нет описания</div>`}
        </div>

        <div class="btn-row mt-16">
          <a class="btn btn--ghost" href="#/projects">Назад</a>
          <button class="btn btn--primary" type="button" id="project-apply-btn">Откликнуться</button>
          <button
            class="btn btn--ghost"
            type="button"
            id="project-save-btn"
            aria-pressed="${saved ? "true" : "false"}"
          >${saved ? "Сохранено" : "Сохранить"}</button>
          <button class="btn btn--ghost" type="button" id="project-share-btn">Поделиться</button>
        </div>
        </div>
      </div>
      ${similarHtml}
    </div>
  `;
}

export function mountProjectDetails(ctx = {}) {
  const id = ctx.params?.id;
  if (!id) return;

  const applyBtn = document.getElementById("project-apply-btn");
  const saveBtn = document.getElementById("project-save-btn");
  const shareBtn = document.getElementById("project-share-btn");

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      flash(applyBtn);
      if (!store.state.currentUser) {
        toast.info("Войдите, чтобы откликнуться");
        window.location.hash = "#/login";
        return;
      }

      toast.success("Заявка отправлена (демо)");
    });
  }

  if (saveBtn) {
    const userId = store.state.currentUser?.id;

    if (!userId) {
      saveBtn.addEventListener("click", () => {
        flash(saveBtn);
        toast.info("Войдите, чтобы сохранять проекты");
        window.location.hash = "#/login";
      });
      return;
    }

    const key = savedProjectKey(userId);
    const set = readSavedProjectsForUser(userId);

    function sync() {
      const saved = set.has(String(id));
      saveBtn.setAttribute("aria-pressed", saved ? "true" : "false");
      saveBtn.textContent = saved ? "Сохранено" : "Сохранить";
    }

    sync();
    saveBtn.addEventListener("click", () => {
      flash(saveBtn);
      const s = String(id);
      if (set.has(s)) {
        set.delete(s);
        writeIdSet(key, set);
        sync();
        toast.info("Убрано из сохранённых");
        return;
      }

      set.add(s);
      writeIdSet(key, set);
      sync();
      toast.success("Сохранено");
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      flash(shareBtn);
      const url = window.location.href;

      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          await navigator.clipboard.writeText(url);
          toast.success("Ссылка скопирована");
          return;
        }
      } catch {
        // ignore
      }

      toast.info("Скопируйте ссылку из адресной строки");
    });
  }
}
