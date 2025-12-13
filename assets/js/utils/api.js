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

function ensureObject(key, fallback) {
  const value = readJson(key, null);
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  const next = fallback;
  writeJson(key, next);
  return next;
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

function createUser(overrides = {}) {
  const t = nowIso();
  return {
    id: generateId("usr"),
    role: "candidate",
    name: "User",
    email: "",
    password: "",
    avatarUrl: null,
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

    ensureObject(KEYS.session, { currentUserId: null, remember: false });

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

  getUsers() {
    return ensureArray(KEYS.users);
  },

  getSession() {
    return ensureObject(KEYS.session, { currentUserId: null, remember: false });
  },

  setSession(nextSession) {
    writeJson(KEYS.session, nextSession);
  },

  getUserById(id) {
    if (!id) return null;
    const users = ensureArray(KEYS.users);
    return users.find((u) => u.id === id) || null;
  },

  getCurrentUser() {
    const session = this.getSession();
    return this.getUserById(session.currentUserId);
  },

  register({ role, name, email, password }) {
    const users = ensureArray(KEYS.users);
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error("Email обязателен");
    }

    if (!String(password || "").trim()) {
      throw new Error("Пароль обязателен");
    }

    const exists = users.some((u) => String(u.email || "").toLowerCase() === normalizedEmail);
    if (exists) {
      throw new Error("Пользователь с таким email уже существует");
    }

    const safeRole = role === "employer" ? "employer" : "candidate";
    const safeName = String(name || "").trim() || "User";

    const user = createUser({
      role: safeRole,
      name: safeName,
      email: normalizedEmail,
      password: String(password),
    });

    users.push(user);
    writeJson(KEYS.users, users);
    return user;
  },

  login({ email, password, remember = false }) {
    const users = ensureArray(KEYS.users);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = users.find((u) => String(u.email || "").toLowerCase() === normalizedEmail) || null;

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (String(user.password) !== String(password)) {
      throw new Error("Неверный пароль");
    }

    this.setSession({ currentUserId: user.id, remember: Boolean(remember) });
    return user;
  },

  logout() {
    const session = this.getSession();
    this.setSession({ ...session, currentUserId: null });
  },

  updatePassword({ email, newPassword }) {
    const users = ensureArray(KEYS.users);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const idx = users.findIndex((u) => String(u.email || "").toLowerCase() === normalizedEmail);

    if (idx === -1) {
      throw new Error("Пользователь не найден");
    }

    if (!String(newPassword || "").trim()) {
      throw new Error("Новый пароль обязателен");
    }

    const t = nowIso();
    users[idx] = { ...users[idx], password: String(newPassword), updatedAt: t };
    writeJson(KEYS.users, users);
  },
};
