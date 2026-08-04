//package com.OneCampus.common.security;
//
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import io.jsonwebtoken.Claims;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.util.Collections;
//import java.util.UUID;
//
//@Component
//public class JwtAuthFilter extends OncePerRequestFilter {
//
//
//    private final JwtService jwtService;
//
//    public JwtAuthFilter(JwtService jwtService) {
//        this.jwtService = jwtService;
//    }
//
//    @Override
//    protected void doFilterInternal(
//            HttpServletRequest request,
//            HttpServletResponse response,
//            FilterChain filterChain
//    ) throws ServletException, IOException {
//
//        String authHeader = request.getHeader("Authorization");
//
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        String token = authHeader.substring(7); // strip "Bearer "
//
//        if (!jwtService.isValid(token)) {
//            filterChain.doFilter(request, response); // let it through unauthenticated; SecurityConfig decides if the endpoint needs auth
//            return;
//        }
//
//        // Refresh tokens should never authenticate a normal API request
//        if (jwtService.isRefreshToken(token)) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        try {
//            Claims claims = jwtService.parseClaims(token);
//            UUID userId = UUID.fromString(claims.getSubject());
//            String campusId = claims.get("campusId", String.class);
//
//            AuthenticatedUser principal = new AuthenticatedUser(userId, campusId);
//
//            UsernamePasswordAuthenticationToken authToken =
//                    new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList());
//            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//
//            SecurityContextHolder.getContext().setAuthentication(authToken);
//        } catch (Exception e) {
//            SecurityContextHolder.clearContext();
//        }
//
//        filterChain.doFilter(request, response);
//    }
//}

package com.OneCampus.common.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("\n========== JWT FILTER ==========");
        System.out.println("Request : " + request.getMethod() + " " + request.getRequestURI());

        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization Header : " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No Bearer token found.");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        System.out.println("Token starts with : "
                + token.substring(0, Math.min(25, token.length())) + "...");

        if (!jwtService.isValid(token)) {
            System.out.println("TOKEN IS INVALID");
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("TOKEN IS VALID");

        if (jwtService.isRefreshToken(token)) {
            System.out.println("REFRESH TOKEN DETECTED");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = jwtService.parseClaims(token);

            System.out.println("JWT Subject : " + claims.getSubject());
            System.out.println("Campus ID : " + claims.get("campusId"));

            UUID userId = UUID.fromString(claims.getSubject());
            String campusId = claims.get("campusId", String.class);

            AuthenticatedUser principal =
                    new AuthenticatedUser(userId, campusId);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            Collections.emptyList()
                    );

            authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authToken);

            System.out.println("AUTHENTICATION SUCCESSFUL");

        } catch (Exception e) {
            System.out.println("AUTHENTICATION FAILED");
            e.printStackTrace();
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}