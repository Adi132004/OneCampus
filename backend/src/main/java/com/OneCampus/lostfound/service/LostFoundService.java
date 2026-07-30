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
import org.springframework.stereotype.Service;

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
        String finalImage = request.image();
        try {
            if (finalImage != null && !finalImage.isBlank()) {
                // attempt to upload remote image to Cloudinary and use its secure URL
                String uploaded = cloudinaryService.uploadRemoteImage(finalImage);
                if (uploaded != null && !uploaded.isBlank()) {
                    finalImage = uploaded;
                }
            }
        } catch (Exception e) {
            // upload failed — fall back to provided image URL (if any)
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
        LostFoundItem item = repository.findByIdAndCampusId(itemId, authenticatedUser.campusId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        item.setName(request.name());
        item.setDescription(request.description());
        item.setStatus(request.status());
        item.setLocation(request.location());
        item.setDate(request.date());
        item.setContact(request.contact());
        item.setEmoji(request.emoji());
        item.setImage(request.image());
        return toDto(repository.save(item));
    }

    public void delete(AuthenticatedUser authenticatedUser, UUID itemId) {
        LostFoundItem item = repository.findByIdAndCampusId(itemId, authenticatedUser.campusId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));
        repository.delete(item);
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
