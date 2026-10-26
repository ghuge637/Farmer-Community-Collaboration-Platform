package com.example.socialbackend;

import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AuthIntegrationTest {

    @LocalServerPort
    int port;

    @Autowired
    TestRestTemplate rest;

    @Autowired
    UserRepository users;

    @Test
    public void registerAndLogin_flow() {
        String url = "http://localhost:" + port + "/api/auth/register";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"name\":\"IT Test\",\"email\":\"it-test@example.com\",\"password\":\"pass123\"}";
        ResponseEntity<Map> res = rest.postForEntity(url, new HttpEntity<>(body, headers), Map.class);
        Assertions.assertEquals(200, res.getStatusCode().value());
        Assertions.assertTrue(res.getBody().containsKey("token"));
        Integer userId = (Integer) res.getBody().get("userId");
        Assertions.assertNotNull(userId);

        // verify user present in repository
        User u = users.findById(Long.valueOf(userId)).orElse(null);
        Assertions.assertNotNull(u);
        Assertions.assertEquals("it-test@example.com", u.getEmail());

        // login
        String loginUrl = "http://localhost:" + port + "/api/auth/login";
        String loginBody = "{\"email\":\"it-test@example.com\",\"password\":\"pass123\"}";
        ResponseEntity<Map> loginRes = rest.postForEntity(loginUrl, new HttpEntity<>(loginBody, headers), Map.class);
        Assertions.assertEquals(200, loginRes.getStatusCode().value());
        Assertions.assertTrue(loginRes.getBody().containsKey("token"));

        // verify cookie is set on login
        Assertions.assertTrue(loginRes.getHeaders().containsKey("Set-Cookie"));
        java.util.List<String> setCookies = loginRes.getHeaders().get("Set-Cookie");
        Assertions.assertFalse(setCookies.isEmpty());

        // test logout clears cookie
        HttpHeaders cookieHeaders = new HttpHeaders();
        cookieHeaders.set("Cookie", String.join("; ", setCookies));
        ResponseEntity<Map> logoutRes = rest.postForEntity("http://localhost:" + port + "/api/auth/logout", new HttpEntity<>(null, cookieHeaders), Map.class);
        Assertions.assertEquals(200, logoutRes.getStatusCode().value());

        // after logout, calling /me with the previous cookie should be unauthorized
        ResponseEntity<Map> meRes = rest.exchange("http://localhost:" + port + "/api/auth/me", org.springframework.http.HttpMethod.GET, new HttpEntity<>(cookieHeaders), Map.class);
        Assertions.assertEquals(401, meRes.getStatusCode().value());
    }
}