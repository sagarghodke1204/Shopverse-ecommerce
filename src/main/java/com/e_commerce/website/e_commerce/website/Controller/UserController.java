package com.e_commerce.website.e_commerce.website.Controller;

import com.e_commerce.website.e_commerce.website.Entities.User;
import com.e_commerce.website.e_commerce.website.Exceptions.ResourceNotFoundException;
import com.e_commerce.website.e_commerce.website.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController (UserService userService){
        this.userService=userService;
    }


    //Create new User
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user){
        User saved = userService.saveUser(user);
        return ResponseEntity.ok(saved);
    }

    //Get All Users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(){
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    //Get User By id
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id){
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    //Get User By email
    @GetMapping("/{email}")
    public ResponseEntity <User> getUserByEmail(@PathVariable String email){
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    // update exsitng user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user){
        User existinguser = userService.getUserById(id);

       existinguser.setEmail(user.getEmail());
       existinguser.setUsername(user.getUsername());
       existinguser.setPassword(user.getPassword());

       User updatedUser=userService.saveUser(existinguser);
       return ResponseEntity.ok(updatedUser);
    }

    //delete user by Id
    @DeleteMapping("/{id}")
    public ResponseEntity<User> deleteUser(@PathVariable Long id){
        User deletedUser=userService.getUserById(id);
        userService.deleteUserById(id);
        return ResponseEntity.ok(deletedUser);
    }

    @GetMapping("/login")
    public ResponseEntity<User> login(@RequestParam String email, @RequestParam String password) {
        User user = userService.getUserByEmail(email);
        if (user != null && user.getPassword().equals(password)) {
            return ResponseEntity.ok(user);
        } else {
            throw new ResourceNotFoundException("Invalid email or password");
        }
    }


}
