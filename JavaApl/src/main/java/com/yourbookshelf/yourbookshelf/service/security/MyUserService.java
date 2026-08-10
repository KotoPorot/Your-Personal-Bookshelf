package com.yourbookshelf.yourbookshelf.service.security;

import com.yourbookshelf.yourbookshelf.DTO.user.MyUserDTO;
import com.yourbookshelf.yourbookshelf.customException.MyInvalidCredentialsException;
import com.yourbookshelf.yourbookshelf.customException.MyUserAlreadyExistsException;
import com.yourbookshelf.yourbookshelf.entity.MyShelf;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class MyUserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public String createUser(MyUserDTO userDTO) {

        if (userRepository.findByUsername(userDTO.getUsername()).isPresent()) {
            throw new MyUserAlreadyExistsException("Username already exists");
        }
        MyUser newUser = new MyUser(userDTO.getUsername(), passwordEncoder.encode(userDTO.getPassword()));
        newUser.setShelves(getDefaultShelves(newUser));
        userRepository.save(newUser);
        return verify(userDTO);
    }

    private List<MyShelf> getDefaultShelves(MyUser newUser) {
        return List.of(
                new MyShelf("Want to read", newUser),
                new MyShelf("Reading", newUser),
                new MyShelf("Have read", newUser)
        );
    }


    public String verify(MyUserDTO userDTO) {

        try {
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    userDTO.getUsername(), userDTO.getPassword()));
            return jwtService.generateToken(userDTO.getUsername());

        } catch (BadCredentialsException e) {
            throw new MyInvalidCredentialsException("Incorrect login or password");
        }

    }

}
