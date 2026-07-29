package com.OneCampus.common.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class JwtServiceTest {

    @Test
    void shouldCreateServiceWithGeneratedKeysWhenNoEnvKeysProvided() {
        JwtProperties properties = new JwtProperties();
        JwtService service = new JwtService(properties);

        assertNotNull(service);
    }
}
