import { api } from "../utils/api.js";

export function renderVacancyDetails(ctx = {}) {
  api.initMockData();

  const id = ctx.params?.id;
  const vacancy = api.getVacancyById(id);

  if (!vacancy) {
    return `
      <div class="container">
        <div class="card">
          <h1>Вакансия не найдена</h1>
          <p style="margin-top: 12px;">
            <a href="#/vacancies">Назад к списку вакансий</a>
          </p>
        </div>
      </div>
    `;
  }

  const salary =
    vacancy.salaryFrom || vacancy.salaryTo
      ? `${vacancy.salaryFrom ?? "—"} – ${vacancy.salaryTo ?? "—"}`
      : "—";

  return `
    <div class="container">
      <div class="card">
        <h1>${vacancy.title}</h1>
        <p style="margin-top: 8px; opacity: 0.9;">${vacancy.companyName} · ${vacancy.city} · ${vacancy.remote ? "Remote" : "On-site"}</p>
        <p style="margin-top: 8px; opacity: 0.9;">Зарплата: ${salary}</p>
        <p style="margin-top: 12px; line-height: 1.6; opacity: 0.9;">${vacancy.description}</p>

        <p style="margin-top: 14px;">
          <a href="#/vacancies">Назад к списку вакансий</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/projects">Проекты</a>
        </p>
      </div>
    </div>
  `;
}
