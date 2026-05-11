package com.carsharing.api.dto.publicapi;

import java.util.List;

/** Обёртка `{ "items": [...] }` для публичных списков. */
public record PublicItemsResponse<T>(List<T> items) {}
