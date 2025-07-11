package com.e_commerce.website.e_commerce.website.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Product {
     @Id
     @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;
    String name;
    String category;
    String description;
    double price;
    String imageUrl;

}
