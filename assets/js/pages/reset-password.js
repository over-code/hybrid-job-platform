import { api } from "../utils/api.js";

export function renderResetPassword() {
  return `
    <div class="container">
      <div class="card">
        <h1>Сброс пароля</h1>
        <div id="reset-error" style="display:none; margin-top: 12px; color: #fecaca;"></div>
        <div id="reset-success" style="display:none; margin-top: 12px; color: #bbf7d0;"></div>

        <form id="reset-form" style="margin-top: 12px; display: grid; gap: 10px;">
          <label style="display:grid; gap:6px;">
            <span>Email</span>
            <input name="email" type="email" autocomplete="email" required />
          </label>

          <label style="display:grid; gap:6px;">
            <span>Новый пароль</span>
            <input name="newPassword" type="password" autocomplete="new-password" required />
          </label>

          <button type="submit">Сохранить новый пароль</button>
        </form>

        <p style="margin-top: 12px;">
          <a href="#/login">Назад к входу</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/">На главную</a>
        </p>
      </div>
    </div>
  `;
}

export function mountResetPassword() {
  const form = document.getElementById("reset-form");
  const error = document.getElementById("reset-error");
  const success = document.getElementById("reset-success");
  if (!form || !error || !success) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    error.style.display = "none";
    error.textContent = "";
    success.style.display = "none";
    success.textContent = "";

    const fd = new FormData(form);
    const email = String(fd.get("email") || "");
    const newPassword = String(fd.get("newPassword") || "");

    try {
      api.updatePassword({ email, newPassword });
      success.style.display = "block";
      success.textContent = "Пароль обновлён. Теперь можно войти.";
      setTimeout(() => {
        window.location.hash = "#/login";
      }, 500);
    } catch (err) {
      error.style.display = "block";
      error.textContent = err instanceof Error ? err.message : "Ошибка сброса пароля";
    }
  });
}
