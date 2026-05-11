-- Картинки лежат в frontend/public/ (Vite отдаёт с корня: /polo.png, /911.png, …).
-- Подобрано по сегменту: компакт → премиум → спорт/представительский.

UPDATE vehicle_classes
SET image_url   = '/polo.png',
    seats       = 5
WHERE code = 'ECONOMY';

UPDATE vehicle_classes
SET image_url   = '/i8.png',
    seats       = 4
WHERE code = 'COMFORT';

UPDATE vehicle_classes
SET image_url   = '/911.png',
    seats       = 4
WHERE code = 'BUSINESS';
