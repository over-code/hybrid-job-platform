import { renderHome } from "./pages/home.js";
import { renderAbout } from "./pages/about.js";
import { renderContacts } from "./pages/contacts.js";
import { renderNotFound } from "./pages/not-found.js";

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
  "/": renderHome,
  "/about": renderAbout,
  "/contacts": renderContacts,
};

function renderRoute() {
  const root = getAppRoot();
  const path = getPathFromHash();
  const render = routes[path];

  if (!render) {
    root.innerHTML = renderNotFound(path);
    return;
  }

  root.innerHTML = render();
}

export function initRouter() {
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
}
