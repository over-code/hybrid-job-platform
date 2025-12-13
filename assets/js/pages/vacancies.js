import { api } from "../utils/api.js";

function buildHref(path, query) {
  const qs = new URLSearchParams(query).toString();
  return qs ? `#${path}?${qs}` : `#${path}`;
}

export function renderVacancies(ctx = {}) {
  api.initMockData();
  const vacancies = api.getVacancies();
  const q = String(ctx.query?.q || "").trim().toLowerCase();
  const remoteOnly = String(ctx.query?.remote || "") === "1";

  const filtered = vacancies.filter((v) => {
    if (remoteOnly && !v.remote) return false;
    if (!q) return true;

    const hay = [v.title, v.companyName, v.city, ...(v.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const items = filtered
    .map(
      (v) => `
        <li style="padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.10);">
          <div style="font-weight: 700;">
            <a href="#/vacancies/${v.id}" style="color: inherit; text-decoration: none;">${v.title}</a>
          </div>
          <div style="opacity: 0.85; margin-top: 4px;">${v.companyName} · ${v.city} · ${v.remote ? "Remote" : "On-site"}</div>
        </li>
      `
    )
    .join("");

  return `
    <div class="container">
      <div class="card">
        <h1>Вакансии</h1>
        <form id="vacancies-filters" style="margin-top: 12px; display: grid; gap: 10px;">
          <label style="display:grid; gap:6px;">
            <span>Поиск</span>
            <input name="q" type="text" value="${q}" placeholder="Например: frontend, Алматы..." />
          </label>
          <label style="display:flex; gap:8px; align-items:center;">
            <input name="remote" type="checkbox" ${remoteOnly ? "checked" : ""} />
            <span>Только remote</span>
          </label>
          <button type="submit">Применить</button>
        </form>
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

export function mountVacancies(ctx = {}) {
  const form = document.getElementById("vacancies-filters");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const nextQ = String(fd.get("q") || "").trim();
    const remote = fd.get("remote") ? "1" : "";

    const query = {};
    if (nextQ) query.q = nextQ;
    if (remote) query.remote = remote;

    window.location.hash = buildHref("/vacancies", query).slice(1);
  });
}
