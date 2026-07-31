package com.OneCampus.identity.service;

import com.OneCampus.common.security.AuthenticatedUser;
import com.OneCampus.common.security.JwtService;
import com.OneCampus.identity.dto.AuthResponse;
import com.OneCampus.identity.dto.LoginRequest;
import com.OneCampus.identity.dto.RegisterRequest;
import com.OneCampus.identity.dto.UserDto;
import com.OneCampus.identity.entity.Campus;
import com.OneCampus.identity.entity.User;
import com.OneCampus.identity.repository.CampusRepository;
import com.OneCampus.identity.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class IdentityService {

    private final UserRepository userRepository;
    private final CampusRepository campusRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public IdentityService(
            UserRepository userRepository,
            CampusRepository campusRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.campusRepository = campusRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Normalise the campus name: strip surrounding whitespace so " ABC " and
        // "ABC" are treated as the same campus.  We keep the original casing from
        // the very first registration that created the campus row.
        String normalizedCampusName = request.campusName().strip();
        if (normalizedCampusName.isBlank()) {
            throw new IllegalArgumentException("College/Institute name is required");
        }

        Campus campus = campusRepository.findByNameIgnoreCase(normalizedCampusName)
            .orElseGet(() -> {
                // No campus found (even case-insensitively) — create a new one using
                // the caller's provided casing as the canonical name.
                Campus c = new Campus(java.util.UUID.randomUUID(), normalizedCampusName);
                return campusRepository.save(c);
            });

        String hashed = passwordEncoder.encode(request.password());
        User user = new User(request.name(), request.email(), hashed, campus.getId());
        userRepository.save(user);

        return issueTokens(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return issueTokens(user);
    }

    public UserDto getCurrentUser(AuthenticatedUser authenticatedUser) {
        if (authenticatedUser == null) {
            throw new BadCredentialsException("Authentication required");
        }

        User user = userRepository.findById(authenticatedUser.userId())
                .orElseThrow(() -> new BadCredentialsException("Authenticated user not found"));
        Campus campus = campusRepository.findById(user.getCampusId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid campus"));

        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                campus.getId(),
                campus.getName()
        );
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getCampusId().toString());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getCampusId().toString());
        return new AuthResponse(accessToken, refreshToken);
    }
}
