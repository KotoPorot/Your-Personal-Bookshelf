package com.yourbookshelf.yourbookshelf.service.security;

import com.yourbookshelf.yourbookshelf.DTO.MyUserPrincipal;
import com.yourbookshelf.yourbookshelf.entity.MyUser;
import com.yourbookshelf.yourbookshelf.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class MyUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<MyUser> user = userRepository.findByUsername(username);

        if (!user.isPresent()) {
            throw new UsernameNotFoundException("User does not exists");
        }
        return new MyUserPrincipal(user.get());
    }
}
