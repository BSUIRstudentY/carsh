package com.carsharing.api.repository;

import com.carsharing.api.domain.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    @Query("""
            SELECT DISTINCT v FROM Vehicle v
            JOIN FETCH v.vehicleClass vc
            LEFT JOIN FETCH vc.defaultTariff
            LEFT JOIN FETCH v.city
            WHERE v.status = 'AVAILABLE'
              AND vc.code = :classCode
              AND (:cityId IS NULL OR v.city.id = :cityId)
            ORDER BY v.displayTitle ASC
            """)
    List<Vehicle> findFleetByClassAndOptionalCity(
            @Param("cityId") Long cityId,
            @Param("classCode") String classCode
    );

    /** Доступные машины с координатами для карты (все классы). */
    @Query("""
            SELECT DISTINCT v FROM Vehicle v
            JOIN FETCH v.vehicleClass vc
            LEFT JOIN FETCH vc.defaultTariff
            LEFT JOIN FETCH v.city
            WHERE v.status = 'AVAILABLE'
              AND v.lastLatitude IS NOT NULL
              AND v.lastLongitude IS NOT NULL
              AND (:cityId IS NULL OR v.city.id = :cityId)
            ORDER BY v.displayTitle ASC
            """)
    List<Vehicle> findAvailableWithCoordinates(@Param("cityId") Long cityId);
}
