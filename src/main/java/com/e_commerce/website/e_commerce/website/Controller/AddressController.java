package com.e_commerce.website.e_commerce.website.Controller;

import com.e_commerce.website.e_commerce.website.Entities.Address;
import com.e_commerce.website.e_commerce.website.Entities.User;
import com.e_commerce.website.e_commerce.website.Services.AddressService;
import com.e_commerce.website.e_commerce.website.Services.UserService;
import com.e_commerce.website.e_commerce.website.Exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Address> addAddress(@RequestBody Address address) {
        if (address.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required to save an address.");
        }
        User user = userService.getUserById(address.getUserId());
        if (user == null) {
            throw new ResourceNotFoundException("User not found with ID: " + address.getUserId());
        }
        address.setUser(user);

        // If this new address is set as default, unset default for others
        if (address.getIsDefault() != null && address.getIsDefault()) {
            List<Address> existingAddresses = addressService.getAddressesByUserId(user.getId());
            for (Address existingAddr : existingAddresses) {
                if (existingAddr.getIsDefault() != null && existingAddr.getIsDefault()) {
                    existingAddr.setIsDefault(false);
                    addressService.saveAdress(existingAddr); // Save to update default status
                }
            }
        }

        Address saved = addressService.saveAdress(address);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long id, @RequestBody Address updatedAddress) {
        Address existingAddress = addressService.getAddressById(id); // Throws if not found

        // Update fields from the incoming updatedAddress
        existingAddress.setStreet(updatedAddress.getStreet());
        existingAddress.setCity(updatedAddress.getCity());
        existingAddress.setState(updatedAddress.getState());
        existingAddress.setCountry(updatedAddress.getCountry());
        existingAddress.setZipCode(updatedAddress.getZipCode());
        existingAddress.setFullName(updatedAddress.getFullName());
        existingAddress.setName(updatedAddress.getName());

        // Handle default status logic
        if (updatedAddress.getIsDefault() != null && updatedAddress.getIsDefault()) {
            // If this address is being set as default, unset default for others of the same user
            if (existingAddress.getUser() != null) {
                List<Address> usersAddresses = addressService.getAddressesByUserId(existingAddress.getUser().getId());
                for (Address addr : usersAddresses) {
                    if (addr.getId() != existingAddress.getId() && addr.getIsDefault() != null && addr.getIsDefault()) {
                        addr.setIsDefault(false);
                        addressService.saveAdress(addr); // Save to update default status
                    }
                }
            }
            existingAddress.setIsDefault(true); // Set this address as default
        } else {
            // If the incoming address explicitly says not default, set it so
            existingAddress.setIsDefault(false);
        }


        // Re-link user if needed (though typically user doesn't change for an existing address)
        // This part is crucial if the frontend sends userId in the update payload.
        if (updatedAddress.getUserId() != null) {
            User user = userService.getUserById(updatedAddress.getUserId());
            existingAddress.setUser(user);
        }

        Address saved = addressService.saveAdress(existingAddress);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("user/{userId}")
    public ResponseEntity<List<Address>> getAddressesByUserId(@PathVariable Long userId) {
        List<Address> addresses = addressService.getAddressesByUserId(userId);
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Address> getAddressById(@PathVariable Long id) {
        Address foundAddress = addressService.getAddressById(id);
        return ResponseEntity.ok(foundAddress);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddressById(id); // Service will throw if not found
        return ResponseEntity.noContent().build();
    }
}