package com.OneCampus.event.controller;

import com.OneCampus.common.security.AuthenticatedUser;
import com.OneCampus.event.dto.CreateEventRequest;
import com.OneCampus.event.dto.EventDto;
import com.OneCampus.event.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<EventDto>> list(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(eventService.listForCampus(authenticatedUser));
    }

    @PostMapping
    public ResponseEntity<EventDto> create(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody CreateEventRequest request
    ) {
        if (authenticatedUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(eventService.create(authenticatedUser, request));
    }
}
