package com.OneCampus;

import com.OneCampus.common.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class OneCampusApplicationTests {

	@MockitoBean
	private JwtService jwtService;

	@Test
	void contextLoads() {
	}

}
