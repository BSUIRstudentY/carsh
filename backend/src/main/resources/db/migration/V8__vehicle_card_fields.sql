-- Карточка автомобиля на витрине (название, описание, фото); цена берётся из тарифа класса в коде.

ALTER TABLE vehicles ADD COLUMN display_title VARCHAR(128);
ALTER TABLE vehicles ADD COLUMN description VARCHAR(2000);
ALTER TABLE vehicles ADD COLUMN image_url VARCHAR(512);

UPDATE vehicles
SET display_title = plate_number
WHERE display_title IS NULL;

ALTER TABLE vehicles ALTER COLUMN display_title VARCHAR(128) NOT NULL;

-- Три демо-машины из V5
UPDATE vehicles
SET display_title = 'Volkswagen Polo',
    description     = 'Компактный городской автомобиль для коротких поездок.',
    image_url       = '/polo.png'
WHERE plate_number = '1001-AA1';

UPDATE vehicles
SET display_title = 'BMW i8',
    description     = 'Гибридный спорт-седан повышенной комфортабельности.',
    image_url       = '/i8.png'
WHERE plate_number = '1002-BB2';

UPDATE vehicles
SET display_title = 'Porsche 911',
    description     = 'Представительский спортивный класс.',
    image_url       = '/911.png'
WHERE plate_number = '1003-CC3';

-- Дополнительные авто в том же городе (Минск), по классам
INSERT INTO vehicles (vehicle_class_id, city_id, plate_number, status, display_title, description,
                      image_url, created_at, updated_at)
SELECT vc.id,
       c.id,
       '1010-KK1',
       'AVAILABLE',
       'Chevrolet Cobalt',
       'Практичный седан для города.',
       '/cobalt.png',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM vehicle_classes vc
         CROSS JOIN cities c
WHERE vc.code = 'ECONOMY'
  AND c.code = 'MSQ'
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE plate_number = '1010-KK1');

INSERT INTO vehicles (vehicle_class_id, city_id, plate_number, status, display_title, description,
                      image_url, created_at, updated_at)
SELECT vc.id,
       c.id,
       '1020-RR8',
       'AVAILABLE',
       'Audi R8',
       'Спортивное купе премиум-класса.',
       '/audi_r8.png',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM vehicle_classes vc
         CROSS JOIN cities c
WHERE vc.code = 'COMFORT'
  AND c.code = 'MSQ'
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE plate_number = '1020-RR8');

INSERT INTO vehicles (vehicle_class_id, city_id, plate_number, status, display_title, description,
                      image_url, created_at, updated_at)
SELECT vc.id,
       c.id,
       '1030-HH1',
       'AVAILABLE',
       'Lamborghini Huracán',
       'Эксклюзивный спорткар для особых поездок.',
       '/huracan.png',
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM vehicle_classes vc
         CROSS JOIN cities c
WHERE vc.code = 'BUSINESS'
  AND c.code = 'MSQ'
  AND NOT EXISTS (SELECT 1 FROM vehicles WHERE plate_number = '1030-HH1');
