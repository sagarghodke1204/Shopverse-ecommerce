// In your OrderRepository.java
package com.e_commerce.website.e_commerce.website.Repositories;

import com.e_commerce.website.e_commerce.website.Entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems oi WHERE o.user.id = :userId")
    List<Order> findByUserIdWithOrderItems(@Param("userId") Long userId);

    List<Order> findByUserId(Long userId);
}