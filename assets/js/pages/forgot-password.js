export function renderForgotPassword() {
  return `
    <div class="container">
      <div class="bento-card">
        <div class="bento-card__inner">
          <div class="page-head">
            <div>
              <h1 class="h1">Восстановление пароля</h1>
              <p class="text-muted mt-8">
                Демо‑режим: письма не отправляются. Перейди на экран сброса и задай новый пароль.
              </p>
            </div>
          </div>

          <div class="btn-row mt-16">
            <a class="btn btn--primary" href="#/reset-password">Сбросить пароль</a>
            <a class="btn btn--ghost" href="#/login">Назад к входу</a>
          </div>
        </div>
      </div>
    </div>
  `;
}
