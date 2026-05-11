package com.carsharing.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "tariffs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tariff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(nullable = false, length = 128)
    private String title;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "BYN";

    @Enumerated(EnumType.STRING)
    @Column(name = "tariff_mode", nullable = false, length = 32)
    @Builder.Default
    private TariffMode tariffMode = TariffMode.PER_TIME;

    @Column(name = "price_per_minute", precision = 12, scale = 4)
    private BigDecimal pricePerMinute;

    @Column(name = "price_per_km", precision = 12, scale = 4)
    private BigDecimal pricePerKm;

    @Column(name = "daily_cap_amount", precision = 12, scale = 2)
    private BigDecimal dailyCapAmount;

    /** Для {@link TariffMode#BULK_TIME}: размер пакета в часах. */
    @Column(name = "bulk_time_hours", precision = 8, scale = 2)
    private BigDecimal bulkTimeHours;

    /** Для {@link TariffMode#BULK_TIME}: цена всего пакета в {@link #currency}. */
    @Column(name = "bulk_package_price", precision = 12, scale = 2)
    private BigDecimal bulkPackagePrice;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = Boolean.TRUE;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
