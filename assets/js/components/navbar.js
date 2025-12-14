function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

export function renderNavbar({ currentUser, activePath } = {}) {
  const isAuthed = Boolean(currentUser);
  const userName = currentUser?.name ? escapeHtml(currentUser.name) : "";

  const item = (href, label) => {
    const path = String(activePath || "");
    const itemPath = href.startsWith("#") ? href.slice(1) : href;
    const isActive =
      itemPath === "/"
        ? path === "/"
        : path === itemPath || path.startsWith(`${itemPath}/`);
    return `
      <a class="nav__link ${isActive ? "is-active" : ""}" href="${href}" ${
        isActive ? 'aria-current="page"' : ""
      }>${label}</a>
    `;
  };

  const auth = isAuthed
    ? `
        <a class="btn btn--ghost nav__authProfile" href="#/profile" data-profile-link="1">${userName || "Профиль"}</a>
      `
    : `
        <a class="btn btn--ghost nav__authLogin" href="#/login">Войти</a>
        <a class="btn btn--primary nav__authRegister" href="#/register">Регистрация</a>
      `;

  const mobileAuth = isAuthed
    ? ``
    : `
        <div class="nav__mobileAuth">
          ${auth}
        </div>
      `;

  return `
    <header class="nav" id="app-nav">
      <div class="container nav__container">
        <div class="nav__left">
          <a class="nav__brand" href="#/">HybridHub</a>
        </div>

        <nav class="nav__center" aria-label="Навигация">
          ${item("#/vacancies", "Вакансии")}
          ${item("#/projects", "Проекты")}
          ${item("#/about", "О проекте")}
          ${item("#/contacts", "Контакты")}
        </nav>

        <div class="nav__right">
          <button class="btn btn--icon" type="button" id="theme-toggle" aria-label="Переключить тему" title="Тема" aria-pressed="false">
            <span class="theme-icon theme-icon--sun">${iconSun()}</span>
            <span class="theme-icon theme-icon--moon">${iconMoon()}</span>
          </button>
          ${auth}

          <button class="btn btn--icon nav__burger" type="button" id="nav-burger" aria-label="Открыть меню" title="Меню" aria-controls="nav-mobile" aria-expanded="false">
            <span class="burger" aria-hidden="true"></span>
          </button>
        </div>
      </div>

      <div class="nav__mobile" id="nav-mobile" hidden>
        <div class="container nav__mobileInner">
          ${item("#/vacancies", "Вакансии")}
          ${item("#/projects", "Проекты")}
          ${item("#/about", "О проекте")}
          ${item("#/contacts", "Контакты")}
          ${mobileAuth}
        </div>
      </div>
    </header>
  `;
}
