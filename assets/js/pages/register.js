import { store } from "../store.js";

export function renderRegister() {
  return `
    <div class="container">
      <div class="card">
        <h1>Регистрация</h1>
        <div id="register-error" style="display:none; margin-top: 12px; color: #fecaca;"></div>

        <form id="register-form" style="margin-top: 12px; display: grid; gap: 10px;">
          <label style="display:grid; gap:6px;">
            <span>Роль</span>
            <select name="role">
              <option value="candidate">Соискатель</option>
              <option value="employer">Работодатель</option>
            </select>
          </label>

          <label style="display:grid; gap:6px;">
            <span>Имя</span>
            <input name="name" type="text" autocomplete="name" required />
          </label>

          <label style="display:grid; gap:6px;">
            <span>Email</span>
            <input name="email" type="email" autocomplete="email" required />
          </label>

          <label style="display:grid; gap:6px;">
            <span>Пароль</span>
            <input name="password" type="password" autocomplete="new-password" required />
          </label>

          <button type="submit">Создать аккаунт</button>
        </form>

        <p style="margin-top: 12px;">
          <a href="#/login">Уже есть аккаунт? Войти</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/">На главную</a>
        </p>
      </div>
    </div>
  `;
}

export function mountRegister() {
  if (store.state.currentUser) {
    window.location.hash = "#/profile";
    return;
  }

  const form = document.getElementById("register-form");
  const error = document.getElementById("register-error");
  if (!form || !error) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    error.style.display = "none";
    error.textContent = "";

    const fd = new FormData(form);
    const role = String(fd.get("role") || "candidate");
    const name = String(fd.get("name") || "");
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");

    try {
      store.register({ role, name, email, password });
      store.login({ email, password, remember: true });
      window.location.hash = "#/profile";
    } catch (err) {
      error.style.display = "block";
      error.textContent = err instanceof Error ? err.message : "Ошибка регистрации";
    }
  });
}
