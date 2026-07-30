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

        Campus campus = campusRepository.findByName(request.campusName())
            .orElseGet(() -> {
                // create campus if it doesn't exist yet
                Campus c = new Campus(java.util.UUID.randomUUID(), request.campusName());
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
