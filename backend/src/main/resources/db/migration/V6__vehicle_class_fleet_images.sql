-- Картинки витрины: URL как у статики фронта (Vite: файлы из frontend/public).
-- Замените файлы в public/fleet/ своими фото (jpg/webp/png) и при смене имён обновите URL здесь или через UPDATE.

UPDATE vehicle_classes SET image_url = '/fleet/economy.svg' WHERE code = 'ECONOMY';
UPDATE vehicle_classes SET image_url = '/fleet/comfort.svg' WHERE code = 'COMFORT';
UPDATE vehicle_classes SET image_url = '/fleet/business.svg' WHERE code = 'BUSINESS';
