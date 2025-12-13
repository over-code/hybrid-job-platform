import { store } from "../store.js";

export function renderHome() {
  const isAuthed = Boolean(store.state.currentUser);

  const authLinks = isAuthed
    ? `
        <a href="#/profile">Профиль</a>
      `
    : `
        <a href="#/login">Войти</a>
        <span style="opacity: 0.6;"> · </span>
        <a href="#/register">Регистрация</a>
      `;

  return `
    <div class="container">
      <div class="card">
        <h1>Hybrid Job Platform</h1>
        <p>Главная страница (MVP).</p>
        <p style="margin-top: 12px;">
          <a href="#/vacancies">Вакансии</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/projects">Проекты</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/about">О проекте</a>
          <span style="opacity: 0.6;"> · </span>
          <a href="#/contacts">Контакты</a>
        </p>
        <p style="margin-top: 12px;">
          ${authLinks}
        </p>
      </div>
    </div>
  `;
}
