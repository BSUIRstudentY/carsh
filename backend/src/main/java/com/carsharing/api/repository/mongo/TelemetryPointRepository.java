package com.carsharing.api.repository.mongo;

import com.carsharing.api.domain.mongo.TelemetryPoint;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelemetryPointRepository extends MongoRepository<TelemetryPoint, String> {

    List<TelemetryPoint> findByBookingId(Long bookingId, Sort sort);

    List<TelemetryPoint> findByVehicleId(Long vehicleId, Sort sort);

    List<TelemetryPoint> findByVehicleIdAndIgnitionTrue(Long vehicleId, Sort sort);
}
