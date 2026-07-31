package com.OneCampus.lostfound.controller;

import com.OneCampus.common.security.AuthenticatedUser;
import com.OneCampus.lostfound.dto.CreateLostFoundItemRequest;
import com.OneCampus.lostfound.dto.LostFoundItemDto;
import com.OneCampus.lostfound.dto.UpdateLostFoundItemRequest;
import com.OneCampus.lostfound.service.LostFoundService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lost-found")
public class LostFoundController {

    private final LostFoundService lostFoundService;

    public LostFoundController(LostFoundService lostFoundService) {
        this.lostFoundService = lostFoundService;
    }

    /**
     * Returns all lost-found items that belong to the authenticated user's campus.
     * The backend enforces campus isolation — the frontend never receives items from
     * another institute.
     */
    @GetMapping
    public ResponseEntity<List<LostFoundItemDto>> list(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(lostFoundService.listForCampus(authenticatedUser));
    }

    /**
     * Returns a single lost-found item by ID.
     *
     * <ul>
     *   <li>404 Not Found – item does not exist</li>
     *   <li>403 Forbidden – item exists but belongs to a different campus</li>
     * </ul>
     *
     * The authenticated user's campus is always resolved from the JWT; no campus
     * information should ever be supplied by the frontend.
     */
    @GetMapping("/{itemId}")
    public ResponseEntity<LostFoundItemDto> getById(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID itemId
    ) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(lostFoundService.getById(authenticatedUser, itemId));
    }

    @PostMapping
    public ResponseEntity<LostFoundItemDto> create(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody CreateLostFoundItemRequest request
    ) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(lostFoundService.create(authenticatedUser, request));
    }

    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LostFoundItemDto> createWithFile(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestPart("data") @Valid CreateLostFoundItemRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            LostFoundItemDto dto = lostFoundService.createWithFile(authenticatedUser, request, file);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            // log and return 500 with a simple message
            System.err.println("Error uploading lost/found item: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Updates a lost-found item.
     *
     * <ul>
     *   <li>403 Forbidden – if the authenticated user is not the item's owner</li>
     *   <li>403 Forbidden – if the item belongs to a different campus</li>
     *   <li>404 Not Found – if the item does not exist</li>
     * </ul>
     *
     * The owner identity is always derived from the JWT, never from a frontend-supplied
     * user ID.
     */
    @PutMapping("/{itemId}")
    public ResponseEntity<LostFoundItemDto> update(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateLostFoundItemRequest request
    ) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(lostFoundService.update(authenticatedUser, itemId, request));
    }

    /**
     * Deletes a lost-found item.
     *
     * <ul>
     *   <li>403 Forbidden – if the authenticated user is not the item's owner</li>
     *   <li>403 Forbidden – if the item belongs to a different campus</li>
     *   <li>404 Not Found – if the item does not exist</li>
     * </ul>
     *
     * The authenticated user is always resolved from the JWT.  A user from any
     * other account — even within the same campus — cannot delete another user's
     * report.
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID itemId
    ) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        lostFoundService.delete(authenticatedUser, itemId);
        return ResponseEntity.noContent().build();
    }
}
