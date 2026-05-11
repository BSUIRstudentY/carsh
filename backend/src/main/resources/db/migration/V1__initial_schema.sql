-- Начальная схема. TIMESTAMP WITH TIME ZONE — совместимо с PostgreSQL и H2 (TIMESTAMPTZ у H2 не поддерживается).

CREATE TABLE cities (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(32) NOT NULL UNIQUE,
    name        VARCHAR(128) NOT NULL,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicle_classes (
    id             BIGSERIAL PRIMARY KEY,
    code           VARCHAR(64) NOT NULL UNIQUE,
    title          VARCHAR(128) NOT NULL,
    description    VARCHAR(2000),
    image_url      VARCHAR(512),
    seats          SMALLINT,
    sort_order     INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tariffs (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(64) NOT NULL UNIQUE,
    title               VARCHAR(128) NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'BYN',
    price_per_minute    NUMERIC(12, 4),
    price_per_km        NUMERIC(12, 4),
    daily_cap_amount    NUMERIC(12, 2),
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from          DATE,
    valid_to            DATE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(32) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    status          VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_phone ON users (phone);

CREATE TABLE vehicles (
    id                  BIGSERIAL PRIMARY KEY,
    vehicle_class_id    BIGINT NOT NULL REFERENCES vehicle_classes (id),
    city_id             BIGINT REFERENCES cities (id),
    plate_number        VARCHAR(32) NOT NULL UNIQUE,
    status              VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
    last_latitude       DOUBLE PRECISION,
    last_longitude      DOUBLE PRECISION,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_class ON vehicles (vehicle_class_id);
CREATE INDEX idx_vehicles_city ON vehicles (city_id);

CREATE TABLE bookings (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users (id),
    vehicle_id      BIGINT NOT NULL REFERENCES vehicles (id),
    status          VARCHAR(32) NOT NULL,
    start_at        TIMESTAMP WITH TIME ZONE,
    end_at          TIMESTAMP WITH TIME ZONE,
    total_amount    NUMERIC(12, 2),
    currency        VARCHAR(3) NOT NULL DEFAULT 'BYN',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_vehicle ON bookings (vehicle_id);

CREATE TABLE contact_requests (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(128) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    message     VARCHAR(4000) NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
