// src/main/java/com/e_commerce.website/e_commerce/website/Repositories/AddressRepository.java
package com.e_commerce.website.e_commerce.website.Repositories;

import com.e_commerce.website.e_commerce.website.Entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    // Change 'findByUserId' to 'findByUser_Id'
    List<Address> findByUser_Id(Long userId); // Corrected method name
}