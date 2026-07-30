package com.OneCampus.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
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
        KeyPair keyPair = loadOrGenerateKeyPair(jwtProperties.getPrivateKey(), jwtProperties.getPublicKey());
        this.privateKey = keyPair.getPrivate();
        this.publicKey = keyPair.getPublic();
    }

    private KeyPair loadOrGenerateKeyPair(String privateKeyMaterial, String publicKeyMaterial) {
        if (hasConfiguredKeyMaterial(privateKeyMaterial) && hasConfiguredKeyMaterial(publicKeyMaterial)) {
            try {
                PrivateKey privateKey = decodePrivateKey(privateKeyMaterial);
                PublicKey publicKey = decodePublicKey(publicKeyMaterial);
                return new KeyPair(publicKey, privateKey);
            } catch (Exception e) {
                // Fall back to a generated local key pair for developer environments.
            }
        }

        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            return generator.generateKeyPair();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate JWT key pair", e);
        }
    }

    private boolean hasConfiguredKeyMaterial(String key) {
        return key != null
                && !key.isBlank()
                && !key.startsWith("${")
                && !key.contains("JWT_PRIVATE_KEY")
                && !key.contains("JWT_PUBLIC_KEY");
    }

    private PrivateKey decodePrivateKey(String key) {
        try {
            byte[] keyBytes = decodeKeyMaterial(key);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
            return KeyFactory.getInstance("RSA").generatePrivate(spec);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load JWT private key - check JWT_PRIVATE_KEY env var", e);
        }
    }

    private PublicKey decodePublicKey(String key) {
        try {
            byte[] keyBytes = decodeKeyMaterial(key);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            return KeyFactory.getInstance("RSA").generatePublic(spec);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to load JWT public key - check JWT_PUBLIC_KEY env var", e);
        }
    }

    private byte[] decodeKeyMaterial(String key) {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("JWT key material is missing");
        }

        String normalized = key
                .replace("\\n", "\n")
                .replaceAll("-----BEGIN [A-Z ]+-----", "")
                .replaceAll("-----END [A-Z ]+-----", "")
                .replaceAll("\\s", "");

        return Base64.getDecoder().decode(normalized);
    }

    public String generateAccessToken(UUID userId, String campusId) {
        long expirationMs = jwtProperties.getAccessTokenExpirationMs();
        return buildToken(userId, campusId, "access", expirationMs);
    }

    public String generateRefreshToken(UUID userId, String campusId) {
        long expirationMs = jwtProperties.getRefreshTokenExpirationMs();
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
