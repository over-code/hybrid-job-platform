# Data Model (localStorage)

Единственный источник данных учебной версии — `localStorage`.

## Общие правила
- Формат хранения: JSON.
- Префикс ключей: `hjp:`.
- Идентификаторы: строка (`id`).
- Даты: ISO-строки (`createdAt`, `updatedAt`).

## Ключи

### `hjp:users`
Массив пользователей.

User:
- `id`: string
- `role`: `"candidate" | "employer"`
- `name`: string
- `email`: string
- `password`: string
- `avatarUrl`: string | null
- `preferences`: object
- `candidateProfile`: object
- `createdAt`: string
- `updatedAt`: string

#### `user.preferences`
Структура для хранения предпочтений (используется как расширение профиля и может применяться как стартовые значения для фильтров).

- `preferences.vacancies.workMode`: string (`"" | "remote" | "hybrid" | "office"`)
- `preferences.vacancies.employmentType`: string (`"" | "full_time" | "contract" | "part_time" | "internship"`)
- `preferences.vacancies.minSalary`: string
- `preferences.vacancies.maxSalary`: string
- `preferences.projects.category`: string
- `preferences.projects.difficulty`: string (`"" | "junior" | "middle" | "senior" | "any"`)
- `preferences.projects.minBudget`: string
- `preferences.projects.maxBudget`: string

#### `user.candidateProfile`
Профиль кандидата для отображения работодателю (заполняется в «Расширенных настройках» профиля).

- `candidateProfile.headline`: string
- `candidateProfile.level`: string (`"" | "junior" | "middle" | "senior" | "lead"`)
- `candidateProfile.city`: string
- `candidateProfile.workMode`: string (`"" | "remote" | "hybrid" | "office"`)
- `candidateProfile.employmentType`: string (`"" | "full_time" | "contract" | "part_time" | "internship"`)
- `candidateProfile.experienceYears`: string
- `candidateProfile.salaryFrom`: string
- `candidateProfile.salaryTo`: string
- `candidateProfile.stack`: string
- `candidateProfile.about`: string
- `candidateProfile.links`: object
- `candidateProfile.links.portfolio`: string
- `candidateProfile.links.github`: string
- `candidateProfile.links.linkedin`: string
- `candidateProfile.links.telegram`: string

### `hjp:session`
Текущая сессия.

Session:
- `currentUserId`: string
- `remember`: boolean

### `hjp:vacancies`
Массив вакансий.

Vacancy:
- `id`: string
- `title`: string
- `companyName`: string
- `city`: string
- `salaryFrom`: number | null
- `salaryTo`: number | null
- `employmentType`: `"full_time" | "part_time" | "contract" | "internship"`
- `remote`: boolean
- `tags`: string[]
- `description`: string
- `createdByUserId`: string
- `createdAt`: string
- `updatedAt`: string

### `hjp:projects`
Массив проектов.

Project:
- `id`: string
- `title`: string
- `budgetFrom`: number | null
- `budgetTo`: number | null
- `deadlineText`: string
- `category`: string
- `difficulty`: `"junior" | "middle" | "senior" | "any"`
- `tags`: string[]
- `description`: string
- `createdByUserId`: string
- `createdAt`: string
- `updatedAt`: string

## Инициализация мок-данных
Если ключи отсутствуют, приложение может создать `hjp:vacancies` и `hjp:projects` с 20+ записями.

## Примечание по безопасности
Пароли хранятся в открытом виде — это допустимо только для учебного прототипа.
