export function renderContacts() {
  return `
    <div class="container">
      <div class="card">
        <h1>Контакты</h1>
        <p class="text-muted mt-10">
          Есть идея по улучшению дизайна или контента? Напиши нам — мы используем фидбек, чтобы сделать интерфейс аккуратнее.
        </p>

        <p class="mt-10">
          HybridHub — демо‑проект, поэтому каналы связи указаны в формате примера. Тем не менее, структура страницы повторяет реальный сервисный подход:
          отдельные контакты под разные типы запросов и понятные ожидания по скорости ответа.
        </p>

        <p class="mt-10">
          Лучше всего писать так: коротко описать задачу, приложить скриншот и указать, на какой странице/устройстве это происходит.
          Если речь про визуальный баг, добавь тему (light/dark) и браузер.
        </p>

        <div class="cards-grid section-gap">
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">Email</div>
              <div class="text-small text-muted">hello@hybridhub.example</div>
              <div class="text-small text-muted mt-8">Общие вопросы, предложения и замечания по интерфейсу.</div>
            </div>
          </div>
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">Telegram</div>
              <div class="text-small text-muted">@hybridhub_support</div>
              <div class="text-small text-muted mt-8">Быстрые уточнения, короткий фидбек, идеи по UX.</div>
            </div>
          </div>
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">Партнёрства</div>
              <div class="text-small text-muted">partners@hybridhub.example</div>
              <div class="text-small text-muted mt-8">Интеграции, совместные проекты и предложения по контенту.</div>
            </div>
          </div>
        </div>

        <div class="cards-grid section-gap">
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">Скорость ответа</div>
              <div class="text-small text-muted">Обычно отвечаем в течение 1 рабочего дня (UTC+5).</div>
            </div>
          </div>
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">Что прислать</div>
              <div class="text-small text-muted">Скриншот + шаги воспроизведения + ожидаемое поведение.</div>
            </div>
          </div>
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">Темы запросов</div>
              <div class="text-small text-muted">UI/UX, контент, фильтры, сохранения, производительность, доступность.</div>
            </div>
          </div>
        </div>

        <div class="btn-row mt-16">
          <a class="btn btn--ghost" href="#/">На главную</a>
          <a class="btn btn--ghost" href="#/about">О проекте</a>
          <a class="btn btn--primary" href="#/vacancies">Вакансии</a>
        </div>
      </div>
    </div>
  `;
}
