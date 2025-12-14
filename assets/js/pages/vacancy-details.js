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

function formatSalary(v) {
  if (v.salaryFrom || v.salaryTo) {
    const from = v.salaryFrom != null ? `${Number(v.salaryFrom).toLocaleString("ru-RU")}` : "—";
    const to = v.salaryTo != null ? `${Number(v.salaryTo).toLocaleString("ru-RU")}` : "—";
    return `${from} – ${to} ₸`;
  }
  return "По договорённости";
}

function workModeLabel(mode) {
  if (mode === "remote") return "Remote";
  if (mode === "hybrid") return "Hybrid";
  return "Office";
}

function employmentTypeLabel(value) {
  const v = String(value || "");
  if (v === "part_time") return "Part‑time";
  if (v === "contract") return "Contract";
  if (v === "internship") return "Internship";
  return "Full‑time";
}

function renderBullets(items) {
  const arr = Array.isArray(items) ? items.filter(Boolean) : [];
  if (arr.length === 0) return "<div class=\"text-muted text-small\">Нет данных</div>";
  return `<ul class="mt-10">${arr.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
}

function scoreSimilarVacancy(a, b) {
  if (!a || !b) return 0;
  let score = 0;
  if (String(a.city || "") && String(a.city || "") === String(b.city || "")) score += 2;
  if (String(a.workMode || "") && String(a.workMode || "") === String(b.workMode || "")) score += 1;
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

function isVacancySaved(id, userId) {
  if (!userId) return false;
  return readSavedVacanciesForUser(userId).has(String(id));
}

export function renderVacancyDetails(ctx = {}) {
  api.initMockData();

  const id = ctx.params?.id;
  const vacancy = api.getVacancyById(id);

  if (!vacancy) {
    return `
      <div class="container">
        <div class="bento-card">
          <div class="bento-card__inner">
          <h1>Вакансия не найдена</h1>
          <p class="text-muted mt-10">Возможно, вакансия была удалена или ссылка устарела.</p>
          <div class="btn-row mt-14">
            <a class="btn btn--ghost" href="#/vacancies">К списку вакансий</a>
          </div>
          </div>
        </div>
      </div>
    `;
  }

  const title = escapeHtml(vacancy.title);
  const company = escapeHtml(vacancy.companyName);
  const city = escapeHtml(vacancy.city);
  const salary = escapeHtml(formatSalary(vacancy));
  const employmentType = employmentTypeLabel(String(vacancy.employmentType || "full_time"));
  const mode = workModeLabel(String(vacancy.workMode || (vacancy.remote ? "remote" : "office")));
  const tags = (vacancy.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
  const description = escapeHtml(String(vacancy.description || "").trim());
  const saved = isVacancySaved(id, store.state.currentUser?.id);

  const companyAbout = vacancy.companyAbout || {};
  const companyIndustry = escapeHtml(companyAbout.industry || "—");
  const companySize = escapeHtml(companyAbout.size || "—");
  const companyWebsite = String(companyAbout.website || "").trim();
  const companyAboutText = escapeHtml(companyAbout.about || "");

  const all = api.getVacancies();
  const similar = all
    .filter((v) => v && String(v.id) !== String(id))
    .map((v) => ({ v, s: scoreSimilarVacancy(vacancy, v) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(({ v }) => v);

  const similarHtml = similar.length
    ? `
        <div class="section-gap">
          <h2>Похожие вакансии</h2>
          <div class="cards-grid mt-12">
            ${similar
              .map((v) => {
                const t = escapeHtml(v.title);
                const c = escapeHtml(v.companyName);
                const city = escapeHtml(v.city);
                return `
                  <div class="bento-card">
                    <div class="bento-card__inner">
                      <div class="bento-title"><a class="link-plain" href="#/vacancies/${escapeHtml(v.id)}">${t}</a></div>
                      <div class="bento-subtitle">${c}</div>
                      <div class="bento-meta mt-12"><span>${city}</span></div>
                      <div class="mt-14"><a class="btn btn--ghost" href="#/vacancies/${escapeHtml(v.id)}">Открыть</a></div>
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
        <p class="text-muted mt-10">${company}</p>

        <div class="bento-meta mt-12">
          <span>${city}</span>
          <span class="badge badge--primary">${escapeHtml(mode)}</span>
          <span class="badge badge--success">${escapeHtml(employmentType)}</span>
          <span>${salary}</span>
        </div>

        <div class="tags mt-12">${tags}</div>
        <p class="mt-14">${description}</p>

        <div class="section-gap">
          <h2>Обязанности</h2>
          ${renderBullets(vacancy.responsibilities)}
        </div>

        <div class="section-gap">
          <h2>Требования</h2>
          ${renderBullets(vacancy.requirements)}
        </div>

        <div class="section-gap">
          <h2>Условия</h2>
          ${renderBullets(vacancy.conditions)}
        </div>

        <div class="section-gap">
          <h2>Этапы найма</h2>
          ${renderBullets(vacancy.hiringStages)}
        </div>

        <div class="section-gap">
          <h2>О компании</h2>
          <div class="bento-meta mt-12">
            <span>Отрасль: ${companyIndustry}</span>
            <span>Размер: ${companySize}</span>
            <span>
              Сайт:
              ${companyWebsite ? `<a class="link" href="${escapeHtml(companyWebsite)}" target="_blank" rel="noreferrer">${escapeHtml(companyWebsite)}</a>` : "—"}
            </span>
          </div>
          ${companyAboutText ? `<p class="mt-14">${companyAboutText}</p>` : `<div class="text-muted text-small mt-14">Нет описания</div>`}
        </div>

        <div class="btn-row mt-16">
          <a class="btn btn--ghost" href="#/vacancies">Назад</a>
          <button class="btn btn--primary" type="button" id="vacancy-apply-btn">Откликнуться</button>
          <button
            class="btn btn--ghost"
            type="button"
            id="vacancy-save-btn"
            aria-pressed="${saved ? "true" : "false"}"
          >${saved ? "Сохранено" : "Сохранить"}</button>
          <button class="btn btn--ghost" type="button" id="vacancy-share-btn">Поделиться</button>
        </div>
        </div>
      </div>
      ${similarHtml}
    </div>
  `;
}

export function mountVacancyDetails(ctx = {}) {
  const id = ctx.params?.id;
  if (!id) return;

  const applyBtn = document.getElementById("vacancy-apply-btn");
  const saveBtn = document.getElementById("vacancy-save-btn");
  const shareBtn = document.getElementById("vacancy-share-btn");

  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      flash(applyBtn);
      if (!store.state.currentUser) {
        toast.info("Войдите, чтобы откликнуться");
        window.location.hash = "#/login";
        return;
      }

      toast.success("Отклик отправлен (демо)");
    });
  }

  if (saveBtn) {
    const userId = store.state.currentUser?.id;

    if (!userId) {
      saveBtn.addEventListener("click", () => {
        flash(saveBtn);
        toast.info("Войдите, чтобы сохранять вакансии");
        window.location.hash = "#/login";
      });
      return;
    }

    const key = savedVacancyKey(userId);
    const set = readSavedVacanciesForUser(userId);

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
