-- Связь витрины: у класса авто есть тариф по умолчанию (машина → класс → тариф).
-- Цены: BYN/мин (24, 36, 48 копеек = 0.24, 0.36, 0.48 руб.).

ALTER TABLE vehicle_classes
    ADD COLUMN default_tariff_id BIGINT NULL REFERENCES tariffs (id);

-- Три базовых тарифа (идемпотентно)
INSERT INTO tariffs (code, title, currency, price_per_minute, active, created_at)
SELECT 'ECONOMY', 'Эконом', 'BYN', 0.24, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'ECONOMY');

INSERT INTO tariffs (code, title, currency, price_per_minute, active, created_at)
SELECT 'COMFORT', 'Комфорт', 'BYN', 0.36, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'COMFORT');

INSERT INTO tariffs (code, title, currency, price_per_minute, active, created_at)
SELECT 'BUSINESS', 'Бизнес', 'BYN', 0.48, true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tariffs WHERE code = 'BUSINESS');

-- Классы витрины, если ещё нет — с привязкой к тарифу с тем же code
INSERT INTO vehicle_classes (code, title, sort_order, created_at, default_tariff_id)
SELECT t.code,
       CASE t.code
           WHEN 'ECONOMY' THEN 'Эконом'
           WHEN 'COMFORT' THEN 'Комфорт'
           WHEN 'BUSINESS' THEN 'Бизнес'
           END,
       CASE t.code
           WHEN 'ECONOMY' THEN 10
           WHEN 'COMFORT' THEN 20
           WHEN 'BUSINESS' THEN 30
           END,
       CURRENT_TIMESTAMP,
       t.id
FROM tariffs t
WHERE t.code IN ('ECONOMY', 'COMFORT', 'BUSINESS')
  AND NOT EXISTS (SELECT 1 FROM vehicle_classes vc WHERE vc.code = t.code);

-- Уже существующие классы с теми же кодами — проставить тариф
UPDATE vehicle_classes vc
SET default_tariff_id = (SELECT t.id FROM tariffs t WHERE t.code = vc.code)
WHERE vc.default_tariff_id IS NULL
  AND vc.code IN ('ECONOMY', 'COMFORT', 'BUSINESS')
  AND EXISTS (SELECT 1 FROM tariffs t WHERE t.code = vc.code);
