import { store } from "../store.js";
import { toast } from "../components/toast.js";
import { api } from "../utils/api.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(name) {
  const s = String(name || "").trim();
  if (!s) return "HH";
  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || parts[0]?.[1] || "";
  const out = (first + second).toUpperCase();
  return out || "HH";
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

function savedProjectKey(userId) {
  return `hjp:savedProjectIds:${String(userId)}`;
}

function readSavedVacanciesForUser(userId) {
  const userKey = savedVacancyKey(userId);
  if (window.localStorage.getItem(userKey) != null) {
    return readIdSet(userKey);
  }
  return readIdSet("hjp:savedVacancyIds");
}

function readSavedProjectsForUser(userId) {
  const userKey = savedProjectKey(userId);
  if (window.localStorage.getItem(userKey) != null) {
    return readIdSet(userKey);
  }
  return readIdSet("hjp:savedProjectIds");
}

export function renderProfile(ctx = {}) {
  const user = store.state.currentUser;
  api.initMockData();

  if (!user) {
    return `
      <div class="container">
        <div class="bento-card">
          <div class="bento-card__inner">
            <div class="page-head">
              <div>
                <h1 class="h1">Профиль</h1>
                <p class="text-muted">Войдите, чтобы управлять настройками аккаунта.</p>
              </div>
            </div>

            <div class="links-row">
              <a class="btn btn--primary" href="#/login">Войти</a>
              <a class="btn btn--ghost" href="#/register">Создать аккаунт</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const safeName = escapeHtml(user.name || "");
  const safeEmail = escapeHtml(user.email || "");
  const safeRole = escapeHtml(user.role || "");
  const safeAvatarUrl = escapeHtml(user.avatarUrl || "");

  const cp = user.candidateProfile && typeof user.candidateProfile === "object" ? user.candidateProfile : {};
  const cpLinks = cp.links && typeof cp.links === "object" ? cp.links : {};

  const cpHeadline = escapeHtml(cp.headline || "");
  const cpLevel = escapeHtml(cp.level || "");
  const cpCity = escapeHtml(cp.city || "");
  const cpWorkMode = escapeHtml(cp.workMode || "");
  const cpEmploymentType = escapeHtml(cp.employmentType || "");
  const cpExperienceYears = escapeHtml(cp.experienceYears || "");
  const cpSalaryFrom = escapeHtml(cp.salaryFrom || "");
  const cpSalaryTo = escapeHtml(cp.salaryTo || "");
  const cpStack = escapeHtml(cp.stack || "");
  const cpAbout = escapeHtml(cp.about || "");

  const cpPortfolio = escapeHtml(cpLinks.portfolio || "");
  const cpGithub = escapeHtml(cpLinks.github || "");
  const cpLinkedin = escapeHtml(cpLinks.linkedin || "");
  const cpTelegram = escapeHtml(cpLinks.telegram || "");

  const humanLevel = (v) => {
    switch (String(v || "")) {
      case "junior":
        return "Junior";
      case "middle":
        return "Middle";
      case "senior":
        return "Senior";
      case "lead":
        return "Lead";
      default:
        return "";
    }
  };

  const humanWorkMode = (v) => {
    switch (String(v || "")) {
      case "remote":
        return "Удалённо";
      case "hybrid":
        return "Гибрид";
      case "office":
        return "Офис";
      default:
        return "";
    }
  };

  const humanEmploymentType = (v) => {
    switch (String(v || "")) {
      case "full_time":
        return "Full-time";
      case "part_time":
        return "Part-time";
      case "contract":
        return "Contract";
      case "internship":
        return "Internship";
      default:
        return "";
    }
  };

  const candidateMeta = [
    humanLevel(cpLevel),
    cpExperienceYears ? `${cpExperienceYears} лет опыта` : "",
    cpCity,
    humanWorkMode(cpWorkMode),
    humanEmploymentType(cpEmploymentType),
  ].filter(Boolean);

  const candidateSalaryText =
    cpSalaryFrom || cpSalaryTo
      ? `${cpSalaryFrom ? `от ${cpSalaryFrom}` : ""}${cpSalaryFrom && cpSalaryTo ? " — " : ""}${cpSalaryTo ? `до ${cpSalaryTo}` : ""} ₸`
      : "";

  const candidateStackTags = (cp.stack || "")
    .split(",")
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 10);

  const telegramHref = cpTelegram
    ? cpTelegram.startsWith("@")
      ? `https://t.me/${cpTelegram.slice(1)}`
      : cpTelegram
    : "";

  const userId = user.id;
  const savedVacancyIds = Array.from(readSavedVacanciesForUser(userId));
  const savedProjectIds = Array.from(readSavedProjectsForUser(userId));

  const savedVacancyItems = savedVacancyIds
    .map((id) => {
      const v = api.getVacancyById(id);
      if (!v) return "";
      return `
        <div class="row" data-saved-item="vacancy" data-id="${escapeHtml(id)}">
          <a class="link-plain" href="#/vacancies/${escapeHtml(id)}">${escapeHtml(v.title)}</a>
          <button class="btn btn--ghost btn--mini" type="button" data-unsave="vacancy" data-id="${escapeHtml(
            id
          )}">Убрать</button>
        </div>
      `;
    })
    .filter(Boolean)
    .join("");

  const savedProjectItems = savedProjectIds
    .map((id) => {
      const p = api.getProjectById(id);
      if (!p) return "";
      return `
        <div class="row" data-saved-item="project" data-id="${escapeHtml(id)}">
          <a class="link-plain" href="#/projects/${escapeHtml(id)}">${escapeHtml(p.title)}</a>
          <button class="btn btn--ghost btn--mini" type="button" data-unsave="project" data-id="${escapeHtml(
            id
          )}">Убрать</button>
        </div>
      `;
    })
    .filter(Boolean)
    .join("");

  const savedBlock = `
    <section class="bento-card col-span-12">
      <div class="bento-card__inner">
        <div>
          <div class="bento-title">Сохранённые</div>
          <div class="bento-subtitle">Вакансии и проекты, которые вы отметили.</div>
        </div>

        <div class="grid-12 section-gap">
          <div class="col-span-12 lg:col-span-6">
            <div class="bento-title">Вакансии</div>
            <div class="mt-10" id="saved-vacancies">
              ${savedVacancyItems || '<div class="text-muted">Пока пусто</div>'}
            </div>
          </div>

          <div class="col-span-12 lg:col-span-6">
            <div class="bento-title">Проекты</div>
            <div class="mt-10" id="saved-projects">
              ${savedProjectItems || '<div class="text-muted">Пока пусто</div>'}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const avatarBlock = user.avatarUrl
    ? `
        <img
          class="profile-avatar"
          src="${safeAvatarUrl}"
          alt=""
          referrerpolicy="no-referrer"
          loading="lazy"
          onerror="this.hidden=true"
        />
      `
    : `
        <div class="logo-badge profile-avatarFallback" aria-hidden="true">${initials(user.name)}</div>
      `;

  return `
    <div class="container">
      <div class="page-head">
        <div>
          <h1 class="h1">Профиль</h1>
          <p class="text-muted">Управляй данными аккаунта HybridHub.</p>
        </div>
      </div>

      <div class="grid-12 profile-grid">
        <section class="bento-card col-span-12 lg:col-span-4" id="profile-sidebar-card">
          <div class="bento-card__inner">
            <div class="bento-top">
              <div id="profile-avatar-slot">${avatarBlock}</div>
              <div>
                <div class="profile-name" id="profile-name">${safeName}</div>
                <div class="text-muted text-small mt-8" id="profile-headline" ${cpHeadline ? "" : "hidden"}>${cpHeadline}</div>
                <div class="profile-meta">
                  <span class="tag">${safeRole}</span>
                  <span class="text-muted text-small">${safeEmail}</span>
                </div>
              </div>
            </div>

            <div class="links-row">
              <a class="btn btn--ghost" href="#/vacancies">Вакансии</a>
              <a class="btn btn--ghost" href="#/projects">Проекты</a>
            </div>

            <div class="section-gap" id="profile-candidate-summary">
              <div class="bento-title">Кандидат</div>
              <div class="bento-meta mt-12" id="profile-candidate-meta" ${candidateMeta.length ? "" : "hidden"}>
                ${candidateMeta.map((x) => `<span>${escapeHtml(x)}</span>`).join("")}
              </div>
              <div class="text-muted text-small mt-12" id="profile-candidate-salary" ${candidateSalaryText ? "" : "hidden"}>Ожидания: ${escapeHtml(
                candidateSalaryText
              )}</div>
              <div class="tags mt-12" id="profile-candidate-tags" ${candidateStackTags.length ? "" : "hidden"}>
                ${candidateStackTags.map((t) => `<span class=\"tag\">${escapeHtml(t)}</span>`).join("")}
              </div>
              <div class="links-row mt-12" id="profile-candidate-links" ${(cpPortfolio || cpGithub || cpLinkedin || cpTelegram) ? "" : "hidden"}>
                ${cpPortfolio ? `<a class="btn btn--ghost btn--mini" href="${cpPortfolio}" target="_blank" rel="noreferrer">Портфолио</a>` : ``}
                ${cpGithub ? `<a class="btn btn--ghost btn--mini" href="${cpGithub}" target="_blank" rel="noreferrer">GitHub</a>` : ``}
                ${cpLinkedin ? `<a class="btn btn--ghost btn--mini" href="${cpLinkedin}" target="_blank" rel="noreferrer">LinkedIn</a>` : ``}
                ${telegramHref ? `<a class="btn btn--ghost btn--mini" href="${telegramHref}" target="_blank" rel="noreferrer">Telegram</a>` : ``}
              </div>
            </div>
          </div>
        </section>

        <section class="bento-card col-span-12 lg:col-span-8" id="profile-main-card">
          <div class="bento-card__inner">
            <div>
              <div class="bento-title">Настройки</div>
              <div class="bento-subtitle">Обнови имя и ссылку на аватар.</div>
            </div>

            <form id="profile-form" class="form" novalidate>
              <label class="field">
                <span>Имя</span>
                <input name="name" type="text" value="${safeName}" maxlength="24" autocomplete="name" />
              </label>
              <label class="field">
                <span>Avatar URL</span>
                <input name="avatarUrl" type="url" value="${safeAvatarUrl}" placeholder="https://..." inputmode="url" />
              </label>

              <div class="profile-actions">
                <button class="btn btn--primary" type="submit">Сохранить</button>
                <button id="logout-btn" class="btn btn--ghost" type="button">Выйти</button>
              </div>
            </form>

            <details class="filters-collapsible section-gap" id="profile-extended">
              <summary class="filters-summary">Расширенные настройки</summary>
              <div class="filters-panel">
                <div class="filters filters-panel__inner">
                  <form id="profile-candidate" class="grid-12">
                    <div class="col-span-12">
                      <div class="bento-title">Профиль кандидата</div>
                      <div class="text-muted text-small mt-8">Заполни данные, которые помогают работодателю быстро понять твой опыт и соответствие роли.</div>
                    </div>

                    <div class="col-span-12 lg:col-span-8">
                      <label class="text-small text-muted">Заголовок (headline)</label>
                      <input name="headline" type="text" value="${cpHeadline}" placeholder="например Frontend Developer (React)" maxlength="60" />
                    </div>

                    <div class="col-span-12 sm:col-span-6 lg:col-span-4">
                      <label class="text-small text-muted">Уровень</label>
                      <select name="level">
                        <option value="" ${cpLevel === "" ? "selected" : ""}>—</option>
                        <option value="junior" ${cpLevel === "junior" ? "selected" : ""}>junior</option>
                        <option value="middle" ${cpLevel === "middle" ? "selected" : ""}>middle</option>
                        <option value="senior" ${cpLevel === "senior" ? "selected" : ""}>senior</option>
                        <option value="lead" ${cpLevel === "lead" ? "selected" : ""}>lead</option>
                      </select>
                    </div>

                    <div class="col-span-12 sm:col-span-6 lg:col-span-4">
                      <label class="text-small text-muted">Город</label>
                      <input name="city" type="text" value="${cpCity}" placeholder="например Алматы" maxlength="32" />
                    </div>

                    <div class="col-span-12 sm:col-span-6 lg:col-span-4">
                      <label class="text-small text-muted">Формат</label>
                      <select name="workMode">
                        <option value="" ${cpWorkMode === "" ? "selected" : ""}>—</option>
                        <option value="remote" ${cpWorkMode === "remote" ? "selected" : ""}>remote</option>
                        <option value="hybrid" ${cpWorkMode === "hybrid" ? "selected" : ""}>hybrid</option>
                        <option value="office" ${cpWorkMode === "office" ? "selected" : ""}>office</option>
                      </select>
                    </div>

                    <div class="col-span-12 sm:col-span-6 lg:col-span-4">
                      <label class="text-small text-muted">Занятость</label>
                      <select name="employmentType">
                        <option value="" ${cpEmploymentType === "" ? "selected" : ""}>—</option>
                        <option value="full_time" ${cpEmploymentType === "full_time" ? "selected" : ""}>full_time</option>
                        <option value="part_time" ${cpEmploymentType === "part_time" ? "selected" : ""}>part_time</option>
                        <option value="contract" ${cpEmploymentType === "contract" ? "selected" : ""}>contract</option>
                        <option value="internship" ${cpEmploymentType === "internship" ? "selected" : ""}>internship</option>
                      </select>
                    </div>

                    <div class="col-span-12 sm:col-span-6 lg:col-span-4">
                      <label class="text-small text-muted">Опыт (лет)</label>
                      <input name="experienceYears" type="number" inputmode="numeric" value="${cpExperienceYears}" placeholder="например 3" />
                    </div>

                    <div class="col-span-12 sm:col-span-6 lg:col-span-4">
                      <label class="text-small text-muted">Ожидания по зарплате от (₸)</label>
                      <input name="salaryFrom" type="number" inputmode="numeric" value="${cpSalaryFrom}" placeholder="например 600000" />
                    </div>

                    <div class="col-span-12 sm:col-span-6 lg:col-span-4">
                      <label class="text-small text-muted">Ожидания по зарплате до (₸)</label>
                      <input name="salaryTo" type="number" inputmode="numeric" value="${cpSalaryTo}" placeholder="например 1200000" />
                    </div>

                    <div class="col-span-12">
                      <label class="text-small text-muted">Стек (через запятую)</label>
                      <input name="stack" type="text" value="${cpStack}" placeholder="React, TypeScript, Next.js, REST, Jest..." />
                    </div>

                    <div class="col-span-12">
                      <label class="text-small text-muted">О себе</label>
                      <textarea name="about" placeholder="Коротко: что делал, чем силён, что ищешь.">${cpAbout}</textarea>
                    </div>

                    <div class="col-span-12 section-gap">
                      <div class="bento-title">Ссылки</div>
                    </div>

                    <div class="col-span-12 sm:col-span-6 lg:col-span-6">
                      <label class="text-small text-muted">Портфолио</label>
                      <input name="portfolio" type="url" value="${cpPortfolio}" placeholder="https://..." inputmode="url" />
                    </div>

                    <div class="col-span-12 sm:col-span-6 lg:col-span-6">
                      <label class="text-small text-muted">GitHub</label>
                      <input name="github" type="url" value="${cpGithub}" placeholder="https://github.com/..." inputmode="url" />
                    </div>

                    <div class="col-span-12 sm:col-span-6 lg:col-span-6">
                      <label class="text-small text-muted">LinkedIn</label>
                      <input name="linkedin" type="url" value="${cpLinkedin}" placeholder="https://www.linkedin.com/in/..." inputmode="url" />
                    </div>

                    <div class="col-span-12 sm:col-span-6 lg:col-span-6">
                      <label class="text-small text-muted">Telegram</label>
                      <input name="telegram" type="text" value="${cpTelegram}" placeholder="@username или https://t.me/username" />
                    </div>

                    <div class="col-span-12 lg:col-span-4 actions-row">
                      <button type="submit" class="btn btn--primary">Сохранить</button>
                      <button type="button" class="btn btn--ghost" id="profile-candidate-reset">Сбросить</button>
                    </div>
                  </form>
                </div>
              </div>
            </details>
          </div>
        </section>

        ${savedBlock}
      </div>
    </div>
  `;
}

export function mountProfile() {
  const btn = document.getElementById("logout-btn");
  const form = document.getElementById("profile-form");
  const details = document.getElementById("profile-extended");
  const candidateForm = document.getElementById("profile-candidate");
  if (!btn) return;

  api.initMockData();

  btn.addEventListener("click", () => {
    store.logout();
    window.location.hash = "#/";
  });

  if (!form) return;

  const sidebarCard = document.getElementById("profile-sidebar-card");
  const mainCard = document.getElementById("profile-main-card");
  const isDesktop = () =>
    Boolean(window.matchMedia && window.matchMedia("(min-width: 1024px)").matches);

  const syncSidebarMinHeight = () => {
    if (!(sidebarCard instanceof HTMLElement) || !(mainCard instanceof HTMLElement)) return;

    if (!isDesktop()) {
      sidebarCard.style.minHeight = "";
      return;
    }

    if (details instanceof HTMLDetailsElement && details.open) {
      return;
    }

    const h = mainCard.offsetHeight;
    if (h > 0) {
      sidebarCard.style.minHeight = `${h}px`;
    }
  };

  window.requestAnimationFrame(() => window.requestAnimationFrame(syncSidebarMinHeight));
  window.addEventListener("resize", syncSidebarMinHeight);

  const nameEl = document.getElementById("profile-name");
  const avatarSlot = document.getElementById("profile-avatar-slot");

  function validateName(value) {
    const v = String(value || "").trim();
    if (!v) return "Имя не может быть пустым";
    if (v.length < 2) return "Имя слишком короткое";
    if (v.length > 24) return "Имя слишком длинное (макс. 24 символа)";
    return null;
  }

  function validateAvatarUrl(value) {
    const v = String(value || "").trim();
    if (!v) return null;
    try {
      const u = new URL(v);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return "Avatar URL должен начинаться с http:// или https://";
      }
      return null;
    } catch {
      return "Невалидный Avatar URL";
    }
  }

  function renderAvatar(avatarUrl, name) {
    const safeAvatarUrl = escapeHtml(String(avatarUrl || "").trim());
    if (safeAvatarUrl) {
      return `
        <img
          class="profile-avatar"
          src="${safeAvatarUrl}"
          alt=""
          referrerpolicy="no-referrer"
          loading="lazy"
          onerror="this.hidden=true"
        />
      `;
    }

    return `
      <div class="logo-badge profile-avatarFallback" aria-hidden="true">${escapeHtml(
        initials(name)
      )}</div>
    `;
  }

  function flash(el) {
    if (!(el instanceof HTMLElement)) return;
    el.classList.remove("ui-flash");
    window.requestAnimationFrame(() => {
      el.classList.add("ui-flash");
      window.setTimeout(() => {
        el.classList.remove("ui-flash");
      }, 460);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const avatarUrl = String(fd.get("avatarUrl") || "").trim();

    const nameError = validateName(name);
    if (nameError) {
      toast.error(nameError);
      return;
    }

    const avatarError = validateAvatarUrl(avatarUrl);
    if (avatarError) {
      toast.error(avatarError);
      return;
    }

    try {
      store.updateProfile({ name, avatarUrl });
      toast.success("Профиль обновлён");

      if (nameEl) nameEl.textContent = name;
      if (avatarSlot) avatarSlot.innerHTML = renderAvatar(avatarUrl, name);

      document.querySelectorAll('[data-profile-link="1"]').forEach((el) => {
        if (el instanceof HTMLElement) el.textContent = name;
      });

      if (nameEl) flash(nameEl);
      if (avatarSlot) flash(avatarSlot);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    }
  });

  if (details instanceof HTMLDetailsElement && details.dataset.animBound !== "1") {
    details.dataset.animBound = "1";
    const summary = details.querySelector(".filters-summary");
    const panel = details.querySelector(".filters-panel");

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
          details.open = false;
          details.classList.remove("is-closing");
          panel.classList.remove("is-motion");
          panel.style.height = "";
          panel.style.opacity = "";
          panel.style.transform = "";
          syncSidebarMinHeight();
        };
        panel.addEventListener("transitionend", onEnd);
      };

      summary.addEventListener("click", (e) => {
        e.preventDefault();
        if (panel.classList.contains("is-motion")) return;
        if (details.open) {
          details.classList.add("is-closing");
          runClose();
          return;
        }
        details.classList.remove("is-closing");
        details.open = true;
        runOpen();
      });
    }
  }

  if (candidateForm) {
    const resetBtn = document.getElementById("profile-candidate-reset");
    const headlineEl = document.getElementById("profile-headline");
    const summaryEl = document.getElementById("profile-candidate-summary");
    const metaEl = document.getElementById("profile-candidate-meta");
    const salaryEl = document.getElementById("profile-candidate-salary");
    const tagsEl = document.getElementById("profile-candidate-tags");
    const linksEl = document.getElementById("profile-candidate-links");

    const humanLevel = (v) => {
      switch (String(v || "")) {
        case "junior":
          return "Junior";
        case "middle":
          return "Middle";
        case "senior":
          return "Senior";
        case "lead":
          return "Lead";
        default:
          return "";
      }
    };

    const humanWorkMode = (v) => {
      switch (String(v || "")) {
        case "remote":
          return "Удалённо";
        case "hybrid":
          return "Гибрид";
        case "office":
          return "Офис";
        default:
          return "";
      }
    };

    const humanEmploymentType = (v) => {
      switch (String(v || "")) {
        case "full_time":
          return "Full-time";
        case "part_time":
          return "Part-time";
        case "contract":
          return "Contract";
        case "internship":
          return "Internship";
        default:
          return "";
      }
    };

    const updateCandidateSummary = ({
      headline,
      level,
      experienceYears,
      city,
      workMode,
      employmentType,
      salaryFrom,
      salaryTo,
      stack,
      links,
    }) => {
      const nextHeadline = String(headline || "").trim();
      if (headlineEl) {
        headlineEl.textContent = nextHeadline;
        headlineEl.hidden = !nextHeadline;
      }

      const metaParts = [
        humanLevel(level),
        experienceYears ? `${experienceYears} лет опыта` : "",
        String(city || "").trim(),
        humanWorkMode(workMode),
        humanEmploymentType(employmentType),
      ].filter(Boolean);

      if (metaEl) {
        metaEl.innerHTML = metaParts.map((x) => `<span>${escapeHtml(x)}</span>`).join("");
        metaEl.hidden = metaParts.length === 0;
      }

      const sFrom = String(salaryFrom || "").trim();
      const sTo = String(salaryTo || "").trim();
      const salaryText =
        sFrom || sTo
          ? `${sFrom ? `от ${sFrom}` : ""}${sFrom && sTo ? " — " : ""}${sTo ? `до ${sTo}` : ""} ₸`
          : "";

      if (salaryEl) {
        salaryEl.textContent = salaryText ? `Ожидания: ${salaryText}` : "";
        salaryEl.hidden = !salaryText;
      }

      const tagItems = String(stack || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 10);

      if (tagsEl) {
        tagsEl.innerHTML = tagItems.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
        tagsEl.hidden = tagItems.length === 0;
      }

      const ln = links && typeof links === "object" ? links : {};
      const portfolio = String(ln.portfolio || "").trim();
      const github = String(ln.github || "").trim();
      const linkedin = String(ln.linkedin || "").trim();
      const telegramRaw = String(ln.telegram || "").trim();
      const telegramHref = telegramRaw
        ? telegramRaw.startsWith("@")
          ? `https://t.me/${telegramRaw.slice(1)}`
          : telegramRaw
        : "";

      const linkHtml = [
        portfolio ? `<a class="btn btn--ghost btn--mini" href="${escapeHtml(portfolio)}" target="_blank" rel="noreferrer">Портфолио</a>` : "",
        github ? `<a class="btn btn--ghost btn--mini" href="${escapeHtml(github)}" target="_blank" rel="noreferrer">GitHub</a>` : "",
        linkedin ? `<a class="btn btn--ghost btn--mini" href="${escapeHtml(linkedin)}" target="_blank" rel="noreferrer">LinkedIn</a>` : "",
        telegramHref ? `<a class="btn btn--ghost btn--mini" href="${escapeHtml(telegramHref)}" target="_blank" rel="noreferrer">Telegram</a>` : "",
      ].filter(Boolean);

      if (linksEl) {
        linksEl.innerHTML = linkHtml.join("");
        linksEl.hidden = linkHtml.length === 0;
      }

      if (summaryEl) flash(summaryEl);
      if (headlineEl && !headlineEl.hidden) flash(headlineEl);
      if (metaEl && !metaEl.hidden) flash(metaEl);
      if (salaryEl && !salaryEl.hidden) flash(salaryEl);
      if (tagsEl && !tagsEl.hidden) flash(tagsEl);
      if (linksEl && !linksEl.hidden) flash(linksEl);
    };

    const setField = (name, value) => {
      const el = candidateForm.querySelector(`[name="${CSS.escape(name)}"]`);
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
        el.value = value;
      }
    };

    const toInt = (v) => {
      const s = String(v || "").trim();
      if (!s) return "";
      const n = Number(s);
      if (!Number.isFinite(n) || n < 0) return null;
      return String(Math.floor(n));
    };

    const validateUrlOptional = (value, label) => {
      const v = String(value || "").trim();
      if (!v) return null;
      try {
        const u = new URL(v);
        if (u.protocol !== "http:" && u.protocol !== "https:") return `${label}: ссылка должна начинаться с http:// или https://`;
        return null;
      } catch {
        return `${label}: невалидная ссылка`;
      }
    };

    resetBtn?.addEventListener("click", () => {
      setField("headline", "");
      setField("level", "");
      setField("city", "");
      setField("workMode", "");
      setField("employmentType", "");
      setField("experienceYears", "");
      setField("salaryFrom", "");
      setField("salaryTo", "");
      setField("stack", "");
      setField("about", "");
      setField("portfolio", "");
      setField("github", "");
      setField("linkedin", "");
      setField("telegram", "");
      toast.info("Поля сброшены (не забудь сохранить)");
    });

    candidateForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(candidateForm);

      const experienceYears = toInt(fd.get("experienceYears"));
      if (experienceYears === null) {
        toast.error("Опыт: невалидное значение");
        return;
      }

      const salaryFrom = toInt(fd.get("salaryFrom"));
      const salaryTo = toInt(fd.get("salaryTo"));
      if (salaryFrom === null || salaryTo === null) {
        toast.error("Зарплата: невалидное значение");
        return;
      }
      if (salaryFrom && salaryTo && Number(salaryFrom) > Number(salaryTo)) {
        toast.error('Зарплата: "от" не может быть больше "до"');
        return;
      }

      const portfolio = String(fd.get("portfolio") || "").trim();
      const github = String(fd.get("github") || "").trim();
      const linkedin = String(fd.get("linkedin") || "").trim();

      const portfolioErr = validateUrlOptional(portfolio, "Портфолио");
      if (portfolioErr) return void toast.error(portfolioErr);
      const githubErr = validateUrlOptional(github, "GitHub");
      if (githubErr) return void toast.error(githubErr);
      const linkedinErr = validateUrlOptional(linkedin, "LinkedIn");
      if (linkedinErr) return void toast.error(linkedinErr);

      const telegram = String(fd.get("telegram") || "").trim();

      const headline = String(fd.get("headline") || "").trim();
      const level = String(fd.get("level") || "");
      const city = String(fd.get("city") || "").trim();
      const workMode = String(fd.get("workMode") || "");
      const employmentType = String(fd.get("employmentType") || "");
      const stack = String(fd.get("stack") || "").trim();
      const about = String(fd.get("about") || "").trim();

      try {
        store.updateProfile({
          candidateProfile: {
            headline,
            level,
            city,
            workMode,
            employmentType,
            experienceYears,
            salaryFrom: salaryFrom === null ? "" : salaryFrom,
            salaryTo: salaryTo === null ? "" : salaryTo,
            stack,
            about,
            links: { portfolio, github, linkedin, telegram },
          },
        });
        toast.success("Профиль кандидата сохранён");
        updateCandidateSummary({
          headline,
          level,
          experienceYears,
          city,
          workMode,
          employmentType,
          salaryFrom: salaryFrom === null ? "" : salaryFrom,
          salaryTo: salaryTo === null ? "" : salaryTo,
          stack,
          links: { portfolio, github, linkedin, telegram },
        });
        if (!(details instanceof HTMLDetailsElement) || !details.open) {
          window.requestAnimationFrame(() => syncSidebarMinHeight());
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
      }
    });
  }

  const userId = store.state.currentUser?.id;
  if (userId) {
    const container = document.querySelector(".profile-grid");
    if (container) {
      const prefersReducedMotion = () =>
        Boolean(
          window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
        );

      const removeWithAnim = (el) => {
        if (!(el instanceof HTMLElement)) return;
        if (prefersReducedMotion()) {
          el.remove();
          return;
        }

        el.classList.add("ui-remove");
        window.setTimeout(() => {
          el.remove();
        }, 220);
      };

      container.addEventListener("click", (e) => {
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;
        const btn = t.closest("button[data-unsave]");
        if (!(btn instanceof HTMLButtonElement)) return;

        const kind = btn.dataset.unsave;
        const id = btn.dataset.id;
        if (!kind || !id) return;

        if (kind === "vacancy") {
          const key = savedVacancyKey(userId);
          const set = readSavedVacanciesForUser(userId);
          set.delete(String(id));
          writeIdSet(key, set);
          const row = container.querySelector(`[data-saved-item="vacancy"][data-id="${CSS.escape(
            String(id)
          )}"]`);
          if (row) removeWithAnim(row);
          const list = document.getElementById("saved-vacancies");
          if (list && !list.querySelector("[data-saved-item=\"vacancy\"]")) {
            list.innerHTML = '<div class="text-muted">Пока пусто</div>';
          }
          toast.info("Убрано из сохранённых");
          return;
        }

        if (kind === "project") {
          const key = savedProjectKey(userId);
          const set = readSavedProjectsForUser(userId);
          set.delete(String(id));
          writeIdSet(key, set);
          const row = container.querySelector(`[data-saved-item="project"][data-id="${CSS.escape(
            String(id)
          )}"]`);
          if (row) removeWithAnim(row);
          const list = document.getElementById("saved-projects");
          if (list && !list.querySelector("[data-saved-item=\"project\"]")) {
            list.innerHTML = '<div class="text-muted">Пока пусто</div>';
          }
          toast.info("Убрано из сохранённых");
        }
      });
    }
  }
}
