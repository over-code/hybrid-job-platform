const THEME_KEY = "hjp:theme";

export function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

export function applyTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  return next;
}

export function initTheme() {
  return applyTheme(getPreferredTheme());
}

export function toggleTheme() {
  const current = document.documentElement.dataset.theme || "dark";
  return applyTheme(current === "dark" ? "light" : "dark");
}
