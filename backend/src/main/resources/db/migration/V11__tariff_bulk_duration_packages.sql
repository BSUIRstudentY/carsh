-- Дополнительные пакеты по времени: 1 ч, 24 ч (сутки), 72 ч (3 суток) по каждому классу.

INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'ECONOMY_BULK_1H', 'Эконом — пакет 1 час', 'BYN', 'BULK_TIME', 1, 12.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'ECONOMY_BULK_1H');

INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'ECONOMY_BULK_24H', 'Эконом — сутки (24 ч)', 'BYN', 'BULK_TIME', 24, 180.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'ECONOMY_BULK_24H');

INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'ECONOMY_BULK_72H', 'Эконом — 3 суток (72 ч)', 'BYN', 'BULK_TIME', 72, 480.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'ECONOMY_BULK_72H');

INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'COMFORT_BULK_1H', 'Комфорт — пакет 1 час', 'BYN', 'BULK_TIME', 1, 18.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'COMFORT_BULK_1H');

INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'COMFORT_BULK_24H', 'Комфорт — сутки (24 ч)', 'BYN', 'BULK_TIME', 24, 260.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'COMFORT_BULK_24H');

INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'COMFORT_BULK_72H', 'Комфорт — 3 суток (72 ч)', 'BYN', 'BULK_TIME', 72, 680.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'COMFORT_BULK_72H');

INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'BUSINESS_BULK_1H', 'Бизнес — пакет 1 час', 'BYN', 'BULK_TIME', 1, 28.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'BUSINESS_BULK_1H');

INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'BUSINESS_BULK_24H', 'Бизнес — сутки (24 ч)', 'BYN', 'BULK_TIME', 24, 380.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'BUSINESS_BULK_24H');

INSERT INTO tariffs (code, title, currency, tariff_mode, bulk_time_hours, bulk_package_price, active, created_at)
SELECT 'BUSINESS_BULK_72H', 'Бизнес — 3 суток (72 ч)', 'BYN', 'BULK_TIME', 72, 950.00, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'BUSINESS_BULK_72H');
