export function renderForgotPassword() {
  return `
    <div class="container">
      <div class="card">
        <h1>Восстановление пароля</h1>
        <p style="margin-top: 10px;">
          В учебной версии мы не отправляем письма. Перейди на экран сброса и задай новый пароль.
        </p>
        <p style="margin-top: 12px;">
          <a href="#/reset-password">Перейти к сбросу пароля</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/login">Назад к входу</a>
        </p>
      </div>
    </div>
  `;
}
