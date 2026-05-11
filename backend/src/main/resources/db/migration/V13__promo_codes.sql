CREATE TABLE promo_codes (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(32) NOT NULL UNIQUE,
    discount_percent INT NOT NULL DEFAULT 0,
    max_uses        INT,
    current_uses    INT NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from      TIMESTAMP WITH TIME ZONE,
    valid_to        TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bookings ADD COLUMN promo_code_id BIGINT REFERENCES promo_codes(id);
ALTER TABLE bookings ADD COLUMN discount_percent INT NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN tariff_mode VARCHAR(32);

INSERT INTO promo_codes (code, discount_percent, max_uses, active) VALUES
('WELCOME', 60, 1000, true),
('FIRST', 30, 500, true),
('TEST10', 10, null, true);
