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

    @GetMapping
    public ResponseEntity<List<LostFoundItemDto>> list(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(lostFoundService.listForCampus(authenticatedUser));
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
        return ResponseEntity.ok(lostFoundService.createWithFile(authenticatedUser, request, file));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<LostFoundItemDto> update(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateLostFoundItemRequest request
    ) {
        return ResponseEntity.ok(lostFoundService.update(authenticatedUser, itemId, request));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID itemId
    ) {
        lostFoundService.delete(authenticatedUser, itemId);
        return ResponseEntity.noContent().build();
    }
}
