package com.example.socialbackend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.exp-ms:3600000}")
    private long expMs;

    public String generateToken(Long userId) {
        Key key = Keys.hmacShaKeyFor(secret.getBytes());
        return Jwts.builder().setSubject(String.valueOf(userId)).setExpiration(new Date(System.currentTimeMillis() + expMs)).signWith(key, SignatureAlgorithm.HS256).compact();
    }

    public Long parseUserId(String token) {
        Key key = Keys.hmacShaKeyFor(secret.getBytes());
        String sub = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
        return Long.valueOf(sub);
    }

    public long getExpiryMs() { return expMs; }
}
