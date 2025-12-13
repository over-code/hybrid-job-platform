export function renderNotFound(path) {
  const safePath = String(path || "");

  return `
    <div class="container">
      <div class="card">
        <h1>404</h1>
        <p>Страница не найдена: <code>${safePath}</code></p>
        <p style="margin-top: 12px;">
          <a href="#/">На главную</a>
        </p>
      </div>
    </div>
  `;
}
