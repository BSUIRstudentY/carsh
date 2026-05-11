package com.carsharing.api.service;

import com.carsharing.api.domain.*;
import com.carsharing.api.dto.booking.BookingResponse;
import com.carsharing.api.dto.telemetry.RouteResponse;
import com.carsharing.api.repository.*;
import com.carsharing.api.service.telemetry.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Duration RESERVE_DURATION = Duration.ofMinutes(2);

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final TelemetryService telemetryService;

    @Transactional
    public BookingResponse startBooking(Long userId, Long vehicleId, String tariffMode, String promoCodeStr) {
        if (bookingRepository.findActiveByUserId(userId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already has an active booking");
        }

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));

        if (!"AVAILABLE".equals(vehicle.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Vehicle is not available");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String mode = tariffMode != null ? tariffMode : "PER_TIME";
        int discount = 0;
        PromoCode promo = null;

        if (promoCodeStr != null && !promoCodeStr.isBlank()) {
            promo = promoCodeRepository.findByCodeIgnoreCase(promoCodeStr.strip())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Промокод не найден"));
            if (!Boolean.TRUE.equals(promo.getActive())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Промокод неактивен");
            }
            if (promo.getMaxUses() != null && promo.getCurrentUses() >= promo.getMaxUses()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Промокод исчерпан");
            }
            Instant now = Instant.now();
            if (promo.getValidFrom() != null && now.isBefore(promo.getValidFrom())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Промокод ещё не действует");
            }
            if (promo.getValidTo() != null && now.isAfter(promo.getValidTo())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Промокод просрочен");
            }
            discount = promo.getDiscountPercent();
            promo.setCurrentUses(promo.getCurrentUses() + 1);
            promoCodeRepository.save(promo);
        }

        vehicle.setStatus("RESERVED");
        vehicleRepository.save(vehicle);

        Booking booking = Booking.builder()
                .user(user)
                .vehicle(vehicle)
                .status("RESERVED")
                .tariffMode(mode)
                .discountPercent(discount)
                .promoCode(promo)
                .startAt(Instant.now())
                .currency("BYN")
                .build();
        bookingRepository.save(booking);

        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse activateBooking(Long userId, Long bookingId) {
        Booking booking = getOwnBooking(userId, bookingId);
        if (!"RESERVED".equals(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking is not in RESERVED state");
        }
        booking.setStatus("ACTIVE");
        booking.setStartAt(Instant.now());
        booking.getVehicle().setStatus("IN_USE");
        vehicleRepository.save(booking.getVehicle());
        bookingRepository.save(booking);
        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse endBooking(Long userId, Long bookingId) {
        Booking booking = getOwnBooking(userId, bookingId);
        if (!"ACTIVE".equals(booking.getStatus()) && !"RESERVED".equals(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking is not active");
        }

        Instant endAt = Instant.now();
        booking.setStatus("COMPLETED");
        booking.setEndAt(endAt);

        BigDecimal rawAmount = calculateAmount(booking, endAt);
        if (booking.getDiscountPercent() > 0) {
            BigDecimal multiplier = BigDecimal.valueOf(100 - booking.getDiscountPercent())
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            rawAmount = rawAmount.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
        }
        booking.setTotalAmount(rawAmount);
        bookingRepository.save(booking);

        Vehicle vehicle = booking.getVehicle();
        vehicle.setStatus("AVAILABLE");
        vehicleRepository.save(vehicle);

        return BookingResponse.from(booking);
    }

    private BigDecimal calculateAmount(Booking booking, Instant endAt) {
        String mode = booking.getTariffMode() != null ? booking.getTariffMode() : "PER_TIME";
        Tariff tariff = booking.getVehicle().getVehicleClass().getDefaultTariff();
        long minutes = Duration.between(booking.getStartAt(), endAt).toMinutes();
        minutes = Math.max(1, minutes);

        return switch (mode) {
            case "PER_KM" -> {
                BigDecimal pricePerKm = tariff != null && tariff.getPricePerKm() != null
                        ? tariff.getPricePerKm() : BigDecimal.valueOf(0.20);
                RouteResponse route = telemetryService.getRouteByBooking(booking.getId());
                double km = route.distanceKm();
                yield pricePerKm.multiply(BigDecimal.valueOf(Math.max(0.1, km)))
                        .setScale(2, RoundingMode.HALF_UP);
            }
            case "BULK_TIME" -> {
                BigDecimal bulkPrice = tariff != null && tariff.getBulkPackagePrice() != null
                        ? tariff.getBulkPackagePrice() : BigDecimal.valueOf(12.00);
                yield bulkPrice;
            }
            default -> {
                BigDecimal pricePerMinute = tariff != null && tariff.getPricePerMinute() != null
                        ? tariff.getPricePerMinute() : BigDecimal.valueOf(0.24);
                yield pricePerMinute.multiply(BigDecimal.valueOf(minutes));
            }
        };
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(BookingResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getActiveBooking(Long userId) {
        Booking booking = bookingRepository.findActiveByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active booking"));
        return BookingResponse.from(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(BookingResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Booking getOwnBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!booking.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your booking");
        }
        return booking;
    }
}
