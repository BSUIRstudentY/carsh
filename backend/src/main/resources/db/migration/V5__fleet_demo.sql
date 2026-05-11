-- Демо-данные автопарка: город Минск и по одной доступной машине на класс ECONOMY/COMFORT/BUSINESS.

UPDATE vehicle_classes SET description = 'Компактные авто для города и коротких поездок.'
WHERE code = 'ECONOMY' AND description IS NULL;
UPDATE vehicle_classes SET description = 'Седаны повышенной комфортабельности.'
WHERE code = 'COMFORT' AND description IS NULL;
UPDATE vehicle_classes SET description = 'Представительский класс для деловых поездок.'
WHERE code = 'BUSINESS' AND description IS NULL;

INSERT INTO cities (code, name, active, created_at)
SELECT 'MSQ', 'Минск', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM cities WHERE code = 'MSQ');

INSERT INTO vehicles (vehicle_class_id, city_id, plate_number, status, created_at, updated_at)
SELECT vc.id, c.id, '1001-AA1', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM vehicle_classes vc
         CROSS JOIN cities c
WHERE vc.code = 'ECONOMY'
  AND c.code = 'MSQ'
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE plate_number = '1001-AA1');

INSERT INTO vehicles (vehicle_class_id, city_id, plate_number, status, created_at, updated_at)
SELECT vc.id, c.id, '1002-BB2', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM vehicle_classes vc
         CROSS JOIN cities c
WHERE vc.code = 'COMFORT'
  AND c.code = 'MSQ'
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE plate_number = '1002-BB2');

INSERT INTO vehicles (vehicle_class_id, city_id, plate_number, status, created_at, updated_at)
SELECT vc.id, c.id, '1003-CC3', 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM vehicle_classes vc
         CROSS JOIN cities c
WHERE vc.code = 'BUSINESS'
  AND c.code = 'MSQ'
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE plate_number = '1003-CC3');
