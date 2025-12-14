import { renderHome, mountHome } from "./pages/home.js";
import { renderAbout } from "./pages/about.js";
import { renderContacts } from "./pages/contacts.js";
import { renderLogin, mountLogin } from "./pages/login.js";
import { renderRegister, mountRegister } from "./pages/register.js";
import { renderForgotPassword } from "./pages/forgot-password.js";
import { renderResetPassword, mountResetPassword } from "./pages/reset-password.js";
import { renderProfile, mountProfile } from "./pages/profile.js";
import { renderVacancies, mountVacancies } from "./pages/vacancies.js";
import { renderVacancyDetails, mountVacancyDetails } from "./pages/vacancy-details.js";
import { renderProjects, mountProjects } from "./pages/projects.js";
import { renderProjectDetails, mountProjectDetails } from "./pages/project-details.js";
import { renderNotFound } from "./pages/not-found.js";
import { store } from "./store.js";
import { renderShell, mountShell } from "./shell.js";

let transitionToken = 0;

function prefersReducedMotion() {
  return Boolean(
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function toMs(value) {
  const v = String(value || "").trim();
  if (!v) return 0;
  if (v.endsWith("ms")) return Number.parseFloat(v);
  if (v.endsWith("s")) return Number.parseFloat(v) * 1000;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function getTransitionMs(el) {
  if (!el) return 0;
  const style = window.getComputedStyle(el);
  const durations = (style.transitionDuration || "").split(",").map((s) => s.trim());
  const delays = (style.transitionDelay || "").split(",").map((s) => s.trim());
  const len = Math.max(durations.length, delays.length);

  let max = 0;
  for (let i = 0; i < len; i += 1) {
    const dur = toMs(durations[i] ?? durations[durations.length - 1]);
    const del = toMs(delays[i] ?? delays[delays.length - 1]);
    max = Math.max(max, dur + del);
  }
  return max;
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

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
  "/": { render: renderHome, mount: mountHome },
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
    if (id) return { render: renderVacancyDetails, mount: mountVacancyDetails, params: { id } };
  }

  const projectPrefix = "/projects/";
  if (path.startsWith(projectPrefix)) {
    const id = path.slice(projectPrefix.length);
    if (id) return { render: renderProjectDetails, mount: mountProjectDetails, params: { id } };
  }

  return null;
}

async function renderRoute() {
  const myToken = (transitionToken += 1);
  const root = getAppRoot();

  const existingMain = document.getElementById("app-main");
  if (existingMain && !prefersReducedMotion()) {
    existingMain.classList.add("page-leave");
    await sleep(getTransitionMs(existingMain));
  }

  if (myToken !== transitionToken) return;

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
    root.innerHTML = renderShell(renderNotFound(path), ctx);
    mountShell();
    return;
  }

  if (route.isPrivate && !store.state.currentUser) {
    window.location.hash = "#/login";
    return;
  }

  root.innerHTML = renderShell(route.render(ctx), ctx);
  mountShell();
  if (typeof route.mount === "function") {
    route.mount(ctx);
  }

  const nextMain = document.getElementById("app-main");
  if (nextMain && !prefersReducedMotion()) {
    nextMain.classList.add("page-enter");
    window.requestAnimationFrame(() => {
      nextMain.classList.remove("page-enter");
    });
  }
}

export function initRouter() {
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
}
