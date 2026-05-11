package com.carsharing.api.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "contact_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 4000)
    private String message;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "NEW";

    @Column(name = "admin_reply", length = 4000)
    private String adminReply;

    @Column(name = "replied_at")
    private Instant repliedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() { if (createdAt == null) createdAt = Instant.now(); }
}
