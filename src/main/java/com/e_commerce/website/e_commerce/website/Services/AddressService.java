// src/main/java/com.e_commerce.website/e_commerce/website/Services/AddressService.java
package com.e_commerce.website.e_commerce.website.Services;
import com.e_commerce.website.e_commerce.website.Entities.Address;

import java.util.List;

public interface AddressService {

    List<Address> getAddressesByUserId(Long userId);

    Address saveAdress (Address address);

    void deleteAddressById(Long id);

    Address getAddressById(Long id);
}