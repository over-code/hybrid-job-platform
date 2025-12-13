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
- `createdAt`: string
- `updatedAt`: string

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
