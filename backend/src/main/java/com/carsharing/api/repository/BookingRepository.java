package com.carsharing.api.repository;

import com.carsharing.api.domain.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = 'ACTIVE'")
    Optional<Booking> findActiveByUserId(@Param("userId") Long userId);

    @Query("SELECT b FROM Booking b WHERE b.vehicle.id = :vehicleId AND b.status = 'ACTIVE'")
    Optional<Booking> findActiveByVehicleId(@Param("vehicleId") Long vehicleId);

    List<Booking> findAllByOrderByCreatedAtDesc();
}
