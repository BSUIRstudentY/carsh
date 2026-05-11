package com.carsharing.api.repository;

import com.carsharing.api.domain.Tariff;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TariffRepository extends JpaRepository<Tariff, Long> {

    List<Tariff> findAllByActiveTrue(Sort sort);
}
