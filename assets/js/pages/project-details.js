import { api } from "../utils/api.js";

export function renderProjectDetails(ctx = {}) {
  api.initMockData();

  const id = ctx.params?.id;
  const project = api.getProjectById(id);

  if (!project) {
    return `
      <div class="container">
        <div class="card">
          <h1>Проект не найден</h1>
          <p style="margin-top: 12px;">
            <a href="#/projects">Назад к списку проектов</a>
          </p>
        </div>
      </div>
    `;
  }

  const budget =
    project.budgetFrom || project.budgetTo
      ? `${project.budgetFrom ?? "—"} – ${project.budgetTo ?? "—"}`
      : "—";

  return `
    <div class="container">
      <div class="card">
        <h1>${project.title}</h1>
        <p style="margin-top: 8px; opacity: 0.9;">${project.category} · ${project.deadlineText} · ${project.difficulty}</p>
        <p style="margin-top: 8px; opacity: 0.9;">Бюджет: ${budget}</p>
        <p style="margin-top: 12px; line-height: 1.6; opacity: 0.9;">${project.description}</p>

        <p style="margin-top: 14px;">
          <a href="#/projects">Назад к списку проектов</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/vacancies">Вакансии</a>
        </p>
      </div>
    </div>
  `;
}
