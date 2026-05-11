package com.carsharing.api.web.admin;

import com.carsharing.api.domain.*;
import com.carsharing.api.dto.admin.AdminUserResponse;
import com.carsharing.api.dto.admin.AdminVehicleResponse;
import com.carsharing.api.dto.booking.BookingResponse;
import com.carsharing.api.repository.*;
import com.carsharing.api.service.BookingService;
import com.carsharing.api.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleClassRepository vehicleClassRepository;
    private final CityRepository cityRepository;
    private final TariffRepository tariffRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final BookingService bookingService;
    private final ContactService contactService;
    private final ContactRequestRepository contactRequestRepository;

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return Map.of(
                "usersCount", userRepository.count(),
                "vehiclesCount", vehicleRepository.count(),
                "contactsCount", contactRequestRepository.count(),
                "promoCodesCount", promoCodeRepository.count()
        );
    }

    // ─── Users ───
    @GetMapping("/users")
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll().stream().map(AdminUserResponse::from).toList();
    }

    @PutMapping("/users/{id}/role")
    public AdminUserResponse updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        String role = body.get("role");
        if (role == null || (!role.equals("USER") && !role.equals("ADMIN")))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        user.setRole(role);
        userRepository.save(user);
        return AdminUserResponse.from(user);
    }

    // ─── Vehicles ───
    @GetMapping("/vehicles")
    public List<AdminVehicleResponse> listVehicles() {
        return vehicleRepository.findAll().stream().map(AdminVehicleResponse::from).toList();
    }

    @PostMapping("/vehicles")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminVehicleResponse createVehicle(@RequestBody Map<String, Object> body) {
        VehicleClass vc = vehicleClassRepository.findById(((Number) body.get("vehicleClassId")).longValue())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid vehicleClassId"));
        City city = body.get("cityId") != null
                ? cityRepository.findById(((Number) body.get("cityId")).longValue()).orElse(null) : null;
        Vehicle v = Vehicle.builder()
                .vehicleClass(vc).city(city)
                .plateNumber((String) body.get("plateNumber"))
                .displayTitle((String) body.get("displayTitle"))
                .description((String) body.get("description"))
                .imageUrl((String) body.get("imageUrl"))
                .status("AVAILABLE")
                .build();
        vehicleRepository.save(v);
        return AdminVehicleResponse.from(v);
    }

    @PutMapping("/vehicles/{id}")
    public AdminVehicleResponse updateVehicle(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.containsKey("status")) v.setStatus((String) body.get("status"));
        if (body.containsKey("displayTitle")) v.setDisplayTitle((String) body.get("displayTitle"));
        if (body.containsKey("description")) v.setDescription((String) body.get("description"));
        if (body.containsKey("imageUrl")) v.setImageUrl((String) body.get("imageUrl"));
        if (body.containsKey("plateNumber")) v.setPlateNumber((String) body.get("plateNumber"));
        vehicleRepository.save(v);
        return AdminVehicleResponse.from(v);
    }

    @DeleteMapping("/vehicles/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVehicle(@PathVariable Long id) {
        vehicleRepository.deleteById(id);
    }

    // ─── Cities ───
    @GetMapping("/cities")
    public List<City> listCities() { return cityRepository.findAll(); }

    @PostMapping("/cities")
    @ResponseStatus(HttpStatus.CREATED)
    public City createCity(@RequestBody Map<String, String> body) {
        City c = City.builder().code(body.get("code")).name(body.get("name")).build();
        return cityRepository.save(c);
    }

    @PutMapping("/cities/{id}")
    public City updateCity(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        City c = cityRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.containsKey("name")) c.setName((String) body.get("name"));
        if (body.containsKey("active")) c.setActive((Boolean) body.get("active"));
        return cityRepository.save(c);
    }

    // ─── Tariffs ───
    @GetMapping("/tariffs")
    public List<Tariff> listTariffs() { return tariffRepository.findAll(); }

    @PostMapping("/tariffs")
    @ResponseStatus(HttpStatus.CREATED)
    public Tariff createTariff(@RequestBody Tariff tariff) {
        tariff.setId(null);
        return tariffRepository.save(tariff);
    }

    @PutMapping("/tariffs/{id}")
    public Tariff updateTariff(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Tariff t = tariffRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.containsKey("title")) t.setTitle((String) body.get("title"));
        if (body.containsKey("active")) t.setActive((Boolean) body.get("active"));
        if (body.containsKey("pricePerMinute") && body.get("pricePerMinute") != null)
            t.setPricePerMinute(new java.math.BigDecimal(body.get("pricePerMinute").toString()));
        if (body.containsKey("pricePerKm") && body.get("pricePerKm") != null)
            t.setPricePerKm(new java.math.BigDecimal(body.get("pricePerKm").toString()));
        return tariffRepository.save(t);
    }

    // ─── Promo codes ───
    @GetMapping("/promo-codes")
    public List<PromoCode> listPromoCodes() { return promoCodeRepository.findAll(); }

    @PostMapping("/promo-codes")
    @ResponseStatus(HttpStatus.CREATED)
    public PromoCode createPromoCode(@RequestBody Map<String, Object> body) {
        PromoCode p = PromoCode.builder()
                .code(((String) body.get("code")).toUpperCase())
                .discountPercent((Integer) body.get("discountPercent"))
                .maxUses(body.containsKey("maxUses") ? (Integer) body.get("maxUses") : null)
                .build();
        return promoCodeRepository.save(p);
    }

    @PutMapping("/promo-codes/{id}")
    public PromoCode updatePromoCode(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        PromoCode p = promoCodeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.containsKey("active")) p.setActive((Boolean) body.get("active"));
        if (body.containsKey("maxUses")) p.setMaxUses((Integer) body.get("maxUses"));
        return promoCodeRepository.save(p);
    }

    // ─── Bookings ───
    @GetMapping("/bookings")
    public List<BookingResponse> listBookings() { return bookingService.getAllBookings(); }

    // ─── Contacts / tickets ───
    @GetMapping("/contacts")
    public List<ContactRequest> listContacts() { return contactService.findAll(); }

    @PutMapping("/contacts/{id}/reply")
    public ContactRequest replyToContact(@PathVariable Long id, @RequestBody Map<String, String> body) {
        ContactRequest cr = contactRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        cr.setAdminReply(body.get("reply"));
        cr.setStatus("REPLIED");
        cr.setRepliedAt(Instant.now());
        return contactRequestRepository.save(cr);
    }
}
