package com.carsharing.api.service;

import com.carsharing.api.dto.publicapi.TariffPublicDto;
import com.carsharing.api.repository.TariffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TariffService {

    private static final Sort ACTIVE_TARIFF_SORT = Sort.by(
            Sort.Order.asc("tariffMode"),
            Sort.Order.asc("title")
    );

    private final TariffRepository tariffRepository;

    @Transactional(readOnly = true)
    public List<TariffPublicDto> findActivePublic() {
        return tariffRepository.findAllByActiveTrue(ACTIVE_TARIFF_SORT).stream()
                .map(TariffPublicDto::from)
                .toList();
    }
}
