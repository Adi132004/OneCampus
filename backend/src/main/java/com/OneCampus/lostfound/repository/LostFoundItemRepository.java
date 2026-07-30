package com.OneCampus.lostfound.repository;

import com.OneCampus.lostfound.entity.LostFoundItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LostFoundItemRepository extends JpaRepository<LostFoundItem, UUID> {

    List<LostFoundItem> findAllByCampusId(String campusId);

    Optional<LostFoundItem> findByIdAndCampusId(UUID id, String campusId);
}
