package com.e_commerce.website.e_commerce.website.Repositories;

import com.e_commerce.website.e_commerce.website.Entities.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem,Long> {
}
