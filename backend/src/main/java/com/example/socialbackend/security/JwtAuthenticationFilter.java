package com.example.socialbackend.security;

import com.example.socialbackend.model.User;
import com.example.socialbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;


@Component

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Autowired
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        logger.info("JwtAuthenticationFilter: CONSTRUCTOR - Filter bean created and registered");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        logger.info("JwtAuthenticationFilter: doFilterInternal called for URI: {}", request.getRequestURI());
        String token = null;
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        } else {
            jakarta.servlet.http.Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (jakarta.servlet.http.Cookie c : cookies) {
                    if ("AUTH_TOKEN".equals(c.getName())) {
                        token = c.getValue();
                        break;
                    }
                }
            }
        }
        if (token != null) {
            int dotCount = 0;
            for (int i = 0; i < token.length(); i++) {
                if (token.charAt(i) == '.') dotCount++;
            }
            logger.debug("JwtAuthenticationFilter: token present=true length={} dots={}", token.length(), dotCount);
        } else {
            logger.debug("JwtAuthenticationFilter: token present=false");
        }

        if (token != null) {
            try {
                Long userId = jwtUtil.parseUserId(token);
                logger.debug("JwtAuthenticationFilter: parsed userId from token: {}", userId);
                Optional<User> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    logger.debug("JwtAuthenticationFilter: user found: {}", user.getEmail());
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    logger.warn("JwtAuthenticationFilter: userId {} not found in database", userId);
                }
            } catch (Exception ex) {
                logger.warn("JwtAuthenticationFilter: Exception parsing token or looking up user: {}", ex.getMessage());
            }
        } else {
            logger.warn("JwtAuthenticationFilter: No token found in request");
        }
        filterChain.doFilter(request, response);
    }
}
