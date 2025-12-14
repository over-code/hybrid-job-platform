import { store } from "../store.js";
import { toast } from "../components/toast.js";

export function renderLogin() {
  return `
    <div class="container">
      <div class="bento-card">
        <div class="bento-card__inner">
          <div class="page-head">
            <div>
              <h1 class="h1">Вход</h1>
              <p class="text-muted mt-8">Продолжи с того места, где остановился.</p>
            </div>
          </div>

          <form id="login-form" class="form" novalidate autocomplete="off">
          <label class="field">
            <span>Email</span>
            <input name="email" type="email" autocomplete="email" inputmode="email" />
          </label>

          <label class="field">
            <span>Пароль</span>
            <div class="input-row">
              <input name="password" type="password" autocomplete="current-password" />
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
            <div class="hint hint--warn text-small" id="login-capslock" hidden>Caps Lock включён</div>
          </label>

          <label class="field field--row">
            <input name="remember" type="checkbox" />
            <span>Запомнить</span>
          </label>

          <button class="btn btn--primary" type="submit">Войти</button>
          </form>

          <div class="btn-row mt-16">
            <a class="btn btn--ghost" href="#/register">Регистрация</a>
            <a class="btn btn--ghost" href="#/forgot-password">Забыли пароль?</a>
            <a class="btn btn--ghost" href="#/">На главную</a>
          </div>

          <section class="hint mt-16" aria-label="Подсказка">
            <div class="empty-title">После входа</div>
            <div class="text-muted text-small mt-8">
              Сохранения и профиль привязаны к пользователю. Демо‑данные хранятся в localStorage этого браузера.
            </div>
            <div class="tags mt-12">
              <span class="tag">Сохранения</span>
              <span class="tag">Отклики (демо)</span>
              <span class="tag">Профиль</span>
            </div>
            <div class="text-muted text-small mt-12">Совет: включи «Запомнить», чтобы не вводить данные заново.</div>
          </section>
        </div>
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
  if (!form) return;

  const emailEl = form.querySelector('input[name="email"]');
  const passwordEl = form.querySelector('input[name="password"]');
  const rememberEl = form.querySelector('input[name="remember"]');
  const togglePasswordBtn = form.querySelector("[data-toggle-password]");
  const capsLockHint = document.getElementById("login-capslock");
  if (!(emailEl instanceof HTMLInputElement)) return;
  if (!(passwordEl instanceof HTMLInputElement)) return;
  if (!(rememberEl instanceof HTMLInputElement)) return;

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

  const REMEMBER_FORM_KEY = "hjp:loginRememberForm";

  function readRememberForm() {
    try {
      const raw = localStorage.getItem(REMEMBER_FORM_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return {
        remember: Boolean(parsed.remember),
        email: String(parsed.email || ""),
        password: String(parsed.password || ""),
      };
    } catch {
      return null;
    }
  }

  function writeRememberForm({ remember, email }) {
    localStorage.setItem(
      REMEMBER_FORM_KEY,
      JSON.stringify({
        remember: Boolean(remember),
        email: String(email || "").trim(),
        password: String(passwordEl.value || ""),
      })
    );
  }

  function clearRememberForm() {
    localStorage.removeItem(REMEMBER_FORM_KEY);
  }

  const remembered = readRememberForm();
  const shouldRemember = Boolean(remembered?.remember);
  rememberEl.checked = shouldRemember;

  if (shouldRemember && remembered?.email) {
    emailEl.value = String(remembered.email || "");
  }

  if (shouldRemember && remembered?.password) {
    passwordEl.value = String(remembered.password || "");
  }

  if (!shouldRemember) {
    // Браузер может автозаполнять поля независимо от нашего чекбокса.
    // Если "Запомнить" выключен — очищаем ТОЛЬКО автозаполненные значения,
    // не трогая ввод пользователя.
    const hasAutofill = Boolean(emailEl.value || passwordEl.value);
    if (hasAutofill) {
      let userInteracted = false;

      const markInteracted = () => {
        userInteracted = true;
      };

      emailEl.addEventListener("input", markInteracted, { once: true });
      passwordEl.addEventListener("input", markInteracted, { once: true });

      const clearIfNotInteracted = () => {
        if (userInteracted) return;
        emailEl.value = "";
        passwordEl.value = "";
      };

      window.requestAnimationFrame(clearIfNotInteracted);
      setTimeout(clearIfNotInteracted, 0);
    }
  }

  rememberEl.addEventListener("change", () => {
    if (!rememberEl.checked) {
      clearRememberForm();
      return;
    }

    writeRememberForm({ remember: true, email: emailEl.value });
  });

  emailEl.addEventListener("input", () => {
    if (!rememberEl.checked) return;
    writeRememberForm({ remember: true, email: emailEl.value });
  });

  passwordEl.addEventListener("input", () => {
    if (!rememberEl.checked) return;
    writeRememberForm({ remember: true, email: emailEl.value });
  });

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
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const remember = Boolean(fd.get("remember"));

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
      store.login({ email, password, remember });
      toast.success("Добро пожаловать");

      if (remember) {
        writeRememberForm({ remember: true, email });
      } else {
        clearRememberForm();
      }

      window.location.hash = "#/profile";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка входа");
    }
  });
}
