# Architecture

## 1) Как запускается
Проект — статический сайт.
Рекомендация: использовать **hash‑роутинг** (пример: `/#/vacancies`), чтобы навигация работала без backend.

## 2) Целевая структура проекта
```
hybrid-job-platform/
  index.html
  assets/
    css/
      base/
        reset.css
        vars.css
        fonts.css
      components/
      style.css
    js/
      main.js
      router.js
      store.js
      pages/
        home.js
        login.js
        register.js
        forgot-password.js
        reset-password.js
        vacancies.js
        vacancy-details.js
        projects.js
        project-details.js
        profile.js
        about.js
        contacts.js
      components/
        header.js
        footer.js
        auth-form.js
        vacancy-card.js
        project-card.js
      utils/
        api.js
        validators.js
        formatters.js
    images/
  docs/
    README.md
    OVERVIEW.md
    ARCHITECTURE.md
    DATA_MODEL.md
    ROADMAP.md
    QA.md
    GLOSSARY.md
```

## 3) Ответственности модулей
- `index.html`: один контейнер приложения + подключения стилей/скриптов.
- `main.js`: инициализация приложения, регистрация роутера, подключение общих компонентов.
- `router.js`: hash‑роутинг, маппинг маршрутов на страницы, 404.
- `store.js`: состояние (текущий пользователь, настройки), синхронизация с `localStorage`.
- `pages/*`: рендер конкретных экранов.
- `components/*`: переиспользуемые UI‑блоки.
- `utils/api.js`: CRUD для `localStorage` по `DATA_MODEL.md` (это “API” проекта).

## 4) Конвенции
- Все ключи в `localStorage` имеют префикс `hjp:`.
- Любая страница должна уметь отрисоваться “с нуля” из текущего состояния `store`/`localStorage`.
- Ошибки должны отображаться пользователю понятным текстом (хотя бы через UI‑алерт/блок).
