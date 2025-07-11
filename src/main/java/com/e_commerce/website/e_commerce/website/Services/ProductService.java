package com.e_commerce.website.e_commerce.website.Services;

import com.e_commerce.website.e_commerce.website.Entities.Product;

import java.util.List;
import java.util.Optional;

public interface ProductService {

    Product saveProduct (Product product);

    List<Product>getAllProducts();

    Product getProductById(Long id);

    void deleteProduct(Long id);

    List<Product> getProductsByCategory(String category);
}
