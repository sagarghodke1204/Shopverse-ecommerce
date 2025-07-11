package com.e_commerce.website.e_commerce.website.Services;

import com.e_commerce.website.e_commerce.website.Entities.User;

import java.util.List;
import java.util.Optional;


public interface UserService {

    User saveUser(User user);

    List<User>getAllUsers();

    User getUserById(Long id);

    User getUserByEmail(String email);

    void deleteUserById(Long id);
}
