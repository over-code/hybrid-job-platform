import { store } from "../store.js";
import { api } from "../utils/api.js";

export function renderHome() {
  const isAuthed = Boolean(store.state.currentUser);

  return `
    <div class="container">
      <div class="card card--soft">
        <div class="grid-12 items-center">
          <div class="col-span-12 lg:col-span-4">
            <div class="logo-badge logo-badge--lg" aria-hidden="true">HH</div>
          </div>
          <div class="col-span-12">
            <h1>HybridHub</h1>
            <p class="text-muted mt-10">
              Платформа для поиска работы и фриланс‑проектов в IT: разработка, дизайн, DevOps, QA, аналитика, менеджмент, контент и маркетинг.
            </p>
            <div class="btn-row mt-16">
              <a class="btn btn--primary" href="#/vacancies">Смотреть вакансии</a>
              <a class="btn btn--ghost" href="#/projects">Смотреть проекты</a>
              ${isAuthed ? `<a class="btn btn--ghost" href="#/profile">Профиль</a>` : ``}
            </div>
          </div>
        </div>
      </div>

      <div class="cards-grid section-gap">
        <div class="bento-card">
          <div class="bento-card__inner">
            <div class="bento-title">Вакансии</div>
            <div class="text-small text-muted">Полная занятость, контракты, стажировки. Remote / Hybrid / Office.</div>
            <div class="tags">
              <span class="tag">React</span>
              <span class="tag">Python</span>
              <span class="tag">Figma</span>
              <span class="tag">AWS</span>
              <span class="tag">QA</span>
              <span class="tag">PM</span>
            </div>
            <div>
              <a class="btn btn--ghost" href="#/vacancies">Открыть каталог</a>
            </div>
          </div>
        </div>

        <div class="bento-card">
          <div class="bento-card__inner">
            <div class="bento-title">Фриланс‑проекты</div>
            <div class="text-small text-muted">Короткие задачи и крупные инициативы: дизайн‑системы, CI/CD, аналитика, документация.</div>
            <div class="tags">
              <span class="tag">Design System</span>
              <span class="tag">Playwright</span>
              <span class="tag">SQL</span>
              <span class="tag">CI/CD</span>
            </div>
            <div>
              <a class="btn btn--ghost" href="#/projects">Смотреть проекты</a>
            </div>
          </div>
        </div>

        <div class="bento-card">
          <div class="bento-card__inner">
            <div class="bento-title">О проекте</div>
            <div class="text-small text-muted">Концепт темной дизайн‑системы в стиле Linear/Vercel и демонстрация UI‑паттернов.</div>
            <div>
              <a class="btn btn--ghost" href="#/about">Подробнее</a>
            </div>
          </div>
        </div>
      </div>

      <div class="section-gap">
        <div class="card card--soft home-live" id="home-live">
          <div class="home-live__head">
            <div>
              <h2 class="h3">Новые вакансии и проекты</h2>
              <div class="text-small text-muted mt-8">Лента обновляется автоматически: новые появляются, старые уходят.</div>
            </div>
            <div class="home-live__actions">
              <a class="btn btn--ghost" href="#/vacancies">Все вакансии</a>
              <a class="btn btn--ghost" href="#/projects">Все проекты</a>
            </div>
          </div>
          <div class="home-live__list" id="home-live-list" aria-live="polite"></div>
        </div>
      </div>
    </div>
  `;
}

 function prefersReducedMotion() {
   return Boolean(
     window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
   );
 }

 function formatSalary(v) {
   const from = v?.salaryFrom != null ? Number(v.salaryFrom) : null;
   const to = v?.salaryTo != null ? Number(v.salaryTo) : null;
   if (!Number.isFinite(from) && !Number.isFinite(to)) return "";
   const fmt = (n) => Intl.NumberFormat("ru-RU").format(n);
   if (Number.isFinite(from) && Number.isFinite(to)) return `${fmt(from)}–${fmt(to)} ₸`;
   if (Number.isFinite(from)) return `от ${fmt(from)} ₸`;
   return `до ${fmt(to)} ₸`;
 }

 function formatBudget(p) {
   const from = p?.budgetFrom != null ? Number(p.budgetFrom) : null;
   const to = p?.budgetTo != null ? Number(p.budgetTo) : null;
   if (!Number.isFinite(from) && !Number.isFinite(to)) return "";
   const fmt = (n) => Intl.NumberFormat("ru-RU").format(n);
   if (Number.isFinite(from) && Number.isFinite(to)) return `${fmt(from)}–${fmt(to)} ₸`;
   if (Number.isFinite(from)) return `от ${fmt(from)} ₸`;
   return `до ${fmt(to)} ₸`;
 }

 function renderLiveItem(item) {
   if (!item) return "";
   if (item.kind === "vacancy") {
     const href = `#/vacancies/${item.id}`;
     const salary = formatSalary(item);
     const metaParts = [item.companyName, item.city, salary].filter(Boolean);
     const meta = metaParts.join(" • ");
     return `
       <a class="home-live-item link-plain" href="${href}">
         <div class="home-live-item__top">
           <div class="home-live-item__title">${item.title}</div>
           <span class="badge badge--primary">Вакансия</span>
         </div>
         <div class="home-live-item__meta text-small text-muted">${meta}</div>
       </a>
     `;
   }

   const href = `#/projects/${item.id}`;
   const budget = formatBudget(item);
   const metaParts = [item.category, item.deadlineText, budget].filter(Boolean);
   const meta = metaParts.join(" • ");
   return `
     <a class="home-live-item link-plain" href="${href}">
       <div class="home-live-item__top">
         <div class="home-live-item__title">${item.title}</div>
         <span class="badge">Проект</span>
       </div>
       <div class="home-live-item__meta text-small text-muted">${meta}</div>
     </a>
   `;
 }

 function seedFeed() {
   const vacancies = api
     .getVacancies()
     .slice()
     .sort((a, b) => String(b?.createdAt || "").localeCompare(String(a?.createdAt || "")))
     .slice(0, 12)
     .map((v) => ({ ...v, kind: "vacancy" }));

   const projects = api
     .getProjects()
     .slice()
     .sort((a, b) => String(b?.createdAt || "").localeCompare(String(a?.createdAt || "")))
     .slice(0, 12)
     .map((p) => ({ ...p, kind: "project" }));

   return vacancies
     .concat(projects)
     .sort((a, b) => String(b?.createdAt || "").localeCompare(String(a?.createdAt || "")));
 }

 export function mountHome() {
   const listEl = document.getElementById("home-live-list");
   if (!listEl) return;

   const feed = seedFeed();
  if (!feed.length) return;

  const reduced = prefersReducedMotion();
  const animMs = reduced ? 0 : 900;

   if (window.__homeLiveTickerId) {
     window.clearInterval(window.__homeLiveTickerId);
     window.__homeLiveTickerId = null;
   }

   let start = 0;
   let isAnimating = false;

   const renderInitial = () => {
     const windowItems = [0, 1, 2]
       .map((i) => feed[(start + i) % feed.length])
       .filter(Boolean);
     listEl.innerHTML = windowItems.map(renderLiveItem).join("");
   };

   const appendNext = () => {
     const next = feed[(start + 2) % feed.length];
     const wrap = document.createElement("div");
     wrap.innerHTML = renderLiveItem(next).trim();
     const node = wrap.firstElementChild;
     if (!node) return;
     if (!reduced) node.classList.add("is-enter");
     listEl.appendChild(node);
     if (!reduced) {
       window.requestAnimationFrame(() => {
         node.classList.remove("is-enter");
       });
     }
     return node;
   };

   const tick = () => {
     if (isAnimating) return;
     if (feed.length <= 3) return;
     const first = listEl.firstElementChild;
     if (!first) return;

     isAnimating = true;
     start = (start + 1) % feed.length;

     if (reduced) {
       if (first && first.parentElement === listEl) first.remove();
       appendNext();
       isAnimating = false;
       return;
     }

     appendNext();
     first.classList.add("is-leave");

     let done = false;
     const finish = () => {
       if (done) return;
       done = true;
       first.removeEventListener("transitionend", onEnd);
       if (first && first.parentElement === listEl) first.remove();
       isAnimating = false;
     };

     const onEnd = (e) => {
      if (!e) return;
      if (e.target !== first) return;
      if (
        e.propertyName !== "margin-right" &&
        e.propertyName !== "margin-bottom" &&
        e.propertyName !== "flex-basis" &&
        e.propertyName !== "max-width"
      ) {
        return;
      }
      finish();
    };

     first.addEventListener("transitionend", onEnd);
     window.setTimeout(finish, animMs + 120);
   };

   renderInitial();
   if (feed.length > 3) {
     window.__homeLiveTickerId = window.setInterval(tick, 60 * 1000);
     window.addEventListener(
       "hashchange",
       () => {
         if (window.__homeLiveTickerId) {
           window.clearInterval(window.__homeLiveTickerId);
           window.__homeLiveTickerId = null;
         }
       },
       { once: true }
     );
   }
 }
