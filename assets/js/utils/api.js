const PREFIX = "hjp:";

const KEYS = {
  users: `${PREFIX}users`,
  session: `${PREFIX}session`,
  vacancies: `${PREFIX}vacancies`,
  projects: `${PREFIX}projects`,
};

function nowIso() {
  return new Date().toISOString();
}

function readJson(key, fallback) {
  const raw = localStorage.getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureArray(key) {
  const value = readJson(key, null);
  if (Array.isArray(value)) return value;
  const next = [];
  writeJson(key, next);
  return next;
}

function generateId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function createVacancy(overrides = {}) {
  const t = nowIso();
  return {
    id: generateId("vac"),
    title: "Frontend Developer",
    companyName: "Demo Company",
    city: "Алматы",
    salaryFrom: 250000,
    salaryTo: 450000,
    employmentType: "full_time",
    remote: true,
    tags: ["js", "html", "css"],
    description: "Учебная вакансия (мок-данные).",
    createdByUserId: "system",
    createdAt: t,
    updatedAt: t,
    ...overrides,
  };
}

function createProject(overrides = {}) {
  const t = nowIso();
  return {
    id: generateId("prj"),
    title: "Landing page",
    budgetFrom: 80000,
    budgetTo: 150000,
    deadlineText: "2 недели",
    category: "Web",
    difficulty: "junior",
    tags: ["layout", "css"],
    description: "Учебный проект (мок-данные).",
    createdByUserId: "system",
    createdAt: t,
    updatedAt: t,
    ...overrides,
  };
}

export const api = {
  KEYS,

  initMockData() {
    ensureArray(KEYS.users);

    const session = readJson(KEYS.session, null);
    if (session == null || typeof session !== "object") {
      writeJson(KEYS.session, { currentUserId: null, remember: false });
    }

    const vacancies = readJson(KEYS.vacancies, null);
    if (!Array.isArray(vacancies) || vacancies.length === 0) {
      const seed = Array.from({ length: 20 }, (_, i) =>
        createVacancy({
          title: `Frontend Developer #${i + 1}`,
          city: i % 2 === 0 ? "Алматы" : "Астана",
          remote: i % 3 === 0,
        })
      );
      writeJson(KEYS.vacancies, seed);
    }

    const projects = readJson(KEYS.projects, null);
    if (!Array.isArray(projects) || projects.length === 0) {
      const seed = Array.from({ length: 20 }, (_, i) =>
        createProject({
          title: `Project #${i + 1}`,
          difficulty: i % 3 === 0 ? "junior" : i % 3 === 1 ? "middle" : "senior",
        })
      );
      writeJson(KEYS.projects, seed);
    }
  },

  getVacancies() {
    return ensureArray(KEYS.vacancies);
  },

  getProjects() {
    return ensureArray(KEYS.projects);
  },
};
