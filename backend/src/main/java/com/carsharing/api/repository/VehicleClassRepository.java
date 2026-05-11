package com.carsharing.api.repository;

import com.carsharing.api.domain.VehicleClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleClassRepository extends JpaRepository<VehicleClass, Long> {

    @Query("""
            SELECT DISTINCT vc FROM VehicleClass vc
            LEFT JOIN FETCH vc.defaultTariff
            ORDER BY vc.sortOrder ASC, vc.title ASC
            """)
    List<VehicleClass> findAllForCatalog();

    @Query("""
            SELECT DISTINCT vc FROM Vehicle v
            JOIN v.vehicleClass vc
            LEFT JOIN FETCH vc.defaultTariff
            WHERE v.city.id = :cityId AND v.status = 'AVAILABLE'
            ORDER BY vc.sortOrder ASC, vc.title ASC
            """)
    List<VehicleClass> findAvailableClassesInCity(@Param("cityId") Long cityId);

    @Query("""
            SELECT vc FROM VehicleClass vc
            LEFT JOIN FETCH vc.defaultTariff
            WHERE vc.id = :id
            """)
    Optional<VehicleClass> findWithTariffById(@Param("id") Long id);
}
