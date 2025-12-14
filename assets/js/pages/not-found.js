export function renderNotFound(path) {
  const safePath = String(path || "");

  return `
    <div class="container">
      <div class="card">
        <h1>404</h1>
        <p>Страница не найдена: <code>${safePath}</code></p>
        <div class="btn-row mt-12">
          <a class="btn btn--ghost" href="#/">На главную</a>
        </div>
      </div>
    </div>
  `;
}
