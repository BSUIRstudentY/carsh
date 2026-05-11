package com.carsharing.api.service;

import com.carsharing.api.domain.ContactRequest;
import com.carsharing.api.repository.ContactRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRequestRepository contactRequestRepository;

    @Transactional
    public ContactRequest create(String name, String email, String message) {
        ContactRequest entity = ContactRequest.builder()
                .name(name)
                .email(email)
                .message(message)
                .build();
        return contactRequestRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<ContactRequest> findAll() {
        return contactRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<ContactRequest> findByEmail(String email) {
        return contactRequestRepository.findByEmailOrderByCreatedAtDesc(email);
    }
}
