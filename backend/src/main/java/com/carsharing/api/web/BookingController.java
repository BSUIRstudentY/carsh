package com.carsharing.api.web;

import com.carsharing.api.dto.booking.BookingResponse;
import com.carsharing.api.dto.booking.StartBookingRequest;
import com.carsharing.api.dto.telemetry.RouteResponse;
import com.carsharing.api.service.BookingService;
import com.carsharing.api.service.telemetry.TelemetryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final TelemetryService telemetryService;

    @PostMapping("/start")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse startBooking(
            Authentication authentication,
            @Valid @RequestBody StartBookingRequest request
    ) {
        Long userId = (Long) authentication.getPrincipal();
        return bookingService.startBooking(userId, request.vehicleId(),
                request.tariffMode(), request.promoCode());
    }

    @PostMapping("/{id}/activate")
    public BookingResponse activateBooking(Authentication authentication, @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        return bookingService.activateBooking(userId, id);
    }

    @PostMapping("/{id}/end")
    public BookingResponse endBooking(Authentication authentication, @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        return bookingService.endBooking(userId, id);
    }

    @GetMapping
    public List<BookingResponse> myBookings(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return bookingService.getUserBookings(userId);
    }

    @GetMapping("/active")
    public BookingResponse activeBooking(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return bookingService.getActiveBooking(userId);
    }

    @GetMapping("/{id}/route")
    public RouteResponse getBookingRoute(Authentication authentication, @PathVariable Long id) {
        Long userId = (Long) authentication.getPrincipal();
        bookingService.getOwnBooking(userId, id);
        return telemetryService.getRouteByBooking(id);
    }
}
