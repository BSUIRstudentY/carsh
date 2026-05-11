-- Режимы тарифа: по времени (мин), по км, оптовый пакет по времени.

ALTER TABLE tariffs ADD COLUMN tariff_mode VARCHAR(32) NOT NULL DEFAULT 'PER_TIME';

ALTER TABLE tariffs ADD COLUMN bulk_time_hours NUMERIC(8, 2);

ALTER TABLE tariffs ADD COLUMN bulk_package_price NUMERIC(12, 2);

-- Уже существующие строки (ECONOMY / COMFORT / BUSINESS) — поминутные
UPDATE tariffs
SET tariff_mode = 'PER_TIME'
WHERE code IN ('ECONOMY', 'COMFORT', 'BUSINESS');

-- По километрам (примерные ставки BYN/км)
INSERT INTO tariffs (code, title, currency, tariff_mode, price_per_km, active, created_at)
SELECT 'ECONOMY_KM', 'Эконом — по километрам', 'BYN', 'PER_KM', 0.20, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'ECONOMY_KM');

INSERT INTO tariffs (code, title, currency, tariff_mode, price_per_km, active, created_at)
SELECT 'COMFORT_KM', 'Комфорт — по километрам', 'BYN', 'PER_KM', 0.30, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'COMFORT_KM');

INSERT INTO tariffs (code, title, currency, tariff_mode, price_per_km, active, created_at)
SELECT 'BUSINESS_KM', 'Бизнес — по километрам', 'BYN', 'PER_KM', 0.40, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'BUSINESS_KM');

-- Опт по времени: пакет часов за фиксированную сумму (пример)
INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'ECONOMY_BULK', 'Эконом — опт времени (10 ч)', 'BYN', 'BULK_TIME', 10, 100.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'ECONOMY_BULK');

INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'COMFORT_BULK', 'Комфорт — опт времени (10 ч)', 'BYN', 'BULK_TIME', 10, 150.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'COMFORT_BULK');

INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'BUSINESS_BULK', 'Бизнес — опт времени (10 ч)', 'BYN', 'BULK_TIME', 10, 200.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'BUSINESS_BULK');
