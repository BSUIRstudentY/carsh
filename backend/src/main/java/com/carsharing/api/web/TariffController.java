package com.carsharing.api.web;

import com.carsharing.api.dto.publicapi.TariffPublicDto;
import com.carsharing.api.service.TariffService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class TariffController {

    private final TariffService tariffService;

    /** Все активные тарифы (без пагинации), отсортированы по режиму и названию. */
    @GetMapping("/tariffs")
    public List<TariffPublicDto> listTariffs() {
        return tariffService.findActivePublic();
    }
}
