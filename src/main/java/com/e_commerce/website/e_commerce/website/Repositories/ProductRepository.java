package com.e_commerce.website.e_commerce.website.Repositories;

import com.e_commerce.website.e_commerce.website.Entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {

    List<Product> findByCategory(String category);

}
