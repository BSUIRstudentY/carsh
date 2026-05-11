package com.carsharing.api.security;

import com.carsharing.api.config.JwtProperties;
import com.carsharing.api.domain.RefreshToken;
import com.carsharing.api.domain.User;
import com.carsharing.api.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProperties jwtProperties;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public String createAndStore(User user) {
        byte[] raw = new byte[32];
        secureRandom.nextBytes(raw);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        String hash = TokenHasher.sha256Hex(raw);
        Instant expiresAt = Instant.now().plus(jwtProperties.refreshTokenValidity());

        RefreshToken entity = RefreshToken.builder()
                .user(user)
                .tokenHash(hash)
                .expiresAt(expiresAt)
                .build();
        refreshTokenRepository.save(entity);
        return token;
    }

    public Optional<RefreshToken> findValid(String rawToken) {
        byte[] raw;
        try {
            raw = Base64.getUrlDecoder().decode(rawToken);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
        String hash = TokenHasher.sha256Hex(raw);
        Optional<RefreshToken> found = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash);
        return found.filter(rt -> rt.getExpiresAt().isAfter(Instant.now()));
    }

    @Transactional
    public void revoke(String rawToken) {
        byte[] raw;
        try {
            raw = Base64.getUrlDecoder().decode(rawToken);
        } catch (IllegalArgumentException e) {
            return;
        }
        String hash = TokenHasher.sha256Hex(raw);
        refreshTokenRepository.revokeByHash(hash, Instant.now());
    }

    @Transactional
    public void revokeEntity(RefreshToken token) {
        token.setRevokedAt(Instant.now());
        refreshTokenRepository.save(token);
    }
}
