package com.carsharing.api.web;

import com.carsharing.api.dto.publicapi.CityPublicDto;
import com.carsharing.api.dto.publicapi.PublicItemsResponse;
import com.carsharing.api.dto.publicapi.VehicleClassPublicDto;
import com.carsharing.api.dto.publicapi.VehiclePublicDto;
import com.carsharing.api.service.FleetCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicCatalogController {

    private final FleetCatalogService fleetCatalogService;

    @GetMapping("/cities")
    public PublicItemsResponse<CityPublicDto> cities() {
        return fleetCatalogService.listCities();
    }

    /**
     * @param cityId если задан — только классы, у которых есть доступная машина в этом городе
     */
    @GetMapping("/vehicle-classes")
    public PublicItemsResponse<VehicleClassPublicDto> vehicleClasses(
            @RequestParam(required = false) Long cityId
    ) {
        return fleetCatalogService.listVehicleClasses(cityId);
    }

    @GetMapping("/vehicle-classes/{id}")
    public VehicleClassPublicDto vehicleClassById(@PathVariable Long id) {
        return fleetCatalogService.getVehicleClass(id);
    }

    /**
     * Машины для витрины автопарка по сегменту (класс) и опционально городу.
     *
     * @param classCode ECONOMY | COMFORT | BUSINESS (обязателен)
     */
    @GetMapping("/vehicles")
    public PublicItemsResponse<VehiclePublicDto> fleetVehicles(
            @RequestParam String classCode,
            @RequestParam(required = false) Long cityId
    ) {
        return fleetCatalogService.listFleetVehicles(cityId, classCode);
    }

    /**
     * Доступные автомобили с координатами для карты (все классы сегмента витрины).
     */
    @GetMapping("/vehicles/map")
    public PublicItemsResponse<VehiclePublicDto> mapVehicles(
            @RequestParam(required = false) Long cityId
    ) {
        return fleetCatalogService.listMapVehicles(cityId);
    }
}
