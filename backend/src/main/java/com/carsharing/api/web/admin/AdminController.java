package com.carsharing.api.web.admin;

import com.carsharing.api.domain.ContactRequest;
import com.carsharing.api.domain.User;
import com.carsharing.api.domain.Vehicle;
import com.carsharing.api.dto.admin.AdminUserResponse;
import com.carsharing.api.dto.admin.AdminVehicleResponse;
import com.carsharing.api.dto.booking.BookingResponse;
import com.carsharing.api.repository.ContactRequestRepository;
import com.carsharing.api.repository.UserRepository;
import com.carsharing.api.repository.VehicleRepository;
import com.carsharing.api.service.BookingService;
import com.carsharing.api.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingService bookingService;
    private final ContactService contactService;
    private final ContactRequestRepository contactRequestRepository;

    @GetMapping("/users")
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(AdminUserResponse::from)
                .toList();
    }

    @PutMapping("/users/{id}/role")
    public AdminUserResponse updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        String role = body.get("role");
        if (role == null || (!role.equals("USER") && !role.equals("ADMIN"))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        }
        user.setRole(role);
        userRepository.save(user);
        return AdminUserResponse.from(user);
    }

    @GetMapping("/vehicles")
    public List<AdminVehicleResponse> listVehicles() {
        return vehicleRepository.findAll().stream()
                .map(AdminVehicleResponse::from)
                .toList();
    }

    @PutMapping("/vehicles/{id}/status")
    public AdminVehicleResponse updateVehicleStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        String status = body.get("status");
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }
        vehicle.setStatus(status);
        vehicleRepository.save(vehicle);
        return AdminVehicleResponse.from(vehicle);
    }

    @GetMapping("/bookings")
    public List<BookingResponse> listBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/contacts")
    public List<ContactRequest> listContacts() {
        return contactService.findAll();
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        long usersCount = userRepository.count();
        long vehiclesCount = vehicleRepository.count();
        long contactsCount = contactRequestRepository.count();
        return Map.of(
                "usersCount", usersCount,
                "vehiclesCount", vehiclesCount,
                "contactsCount", contactsCount
        );
    }
}
