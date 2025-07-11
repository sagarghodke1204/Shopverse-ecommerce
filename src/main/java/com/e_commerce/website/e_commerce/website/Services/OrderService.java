package com.e_commerce.website.e_commerce.website.Services;

import com.e_commerce.website.e_commerce.website.Entities.Order;

import java.util.List;
import java.util.Optional;

public interface OrderService {

    Order saveOrder (Order order);

    List<Order>getAllOrders();

    Order getOrderById(Long id);

    void deleteOrder(Long id);


}
