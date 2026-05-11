package com.carsharing.api.domain;

/**
 * PER_TIME — поминутная оплата ({@code price_per_minute}).<br>
 * PER_KM — по километрам ({@code price_per_km}).<br>
 * BULK_TIME — пакет часов: фиксированная сумма за блок ({@code bulk_time_hours} + {@code bulk_package_price}).
 */
public enum TariffMode {
    PER_TIME,
    PER_KM,
    BULK_TIME
}
