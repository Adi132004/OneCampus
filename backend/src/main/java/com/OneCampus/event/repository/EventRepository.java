package com.OneCampus.event.repository;

import com.OneCampus.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findAllByCampusId(String campusId);
}
