-- Единый каталог картинок: /fleet/cars/*.png (раньше были корни вида /polo.png — в SPA файлы лежат в public/fleet/cars).
-- Дополнительные модели из имеющихся изображений.

UPDATE vehicles SET image_url = '/fleet/cars/polo.png' WHERE plate_number = '1001-AA1';
UPDATE vehicles SET image_url = '/fleet/cars/i8.png' WHERE plate_number = '1002-BB2';
UPDATE vehicles SET image_url = '/fleet/cars/911.png' WHERE plate_number = '1003-CC3';
UPDATE vehicles SET image_url = '/fleet/cars/cobalt.png' WHERE plate_number = '1010-KK1';
UPDATE vehicles SET image_url = '/fleet/cars/audi_r8.png' WHERE plate_number = '1020-RR8';
UPDATE vehicles SET image_url = '/fleet/cars/huracan.png' WHERE plate_number = '1030-HH1';

-- Те же пути для превью классов на витрине (ранее V7 указывал корень без /fleet/cars/).
UPDATE vehicle_classes SET image_url = '/fleet/cars/polo.png' WHERE code = 'ECONOMY';
UPDATE vehicle_classes SET image_url = '/fleet/cars/i8.png' WHERE code = 'COMFORT';
UPDATE vehicle_classes SET image_url = '/fleet/cars/911.png' WHERE code = 'BUSINESS';

-- BMW M2, Ford Mustang, Chevrolet Corvette — комфорт / спорт-премиум
INSERT INTO vehicles (vehicle_class_id, city_id, plate_number, status, display_title, description,
                      image_url, created_at, updated_at)
SELECT vc.id,
       c.id,
       '1041-M21',
       'AVAILABLE',
       'BMW M2',
       'Компактное купе с задним приводом и характерным характером M Performance.',
       '/fleet/cars/m2.png',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM vehicle_classes vc
         CROSS JOIN cities c
WHERE vc.code = 'COMFORT'
  AND c.code = 'MSQ'
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE plate_number = '1041-M21');

INSERT INTO vehicles (vehicle_class_id, city_id, plate_number, status, display_title, description,
                      image_url, created_at, updated_at)
SELECT vc.id,
       c.id,
       '1042-MU1',
       'AVAILABLE',
       'Ford Mustang',
       'Иконичное мускулистое купе для ярких поездок.',
       '/fleet/cars/mustang.png',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM vehicle_classes vc
         CROSS JOIN cities c
WHERE vc.code = 'COMFORT'
  AND c.code = 'MSQ'
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE plate_number = '1042-MU1');

INSERT INTO vehicles (vehicle_class_id, city_id, plate_number, status, display_title, description,
                      image_url, created_at, updated_at)
SELECT vc.id,
       c.id,
       '1043-CV1',
       'AVAILABLE',
       'Chevrolet Corvette',
       'Американский спорткар с выразительным силуэтом.',
       '/fleet/cars/corvette.png',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM vehicle_classes vc
         CROSS JOIN cities c
WHERE vc.code = 'COMFORT'
  AND c.code = 'MSQ'
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE plate_number = '1043-CV1');

-- Acura NSX, Dodge SRT Hellcat — бизнес / топ-сегмент витрины
INSERT INTO vehicles (vehicle_class_id, city_id, plate_number, status, display_title, description,
                      image_url, created_at, updated_at)
SELECT vc.id,
       c.id,
       '1044-NS1',
       'AVAILABLE',
       'Acura NSX',
       'Гибридный суперкар с точной управляемостью и премиальной подачей.',
       '/fleet/cars/asura_nsx.png',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM vehicle_classes vc
         CROSS JOIN cities c
WHERE vc.code = 'BUSINESS'
  AND c.code = 'MSQ'
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE plate_number = '1044-NS1');

INSERT INTO vehicles (vehicle_class_id, city_id, plate_number, status, display_title, description,
                      image_url, created_at, updated_at)
SELECT vc.id,
       c.id,
       '1045-HC1',
       'AVAILABLE',
       'Dodge Challenger SRT Hellcat',
       'Мощный muscle car для тех, кто ценит характер и звук V8.',
       '/fleet/cars/srt_hellcat.png',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM vehicle_classes vc
         CROSS JOIN cities c
WHERE vc.code = 'BUSINESS'
  AND c.code = 'MSQ'
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE plate_number = '1045-HC1');
