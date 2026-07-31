package com.OneCampus.marketplace.repository;

import com.OneCampus.marketplace.entity.MarketplaceItem;
import com.OneCampus.marketplace.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MarketplaceRepository extends JpaRepository<MarketplaceItem, UUID> {

    List<MarketplaceItem> findByCategory(String category);

    List<MarketplaceItem> findByCollege(String college);

    List<MarketplaceItem> findByStatus(ProductStatus status);

    List<MarketplaceItem> findBySellerId(UUID sellerId);

    List<MarketplaceItem> findAllByCampusId(String campusId);
}