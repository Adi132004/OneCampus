package com.OneCampus.identity.service;

import com.OneCampus.common.security.JwtService;
import com.OneCampus.identity.dto.AuthResponse;
import com.OneCampus.identity.dto.LoginRequest;
import com.OneCampus.identity.dto.RegisterRequest;
import com.OneCampus.identity.entity.Campus;
import com.OneCampus.identity.entity.User;
import com.OneCampus.identity.repository.CampusRepository;
import com.OneCampus.identity.repository.UserRepository;
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
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already registered");
        }

        Campus campus = campusRepository.findByName(request.campusName())
                .orElseThrow(() -> new IllegalArgumentException("Unknown campus: " + request.campusName()));

        String passwordHash = passwordEncoder.encode(request.password());

        User user = new User(request.name(), normalizedEmail, passwordHash, campus);
        userRepository.save(user);

        return issueTokens(user);
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return issueTokens(user);
    }

    private AuthResponse issueTokens(User user) {
        String campusId = user.getCampus().getId().toString();
        String accessToken = jwtService.generateAccessToken(user.getId(), campusId);
        String refreshToken = jwtService.generateRefreshToken(user.getId(), campusId);
        return new AuthResponse(accessToken, refreshToken);
    }
}