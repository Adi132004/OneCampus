package com.OneCampus.identity.controller;

import com.OneCampus.common.security.AuthenticatedUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/protected")
public class TestAuthController {

    @GetMapping("/ping")
    @ResponseStatus(HttpStatus.OK)
    public String ping(@AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return "Authenticated as userId=" + user.userId() + ", campus=" + user.campusId();
    }
}
