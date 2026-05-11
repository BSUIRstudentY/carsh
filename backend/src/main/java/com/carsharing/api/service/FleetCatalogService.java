package com.carsharing.api.service;

import com.carsharing.api.domain.VehicleClass;
import com.carsharing.api.dto.publicapi.CityPublicDto;
import com.carsharing.api.dto.publicapi.PublicItemsResponse;
import com.carsharing.api.dto.publicapi.VehicleClassPublicDto;
import com.carsharing.api.dto.publicapi.VehiclePublicDto;
import com.carsharing.api.repository.CityRepository;
import com.carsharing.api.repository.VehicleClassRepository;
import com.carsharing.api.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FleetCatalogService {

    /** Коды классов для сегментов витрины «Эконом / Комфорт / Бизнес». */
    private static final Set<String> FLEET_SEGMENT_CODES = Set.of("ECONOMY", "COMFORT", "BUSINESS");

    private final CityRepository cityRepository;
    private final VehicleClassRepository vehicleClassRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional(readOnly = true)
    public PublicItemsResponse<CityPublicDto> listCities() {
        List<CityPublicDto> items = cityRepository.findAllByActiveTrueOrderByNameAsc().stream()
                .map(CityPublicDto::from)
                .toList();
        return new PublicItemsResponse<>(items);
    }

    @Transactional(readOnly = true)
    public PublicItemsResponse<VehicleClassPublicDto> listVehicleClasses(Long cityId) {
        List<VehicleClass> entities = cityId == null
                ? vehicleClassRepository.findAllForCatalog()
                : vehicleClassRepository.findAvailableClassesInCity(cityId);
        List<VehicleClassPublicDto> items = entities.stream()
                .map(VehicleClassPublicDto::from)
                .toList();
        return new PublicItemsResponse<>(items);
    }

    @Transactional(readOnly = true)
    public VehicleClassPublicDto getVehicleClass(Long id) {
        VehicleClass vc = vehicleClassRepository.findWithTariffById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return VehicleClassPublicDto.from(vc);
    }

    /**
     * Доступные в городе машины заданного класса для страницы автопарка.
     *
     * @param cityId   опционально; если задан — только машины этого города
     * @param classCode обязателен: ECONOMY, COMFORT или BUSINESS
     */
    @Transactional(readOnly = true)
    public PublicItemsResponse<VehiclePublicDto> listFleetVehicles(Long cityId, String classCode) {
        if (classCode == null || classCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "classCode is required");
        }
        String normalized = classCode.trim().toUpperCase();
        if (!FLEET_SEGMENT_CODES.contains(normalized)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "classCode must be one of: ECONOMY, COMFORT, BUSINESS"
            );
        }
        List<VehiclePublicDto> items = vehicleRepository
                .findFleetByClassAndOptionalCity(cityId, normalized)
                .stream()
                .map(VehiclePublicDto::from)
                .toList();
        return new PublicItemsResponse<>(items);
    }

    /**
     * Машины на карте: только со сохранёнными координатами; опционально фильтр по городу.
     */
    @Transactional(readOnly = true)
    public PublicItemsResponse<VehiclePublicDto> listMapVehicles(Long cityId) {
        List<VehiclePublicDto> items = vehicleRepository
                .findAvailableWithCoordinates(cityId)
                .stream()
                .map(VehiclePublicDto::from)
                .toList();
        return new PublicItemsResponse<>(items);
    }
}
