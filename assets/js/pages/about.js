export function renderAbout() {
  return `
    <div class="container">
      <div class="card">
        <h1>О HybridHub</h1>
        <p class="text-muted mt-10">
          HybridHub — интерфейсный концепт платформы для поиска работы и фриланс‑проектов в IT‑сфере.
          Здесь IT — это не только разработка: дизайн, UX‑исследования, DevOps, QA, аналитика, менеджмент, контент и маркетинг.
        </p>

        <p class="mt-10">
          Цель проекта — показать цельный UX: каталог с фильтрами, детальные страницы, сохранения, микро‑анимации и аккуратная типографика.
          Это демо‑прототип, поэтому большинство данных хранится локально и предназначено для демонстрации интерфейсных паттернов.
        </p>

        <p class="mt-10">
          Если ты тестируешь платформу как пользователь, попробуй сценарий: выбери несколько вакансий/проектов, сохрани их, открой профиль и сравни списки.
          Так проще увидеть, как ведут себя компоненты в разных контекстах.
        </p>

        <div class="cards-grid section-gap">
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">Темная дизайн‑система</div>
              <div class="text-small text-muted">Палитра, типографика Inter, Bento‑карточки, плавные hover‑состояния.</div>
            </div>
          </div>
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">Реалистичный контент</div>
              <div class="text-small text-muted">Вакансии и проекты с разнообразием ролей, навыков, компаний, зарплат и форматов работы.</div>
            </div>
          </div>
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">SPA‑навигация</div>
              <div class="text-small text-muted">Маршрутизация на hash‑роутере — удобно для статического хостинга и демо.</div>
            </div>
          </div>
        </div>

        <div class="cards-grid section-gap">
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">Сохранения</div>
              <div class="text-small text-muted">Избранное хранится в localStorage и привязано к пользователю демо‑сессии.</div>
            </div>
          </div>
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">Фильтры и поиск</div>
              <div class="text-small text-muted">Фильтрация по формату работы, зарплате/бюджету, типу занятости и другим параметрам.</div>
            </div>
          </div>
          <div class="bento-card">
            <div class="bento-card__inner">
              <div class="bento-title">Детальные страницы</div>
              <div class="text-small text-muted">Развернутые блоки: требования, условия, этапы, о компании/клиенте и похожие предложения.</div>
            </div>
          </div>
        </div>

        <div class="btn-row mt-16">
          <a class="btn btn--ghost" href="#/">На главную</a>
          <a class="btn btn--primary" href="#/vacancies">Смотреть вакансии</a>
          <a class="btn btn--ghost" href="#/contacts">Контакты</a>
        </div>
      </div>
    </div>
  `;
}
