package com.OneCampus.event.service;

import com.OneCampus.common.security.AuthenticatedUser;
import com.OneCampus.identity.dto.UserDto;
import com.OneCampus.identity.service.IdentityService;
import com.OneCampus.event.dto.CreateEventRequest;
import com.OneCampus.event.dto.EventDto;
import com.OneCampus.event.entity.Event;
import com.OneCampus.event.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository repository;
    private final IdentityService identityService;

    public EventService(EventRepository repository, IdentityService identityService) {
        this.repository = repository;
        this.identityService = identityService;
    }

    public List<EventDto> listForCampus(AuthenticatedUser authenticatedUser) {
        String campusId = authenticatedUser.campusId();
        return repository.findAllByCampusId(campusId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public EventDto create(AuthenticatedUser authenticatedUser, CreateEventRequest request) {
        UserDto user = identityService.getCurrentUser(authenticatedUser);
        Event event = new Event(
                request.title(),
                request.description(),
                request.date(),
                request.time(),
                request.location(),
                request.college() != null && !request.college().isBlank() ? request.college() : user.campusName(),
                authenticatedUser.campusId(),
                user.id(),
                user.name()
        );
        return toDto(repository.save(event));
    }

    private EventDto toDto(Event event) {
        return new EventDto(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getDate(),
                event.getTime(),
                event.getLocation(),
                event.getCollege(),
                event.getCampusId(),
                event.getOrganizerId(),
                event.getOrganizerName(),
                event.getCreatedAt()
        );
    }
}
