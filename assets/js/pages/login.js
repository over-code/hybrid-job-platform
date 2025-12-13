import { store } from "../store.js";

export function renderLogin() {
  return `
    <div class="container">
      <div class="card">
        <h1>Вход</h1>
        <div id="login-error" style="display:none; margin-top: 12px; color: #fecaca;"></div>

        <form id="login-form" style="margin-top: 12px; display: grid; gap: 10px;">
          <label style="display:grid; gap:6px;">
            <span>Email</span>
            <input name="email" type="email" autocomplete="email" required />
          </label>

          <label style="display:grid; gap:6px;">
            <span>Пароль</span>
            <input name="password" type="password" autocomplete="current-password" required />
          </label>

          <label style="display:flex; gap:8px; align-items:center;">
            <input name="remember" type="checkbox" />
            <span>Запомнить</span>
          </label>

          <button type="submit">Войти</button>
        </form>

        <p style="margin-top: 12px;">
          <a href="#/register">Регистрация</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/forgot-password">Забыли пароль?</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/">На главную</a>
        </p>
      </div>
    </div>
  `;
}

export function mountLogin() {
  if (store.state.currentUser) {
    window.location.hash = "#/profile";
    return;
  }

  const form = document.getElementById("login-form");
  const error = document.getElementById("login-error");
  if (!form || !error) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    error.style.display = "none";
    error.textContent = "";

    const fd = new FormData(form);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    const remember = Boolean(fd.get("remember"));

    try {
      store.login({ email, password, remember });
      window.location.hash = "#/profile";
    } catch (err) {
      error.style.display = "block";
      error.textContent = err instanceof Error ? err.message : "Ошибка входа";
    }
  });
}
