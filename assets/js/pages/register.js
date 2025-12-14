import { store } from "../store.js";
import { toast } from "../components/toast.js";

export function renderRegister() {
  return `
    <div class="container">
      <div class="bento-card">
        <div class="bento-card__inner">
          <div class="page-head">
            <div>
              <h1 class="h1">Регистрация</h1>
              <p class="text-muted mt-8">Создай аккаунт и начни сохранять вакансии и проекты.</p>
            </div>
          </div>

          <form id="register-form" class="form" novalidate>
          <label class="field">
            <span>Роль</span>
            <select name="role">
              <option value="candidate">Соискатель</option>
              <option value="employer">Работодатель</option>
            </select>
          </label>

          <label class="field">
            <span>Имя</span>
            <input name="name" type="text" autocomplete="name" maxlength="24" />
          </label>

          <label class="field">
            <span>Email</span>
            <input name="email" type="email" autocomplete="email" inputmode="email" />
          </label>

          <label class="field">
            <span>Пароль</span>
            <div class="input-row">
              <input name="password" type="password" autocomplete="new-password" />
              <button
                class="btn btn--ghost btn--mini"
                type="button"
                data-toggle-password
                aria-pressed="false"
              >
                Показать
              </button>
            </div>
            <div class="text-muted text-small">Мин. 6 символов.</div>
            <div class="hint hint--warn text-small" id="register-capslock" hidden>Caps Lock включён</div>
          </label>

          <button class="btn btn--primary" type="submit">Создать аккаунт</button>
          </form>

          <div class="btn-row mt-16">
            <a class="btn btn--ghost" href="#/login">Уже есть аккаунт? Войти</a>
            <a class="btn btn--ghost" href="#/">На главную</a>
          </div>

          <section class="hint mt-16" aria-label="Подсказка">
            <div class="empty-title">После регистрации</div>
            <div class="text-muted text-small mt-8">
              Аккаунт позволит сохранять вакансии/проекты и использовать действия на деталях. Всё работает в демо‑режиме через localStorage.
            </div>
            <div class="tags mt-12">
              <span class="tag">Сохранения</span>
              <span class="tag">Действия</span>
              <span class="tag">Профиль</span>
            </div>
          </section>
        </div>
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
  if (!form) return;

  const passwordEl = form.querySelector('input[name="password"]');
  const togglePasswordBtn = form.querySelector("[data-toggle-password]");
  const capsLockHint = document.getElementById("register-capslock");
  if (!(passwordEl instanceof HTMLInputElement)) return;

  if (togglePasswordBtn instanceof HTMLButtonElement && togglePasswordBtn.dataset.bound !== "1") {
    togglePasswordBtn.dataset.bound = "1";
    togglePasswordBtn.addEventListener("click", () => {
      const isPassword = passwordEl.type === "password";
      passwordEl.type = isPassword ? "text" : "password";
      togglePasswordBtn.textContent = isPassword ? "Скрыть" : "Показать";
      togglePasswordBtn.setAttribute("aria-pressed", isPassword ? "true" : "false");
      passwordEl.focus();
    });
  }

  if (capsLockHint instanceof HTMLElement) {
    const updateCaps = (e) => {
      if (!(e instanceof KeyboardEvent)) return;
      const on = Boolean(e.getModifierState && e.getModifierState("CapsLock"));
      capsLockHint.hidden = !on;
    };

    passwordEl.addEventListener("keydown", updateCaps);
    passwordEl.addEventListener("keyup", updateCaps);
    passwordEl.addEventListener("blur", () => {
      capsLockHint.hidden = true;
    });
  }

  function validateName(value) {
    const v = String(value || "").trim();
    if (!v) return "Введите имя";
    if (v.length < 2) return "Имя слишком короткое";
    if (v.length > 24) return "Имя слишком длинное (макс. 24 символа)";
    return null;
  }

  function validateEmail(value) {
    const v = String(value || "").trim();
    if (!v) return "Введите email";
    if (!/^\S+@\S+\.\S+$/.test(v)) return "Невалидный email";
    return null;
  }

  function validatePassword(value) {
    const v = String(value || "");
    if (!v) return "Введите пароль";
    if (v.length < 6) return "Пароль слишком короткий (мин. 6 символов)";
    return null;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const role = String(fd.get("role") || "candidate");
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");

    const nameError = validateName(name);
    if (nameError) {
      toast.error(nameError);
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    try {
      store.register({ role, name, email, password });
      store.login({ email, password, remember: true });
      toast.success("Аккаунт создан");
      window.location.hash = "#/profile";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка регистрации");
    }
  });
}
