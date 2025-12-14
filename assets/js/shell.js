import { renderNavbar } from "./components/navbar.js";
import { toggleTheme } from "./theme.js";
import { store } from "./store.js";

let shellGlobalsMounted = false;

function iconSun() {
  return `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" stroke-width="2"/>
      <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 20.5 19 19M19 5l1.5-1.5M4.5 20.5 6 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
}

function iconMoon() {
  return `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>
  `;
}

function closeMobileNav() {
  const burger = document.getElementById("nav-burger");
  const mobile = document.getElementById("nav-mobile");
  if (!mobile) return;
  mobile.hidden = true;
  document.body.classList.remove("nav-open");

  if (burger) {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
  }
}

export function renderShell(pageHtml, ctx = {}) {
  const activePath = ctx.path || "/";
  return `
    ${renderNavbar({ currentUser: store.state.currentUser, activePath })}
    <main class="main" id="app-main">
      ${pageHtml}
    </main>

    <footer class="footer" id="app-footer">
      <div class="container">
        <div class="footer__inner">
          <div class="footer__top">
            <div>
              <div class="footer__brand">HybridHub</div>
              <div class="text-muted text-small mt-8">
                Демо‑прототип. Данные сохраняются в localStorage.
              </div>
            </div>

            <nav class="footer__links" aria-label="Разделы">
              <a class="footer__link" href="#/vacancies">Вакансии</a>
              <a class="footer__link" href="#/projects">Проекты</a>
              <a class="footer__link" href="#/about">О проекте</a>
              <a class="footer__link" href="#/contacts">Контакты</a>
            </nav>

            <div class="footer__actions">
              <button
                class="btn btn--icon"
                type="button"
                id="footer-theme-toggle"
                aria-label="Переключить тему"
                title="Тема"
                aria-pressed="false"
              >
                <span class="theme-icon theme-icon--sun">${iconSun()}</span>
                <span class="theme-icon theme-icon--moon">${iconMoon()}</span>
              </button>
              <a class="btn btn--ghost" href="#/profile">Профиль</a>
            </div>
          </div>

          <div class="footer__bottom">
            <div class="text-muted text-small">© ${new Date().getFullYear()} HybridHub</div>
            <div class="text-muted text-small">v2 demo</div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

export function mountShell() {
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn && themeBtn.dataset.bound !== "1") {
    themeBtn.dataset.bound = "1";

    const currentTheme = document.documentElement.dataset.theme || "dark";
    themeBtn.setAttribute("aria-pressed", currentTheme === "light" ? "true" : "false");

    themeBtn.addEventListener("click", () => {
      const nextTheme = toggleTheme();
      themeBtn.setAttribute("aria-pressed", nextTheme === "light" ? "true" : "false");
    });
  }

  const footerThemeBtn = document.getElementById("footer-theme-toggle");
  if (footerThemeBtn && footerThemeBtn.dataset.bound !== "1") {
    footerThemeBtn.dataset.bound = "1";

    const currentTheme = document.documentElement.dataset.theme || "dark";
    footerThemeBtn.setAttribute("aria-pressed", currentTheme === "light" ? "true" : "false");

    footerThemeBtn.addEventListener("click", () => {
      const nextTheme = toggleTheme();
      footerThemeBtn.setAttribute("aria-pressed", nextTheme === "light" ? "true" : "false");

      const headerThemeBtn = document.getElementById("theme-toggle");
      if (headerThemeBtn) {
        headerThemeBtn.setAttribute("aria-pressed", nextTheme === "light" ? "true" : "false");
      }
    });
  }

  const burger = document.getElementById("nav-burger");
  const mobile = document.getElementById("nav-mobile");

  if (burger && mobile && burger.dataset.bound !== "1") {
    burger.dataset.bound = "1";
    burger.addEventListener("click", () => {
      const next = Boolean(mobile.hidden);
      mobile.hidden = !next;
      document.body.classList.toggle("nav-open", next);

      burger.setAttribute("aria-expanded", next ? "true" : "false");
      burger.setAttribute("aria-label", next ? "Закрыть меню" : "Открыть меню");
    });

    mobile.addEventListener("click", (e) => {
      const t = e.target;
      if (t instanceof HTMLElement && t.closest("a")) {
        closeMobileNav();
      }
    });
  }

  if (!shellGlobalsMounted) {
    shellGlobalsMounted = true;

    window.addEventListener("hashchange", closeMobileNav);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        closeMobileNav();
      }
    });

    window.addEventListener("click", (e) => {
      if (!document.body.classList.contains("nav-open")) return;

      const t = e.target;
      if (!(t instanceof HTMLElement)) return;

      const mobileEl = document.getElementById("nav-mobile");
      const burgerEl = document.getElementById("nav-burger");

      if (burgerEl && t.closest("#nav-burger")) return;
      if (mobileEl && t.closest("#nav-mobile")) return;

      closeMobileNav();
    });

    const onScroll = () => {
      document.body.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
}
