import { api } from "../utils/api.js";

function buildHref(path, query) {
  const qs = new URLSearchParams(query).toString();
  return qs ? `#${path}?${qs}` : `#${path}`;
}

export function renderProjects(ctx = {}) {
  api.initMockData();
  const projects = api.getProjects();

  const q = String(ctx.query?.q || "").trim().toLowerCase();
  const difficulty = String(ctx.query?.difficulty || "");

  const filtered = projects.filter((p) => {
    if (difficulty && String(p.difficulty) !== difficulty) return false;
    if (!q) return true;

    const hay = [p.title, p.category, p.deadlineText, p.difficulty, ...(p.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const items = filtered
    .map(
      (p) => `
        <li style="padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.10);">
          <div style="font-weight: 700;">
            <a href="#/projects/${p.id}" style="color: inherit; text-decoration: none;">${p.title}</a>
          </div>
          <div style="opacity: 0.85; margin-top: 4px;">${p.category} · ${p.deadlineText} · ${p.difficulty}</div>
        </li>
      `
    )
    .join("");

  return `
    <div class="container">
      <div class="card">
        <h1>Проекты</h1>
        <form id="projects-filters" style="margin-top: 12px; display: grid; gap: 10px;">
          <label style="display:grid; gap:6px;">
            <span>Поиск</span>
            <input name="q" type="text" value="${q}" placeholder="Например: landing, junior..." />
          </label>
          <label style="display:grid; gap:6px;">
            <span>Уровень</span>
            <select name="difficulty">
              <option value="" ${difficulty === "" ? "selected" : ""}>Любой</option>
              <option value="junior" ${difficulty === "junior" ? "selected" : ""}>junior</option>
              <option value="middle" ${difficulty === "middle" ? "selected" : ""}>middle</option>
              <option value="senior" ${difficulty === "senior" ? "selected" : ""}>senior</option>
              <option value="any" ${difficulty === "any" ? "selected" : ""}>any</option>
            </select>
          </label>
          <button type="submit">Применить</button>
        </form>
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

export function mountProjects(ctx = {}) {
  const form = document.getElementById("projects-filters");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const nextQ = String(fd.get("q") || "").trim();
    const nextDifficulty = String(fd.get("difficulty") || "");

    const query = {};
    if (nextQ) query.q = nextQ;
    if (nextDifficulty) query.difficulty = nextDifficulty;

    window.location.hash = buildHref("/projects", query).slice(1);
  });
}
