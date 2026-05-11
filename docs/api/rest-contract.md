# REST API: контракт v1 (черновик)

Базовый префикс: **`/api/v1`**. Формат JSON: `UTF-8`, даты в **ISO-8601** (`TIMESTAMPTZ` как строка).

Общие ошибки:

| HTTP | Когда |
|------|--------|
| 400 | Валидация тела/параметров |
| 401 | Нет/просрочен токен (защищённые методы) |
| 404 | Нет ресурса |
| 409 | Конфликт (дубликат телефона и т.д.) |

---

## Система

### `GET /api/v1/health`

**Ответ 200**

```json
{
  "status": "UP",
  "service": "carsharing-api"
}
```

---

## Публичные данные (без авторизации)

### `GET /api/v1/public/cities`

Города присутствия сервиса.

**Ответ 200**

```json
{
  "items": [
    {
      "id": 1,
      "code": "MSQ",
      "name": "Минск",
      "active": true
    }
  ]
}
```

---

### `GET /api/v1/public/vehicle-classes`

Классы автомобилей для витрины (лендинг / автопарк).

**Query (опционально):** `cityId` (long)

**Ответ 200**

```json
{
  "items": [
    {
      "id": 10,
      "code": "COMFORT",
      "title": "Комфорт",
      "description": "Седаны бизнес-класса",
      "imageUrl": "https://...",
      "seats": 5,
      "sortOrder": 20,
      "pricePerMinute": 0.36
    }
  ]
}
```

`pricePerMinute` — опционально, из тарифа по умолчанию класса при режиме `PER_TIME`.

---

### `GET /api/v1/public/vehicles`

Доступные автомобили для страницы «Автопарк» по сегменту (класс).

**Query:**

| Параметр   | Обязательность | Описание |
|------------|----------------|----------|
| `classCode` | **да**         | `ECONOMY` \| `COMFORT` \| `BUSINESS` |
| `cityId`    | нет            | если задан — только машины в этом городе |

**Ответ 200**

```json
{
  "items": [
    {
      "id": 101,
      "displayTitle": "Volkswagen Polo",
      "description": "Компактный городской авто",
      "imageUrl": "/fleet/cars/polo.png",
      "vehicleClassCode": "ECONOMY",
      "vehicleClassTitle": "Эконом",
      "pricePerMinute": 0.24,
      "seats": 5,
      "latitude": 53.9085,
      "longitude": 27.5585
    }
  ]
}
```

`pricePerMinute` — из тарифа по умолчанию класса при режиме `PER_TIME`; может быть `null`.  
`latitude` / `longitude` — последняя известная позиция (`null`, если координаты не заданы).

**400** — не указан или недопустимый `classCode`.

---

### `GET /api/v1/public/vehicles/map`

Свободные автомобили **с непустыми координатами** для карты (все классы).

**Query (опционально):** `cityId` (long) — только машины в этом городе.

**Ответ 200** — как у `GET .../vehicles`, но в `items` попадают только записи, у которых заданы `latitude` и `longitude`.

---

### `GET /api/v1/public/vehicle-classes/{id}`

Детали класса.

**Ответ 200** — один объект как в элементе `items` выше.  
**404** — нет класса.

---

### `GET /api/v1/public/tariffs`

Активные тарифы для страницы «Тарифы». Возвращается **массив** JSON (без пагинации), отсортирован по `tariffMode`, затем по `title`.

**Ответ 200** — массив объектов:

```json
[
  {
    "id": 1,
    "code": "ECONOMY",
    "title": "Эконом",
    "currency": "BYN",
    "tariffMode": "PER_TIME",
    "pricePerMinute": 0.24,
    "pricePerKm": null,
    "dailyCapAmount": null,
    "bulkTimeHours": null,
    "bulkPackagePrice": null,
    "validFrom": null,
    "validTo": null
  }
]
```

`tariffMode`: `PER_TIME` | `PER_KM` | `BULK_TIME`.

---

### `POST /api/v1/public/contact`

Обращение с лендинга (форма «Контакты»).

**Запрос**

```json
{
  "name": "Иван",
  "email": "ivan@example.com",
  "message": "Вопрос по регистрации"
}
```

**Ответ 201**

```json
{
  "id": 42,
  "createdAt": "2026-05-08T12:00:00Z"
}
```

---

## Регистрация и вход

### `POST /api/v1/auth/register`

**Запрос** (вариант без SMS — уточнишь поток верификации)

```json
{
  "phone": "+375291234567",
  "email": "user@example.com",
  "password": "Secret123!"
}
```

**Ответ 201**

```json
{
  "userId": 100,
  "status": "PENDING"
}
```

**409** — телефон/email уже занят.

---

### `POST /api/v1/auth/login`

**Запрос**

```json
{
  "login": "+375291234567",
  "password": "Secret123!"
}
```

(`login` — телефон или email)

**Ответ 200** (JWT в теле или cookie — на твой выбор)

```json
{
  "accessToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresInSeconds": 3600
}
```

**401** — неверные данные.

---

## Защищённые ресурсы (после логина) — на потом

Примеры: `GET /api/v1/me`, бронирования, телеметрия. Описываем отдельным документом, когда появится домен поездки.

---

## Версионирование

При ломающих изменениях вводи **`/api/v2`** или заголовок `Accept-Version`.
