const TOAST_CONTAINER_ID = "app-toast";

function ensureContainer() {
  let el = document.getElementById(TOAST_CONTAINER_ID);
  if (el) return el;

  el = document.createElement("div");
  el.id = TOAST_CONTAINER_ID;
  el.className = "toast-container";
  document.body.appendChild(el);
  return el;
}

function removeToast(node) {
  if (!(node instanceof HTMLElement)) return;
  if (node.dataset.closing === "1") return;
  node.dataset.closing = "1";
  node.classList.remove("is-visible");

  const prefersReduced = Boolean(
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const ms = prefersReduced ? 0 : 220;
  window.setTimeout(() => {
    node.remove();
  }, ms);
}

function show(message, opts = {}) {
  const { type = "info", duration = 3800 } = opts;

  const container = ensureContainer();
  const toastEl = document.createElement("div");
  toastEl.className = `toast toast--${type}`;
  toastEl.setAttribute("role", "status");
  toastEl.setAttribute("aria-live", "polite");

  const textEl = document.createElement("div");
  textEl.className = "toast__text";
  textEl.textContent = String(message || "");

  const closeBtn = document.createElement("button");
  closeBtn.className = "toast__close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Закрыть уведомление");
  closeBtn.textContent = "×";

  closeBtn.addEventListener("click", () => {
    removeToast(toastEl);
  });

  toastEl.addEventListener("click", (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && t.closest("button")) return;
    removeToast(toastEl);
  });

  toastEl.appendChild(textEl);
  toastEl.appendChild(closeBtn);
  container.appendChild(toastEl);

  window.requestAnimationFrame(() => {
    toastEl.classList.add("is-visible");
  });

  if (Number.isFinite(duration) && duration > 0) {
    window.setTimeout(() => {
      removeToast(toastEl);
    }, duration);
  }

  return toastEl;
}

export const toast = {
  show,
  success(message, opts = {}) {
    return show(message, { ...opts, type: "success" });
  },
  error(message, opts = {}) {
    return show(message, { ...opts, type: "error" });
  },
  info(message, opts = {}) {
    return show(message, { ...opts, type: "info" });
  },
};
