package com.OneCampus.identity.controller;

import com.OneCampus.identity.dto.AuthResponse;
import com.OneCampus.identity.dto.LoginRequest;
import com.OneCampus.identity.dto.RegisterRequest;
import com.OneCampus.identity.service.IdentityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final IdentityService identityService;

    public AuthController(IdentityService identityService) {
        this.identityService = identityService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = identityService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = identityService.login(request);
        return ResponseEntity.ok(response);
    }
}