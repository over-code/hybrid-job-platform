import { store } from "../store.js";

export function renderProfile(ctx = {}) {
  const user = store.state.currentUser;
  const showSaved = Boolean(ctx.query?.updated);

  if (!user) {
    return `
      <div class="container">
        <div class="card">
          <h1>Профиль</h1>
          <p>Нет активной сессии.</p>
          <p style="margin-top: 12px;">
            <a href="#/login">Войти</a>
          </p>
        </div>
      </div>
    `;
  }

  const avatarBlock = user.avatarUrl
    ? `
        <div style="margin-top: 12px;">
          <img
            src="${user.avatarUrl}"
            alt=""
            referrerpolicy="no-referrer"
            loading="lazy"
            onerror="this.style.display='none'"
            style="width: 72px; height: 72px; border-radius: 16px; object-fit: cover;"
          />
        </div>
      `
    : "";

  return `
    <div class="container">
      <div class="card">
        <h1>Профиль</h1>
        <p style="margin-top: 10px;">
          <strong>${user.name}</strong>
          <span style="opacity:0.6;">(${user.role})</span>
        </p>
        <p style="opacity: 0.85; margin-top: 6px;">${user.email}</p>

        ${avatarBlock}

        <div id="profile-error" style="display:none; margin-top: 12px; color: #fecaca;"></div>
        <div id="profile-success" style="display:${showSaved ? "block" : "none"}; margin-top: 12px; color: #bbf7d0;">
          ${showSaved ? "Сохранено" : ""}
        </div>

        <form id="profile-form" style="margin-top: 12px; display: grid; gap: 10px;">
          <label style="display:grid; gap:6px;">
            <span>Имя</span>
            <input name="name" type="text" value="${user.name}" required />
          </label>
          <label style="display:grid; gap:6px;">
            <span>Avatar URL</span>
            <input name="avatarUrl" type="url" value="${user.avatarUrl || ""}" placeholder="https://..." />
          </label>
          <button type="submit">Сохранить</button>
        </form>

        <p style="margin-top: 12px;">
          <a href="#/vacancies">Вакансии</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/projects">Проекты</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/">На главную</a>
        </p>

        <button id="logout-btn" style="margin-top: 14px;">Выйти</button>
      </div>
    </div>
  `;
}

export function mountProfile() {
  const btn = document.getElementById("logout-btn");
  const form = document.getElementById("profile-form");
  const error = document.getElementById("profile-error");
  const success = document.getElementById("profile-success");
  if (!btn) return;

  btn.addEventListener("click", () => {
    store.logout();
    window.location.hash = "#/";
  });

  if (!form || !error || !success) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    error.style.display = "none";
    error.textContent = "";
    success.style.display = "none";
    success.textContent = "";

    const fd = new FormData(form);
    const name = String(fd.get("name") || "");
    const avatarUrl = String(fd.get("avatarUrl") || "");

    try {
      store.updateProfile({ name, avatarUrl });
      success.style.display = "block";
      success.textContent = "Сохранено";
      window.location.hash = `#/profile?updated=${Date.now()}`;
    } catch (err) {
      error.style.display = "block";
      error.textContent = err instanceof Error ? err.message : "Ошибка сохранения";
    }
  });
}
