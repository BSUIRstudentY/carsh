package com.carsharing.api.service;

import com.carsharing.api.config.JwtProperties;
import com.carsharing.api.domain.User;
import com.carsharing.api.dto.auth.TokenResponse;
import com.carsharing.api.dto.auth.UserProfileResponse;
import com.carsharing.api.repository.UserRepository;
import com.carsharing.api.security.JwtService;
import com.carsharing.api.security.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final JwtProperties jwtProperties;

    @Transactional
    public TokenResponse register(String email, String rawPassword, String phone,
                                  String firstName, String lastName) {
        String normalizedEmail = email.strip().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        if (phone != null && !phone.isBlank()) {
            String p = phone.strip();
            if (userRepository.existsByPhone(p)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already registered");
            }
        }

        Instant now = Instant.now();
        User user = User.builder()
                .email(normalizedEmail)
                .phone(phone != null && !phone.isBlank() ? phone.strip() : null)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .firstName(firstName)
                .lastName(lastName)
                .role("USER")
                .status("ACTIVE")
                .createdAt(now)
                .updatedAt(now)
                .build();
        userRepository.save(user);
        return issueTokenPair(user);
    }

    @Transactional
    public TokenResponse login(String identifier, String rawPassword) {
        User user = resolveUser(identifier.strip());
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw unauthorized();
        }
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw unauthorized();
        }
        return issueTokenPair(user);
    }

    @Transactional
    public TokenResponse refresh(String rawRefreshToken) {
        var rt = refreshTokenService.findValid(rawRefreshToken)
                .orElseThrow(this::unauthorized);
        User user = userRepository.findById(rt.getUser().getId())
                .orElseThrow(this::unauthorized);
        refreshTokenService.revokeEntity(rt);
        return issueTokenPair(user);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse profile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getPhone(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getStatus()
        );
    }

    private TokenResponse issueTokenPair(User user) {
        String access = jwtService.createAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refresh = refreshTokenService.createAndStore(user);
        long expiresInSeconds = jwtProperties.accessTokenValidity().toSeconds();
        return new TokenResponse(access, refresh, "Bearer", expiresInSeconds);
    }

    private User resolveUser(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmailIgnoreCase(identifier)
                    .orElseThrow(this::unauthorized);
        }
        return userRepository.findByPhone(identifier)
                .orElseThrow(this::unauthorized);
    }

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
}
