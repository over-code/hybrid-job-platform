import { renderHome } from "./pages/home.js";
import { renderAbout } from "./pages/about.js";
import { renderContacts } from "./pages/contacts.js";
import { renderLogin, mountLogin } from "./pages/login.js";
import { renderRegister, mountRegister } from "./pages/register.js";
import { renderForgotPassword } from "./pages/forgot-password.js";
import { renderResetPassword, mountResetPassword } from "./pages/reset-password.js";
import { renderProfile, mountProfile } from "./pages/profile.js";
import { renderVacancies } from "./pages/vacancies.js";
import { renderProjects } from "./pages/projects.js";
import { renderNotFound } from "./pages/not-found.js";
import { store } from "./store.js";

function getAppRoot() {
  const root = document.getElementById("app");
  if (!root) {
    throw new Error("Root element #app not found");
  }
  return root;
}

function getPathFromHash() {
  const raw = window.location.hash || "";
  const withoutHash = raw.startsWith("#") ? raw.slice(1) : raw;
  const path = withoutHash.trim() || "/";
  return path;
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
  "/vacancies": { render: renderVacancies },
  "/projects": { render: renderProjects },
};

function renderRoute() {
  const root = getAppRoot();
  const path = getPathFromHash();
  store.refreshCurrentUser();
  const route = routes[path];

  if (!route) {
    root.innerHTML = renderNotFound(path);
    return;
  }

  if (route.isPrivate && !store.state.currentUser) {
    window.location.hash = "#/login";
    return;
  }

  root.innerHTML = route.render();
  if (typeof route.mount === "function") {
    route.mount();
  }
}

export function initRouter() {
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
}
