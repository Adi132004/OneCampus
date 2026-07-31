package com.OneCampus.identity.repository;

import com.OneCampus.identity.entity.Campus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CampusRepository extends JpaRepository<Campus, UUID> {
    Optional<Campus> findByName(String name);

    /**
     * Case-insensitive campus lookup so that "ABC College" and "abc college"
     * resolve to the same campus and never create duplicate rows.
     */
    Optional<Campus> findByNameIgnoreCase(String name);
}
