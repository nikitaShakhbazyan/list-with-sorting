Сортировка списка - Fullstack

Приложение для работы с 1 млн элементов: выбор, фильтры, drag & drop, сохранение состояния.

Функции

Левая панель- все невыбранные элементы, фильтр, бесконечный скролл

Правая панель -выбранные элементы, сортировка drag & drop

Добавление новых элементов вручную

Сохранение выбранных элементов и порядка сортировки

Серверная очередь запросов с батчингом и дедупликацией

Технологии

Бекенд: Express.js + TypeScript

Фронтенд: Next.js + TypeScript + React

Запуск
``` bash
npm run install:all
npm run dev      # фронт: localhost:3000, бэк: localhost:3001
npm run build
npm start
```

API

GET /api/elements —невыбранные элементы

GET /api/selected —выбранные

POST /api/select / deselect —добавить/убрать

POST /api/sort —изменить порядок

POST /api/add— добавить элемент

GET /api/state — текущее состояние