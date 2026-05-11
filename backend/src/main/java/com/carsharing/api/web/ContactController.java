package com.carsharing.api.web;

import com.carsharing.api.domain.ContactRequest;
import com.carsharing.api.service.ContactService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    public record ContactFormRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank String message
    ) {}

    @PostMapping("/api/v1/public/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createContact(@Valid @RequestBody ContactFormRequest request) {
        ContactRequest saved = contactService.create(request.name(), request.email(), request.message());
        return Map.of(
                "id", saved.getId(),
                "createdAt", saved.getCreatedAt() != null ? saved.getCreatedAt() : Instant.now()
        );
    }

    @GetMapping("/api/v1/support/tickets")
    public List<Map<String, Object>> myTickets(@RequestParam String email) {
        return contactService.findByEmail(email).stream().map(cr -> Map.<String, Object>of(
                "id", cr.getId(),
                "message", cr.getMessage(),
                "status", cr.getStatus(),
                "createdAt", cr.getCreatedAt(),
                "adminReply", cr.getAdminReply() != null ? cr.getAdminReply() : "",
                "repliedAt", cr.getRepliedAt() != null ? cr.getRepliedAt().toString() : ""
        )).toList();
    }
}
