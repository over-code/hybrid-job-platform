const PREFIX = "hjp:";

const KEYS = {
  users: `${PREFIX}users`,
  session: `${PREFIX}session`,
  vacancies: `${PREFIX}vacancies`,
  projects: `${PREFIX}projects`,
};

function nowIso() {
  return new Date().toISOString();
}

function readJson(key, fallback) {
  const raw = localStorage.getItem(key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureObject(key, fallback) {
  const value = readJson(key, null);
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  const next = fallback;
  writeJson(key, next);
  return next;
}

function ensureArray(key) {
  const value = readJson(key, null);
  if (Array.isArray(value)) return value;
  const next = [];
  writeJson(key, next);
  return next;
}

function generateId(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function createVacancy(overrides = {}) {
  const t = nowIso();
  const workMode = overrides.workMode || (overrides.remote ? "remote" : "hybrid");
  const remote = workMode === "remote";
  return {
    id: generateId("vac"),
    title: "Frontend Engineer (React)",
    companyName: "HybridHub Studio",
    city: "Алматы",
    salaryFrom: 500000,
    salaryTo: 850000,
    employmentType: "full_time",
    workMode,
    remote,
    tags: ["React", "TypeScript", "CSS", "REST"],
    description: "Работа над продуктовой UI‑платформой: дизайн‑система, компоненты, производительность. Плотная коммуникация с дизайном и бэкендом.",
    responsibilities: [
      "Разработка и поддержка функциональности продукта",
      "Участие в code review и улучшении качества кода",
      "Работа с API и интеграциями",
      "Оптимизация производительности и UX",
    ],
    requirements: [
      "Опыт коммерческой разработки или сильное портфолио/пет‑проекты",
      "Понимание HTTP/REST и работа с API",
      "Умение читать чужой код и доводить задачи до конца",
      "Ответственность и коммуникация в команде",
    ],
    conditions: [
      "Гибкий график и понятные ожидания по результату",
      "Бюджет на обучение и рост",
      "Современная техника для работы",
      "Регулярная обратная связь и прозрачные цели",
    ],
    hiringStages: ["Скрининг", "Тех‑интервью", "Интервью с командой", "Оффер"],
    companyAbout: {
      industry: "IT / Product",
      size: "50–200",
      website: "",
      about:
        "Команда, которая строит продуктовую платформу и любит аккуратный интерфейс. Ценим инженерную культуру, ответственность и прозрачность процессов.",
    },
    createdByUserId: "system",
    createdAt: t,
    updatedAt: t,
    ...overrides,
  };
}

function stripTrailingNumberTag(value) {
  const s = String(value || "");
  return s.replace(/\s*#\d+\s*$/, "").trim();
}

function looksLikeOldExtraVacancyDescription(v) {
  const d = String(v?.description || "").trim();
  if (!d) return false;
  return d ===
    "Нужен человек, который поможет команде закрыть задачи в срок: качество, коммуникация и аккуратность важнее шума. Демо‑вакансия для каталога.";
}

function looksLikeOldExtraProjectDescription(p) {
  const d = String(p?.description || "").trim();
  if (!d) return false;
  return d ===
    "Короткая работа на результат: аудит текущего состояния, список улучшений и понятный план следующего шага. Демо‑проект для каталога.";
}

function createExtraVacancy(i) {
  const templates = [
    {
      title: "Frontend Developer (Vue)",
      tags: ["Vue", "TypeScript", "CSS", "REST"],
      workMode: "hybrid",
      city: "Алматы",
      companyName: "NovaWeb",
      salaryFrom: 550000,
      salaryTo: 950000,
    },
    {
      title: "Backend Developer (Java)",
      tags: ["Java", "Spring", "PostgreSQL", "Kafka"],
      workMode: "office",
      city: "Астана",
      companyName: "FinCore",
      salaryFrom: 800000,
      salaryTo: 1500000,
    },
    {
      title: "Fullstack Developer (React + Node)",
      tags: ["React", "Node.js", "PostgreSQL", "Docker"],
      workMode: "remote",
      city: "Remote",
      companyName: "StackCraft",
      salaryFrom: 750000,
      salaryTo: 1350000,
    },
    {
      title: "Product Designer (SaaS)",
      tags: ["Figma", "UX", "Prototyping", "Design System"],
      workMode: "hybrid",
      city: "Алматы",
      companyName: "SaaSLab",
      salaryFrom: 500000,
      salaryTo: 950000,
    },
    {
      title: "QA Engineer (Automation)",
      tags: ["Playwright", "API", "CI", "Regression"],
      workMode: "remote",
      city: "Remote",
      companyName: "QualityWorks",
      salaryFrom: 520000,
      salaryTo: 980000,
    },
    {
      title: "Data Analyst (Product)",
      tags: ["SQL", "Cohorts", "Funnels", "BI"],
      workMode: "office",
      city: "Алматы",
      companyName: "MetricFlow",
      salaryFrom: 600000,
      salaryTo: 1150000,
    },
  ];

  const employmentTypes = ["full_time", "contract", "part_time", "internship"];
  const employmentType = employmentTypes[i % employmentTypes.length];

  const base = templates[i % templates.length];
  const descriptionVariants = {
    "Frontend Developer (Vue)": [
      "Разработка интерфейсов для клиентского кабинета: компоненты, формы, таблицы, адаптив. Важно: аккуратный UI, работа с REST и понимание производительности.",
      "Поддержка SPA на Vue: доработка экранов, рефакторинг компонентов, исправление багов по метрикам. Плюс будет опыт с i18n и тестами.",
      "Нужен Vue‑разработчик для развития продукта: интеграции с API, работа с состоянием, улучшение UX. Ожидаем самостоятельность и любовь к чистому коду.",
    ],
    "Backend Developer (Java)": [
      "Сервисы для финтех‑домена: интеграции, транзакции, отчётность. Стек: Spring, PostgreSQL, очереди. Важны тестируемость и понятные контракты.",
      "Поддержка и развитие backend‑платформы: оптимизация запросов, введение кэширования, работа с Kafka. Нужен опыт продакшена и аккуратная архитектура.",
      "Проектируем API и доменную модель: пишем сервисы, настраиваем наблюдаемость, закрываем инциденты. Ценим системность и ответственность.",
    ],
    "Fullstack Developer (React + Node)": [
      "Фуллстек‑роль для продуктовой команды: React‑интерфейс + Node API, работа с PostgreSQL. Нужны уверенные основы, грамотные PR и умение доводить задачи.",
      "Развиваем веб‑приложение: новые фичи, интеграции, оптимизация. Есть CI, код‑ревью и понятные ожидания по результату.",
      "Нужен разработчик, который закроет end‑to‑end задачи: UI, API, схема БД, деплой в Docker. Важно: коммуникация и внимание к деталям.",
    ],
    "Product Designer (SaaS)": [
      "Проектирование новых сценариев: таблицы, формы, навигация, онбординг. Нужна сильная типографика, работа с компонентами и аккуратный handoff.",
      "Ищем дизайнера для SaaS: быстрые прототипы, исследование проблем, улучшение UX‑метрик. Важно: системное мышление и работа в дизайн‑системе.",
      "Роль про продуктовый дизайн: от постановки гипотез до финальных макетов. Плюс будет опыт с дизайн‑токенами и документацией.",
    ],
    "QA Engineer (Automation)": [
      "Автотесты для web и API: Playwright, стабильность регресса, улучшение отчётов. Нужен практический опыт, умение дебажить и работать с CI.",
      "Налаживаем качество релизов: e2e, API‑покрытие, критические проверки. Важно: системность, коммуникация и здравый прагматизм.",
      "Роль QA automation: поддержка тестовой инфраструктуры, оптимизация времени прогона, подготовка тест‑данных. Плюс будет опыт с Allure.",
    ],
    "Data Analyst (Product)": [
      "Продуктовая аналитика: метрики, воронки, когортный анализ, дашборды. Нужны сильный SQL и аккуратность в определениях.",
      "Помочь команде с аналитикой: событийная модель, отчётность, гипотезы. Плюс будет опыт с BI и A/B экспериментами.",
      "Роль аналитика: поддержка решений данными, разбор причин изменений метрик, подготовка рекомендаций. Важны коммуникация и структурность.",
    ],
  };

  const descKey = base.title;
  const descList = descriptionVariants[descKey] || [
    "Нужен специалист для продуктовой команды: задачи на качество, сроки и понятные результаты. Демо‑вакансия для каталога.",
  ];
  const description = descList[i % descList.length];

  const salaryBump = Math.floor(i / templates.length) * 35000;
  return createVacancy({
    ...base,
    employmentType,
    salaryFrom: base.salaryFrom + salaryBump,
    salaryTo: base.salaryTo + salaryBump,
    description,
  });
}

function createExtraProject(i) {
  const titles = [
    "Консультация и оценка продукта",
    "Экспресс‑аудит UI и UX",
    "Ревью дизайн‑макетов перед handoff",
    "Технический аудит CI/CD",
    "Настройка аналитики событий",
    "Пакет улучшений производительности",
    "Проработка онбординга и активации",
    "Набор шаблонов документации",
    "Проектирование API‑контрактов",
    "Миграция дизайн‑токенов",
    "Подготовка тест‑плана и чек‑листов",
    "Пакет рекомендаций по безопасности",
  ];

  const categories = ["Web", "Design", "DevOps", "QA", "Data", "Content", "Marketing", "PM"];
  const difficulties = ["junior", "middle", "senior", "any"];

  const title = titles[i % titles.length];
  const category = categories[i % categories.length];
  const difficulty = difficulties[i % difficulties.length];
  const base = 120000 + i * 15000;
  const budgetFrom = base;
  const budgetTo = base + 140000 + (i % 3) * 70000;
  const deadlineText = i % 3 === 0 ? "1 неделя" : i % 3 === 1 ? "2 недели" : "3 недели";
  const tags =
    category === "Design"
      ? ["Figma", "UI", "Review", "Handoff"]
      : category === "DevOps"
        ? ["CI/CD", "Docker", "Deploy", "Observability"]
        : category === "QA"
          ? ["Test Plan", "API", "Regression", "Checklist"]
          : category === "Data"
            ? ["SQL", "Metrics", "Dashboard", "Definitions"]
            : category === "Content"
              ? ["Docs", "Guides", "Examples", "Structure"]
              : category === "Marketing"
                ? ["Content", "Positioning", "Analytics", "GTM"]
                : category === "PM"
                  ? ["Backlog", "AC", "Scope", "Roadmap"]
                  : ["Audit", "Recommendations", "Roadmap"];

  const projectDescriptionByCategory = {
    Design: [
      "Нужно оценить текущие макеты и привести их к единому стилю: сетка, типографика, состояния. На выходе — список правок и обновлённый набор ключевых экранов.",
      "Короткий дизайн‑проект: ревью UI, улучшение UX‑сценариев и подготовка к handoff. Важно: аккуратная документация и понятные комментарии.",
      "Проработка интерфейса для продукта: прототип + финальные макеты в Figma, состояния компонентов и рекомендации по дизайн‑системе.",
    ],
    Web: [
      "Нужен быстрый аудит фронтенда: узкие места, Web Vitals, план оптимизации. Результат — отчёт + список конкретных задач и быстрые фиксы.",
      "Небольшой web‑проект на результат: улучшить UX и производительность, устранить визуальные баги, подготовить чек‑лист регресса.",
      "Требуется ревью реализации: структура компонентов, доступность, скорость загрузки. На выходе — рекомендации и PR с улучшениями (по согласованию).",
    ],
    DevOps: [
      "Настроить CI/CD: пайплайны, окружения, базовая наблюдаемость. Важно: воспроизводимые деплои и понятная инструкция для команды.",
      "Короткий DevOps‑аудит: инфраструктура, секреты, логи, алерты. Результат — список рисков и план улучшений с приоритетами.",
      "Нужно привести процесс релизов в порядок: шаблоны пайплайна, кэширование, ускорение сборок, безопасные окружения.",
    ],
    QA: [
      "Подготовить тест‑план и чек‑листы под релиз: критические сценарии, API‑проверки, регресс. Итог — артефакты, которые можно сразу применять.",
      "Нужен аудит качества: где падают тесты, какие дыры в покрытии, как ускорить регресс. На выходе — список действий и улучшенные шаблоны.",
      "Проект по QA: структурировать тестовую документацию и настроить базовый набор проверок для новых фичей.",
    ],
    Data: [
      "Настроить продуктовые метрики: определения, витрина/запросы, дашборд. Важно: единые термины и отсутствие двусмысленностей.",
      "Нужен аналитик на короткий проект: разобраться в данных, построить воронку и подготовить рекомендации для роста.",
      "Проект по данным: привести события к одной схеме, подготовить SQL‑запросы и описание метрик для команды.",
    ],
    Content: [
      "Нужно обновить документацию: структура, примеры, гайды, терминология. Итог — понятный набор страниц и шаблон для дальнейших обновлений.",
      "Короткий контент‑проект: переписать сложные разделы простым языком, подготовить FAQ и примеры использования.",
      "Проект по контенту: собрать базовые гайды, улучшить навигацию, привести стиль и форматирование к единому виду.",
    ],
    Marketing: [
      "Нужно упаковать продукт: позиционирование, ключевые сообщения, контент‑план. Итог — набор материалов и рекомендации по каналам.",
      "Короткий маркетинговый проект: аудит воронки, метрики, гипотезы по росту. Результат — план тестов и приоритеты.",
      "Проект на 2–3 недели: подготовить материалы для запуска фичи (лендинг/посты/аналитика), согласовать tone of voice.",
    ],
    PM: [
      "Нужно структурировать backlog: цели, приоритеты, AC, границы scope. Итог — план на спринт/месяц и понятные задачи для команды.",
      "Короткий PM‑проект: провести discovery по проблеме, собрать требования и подготовить roadmap/план релиза.",
      "Проект по управлению: оформить спецификации, согласовать процессы коммуникации и риски, настроить трекинг прогресса.",
    ],
  };

  const descList = projectDescriptionByCategory[category] || [
    "Короткая работа на результат: аудит текущего состояния, список улучшений и понятный план следующего шага.",
  ];
  const description = descList[i % descList.length];

  return createProject({
    title,
    category,
    difficulty,
    budgetFrom,
    budgetTo,
    deadlineText,
    tags,
    description,
  });
}

function createUser(overrides = {}) {
  const t = nowIso();
  const defaultPreferences = {
    vacancies: {
      workMode: "",
      employmentType: "",
      minSalary: "",
      maxSalary: "",
    },
    projects: {
      category: "",
      difficulty: "",
      minBudget: "",
      maxBudget: "",
    },
  };

  const defaultCandidateProfile = {
    headline: "",
    level: "",
    city: "",
    workMode: "",
    employmentType: "",
    experienceYears: "",
    salaryFrom: "",
    salaryTo: "",
    stack: "",
    about: "",
    links: {
      portfolio: "",
      github: "",
      linkedin: "",
      telegram: "",
    },
  };

  return {
    id: generateId("usr"),
    role: "candidate",
    name: "User",
    email: "",
    password: "",
    avatarUrl: null,
    preferences: defaultPreferences,
    candidateProfile: defaultCandidateProfile,
    createdAt: t,
    updatedAt: t,
    ...overrides,
  };
}

function createProject(overrides = {}) {
  const t = nowIso();
  return {
    id: generateId("prj"),
    title: "Редизайн лендинга B2B‑сервиса",
    budgetFrom: 250000,
    budgetTo: 450000,
    deadlineText: "10–14 дней",
    category: "Design",
    difficulty: "junior",
    tags: ["Figma", "UI Kit", "Bento", "Landing"],
    description: "Нужно обновить визуальный стиль и собрать адаптивный лендинг. Важно: чистая типографика, аккуратные отступы, подготовка к передаче в разработку.",
    deliverables: [
      "Список задач и границы проекта (in/out scope)",
      "Готовые артефакты: макеты/код/документация (по типу проекта)",
      "Краткий отчёт с рекомендациями и next steps",
    ],
    milestones: ["Бриф и уточнение требований", "Черновик/прототип", "Финальная версия", "Передача результатов"],
    acceptanceCriteria: [
      "Результат воспроизводим и понятен без доп. пояснений",
      "Соблюдены сроки и согласованный объём",
      "Есть инструкция/README или короткое описание как пользоваться",
    ],
    communication: {
      channels: ["Чат", "Созвоны 2–3 раза в неделю"],
      timezone: "UTC+5",
      responseTime: "в течение рабочего дня",
    },
    paymentTerms: "Оплата по этапам: 50% старт / 50% после сдачи результата (можно обсудить)",
    clientAbout: {
      type: "Product team",
      domain: "B2B",
      about:
        "Клиент — небольшая продуктовая команда. Важно: ясная коммуникация, предсказуемые сроки и аккуратное оформление результата.",
    },
    createdByUserId: "system",
    createdAt: t,
    updatedAt: t,
    ...overrides,
  };
}

function ensureArrayField(value, fallback) {
  return Array.isArray(value) ? value : fallback;
}

function ensureObjectField(value, fallback) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

function defaultVacancyDetails() {
  return {
    responsibilities: [
      "Разработка и поддержка функциональности продукта",
      "Участие в code review и улучшении качества кода",
      "Интеграции с API и внешними сервисами",
      "Оптимизация производительности и UX",
    ],
    requirements: [
      "Опыт коммерческой разработки или сильное портфолио",
      "Понимание HTTP/REST и работы с API",
      "Умение доводить задачи до результата",
      "Командная коммуникация и ответственность",
    ],
    conditions: [
      "Гибкий график и понятные ожидания",
      "Бюджет на обучение и рост",
      "Регулярная обратная связь",
      "Современная техника/инструменты",
    ],
    hiringStages: ["Скрининг", "Тех‑интервью", "Интервью с командой", "Оффер"],
    companyAbout: {
      industry: "IT / Product",
      size: "50–200",
      website: "",
      about:
        "Команда, которая строит продуктовую платформу. Ценим инженерную культуру, ответственность и прозрачность процессов.",
    },
  };
}

function defaultProjectDetails() {
  return {
    deliverables: [
      "Список задач и границы проекта (in/out scope)",
      "Готовые артефакты (макеты/код/документация — по типу проекта)",
      "Короткий отчёт: что сделано, риски, next steps",
    ],
    milestones: ["Бриф", "Черновик", "Финальная версия", "Передача результата"],
    acceptanceCriteria: [
      "Результат воспроизводим и понятен без доп. пояснений",
      "Соблюдены сроки и согласованный объём",
      "Есть инструкция/README или понятное описание",
    ],
    communication: {
      channels: ["Чат", "Созвоны 2–3 раза в неделю"],
      timezone: "UTC+5",
      responseTime: "в течение рабочего дня",
    },
    paymentTerms: "Оплата по этапам: 50% старт / 50% после сдачи результата",
    clientAbout: {
      type: "Product team",
      domain: "B2B",
      about: "Небольшая продуктовая команда. Важны ясные сроки, прозрачность и аккуратное оформление результата.",
    },
  };
}

export const api = {
  KEYS,

  initMockData() {
    ensureArray(KEYS.users);

    ensureObject(KEYS.session, { currentUserId: null, remember: false });

    const vacancies = readJson(KEYS.vacancies, null);
    const looksLikeOldVacancies =
      Array.isArray(vacancies) &&
      vacancies.some((v) =>
        String(v?.title || "").toLowerCase().includes("frontend developer #")
      );

    if (!Array.isArray(vacancies) || vacancies.length === 0 || looksLikeOldVacancies) {
      const seed = [
        createVacancy({
          title: "Frontend Engineer (React)",
          companyName: "Kaspi.kz",
          city: "Алматы",
          workMode: "hybrid",
          employmentType: "full_time",
          salaryFrom: 700000,
          salaryTo: 1100000,
          tags: ["React", "TypeScript", "Accessibility", "Design System"],
          description:
            "Развиваем дизайн‑систему и витрины продукта. Нужны уверенные навыки React/TS, внимание к доступности и аккуратности UI.",
        }),
        createVacancy({
          title: "Backend Developer (Node.js)",
          companyName: "inDrive",
          city: "Алматы",
          workMode: "office",
          employmentType: "contract",
          salaryFrom: 800000,
          salaryTo: 1400000,
          tags: ["Node.js", "PostgreSQL", "Redis", "Docker"],
          description:
            "Сервисы для высоконагруженных сценариев: маршрутизация, платежи, интеграции. Важны чистая архитектура и уверенная работа с БД.",
        }),
        createVacancy({
          title: "Python Backend Engineer (Django)",
          companyName: "NebulaSoft",
          city: "Астана",
          workMode: "hybrid",
          employmentType: "part_time",
          salaryFrom: 650000,
          salaryTo: 1200000,
          tags: ["Python", "Django", "REST", "Celery"],
          description:
            "Разработка API для B2B‑платформы: роли/доступы, отчёты, фоновые задачи. Плюс будет опыт с очередями и интеграциями.",
        }),
        createVacancy({
          title: "DevOps Engineer (AWS)",
          companyName: "CloudKZ",
          city: "Алматы",
          workMode: "remote",
          employmentType: "contract",
          salaryFrom: 900000,
          salaryTo: 1600000,
          tags: ["AWS", "Terraform", "Kubernetes", "CI/CD"],
          description:
            "Автоматизируем инфраструктуру и релизы. Нужно настроить IaC, наблюдаемость и безопасные пайплайны для нескольких окружений.",
        }),
        createVacancy({
          title: "QA Automation Engineer",
          companyName: "Kolesa Group",
          city: "Алматы",
          workMode: "hybrid",
          employmentType: "internship",
          salaryFrom: 550000,
          salaryTo: 950000,
          tags: ["Playwright", "JavaScript", "API Testing", "Allure"],
          description:
            "Нужно поднять стабильность e2e и API‑тестов, ускорить регресс и улучшить отчётность. Важны системность и прагматичный подход.",
        }),
        createVacancy({
          title: "UI/UX Designer",
          companyName: "PixelPulse",
          city: "Астана",
          workMode: "remote",
          employmentType: "full_time",
          salaryFrom: 450000,
          salaryTo: 850000,
          tags: ["Figma", "UX Research", "Prototyping", "Design Systems"],
          description:
            "Проектируем интерфейсы для SaaS‑продукта. Нужны сильная типографика, работа с пользовательскими сценариями и аккуратные прототипы.",
        }),
        createVacancy({
          title: "Product Manager (B2B SaaS)",
          companyName: "AuroraPay",
          city: "Алматы",
          workMode: "hybrid",
          employmentType: "full_time",
          salaryFrom: 900000,
          salaryTo: 1700000,
          tags: ["Discovery", "Roadmap", "Metrics", "Stakeholders"],
          description:
            "Ведём продукт от discovery до delivery: гипотезы, метрики, приоритизация, запуск фичей. Важно: коммуникация и системное мышление.",
        }),
        createVacancy({
          title: "Data Analyst (SQL)",
          companyName: "Freedom Finance",
          city: "Алматы",
          workMode: "office",
          employmentType: "full_time",
          salaryFrom: 600000,
          salaryTo: 1100000,
          tags: ["SQL", "Looker", "A/B", "Cohorts"],
          description:
            "Строим отчётность для роста продукта: воронки, когортный анализ, эксперименты. Нужны сильный SQL и аккуратность в данных.",
        }),
        createVacancy({
          title: "Technical Writer",
          companyName: "JetStream AI",
          city: "Remote",
          workMode: "remote",
          employmentType: "contract",
          salaryFrom: 350000,
          salaryTo: 650000,
          tags: ["Docs", "API", "English", "Markdown"],
          description:
            "Пишем документацию к API и SDK: гайды, туториалы, reference. Нужны структурность, ясный язык и понимание жизненного цикла разработки.",
        }),
        createVacancy({
          title: "Marketing Manager (Tech)",
          companyName: "ChocoFamily",
          city: "Алматы",
          workMode: "hybrid",
          employmentType: "full_time",
          salaryFrom: 450000,
          salaryTo: 900000,
          tags: ["Go-to-market", "Content", "Analytics", "Performance"],
          description:
            "Продвигаем продуктовые фичи и бренд работодателя. Нужны аналитика, умение упаковывать ценность и сильные коммуникации.",
        }),
        createVacancy({
          title: "Mobile Developer (iOS)",
          companyName: "Beeline Kazakhstan",
          city: "Астана",
          workMode: "office",
          employmentType: "full_time",
          salaryFrom: 750000,
          salaryTo: 1400000,
          tags: ["Swift", "UIKit", "Networking", "CI"],
          description:
            "Разработка мобильного приложения: платежи, личный кабинет, уведомления. Нужны аккуратная архитектура и стабильность релизов.",
        }),
        createVacancy({
          title: "Scrum Master / Agile Coach",
          companyName: "DataForge",
          city: "Алматы",
          workMode: "hybrid",
          employmentType: "full_time",
          salaryFrom: 600000,
          salaryTo: 1200000,
          tags: ["Scrum", "Facilitation", "Jira", "Delivery"],
          description:
            "Помогаем командам выстроить прозрачный delivery: ритуалы, метрики, улучшения процесса. Важны фасилитация и эмпатия.",
        }),
        createVacancy({
          title: "Security Analyst",
          companyName: "QuantumLabs",
          city: "Астана",
          workMode: "remote",
          employmentType: "full_time",
          salaryFrom: 800000,
          salaryTo: 1600000,
          tags: ["AppSec", "OWASP", "SIEM", "Threat Modeling"],
          description:
            "Проводим анализ рисков и внедряем практики безопасности: SAST/DAST, модель угроз, обучение команд. Нужны ответственность и системность.",
        }),
        createVacancy({
          title: "Customer Support Engineer (Tech)",
          companyName: "SaaSify",
          city: "Remote",
          workMode: "remote",
          employmentType: "full_time",
          salaryFrom: 300000,
          salaryTo: 550000,
          tags: ["Troubleshooting", "SQL", "Communication", "SLA"],
          description:
            "Техподдержка уровня L2: разбор инцидентов, SQL‑диагностика, эскалации. Нужны внимательность и умение объяснять сложное простым.",
        }),
        createVacancy({
          title: "UX Researcher",
          companyName: "Aviata",
          city: "Алматы",
          workMode: "hybrid",
          employmentType: "contract",
          salaryFrom: 450000,
          salaryTo: 850000,
          tags: ["Interviews", "JTBD", "Usability", "Insights"],
          description:
            "Проводим исследования и превращаем инсайты в продуктовые решения. Важно: качественные интервью, синтез и понятные рекомендации.",
        }),
        createVacancy({
          title: "Backend Engineer (Go)",
          companyName: "Yandex",
          city: "Алматы",
          workMode: "hybrid",
          employmentType: "full_time",
          salaryFrom: 1000000,
          salaryTo: 2000000,
          tags: ["Go", "Microservices", "gRPC", "Observability"],
          description:
            "Разработка микросервисов и инфраструктурных компонент. Нужны сильные основы CS, опыт в продакшене и умение работать с метриками.",
        }),
        createVacancy({
          title: "Data Engineer",
          companyName: "EPAM",
          city: "Астана",
          workMode: "remote",
          employmentType: "full_time",
          salaryFrom: 900000,
          salaryTo: 1700000,
          tags: ["Spark", "Airflow", "Python", "Data Warehouse"],
          description:
            "Строим пайплайны данных и витрины для аналитики. Важно: качество данных, наблюдаемость и оптимизация вычислений.",
        }),
        createVacancy({
          title: "QA Engineer (Manual + API)",
          companyName: "1Fit",
          city: "Алматы",
          workMode: "office",
          employmentType: "full_time",
          salaryFrom: 400000,
          salaryTo: 750000,
          tags: ["Test Cases", "Postman", "Regression", "Bug Reports"],
          description:
            "Ручное тестирование фичей и API, поддержка регресса и улучшение тестовой документации. Нужны внимательность и любовь к качеству.",
        }),
        createVacancy({
          title: "Brand / Graphic Designer",
          companyName: "NordicLabs",
          city: "Remote",
          workMode: "remote",
          employmentType: "contract",
          salaryFrom: 350000,
          salaryTo: 700000,
          tags: ["Branding", "Illustrator", "Social", "Motion (nice to have)"],
          description:
            "Собираем визуальные коммуникации: бренд‑гайды, промо‑материалы, соцсети. Важно: вкус, аккуратность и умение работать по системе.",
        }),
        createVacancy({
          title: "Business Analyst",
          companyName: "FinBridge",
          city: "Астана",
          workMode: "hybrid",
          employmentType: "full_time",
          salaryFrom: 650000,
          salaryTo: 1200000,
          tags: ["Requirements", "BPMN", "User Stories", "UAT"],
          description:
            "Сбор требований и моделирование процессов для финансовых интеграций. Нужны структурность, умение писать спецификации и держать контекст.",
        }),
        createVacancy({
          title: "SRE / Observability Engineer",
          companyName: "OpsCraft",
          city: "Алматы",
          workMode: "remote",
          employmentType: "full_time",
          salaryFrom: 950000,
          salaryTo: 1800000,
          tags: ["Prometheus", "Grafana", "SLO", "Incident Response"],
          description:
            "Налаживаем наблюдаемость и надежность: SLO/SLI, алерты, постмортемы, улучшение on-call. Важно: инженерная культура и опыт инцидентов.",
        }),
        createVacancy({
          title: "Android Developer (Kotlin)",
          companyName: "PayWave",
          city: "Алматы",
          workMode: "hybrid",
          employmentType: "contract",
          salaryFrom: 650000,
          salaryTo: 1200000,
          tags: ["Kotlin", "Coroutines", "Clean Architecture", "Payments"],
          description:
            "Нужен Android‑разработчик на контракт: доработка платежного флоу, улучшение стабильности, оптимизация времени запуска и crash‑rate. Важно: аккуратная архитектура и понятные PR.",
        }),
      ];

      while (seed.length < 41) {
        seed.push(createExtraVacancy(seed.length));
      }

      writeJson(KEYS.vacancies, seed);
    } else {
      let changed = false;
      const next = vacancies.map((v, idx) => {
        if (!v || typeof v !== "object") return v;

        const employmentTypes = ["full_time", "contract", "part_time", "internship"];
        const desiredEmploymentType = employmentTypes[idx % employmentTypes.length];
        const isSystemVacancy = v.createdByUserId === "system";

        const hasMode = v && (v.workMode === "remote" || v.workMode === "hybrid" || v.workMode === "office");
        if (hasMode) {
          const patch = {};
          if (looksLikeOldExtraVacancyDescription(v)) {
            patch.description = createExtraVacancy(idx).description;
          }
          if (typeof v.remote !== "boolean") {
            patch.remote = v.workMode === "remote";
          }
          if (!v.employmentType) patch.employmentType = "full_time";
          if (isSystemVacancy && (v.employmentType == null || v.employmentType === "full_time")) {
            patch.employmentType = desiredEmploymentType;
          }

          const d = defaultVacancyDetails();
          if (!Array.isArray(v.responsibilities)) patch.responsibilities = d.responsibilities;
          if (!Array.isArray(v.requirements)) patch.requirements = d.requirements;
          if (!Array.isArray(v.conditions)) patch.conditions = d.conditions;
          if (!Array.isArray(v.hiringStages)) patch.hiringStages = d.hiringStages;
          if (!v.companyAbout || typeof v.companyAbout !== "object") patch.companyAbout = d.companyAbout;

          const salaryFrom = v.salaryFrom == null ? null : Number(v.salaryFrom);
          const salaryTo = v.salaryTo == null ? null : Number(v.salaryTo);
          if (v.salaryFrom != null && !Number.isFinite(salaryFrom)) patch.salaryFrom = null;
          if (v.salaryTo != null && !Number.isFinite(salaryTo)) patch.salaryTo = null;
          if (v.salaryFrom != null && Number.isFinite(salaryFrom) && salaryFrom !== v.salaryFrom) patch.salaryFrom = salaryFrom;
          if (v.salaryTo != null && Number.isFinite(salaryTo) && salaryTo !== v.salaryTo) patch.salaryTo = salaryTo;

          if (Object.keys(patch).length === 0) return v;
          changed = true;
          return { ...v, ...patch };
        }
        changed = true;
        const remote = Boolean(v?.remote);
        const d = defaultVacancyDetails();
        const salaryFrom = v.salaryFrom == null ? null : Number(v.salaryFrom);
        const salaryTo = v.salaryTo == null ? null : Number(v.salaryTo);
        const migratedEmploymentType =
          isSystemVacancy && (v.employmentType == null || v.employmentType === "full_time")
            ? desiredEmploymentType
            : v.employmentType || "full_time";
        return {
          ...v,
          workMode: remote ? "remote" : "office",
          remote,
          employmentType: migratedEmploymentType,
          responsibilities: ensureArrayField(v.responsibilities, d.responsibilities),
          requirements: ensureArrayField(v.requirements, d.requirements),
          conditions: ensureArrayField(v.conditions, d.conditions),
          hiringStages: ensureArrayField(v.hiringStages, d.hiringStages),
          companyAbout: ensureObjectField(v.companyAbout, d.companyAbout),
          salaryFrom: v.salaryFrom == null ? null : Number.isFinite(salaryFrom) ? salaryFrom : null,
          salaryTo: v.salaryTo == null ? null : Number.isFinite(salaryTo) ? salaryTo : null,
        };
      });

      const extended = next.slice();
      while (extended.length < 41) {
        extended.push(createExtraVacancy(extended.length));
        changed = true;
      }

      if (changed) writeJson(KEYS.vacancies, extended);
    }

    const projects = readJson(KEYS.projects, null);
    const looksLikeOldProjects =
      Array.isArray(projects) &&
      projects.some((p) => String(p?.title || "").startsWith("Project #"));

    if (!Array.isArray(projects) || projects.length === 0 || looksLikeOldProjects) {
      const seed = [
        createProject({
          title: "Дизайн‑система для админ‑панели",
          category: "Design",
          deadlineText: "3–4 недели",
          difficulty: "middle",
          budgetFrom: 600000,
          budgetTo: 1200000,
          tags: ["Figma", "Design Tokens", "Components", "Docs"],
          description:
            "Нужно собрать UI kit и описать принципы компонентов для админ‑панели. Важно: консистентность, состояния, адаптивность, handoff.",
        }),
        createProject({
          title: "Аудит производительности веб‑приложения",
          category: "Web",
          deadlineText: "5–7 дней",
          difficulty: "senior",
          budgetFrom: 350000,
          budgetTo: 700000,
          tags: ["Lighthouse", "Web Vitals", "React", "Profiling"],
          description:
            "Нужен performance‑аудит: загрузка, тяжелые компоненты, сбор метрик. Результат — отчёт + план улучшений и быстрые фиксы.",
        }),
        createProject({
          title: "Настройка CI/CD для monorepo",
          category: "DevOps",
          deadlineText: "1–2 недели",
          difficulty: "senior",
          budgetFrom: 500000,
          budgetTo: 950000,
          tags: ["GitHub Actions", "Docker", "Caching", "Deploy"],
          description:
            "Нужно настроить пайплайны для фронта и API: линт/тест/сборка/деплой, кэширование зависимостей, секреты, отдельные окружения.",
        }),
        createProject({
          title: "Автотесты для формы оплаты",
          category: "QA",
          deadlineText: "7–10 дней",
          difficulty: "middle",
          budgetFrom: 250000,
          budgetTo: 500000,
          tags: ["Playwright", "E2E", "Mocks", "Allure"],
          description:
            "Нужен набор e2e тестов для критического флоу оплаты: позитивные/негативные кейсы, стабильные селекторы, отчётность.",
        }),
        createProject({
          title: "Техническая документация для публичного API",
          category: "Content",
          deadlineText: "2 недели",
          difficulty: "any",
          budgetFrom: 200000,
          budgetTo: 450000,
          tags: ["API Docs", "Markdown", "Examples", "English"],
          description:
            "Собрать README, quickstart и примеры запросов/ответов. Желательно: хороший тон, понятные схемы ошибок, версии.",
        }),
        createProject({
          title: "Дашборд метрик продукта",
          category: "Data",
          deadlineText: "2–3 недели",
          difficulty: "middle",
          budgetFrom: 450000,
          budgetTo: 900000,
          tags: ["SQL", "BI", "Funnels", "Cohorts"],
          description:
            "Нужно настроить метрики: активация, удержание, воронки, конверсии. Результат — дашборд + документация по определениям метрик.",
        }),
        createProject({
          title: "Лендинг для курса по UX",
          category: "Web",
          deadlineText: "10 дней",
          difficulty: "junior",
          budgetFrom: 180000,
          budgetTo: 320000,
          tags: ["HTML", "CSS", "Responsive", "Copy"],
          description:
            "Сверстать адаптивный лендинг с аккуратной типографикой и формой заявки. Дизайн в Figma, нужен чистый код и хорошая скорость загрузки.",
        }),
        createProject({
          title: "Контент‑план для продукта в Tech",
          category: "Marketing",
          deadlineText: "1 неделя",
          difficulty: "any",
          budgetFrom: 120000,
          budgetTo: 250000,
          tags: ["Content", "SEO", "Analytics", "Positioning"],
          description:
            "Собрать контент‑план на месяц: темы, форматы, гипотезы и метрики. Нужно понимание аудитории и аккуратная работа с фактами.",
        }),
        createProject({
          title: "Прототип онбординга в мобильном приложении",
          category: "Design",
          deadlineText: "5 дней",
          difficulty: "middle",
          budgetFrom: 200000,
          budgetTo: 380000,
          tags: ["Figma", "Prototyping", "UX", "Mobile"],
          description:
            "Нужно улучшить сценарий онбординга и активации: экраны, тексты, состояния ошибок. Результат — прототип + пояснения.",
        }),
        createProject({
          title: "Набор user stories и acceptance criteria",
          category: "PM",
          deadlineText: "1 неделя",
          difficulty: "any",
          budgetFrom: 150000,
          budgetTo: 300000,
          tags: ["User Stories", "AC", "Jira", "Backlog"],
          description:
            "Нужно описать фичу \"избранное\" для платформы: user stories, критерии приёмки, edge cases, разбивка на задачи.",
        }),
        createProject({
          title: "Интеграция платежного провайдера + антифрод",
          category: "Web",
          deadlineText: "2–3 недели",
          difficulty: "senior",
          budgetFrom: 900000,
          budgetTo: 1800000,
          tags: ["Payments", "API", "Security", "Observability"],
          description:
            "Нужно подключить платежного провайдера, настроить webhooks и добавить базовую антифрод‑логику. Результат — стабильные платежи, логирование и инструкция по запуску.",
          deliverables: [
            "Интеграция (код/конфиги) + примеры запросов",
            "Логи/метрики для наблюдаемости платежей",
            "README: как тестировать и выкатывать",
          ],
          milestones: ["Бриф", "Интеграция API", "Webhooks + антифрод", "Сдача + документация"],
          acceptanceCriteria: [
            "Платеж проходит и корректно меняет статусы",
            "Обработаны ошибки/таймауты/повторы",
            "Есть понятная инструкция и тестовые кейсы",
          ],
          paymentTerms: "Оплата по этапам: 40% / 40% / 20%",
          clientAbout: {
            type: "Startup",
            domain: "FinTech",
            about: "Небольшая команда, нужен надёжный платежный контур и прозрачная сдача по этапам.",
          },
        }),
        createProject({
          title: "Дизайн и копирайтинг страницы 'Тарифы'",
          category: "Design",
          deadlineText: "5–7 дней",
          difficulty: "middle",
          budgetFrom: 250000,
          budgetTo: 520000,
          tags: ["Figma", "UX", "Copy", "Pricing"],
          description:
            "Нужно собрать страницу тарифов с понятной структурой, сравнением планов и безопасными формулировками. Результат — макеты + тексты + варианты CTA.",
          deliverables: ["Макет страницы (desktop/mobile)", "Копирайт и варианты CTA", "Список состояний/ошибок"],
          milestones: ["Бриф", "Черновик", "Финальные макеты", "Передача"],
          acceptanceCriteria: [
            "Тарифы легко сравниваются",
            "Тексты ясные и без двусмысленностей",
            "Есть состояния: скидка/промо/ошибка оплаты",
          ],
          clientAbout: {
            type: "Product team",
            domain: "SaaS",
            about: "Нужно быстро и аккуратно упаковать тарифы, чтобы повысить конверсию.",
          },
        }),
      ];

      while (seed.length < 42) {
        seed.push(createExtraProject(seed.length));
      }
      writeJson(KEYS.projects, seed);
    } else {
      let changed = false;
      const next = projects.map((p, idx) => {
        if (!p || typeof p !== "object") return p;
        const patch = {};
        if (looksLikeOldExtraProjectDescription(p)) {
          patch.description = createExtraProject(idx).description;
        }
        const budgetFrom = p.budgetFrom == null ? null : Number(p.budgetFrom);
        const budgetTo = p.budgetTo == null ? null : Number(p.budgetTo);
        if (p.budgetFrom != null && !Number.isFinite(budgetFrom)) {
          changed = true;
          return { ...p, ...patch, budgetFrom: null };
        }
        if (p.budgetTo != null && !Number.isFinite(budgetTo)) {
          changed = true;
          return { ...p, ...patch, budgetTo: null };
        }
        if (p.budgetFrom != null && Number.isFinite(budgetFrom) && budgetFrom !== p.budgetFrom) {
          changed = true;
          return { ...p, ...patch, budgetFrom };
        }
        if (p.budgetTo != null && Number.isFinite(budgetTo) && budgetTo !== p.budgetTo) {
          changed = true;
          return { ...p, ...patch, budgetTo };
        }

        if (Object.keys(patch).length) {
          changed = true;
          return { ...p, ...patch };
        }
        return p;
      });

      const extended = next.slice();

      if (extended.length < 42) {
        extended.push(
          createProject({
            title: "Интеграция платежного провайдера + антифрод",
            category: "Web",
            deadlineText: "2–3 недели",
            difficulty: "senior",
            budgetFrom: 900000,
            budgetTo: 1800000,
            tags: ["Payments", "API", "Security", "Observability"],
            description:
              "Нужно подключить платежного провайдера, настроить webhooks и добавить базовую антифрод‑логику. Результат — стабильные платежи, логирование и инструкция по запуску.",
            deliverables: [
              "Интеграция (код/конфиги) + примеры запросов",
              "Логи/метрики для наблюдаемости платежей",
              "README: как тестировать и выкатывать",
            ],
            milestones: ["Бриф", "Интеграция API", "Webhooks + антифрод", "Сдача + документация"],
            acceptanceCriteria: [
              "Платеж проходит и корректно меняет статусы",
              "Обработаны ошибки/таймауты/повторы",
              "Есть понятная инструкция и тестовые кейсы",
            ],
            paymentTerms: "Оплата по этапам: 40% / 40% / 20%",
            clientAbout: {
              type: "Startup",
              domain: "FinTech",
              about: "Небольшая команда, нужен надёжный платежный контур и прозрачная сдача по этапам.",
            },
          })
        );
      }

      if (extended.length < 42) {
        extended.push(
          createProject({
            title: "Дизайн и копирайтинг страницы 'Тарифы'",
            category: "Design",
            deadlineText: "5–7 дней",
            difficulty: "middle",
            budgetFrom: 250000,
            budgetTo: 520000,
            tags: ["Figma", "UX", "Copy", "Pricing"],
            description:
              "Нужно собрать страницу тарифов с понятной структурой, сравнением планов и безопасными формулировками. Результат — макеты + тексты + варианты CTA.",
            deliverables: ["Макет страницы (desktop/mobile)", "Копирайт и варианты CTA", "Список состояний/ошибок"],
            milestones: ["Бриф", "Черновик", "Финальные макеты", "Передача"],
            acceptanceCriteria: [
              "Тарифы легко сравниваются",
              "Тексты ясные и без двусмысленностей",
              "Есть состояния: скидка/промо/ошибка оплаты",
            ],
            clientAbout: {
              type: "Product team",
              domain: "SaaS",
              about: "Нужно быстро и аккуратно упаковать тарифы, чтобы повысить конверсию.",
            },
          })
        );
      }

      while (extended.length < 42) {
        extended.push(createExtraProject(extended.length));
        changed = true;
      }

      if (changed) writeJson(KEYS.projects, extended);
    }
  },

  getVacancies() {
    return ensureArray(KEYS.vacancies);
  },

  getVacancyById(id) {
    if (!id) return null;
    const vacancies = ensureArray(KEYS.vacancies);
    return vacancies.find((v) => v.id === id) || null;
  },

  getProjects() {
    return ensureArray(KEYS.projects);
  },

  getProjectById(id) {
    if (!id) return null;
    const projects = ensureArray(KEYS.projects);
    return projects.find((p) => p.id === id) || null;
  },

  getUsers() {
    return ensureArray(KEYS.users);
  },

  getSession() {
    return ensureObject(KEYS.session, { currentUserId: null, remember: false });
  },

  setSession(nextSession) {
    writeJson(KEYS.session, nextSession);
  },

  getUserById(id) {
    if (!id) return null;
    const users = ensureArray(KEYS.users);
    return users.find((u) => u.id === id) || null;
  },

  updateUser(id, patch = {}) {
    if (!id) {
      throw new Error("Пользователь не найден");
    }

    const users = ensureArray(KEYS.users);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new Error("Пользователь не найден");
    }

    const current = users[idx];
    const nextName = patch.name != null ? String(patch.name).trim() : current.name;

    if (!nextName) {
      throw new Error("Имя обязательно");
    }

    const nextAvatarUrlRaw = patch.avatarUrl != null ? String(patch.avatarUrl).trim() : current.avatarUrl;
    const nextAvatarUrl = nextAvatarUrlRaw ? nextAvatarUrlRaw : null;

    const currentPrefs =
      current.preferences && typeof current.preferences === "object"
        ? current.preferences
        : {
            vacancies: { workMode: "", employmentType: "", minSalary: "", maxSalary: "" },
            projects: { category: "", difficulty: "", minBudget: "", maxBudget: "" },
          };

    const patchPrefs = patch.preferences && typeof patch.preferences === "object" ? patch.preferences : null;
    const nextPreferences = patchPrefs
      ? {
          ...currentPrefs,
          ...patchPrefs,
          vacancies: { ...currentPrefs.vacancies, ...(patchPrefs.vacancies || {}) },
          projects: { ...currentPrefs.projects, ...(patchPrefs.projects || {}) },
        }
      : currentPrefs;

    const currentCandidateProfile =
      current.candidateProfile && typeof current.candidateProfile === "object"
        ? current.candidateProfile
        : { headline: "", level: "", city: "", workMode: "", employmentType: "", experienceYears: "", salaryFrom: "", salaryTo: "", stack: "", about: "", links: { portfolio: "", github: "", linkedin: "", telegram: "" } };

    const patchCandidateProfile =
      patch.candidateProfile && typeof patch.candidateProfile === "object" ? patch.candidateProfile : null;

    const nextCandidateProfile = patchCandidateProfile
      ? {
          ...currentCandidateProfile,
          ...patchCandidateProfile,
          links: {
            ...(currentCandidateProfile.links && typeof currentCandidateProfile.links === "object" ? currentCandidateProfile.links : {}),
            ...((patchCandidateProfile.links && typeof patchCandidateProfile.links === "object") ? patchCandidateProfile.links : {}),
          },
        }
      : currentCandidateProfile;

    const t = nowIso();
    const updated = {
      ...current,
      name: nextName,
      avatarUrl: nextAvatarUrl,
      preferences: nextPreferences,
      candidateProfile: nextCandidateProfile,
      updatedAt: t,
    };

    users[idx] = updated;
    writeJson(KEYS.users, users);
    return updated;
  },

  getCurrentUser() {
    const session = this.getSession();
    return this.getUserById(session.currentUserId);
  },

  updateCurrentUserProfile(patch = {}) {
    const session = this.getSession();
    if (!session.currentUserId) {
      throw new Error("Нет активной сессии");
    }
    return this.updateUser(session.currentUserId, patch);
  },

  register({ role, name, email, password }) {
    const users = ensureArray(KEYS.users);
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error("Email обязателен");
    }

    if (!String(password || "").trim()) {
      throw new Error("Пароль обязателен");
    }

    const exists = users.some((u) => String(u.email || "").toLowerCase() === normalizedEmail);
    if (exists) {
      throw new Error("Пользователь с таким email уже существует");
    }

    const safeRole = role === "employer" ? "employer" : "candidate";
    const safeName = String(name || "").trim() || "User";

    const user = createUser({
      role: safeRole,
      name: safeName,
      email: normalizedEmail,
      password: String(password),
    });

    users.push(user);
    writeJson(KEYS.users, users);
    return user;
  },

  login({ email, password, remember = false }) {
    const users = ensureArray(KEYS.users);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const user = users.find((u) => String(u.email || "").toLowerCase() === normalizedEmail) || null;

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (String(user.password) !== String(password)) {
      throw new Error("Неверный пароль");
    }

    this.setSession({ currentUserId: user.id, remember: Boolean(remember) });
    return user;
  },

  logout() {
    const session = this.getSession();
    this.setSession({ ...session, currentUserId: null });
  },

  updatePassword({ email, newPassword }) {
    const users = ensureArray(KEYS.users);
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const idx = users.findIndex((u) => String(u.email || "").toLowerCase() === normalizedEmail);

    if (idx === -1) {
      throw new Error("Пользователь не найден");
    }

    if (!String(newPassword || "").trim()) {
      throw new Error("Новый пароль обязателен");
    }

    const t = nowIso();
    users[idx] = { ...users[idx], password: String(newPassword), updatedAt: t };
    writeJson(KEYS.users, users);
  },
};
