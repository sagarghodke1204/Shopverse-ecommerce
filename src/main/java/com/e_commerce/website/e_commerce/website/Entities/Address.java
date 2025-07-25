// src/main/java/com/e_commerce/website/e_commerce/website/Entities/Address.java
package com.e_commerce.website.e_commerce.website.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String street;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private String name;
    private String fullName;
    private Boolean isDefault = false;

    @Transient
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // This is the actual DB column
    @JsonIgnore
    private User user;


    public Long getUserId() {
        if (this.user != null) {
            return this.user.getId();
        }
        return this.userId; // Fallback to transient field if user is not set
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}