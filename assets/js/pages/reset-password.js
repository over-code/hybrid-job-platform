import { api } from "../utils/api.js";
import { toast } from "../components/toast.js";

export function renderResetPassword() {
  return `
    <div class="container">
      <div class="bento-card">
        <div class="bento-card__inner">
          <div class="page-head">
            <div>
              <h1 class="h1">Сброс пароля</h1>
              <p class="text-muted mt-8">Демо‑режим: пароль меняется сразу, без писем.</p>
            </div>
          </div>

          <form id="reset-form" class="form" novalidate>
          <label class="field">
            <span>Email</span>
            <input name="email" type="email" autocomplete="email" inputmode="email" />
          </label>

          <label class="field">
            <span>Новый пароль</span>
            <div class="input-row">
              <input name="newPassword" type="password" autocomplete="new-password" />
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
            <div class="hint hint--warn text-small" id="reset-capslock" hidden>Caps Lock включён</div>
          </label>

          <button class="btn btn--primary" type="submit">Сохранить новый пароль</button>
          </form>

          <div class="btn-row mt-16">
            <a class="btn btn--ghost" href="#/login">Назад к входу</a>
            <a class="btn btn--ghost" href="#/">На главную</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function mountResetPassword() {
  const form = document.getElementById("reset-form");
  if (!form) return;

  const passwordEl = form.querySelector('input[name="newPassword"]');
  const togglePasswordBtn = form.querySelector("[data-toggle-password]");
  const capsLockHint = document.getElementById("reset-capslock");
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

  function validateEmail(value) {
    const v = String(value || "").trim();
    if (!v) return "Введите email";
    if (!/^\S+@\S+\.\S+$/.test(v)) return "Невалидный email";
    return null;
  }

  function validatePassword(value) {
    const v = String(value || "");
    if (!v) return "Введите новый пароль";
    if (v.length < 6) return "Пароль слишком короткий (мин. 6 символов)";
    return null;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const email = String(fd.get("email") || "").trim();
    const newPassword = String(fd.get("newPassword") || "");

    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    const passError = validatePassword(newPassword);
    if (passError) {
      toast.error(passError);
      return;
    }

    try {
      api.updatePassword({ email, newPassword });
      toast.success("Пароль обновлён. Теперь можно войти.");
      setTimeout(() => {
        window.location.hash = "#/login";
      }, 700);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сброса пароля");
    }
  });
}
