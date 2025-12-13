import { api } from "../utils/api.js";

export function renderVacancies() {
  api.initMockData();
  const vacancies = api.getVacancies();

  const items = vacancies
    .map(
      (v) => `
        <li style="padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.10);">
          <div style="font-weight: 700;">${v.title}</div>
          <div style="opacity: 0.85; margin-top: 4px;">${v.companyName} · ${v.city} · ${v.remote ? "Remote" : "On-site"}</div>
        </li>
      `
    )
    .join("");

  return `
    <div class="container">
      <div class="card">
        <h1>Вакансии</h1>
        <p style="margin-top: 8px;">
          <a href="#/">На главную</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/projects">Проекты</a>
        </p>
        <ul style="list-style: none; padding: 0; margin: 16px 0 0;">
          ${items}
        </ul>
      </div>
    </div>
  `;
}
