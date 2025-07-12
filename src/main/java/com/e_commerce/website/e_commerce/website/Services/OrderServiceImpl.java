package com.e_commerce.website.e_commerce.website.Services;

import com.e_commerce.website.e_commerce.website.Entities.Order;
import com.e_commerce.website.e_commerce.website.Entities.OrderItem;
import com.e_commerce.website.e_commerce.website.Entities.User;
import com.e_commerce.website.e_commerce.website.Exceptions.ResourceNotFoundException;
import com.e_commerce.website.e_commerce.website.Repositories.OrderRepository;
import com.e_commerce.website.e_commerce.website.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Order saveOrder(Order order) {
        if (order.getUser() != null && order.getUser().getId() != null) {
            User user = userRepository.findById(order.getUser().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + order.getUser().getId()));
            order.setUser(user);
        } else {
            throw new IllegalArgumentException("User ID is required for placing order");
        }

        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                item.setOrder(order);
            }
        }

        return orderRepository.save(order);
    }

    @Override
    public List<Order> getAllOrders() {
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
        return user.getOrders();
    }

}
