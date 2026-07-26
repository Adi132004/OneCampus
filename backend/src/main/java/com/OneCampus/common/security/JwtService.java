package com.OneCampus.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final PrivateKey privateKey;
    private final PublicKey publicKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.privateKey = decodePrivateKey(jwtProperties.getPrivateKey());
        this.publicKey = decodePublicKey(jwtProperties.getPublicKey());
    }

    // ---- Key decoding (runs once, at construction) ----

    private PrivateKey decodePrivateKey(String base64Key) {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(base64Key);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
            return KeyFactory.getInstance("RSA").generatePrivate(spec);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load JWT private key — check JWT_PRIVATE_KEY env var", e);
        }
    }

    private PublicKey decodePublicKey(String base64Key) {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(base64Key);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            return KeyFactory.getInstance("RSA").generatePublic(spec);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load JWT public key — check JWT_PUBLIC_KEY env var", e);
        }
    }

    // ---- Token generation ----

    public String generateAccessToken(UUID userId, String campusId) {
        long expirationMs = jwtProperties.getAccessTokenTtlMinutes() * 60 * 1000;
        return buildToken(userId, campusId, "access", expirationMs);
    }

    public String generateRefreshToken(UUID userId, String campusId) {
        long expirationMs = jwtProperties.getRefreshTokenTtlDays() * 24 * 60 * 60 * 1000;
        return buildToken(userId, campusId, "refresh", expirationMs);
    }

    private String buildToken(UUID userId, String campusId, String tokenType, long expirationMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("campusId", campusId)
                .claim("type", tokenType)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(privateKey, Jwts.SIG.RS256)
                .compact();
    }

    // ---- Token parsing / validation ----

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(parseClaims(token).get("type", String.class));
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public String extractCampusId(String token) {
        return parseClaims(token).get("campusId", String.class);
    }
}