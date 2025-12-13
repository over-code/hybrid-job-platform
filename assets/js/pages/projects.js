import { api } from "../utils/api.js";

export function renderProjects() {
  api.initMockData();
  const projects = api.getProjects();

  const items = projects
    .map(
      (p) => `
        <li style="padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.10);">
          <div style="font-weight: 700;">${p.title}</div>
          <div style="opacity: 0.85; margin-top: 4px;">${p.category} · ${p.deadlineText} · ${p.difficulty}</div>
        </li>
      `
    )
    .join("");

  return `
    <div class="container">
      <div class="card">
        <h1>Проекты</h1>
        <p style="margin-top: 8px;">
          <a href="#/">На главную</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/vacancies">Вакансии</a>
        </p>
        <ul style="list-style: none; padding: 0; margin: 16px 0 0;">
          ${items}
        </ul>
      </div>
    </div>
  `;
}
