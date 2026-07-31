package com.OneCampus.marketplace.service;

import com.OneCampus.common.cloudinary.CloudinaryService;
import com.OneCampus.common.security.AuthenticatedUser;
import com.OneCampus.identity.dto.UserDto;
import com.OneCampus.identity.service.IdentityService;
import com.OneCampus.marketplace.dto.CreateMarketplaceItemRequest;
import com.OneCampus.marketplace.dto.MarketplaceItemDto;
import com.OneCampus.marketplace.entity.MarketplaceItem;
import com.OneCampus.marketplace.entity.ProductStatus;
import com.OneCampus.marketplace.repository.MarketplaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceService {

    private final MarketplaceRepository repository;
    private final IdentityService identityService;
    private final CloudinaryService cloudinaryService;

    public MarketplaceService(
            MarketplaceRepository repository,
            IdentityService identityService,
            CloudinaryService cloudinaryService
    ) {
        this.repository = repository;
        this.identityService = identityService;
        this.cloudinaryService = cloudinaryService;
    }
    public List<MarketplaceItemDto> listForCampus(AuthenticatedUser authenticatedUser) {

        String campusId = authenticatedUser.campusId();

        return repository.findAllByCampusId(campusId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private MarketplaceItemDto toDto(MarketplaceItem item) {
        return new MarketplaceItemDto(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getPrice(),
                item.getCategory(),
                item.getCondition(),
                item.getImage(),
                item.getSellerName(),
                item.getSellerEmail(),
                item.getCollege(),
                item.getStatus(),
                item.getCreatedAt()
        );
    }
}