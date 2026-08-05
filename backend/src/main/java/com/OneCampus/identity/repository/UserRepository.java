package com.OneCampus.identity.repository;

import com.OneCampus.identity.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("""
            select u from User u
            where u.campusId = :campusId
              and lower(u.name) like lower(concat('%', :q, '%'))
            order by u.name asc
            limit 20
            """)
    List<User> searchByCampusAndName(@Param("campusId") UUID campusId, @Param("q") String q);
}