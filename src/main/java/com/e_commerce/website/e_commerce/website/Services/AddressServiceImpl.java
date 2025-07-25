// src/main/java/com.e_commerce.website/e_commerce/website/Services/AddressServiceImpl.java
package com.e_commerce.website.e_commerce.website.Services;

import com.e_commerce.website.e_commerce.website.Entities.Address;
import com.e_commerce.website.e_commerce.website.Exceptions.ResourceNotFoundException;
import com.e_commerce.website.e_commerce.website.Repositories.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Override
    public List<Address> getAddressesByUserId(Long userId) {
        // Call the corrected repository method: findByUser_Id
        return addressRepository.findByUser_Id(userId);
    }

    @Override
    public Address saveAdress(Address address) {
        return addressRepository.save(address);
    }

    @Override
    public void deleteAddressById(Long id) {
        addressRepository.deleteById(id);
    }

    @Override
    public Address getAddressById(Long id) {
        return addressRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + id));
    }
}