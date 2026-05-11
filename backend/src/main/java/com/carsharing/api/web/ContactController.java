package com.carsharing.api.web;

import com.carsharing.api.domain.ContactRequest;
import com.carsharing.api.service.ContactService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    public record ContactFormRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank String message
    ) {}

    @PostMapping("/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createContact(@Valid @RequestBody ContactFormRequest request) {
        ContactRequest saved = contactService.create(request.name(), request.email(), request.message());
        return Map.of(
                "id", saved.getId(),
                "createdAt", saved.getCreatedAt() != null ? saved.getCreatedAt() : Instant.now()
        );
    }
}
