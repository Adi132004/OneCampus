package com.OneCampus.lostfound.service;

import com.OneCampus.common.security.AuthenticatedUser;
import com.OneCampus.identity.dto.UserDto;
import com.OneCampus.identity.service.IdentityService;
import com.OneCampus.common.cloudinary.CloudinaryService;
import com.OneCampus.lostfound.dto.CreateLostFoundItemRequest;
import com.OneCampus.lostfound.dto.LostFoundItemDto;
import com.OneCampus.lostfound.dto.UpdateLostFoundItemRequest;
import com.OneCampus.lostfound.entity.LostFoundItem;
import com.OneCampus.lostfound.repository.LostFoundItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LostFoundService {

    private final LostFoundItemRepository repository;
    private final IdentityService identityService;
    private final CloudinaryService cloudinaryService;

    public LostFoundService(LostFoundItemRepository repository, IdentityService identityService, CloudinaryService cloudinaryService) {
        this.repository = repository;
        this.identityService = identityService;
        this.cloudinaryService = cloudinaryService;
    }

    public List<LostFoundItemDto> listForCampus(AuthenticatedUser authenticatedUser) {
        String campusId = authenticatedUser.campusId();
        return repository.findAllByCampusId(campusId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public LostFoundItemDto create(AuthenticatedUser authenticatedUser, CreateLostFoundItemRequest request) {
        UserDto user = identityService.getCurrentUser(authenticatedUser);
        LostFoundItem item = new LostFoundItem(
                request.name(),
                request.description(),
                request.status(),
                request.location(),
                request.date(),
                request.contact(),
                user.campusName(),
                authenticatedUser.campusId(),
                user.id(),
                user.name(),
                user.email(),
                request.emoji(),
                null
        );
        return toDto(repository.save(item));
    }

    public LostFoundItemDto createWithFile(AuthenticatedUser authenticatedUser, CreateLostFoundItemRequest request, org.springframework.web.multipart.MultipartFile file) {
        UserDto user = identityService.getCurrentUser(authenticatedUser);
        String finalImage = null;
        try {
            if (file != null && !file.isEmpty()) {
                String uploaded = cloudinaryService.uploadFile(file);
                // Only accept a proper HTTPS Cloudinary URL — discard null, blank, or anything else.
                if (uploaded != null && uploaded.startsWith("https://")) {
                    finalImage = uploaded;
                } else {
                    System.err.println("[LostFoundService] Cloudinary returned an unexpected URL: " + uploaded);
                }
            }
        } catch (Exception e) {
            // Log the real error so it is visible in the Spring Boot console.
            // The item will be saved without an image rather than failing the entire request.
            System.err.println("[LostFoundService] Cloudinary upload failed: " + e.getMessage());
            e.printStackTrace();
        }

        LostFoundItem item = new LostFoundItem(
                request.name(),
                request.description(),
                request.status(),
                request.location(),
                request.date(),
                request.contact(),
                user.campusName(),
                authenticatedUser.campusId(),
                user.id(),
                user.name(),
                user.email(),
                request.emoji(),
                finalImage
        );
        return toDto(repository.save(item));
    }

    public LostFoundItemDto update(AuthenticatedUser authenticatedUser, UUID itemId, UpdateLostFoundItemRequest request) {
        LostFoundItem item = findItemForCampusOrThrow(itemId, authenticatedUser);
        ensureOwnerOrThrow(item, authenticatedUser);
        item.setName(request.name());
        item.setDescription(request.description());
        item.setStatus(request.status());
        item.setLocation(request.location());
        item.setDate(request.date());
        item.setContact(request.contact());
        item.setEmoji(request.emoji());
        return toDto(repository.save(item));
    }

    public void delete(AuthenticatedUser authenticatedUser, UUID itemId) {
        LostFoundItem item = findItemForCampusOrThrow(itemId, authenticatedUser);
        ensureOwnerOrThrow(item, authenticatedUser);
        repository.delete(item);
    }

    /**
     * Returns a single item by ID only if it belongs to the authenticated user's campus.
     * Throws 404 if not found, 403 if the item belongs to a different campus.
     */
    public LostFoundItemDto getById(AuthenticatedUser authenticatedUser, UUID itemId) {
        LostFoundItem item = findItemForCampusOrThrow(itemId, authenticatedUser);
        return toDto(item);
    }

    private LostFoundItem findItemForCampusOrThrow(UUID itemId, AuthenticatedUser authenticatedUser) {
        return repository.findByIdAndCampusId(itemId, authenticatedUser.campusId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found"));
    }

    private void ensureOwnerOrThrow(LostFoundItem item, AuthenticatedUser authenticatedUser) {
        if (!item.getOwnerId().equals(authenticatedUser.userId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to modify this item");
        }
    }

    private LostFoundItemDto toDto(LostFoundItem item) {
        return new LostFoundItemDto(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getStatus(),
                item.getLocation(),
                item.getDate(),
                item.getContact(),
                item.getCollege(),
                item.getEmoji(),
                item.getImage(),
                item.getOwnerId(),
                item.getOwnerName(),
                item.getOwnerEmail(),
                item.getCreatedAt()
        );
    }
}
