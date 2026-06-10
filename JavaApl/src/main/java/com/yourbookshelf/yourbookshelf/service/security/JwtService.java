package com.yourbookshelf.yourbookshelf.service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static SecretKey secretKey;

    static {
        try {
            KeyGenerator keyGen = KeyGenerator.getInstance("HmacSHA256");
            keyGen.init(256);
            secretKey = keyGen.generateKey();

        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed");
        }
    }


    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder().claims().add(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis())).expiration(new Date(System.currentTimeMillis() + 60L * 60 * 1000 * 24))
                .and().signWith(secretKey).compact();

    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }


    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }
}
