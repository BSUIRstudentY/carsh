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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
        return bookingService.startBooking(userId, request.vehicleId());
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
    public RouteResponse getBookingRoute(@PathVariable Long id) {
        return telemetryService.getRouteByBooking(id);
    }

    @GetMapping("/{id}/route/live")
    public RouteResponse getLiveRoute(@PathVariable Long id) {
        return telemetryService.getRouteByBooking(id);
    }
}
