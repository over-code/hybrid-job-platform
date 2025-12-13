export function renderHome() {
  return `
    <div class="container">
      <div class="card">
        <h1>Hybrid Job Platform</h1>
        <p>Главная страница (MVP).</p>
        <p style="margin-top: 12px;">
          <a href="#/vacancies">Вакансии</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/projects">Проекты</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/about">О проекте</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/contacts">Контакты</a>
        </p>
      </div>
    </div>
  `;
}
