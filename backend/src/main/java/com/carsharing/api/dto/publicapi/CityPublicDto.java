package com.carsharing.api.dto.publicapi;

import com.carsharing.api.domain.City;

public record CityPublicDto(
        Long id,
        String code,
        String name,
        boolean active
) {
    public static CityPublicDto from(City c) {
        return new CityPublicDto(c.getId(), c.getCode(), c.getName(), Boolean.TRUE.equals(c.getActive()));
    }
}
