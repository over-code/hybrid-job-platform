import { renderHome } from "./pages/home.js";
import { renderAbout } from "./pages/about.js";
import { renderContacts } from "./pages/contacts.js";
import { renderLogin, mountLogin } from "./pages/login.js";
import { renderRegister, mountRegister } from "./pages/register.js";
import { renderForgotPassword } from "./pages/forgot-password.js";
import { renderResetPassword, mountResetPassword } from "./pages/reset-password.js";
import { renderProfile, mountProfile } from "./pages/profile.js";
import { renderVacancies, mountVacancies } from "./pages/vacancies.js";
import { renderVacancyDetails } from "./pages/vacancy-details.js";
import { renderProjects, mountProjects } from "./pages/projects.js";
import { renderProjectDetails } from "./pages/project-details.js";
import { renderNotFound } from "./pages/not-found.js";
import { store } from "./store.js";

function getAppRoot() {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("Root element #app not found");
  }
  return root;
}

function parseHash() {
  const raw = window.location.hash || "";
  const withoutHash = raw.startsWith("#") ? raw.slice(1) : raw;
  const trimmed = withoutHash.trim() || "/";
  const [path, search = ""] = trimmed.split("?");
  const query = Object.fromEntries(new URLSearchParams(search));
  return { path: path || "/", query };
}

const routes = {
  "/": { render: renderHome },
  "/about": { render: renderAbout },
  "/contacts": { render: renderContacts },
  "/login": { render: renderLogin, mount: mountLogin },
  "/register": { render: renderRegister, mount: mountRegister },
  "/forgot-password": { render: renderForgotPassword },
  "/reset-password": { render: renderResetPassword, mount: mountResetPassword },
  "/profile": { render: renderProfile, mount: mountProfile, isPrivate: true },
  "/vacancies": { render: renderVacancies, mount: mountVacancies },
  "/projects": { render: renderProjects, mount: mountProjects },
};

function matchDynamicRoute(path) {
  const vacancyPrefix = "/vacancies/";
  if (path.startsWith(vacancyPrefix)) {
    const id = path.slice(vacancyPrefix.length);
    if (id) return { render: renderVacancyDetails, params: { id } };
  }

  const projectPrefix = "/projects/";
  if (path.startsWith(projectPrefix)) {
    const id = path.slice(projectPrefix.length);
    if (id) return { render: renderProjectDetails, params: { id } };
  }

  return null;
}

function renderRoute() {
  const root = getAppRoot();
  const { path, query } = parseHash();
  store.refreshCurrentUser();
  const staticRoute = routes[path];
  const dynamic = matchDynamicRoute(path);
  const route = staticRoute || dynamic;

  const ctx = {
    path,
    query,
    params: dynamic?.params || {},
  };

  if (!route) {
    root.innerHTML = renderNotFound(path);
    return;
  }

  if (route.isPrivate && !store.state.currentUser) {
    window.location.hash = "#/login";
    return;
  }

  root.innerHTML = route.render(ctx);
  if (typeof route.mount === "function") {
    route.mount(ctx);
  }
}

export function initRouter() {
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
}
