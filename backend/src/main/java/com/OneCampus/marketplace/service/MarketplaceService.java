package com.OneCampus.marketplace.service;

import com.OneCampus.common.cloudinary.CloudinaryService;
import com.OneCampus.common.security.AuthenticatedUser;
import com.OneCampus.identity.dto.UserDto;
import com.OneCampus.identity.service.IdentityService;
import com.OneCampus.marketplace.dto.CreateMarketplaceItemRequest;
import com.OneCampus.marketplace.dto.MarketplaceItemDto;
import com.OneCampus.marketplace.dto.UpdateMarketplaceItemRequest;
import com.OneCampus.marketplace.entity.MarketplaceItem;
import com.OneCampus.marketplace.entity.ProductStatus;
import com.OneCampus.marketplace.repository.MarketplaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
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

    public MarketplaceItemDto getById(
            AuthenticatedUser authenticatedUser,
            UUID itemId
    ) {
        MarketplaceItem item = repository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Marketplace item not found"));

        if (!item.getCampusId().equals(authenticatedUser.campusId())) {
            throw new IllegalArgumentException("Marketplace item not found");
        }

        return toDto(item);
    }

    public MarketplaceItemDto create(
            AuthenticatedUser authenticatedUser,
            CreateMarketplaceItemRequest request
    ) {
        UserDto user = identityService.getCurrentUser(authenticatedUser);
        String finalImage = request.getImage();

        try {
            if (finalImage != null && !finalImage.isBlank() && !finalImage.contains("cloudinary.com")) {
                String uploaded = cloudinaryService.uploadRemoteImage(finalImage);
                if (uploaded != null && !uploaded.isBlank()) {
                    finalImage = uploaded;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        MarketplaceItem item = new MarketplaceItem(
                request.getTitle(),
                request.getDescription(),
                request.getPrice(),
                request.getCategory(),
                request.getCondition(),
                finalImage,
                user.id(),
                user.name(),
                user.email(),
                authenticatedUser.campusId(),
                user.campusName(),
                ProductStatus.AVAILABLE
        );

        MarketplaceItem saved = repository.save(item);
        return toDto(saved);
    }

    public MarketplaceItemDto createWithFile(
            AuthenticatedUser authenticatedUser,
            CreateMarketplaceItemRequest request,
            MultipartFile file
    ) {
        UserDto user = identityService.getCurrentUser(authenticatedUser);
        String finalImage = request.getImage();

        try {
            if (file != null && !file.isEmpty()) {
                String uploaded = cloudinaryService.uploadFile(file);
                if (uploaded != null && !uploaded.isBlank()) {
                    finalImage = uploaded;
                }
            } else if (finalImage != null && !finalImage.isBlank() && !finalImage.contains("cloudinary.com")) {
                String uploaded = cloudinaryService.uploadRemoteImage(finalImage);
                if (uploaded != null && !uploaded.isBlank()) {
                    finalImage = uploaded;
                }
            }
        } catch (Exception ignored) {
        }

        MarketplaceItem item = new MarketplaceItem(
                request.getTitle(),
                request.getDescription(),
                request.getPrice(),
                request.getCategory(),
                request.getCondition(),
                finalImage,
                user.id(),
                user.name(),
                user.email(),
                authenticatedUser.campusId(),
                user.campusName(),
                ProductStatus.AVAILABLE
        );

        return toDto(repository.save(item));
    }

    public MarketplaceItemDto update(
            AuthenticatedUser authenticatedUser,
            UUID itemId,
            UpdateMarketplaceItemRequest request
    ) {
        MarketplaceItem item = repository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (!item.getSellerId().equals(authenticatedUser.userId())) {
            throw new IllegalArgumentException("You can only modify your own listings.");
        }

        String finalImage = request.getImage();
        try {
            if (finalImage != null && !finalImage.isBlank() && !finalImage.contains("cloudinary.com")) {
                String uploaded = cloudinaryService.uploadRemoteImage(finalImage);
                if (uploaded != null && !uploaded.isBlank()) {
                    finalImage = uploaded;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setCategory(request.getCategory());
        item.setCondition(request.getCondition());
        item.setImage(finalImage);

        return toDto(repository.save(item));
    }

    public void delete(
            AuthenticatedUser authenticatedUser,
            UUID itemId
    ) {
        MarketplaceItem item = repository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (!item.getSellerId().equals(authenticatedUser.userId())) {
            throw new IllegalArgumentException("You can only delete your own listings.");
        }

        repository.delete(item);
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
                item.getSellerId(),
                item.getSellerName(),
                item.getSellerEmail(),
                item.getCollege(),
                item.getStatus(),
                item.getCreatedAt()
        );
    }
}