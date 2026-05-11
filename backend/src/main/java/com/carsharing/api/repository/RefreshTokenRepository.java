package com.carsharing.api.repository;

import com.carsharing.api.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHashAndRevokedAtIsNull(String tokenHash);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revokedAt = :revokedAt WHERE r.tokenHash = :hash AND r.revokedAt IS NULL")
    int revokeByHash(@Param("hash") String hash, @Param("revokedAt") Instant revokedAt);
}
