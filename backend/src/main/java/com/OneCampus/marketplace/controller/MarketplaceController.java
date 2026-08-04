package com.OneCampus.marketplace.controller;

import com.OneCampus.common.security.AuthenticatedUser;
import com.OneCampus.marketplace.dto.CreateMarketplaceItemRequest;
import com.OneCampus.marketplace.dto.MarketplaceItemDto;
import com.OneCampus.marketplace.dto.UpdateMarketplaceItemRequest;
import com.OneCampus.marketplace.service.MarketplaceService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    @GetMapping
    public ResponseEntity<List<MarketplaceItemDto>> list(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                marketplaceService.listForCampus(authenticatedUser)
        );
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<MarketplaceItemDto> getById(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID itemId
    ) {

        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                marketplaceService.getById(authenticatedUser, itemId)
        );
    }

//    @PostMapping
//    public ResponseEntity<MarketplaceItemDto> create(
//            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
//            @Valid @RequestBody CreateMarketplaceItemRequest request
//    ) {
//        if (authenticatedUser == null) {
//            return ResponseEntity.status(401).build();
//        }
//
//        return ResponseEntity.ok(
//                marketplaceService.create(authenticatedUser, request)
//        );
//    }

//    @PostMapping
//    public ResponseEntity<?> create(
//            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
//            @Valid @RequestBody CreateMarketplaceItemRequest request
//    ) {
//
//        System.out.println("========== MARKETPLACE ==========");
//        System.out.println("User = " + authenticatedUser);
//
//        if (authenticatedUser == null) {
//            System.out.println("AUTH USER IS NULL");
//            return ResponseEntity.status(401).body("USER NULL");
//        }
//
//        return ResponseEntity.ok(
//                marketplaceService.create(authenticatedUser, request)
//        );
//    }

    @PostMapping
    public ResponseEntity<?> create(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody CreateMarketplaceItemRequest request
    ) {

        System.out.println("===== CONTROLLER HIT =====");
        System.out.println("Authenticated User = " + authenticatedUser);

        if (authenticatedUser == null) {
            return ResponseEntity.status(401).body("AUTH USER NULL");
        }

        return ResponseEntity.ok(
                marketplaceService.create(authenticatedUser, request)
        );
    }

    @PostMapping(
            path = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<MarketplaceItemDto> createWithImage(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestPart("data") @Valid CreateMarketplaceItemRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                marketplaceService.createWithFile(authenticatedUser, request, file)
        );
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<MarketplaceItemDto> update(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateMarketplaceItemRequest request
    ) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                marketplaceService.update(authenticatedUser, itemId, request)
        );
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID itemId
    ) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }

        marketplaceService.delete(authenticatedUser, itemId);

        return ResponseEntity.noContent().build();
    }
}