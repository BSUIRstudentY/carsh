package com.carsharing.api.service;

import com.carsharing.api.domain.Booking;
import com.carsharing.api.domain.User;
import com.carsharing.api.domain.Vehicle;
import com.carsharing.api.dto.booking.BookingResponse;
import com.carsharing.api.repository.BookingRepository;
import com.carsharing.api.repository.UserRepository;
import com.carsharing.api.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse startBooking(Long userId, Long vehicleId) {
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

        vehicle.setStatus("IN_USE");
        vehicleRepository.save(vehicle);

        Booking booking = Booking.builder()
                .user(user)
                .vehicle(vehicle)
                .status("ACTIVE")
                .startAt(Instant.now())
                .currency("BYN")
                .build();
        bookingRepository.save(booking);
        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse endBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (!booking.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your booking");
        }
        if (!"ACTIVE".equals(booking.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking is not active");
        }

        Instant endAt = Instant.now();
        booking.setStatus("COMPLETED");
        booking.setEndAt(endAt);

        long minutes = Duration.between(booking.getStartAt(), endAt).toMinutes();
        BigDecimal pricePerMinute = BigDecimal.valueOf(0.24);
        if (booking.getVehicle().getVehicleClass() != null
                && booking.getVehicle().getVehicleClass().getDefaultTariff() != null
                && booking.getVehicle().getVehicleClass().getDefaultTariff().getPricePerMinute() != null) {
            pricePerMinute = booking.getVehicle().getVehicleClass().getDefaultTariff().getPricePerMinute();
        }
        booking.setTotalAmount(pricePerMinute.multiply(BigDecimal.valueOf(Math.max(1, minutes))));
        bookingRepository.save(booking);

        Vehicle vehicle = booking.getVehicle();
        vehicle.setStatus("AVAILABLE");
        vehicleRepository.save(vehicle);

        return BookingResponse.from(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(BookingResponse::from)
                .toList();
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
                .map(BookingResponse::from)
                .toList();
    }
}
