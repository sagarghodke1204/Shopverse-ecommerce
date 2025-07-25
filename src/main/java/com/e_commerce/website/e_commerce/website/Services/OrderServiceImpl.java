// In your OrderServiceImpl.java
package com.e_commerce.website.e_commerce.website.Services;

import com.e_commerce.website.e_commerce.website.Entities.Order;
import com.e_commerce.website.e_commerce.website.Entities.OrderItem;
import com.e_commerce.website.e_commerce.website.Entities.Product;
import com.e_commerce.website.e_commerce.website.Entities.User;
import com.e_commerce.website.e_commerce.website.Exceptions.ResourceNotFoundException;
import com.e_commerce.website.e_commerce.website.Repositories.OrderRepository;
import com.e_commerce.website.e_commerce.website.Repositories.UserRepository;
import com.e_commerce.website.e_commerce.website.Repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    public Order saveOrder(Order order) {
        // 1. Ensure User is associated
        if (order.getUser() != null && order.getUser().getId() != null) {
            User user = userRepository.findById(order.getUser().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + order.getUser().getId()));
            order.setUser(user);
        } else {
            throw new IllegalArgumentException("User ID is required for placing order");
        }

        double calculatedTotalPrice = 0.0; // Initialize total price calculation

        // 2. Populate OrderItem details from Product and calculate total price
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                item.setOrder(order); // Set the back-reference to the order

                if (item.getProductId() != null) {
                    Product product = productRepository.findById(item.getProductId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.getProductId()));

                    // Set product details directly on the OrderItem
                    item.setProductName(product.getName());
                    item.setImageUrl(product.getImageUrl());
                    // Ensure item.price is set from product.price for calculation consistency
                    item.setPrice(product.getPrice());

                    // Add to calculated total price
                    calculatedTotalPrice += (item.getPrice() * item.getQuantity());

                } else {
                    throw new IllegalArgumentException("Product ID is required for each order item.");
                }
            }
        }

        // 3. Set the calculated total price on the Order entity
        order.setTotalPrice(calculatedTotalPrice);

        return orderRepository.save(order);
    }

    @Override
    public List<Order> getAllOrders() {
        // This method might need a custom query if you want to eagerly fetch orderItems and products for all orders
        return orderRepository.findAll();
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    @Override
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        // Use the new custom query to fetch orders with their items
        return orderRepository.findByUserIdWithOrderItems(userId);
    }
}