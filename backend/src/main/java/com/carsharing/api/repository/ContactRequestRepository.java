package com.carsharing.api.repository;

import com.carsharing.api.domain.ContactRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, Long> {

    List<ContactRequest> findAllByOrderByCreatedAtDesc();
}
