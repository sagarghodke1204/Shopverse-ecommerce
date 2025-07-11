package com.e_commerce.website.e_commerce.website.Controller;

import com.e_commerce.website.e_commerce.website.Entities.Product;
import com.e_commerce.website.e_commerce.website.Services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    @Autowired
    public ProductController (ProductService productService){
        this.productService=productService;
    }

    // Create a new  Product
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product){
        Product saved = productService.saveProduct(product);
        return ResponseEntity.ok(product);
    }

    // Get ALl Products
    @GetMapping
    public  ResponseEntity<List<Product>> getAllProducts(){
        List<Product>products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public  ResponseEntity<Product> getProductById(@PathVariable Long id){
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    //Update Product
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id,@RequestBody Product product){
        Product existing = productService.getProductById(id);

        existing.setName(product.getName());
        existing.setDescription((product.getDescription()));
        existing.setPrice(product.getPrice());
        existing.setImageUrl(product.getImageUrl());

        Product updated= productService.saveProduct(existing);
        return ResponseEntity.ok(updated);
    }

    //Delete Product
    @DeleteMapping("/{id}")
    public ResponseEntity<Product> deleteProduct(@PathVariable Long id){
        Product deleted = productService.getProductById(id);
        productService.deleteProduct(id);
        return ResponseEntity.ok(deleted);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category){
        List<Product> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }


}
