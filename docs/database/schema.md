# Схема БД (обзор)

Источник правды для схемы: миграции Flyway в  
`backend/src/main/resources/db/migration/` (`V1` — базовые таблицы, `V2` — refresh-токены, `V3` — связь класса с тарифом и сиды тарифов/классов).

В **dev** с **H2** включены те же миграции Flyway, что и в prod (`ddl-auto=validate`). Схема и сиды совпадают с PostgreSQL.

## Сущности (логика)

| Таблица | Назначение |
|---------|------------|
| `cities` | Города работы сервиса |
| `vehicle_classes` | Классы авто для витрины; `image_url` — **URL пути** к картинке (например `/fleet/economy.jpg` из `frontend/public`), не храните файлы в БД |
| `vehicles` | Конкретные машины в парке, привязка к классу и городу |
| `tariffs` | Тарифные планы / строки прайса (`tariff_mode`: по времени / км / опт пакет часов) |
| `users` | Пользователи (после регистрации) |
| `bookings` | Поездки / брони (заготовка) |
| `contact_requests` | Заявки с формы «Контакты» |

## Связи (упрощённо)

- `vehicles.vehicle_class_id` → `vehicle_classes.id`
- `vehicles.city_id` → `cities.id`
- `vehicle_classes.default_tariff_id` → `tariffs.id` (тариф по умолчанию для класса; **машина → класс → тариф**)
- `bookings.user_id` → `users.id`
- `bookings.vehicle_id` → `vehicles.id`

## Индексы

Уникальные: `users.email`, `users.phone`, `vehicles.plate_number`, коды городов/классов/тарифов.  
См. индексы в `V1__initial_schema.sql`.

## Расширения на следующих миграциях

- Роли и права (`roles`, `user_roles`)
- Платежи, промокоды, телеметрия (отдельные таблицы или внешнее хранилище)
- Версионирование тарифов, история статусов брони
