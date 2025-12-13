import { store } from "../store.js";

export function renderProfile() {
  const user = store.state.currentUser;

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

  return `
    <div class="container">
      <div class="card">
        <h1>Профиль</h1>
        <p style="margin-top: 10px;">
          <strong>${user.name}</strong>
          <span style="opacity:0.6;">(${user.role})</span>
        </p>
        <p style="opacity: 0.85; margin-top: 6px;">${user.email}</p>

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
  if (!btn) return;

  btn.addEventListener("click", () => {
    store.logout();
    window.location.hash = "#/";
  });
}
