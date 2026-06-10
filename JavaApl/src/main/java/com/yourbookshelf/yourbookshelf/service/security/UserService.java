package com.yourbookshelf.yourbookshelf.service.security;

import com.yourbookshelf.yourbookshelf.DTO.MyUserDTO;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public String createUser(MyUserDTO userDTO) {

        if (userRepository.findByUsername(userDTO.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        userRepository.save(new MyUser(userDTO.getUsername(), passwordEncoder.encode(userDTO.getPassword())));
        return verify(userDTO);
    }

    public String verify(MyUserDTO userDTO) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                userDTO.getUsername(), userDTO.getPassword()));

        if (authentication.isAuthenticated()) {
            return jwtService.generateToken(userDTO.getUsername());
        } else {
            return null;
        }
    }

}
