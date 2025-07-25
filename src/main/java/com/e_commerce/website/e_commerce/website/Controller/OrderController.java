package com.e_commerce.website.e_commerce.website.Controller;

import com.e_commerce.website.e_commerce.website.Entities.Order;
import com.e_commerce.website.e_commerce.website.Entities.User;
import com.e_commerce.website.e_commerce.website.Services.OrderService;
import org.aspectj.weaver.ast.Or;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService){
        this.orderService=orderService;
    }

    //create new  Order
    @PostMapping
    public ResponseEntity<Order> createOrder (@RequestBody Order order){
        Order saved = orderService.saveOrder(order);
        return ResponseEntity.ok(saved);
    }

    // Get All Orders
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrder(){
        List<Order> orderList=orderService.getAllOrders();
        return ResponseEntity.ok(orderList);
    }

    //Get order by id
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id){
        Order order=orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    //delete order
    @DeleteMapping("/{id}")
    public ResponseEntity<Order> deleteOrder(@PathVariable Long id){
        Order deleted = orderService.getOrderById(id);
        orderService.deleteOrder(id);
        return ResponseEntity.ok(deleted);
    }

    //Update Order
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order order){

        Order existing =orderService.getOrderById(id);

        existing.setTotalPrice(order.getTotalPrice());
        existing.setCreatedDate(order.getCreatedDate());

        if (order.getOrderItems() != null) {
            // Replace old with new items
            order.getOrderItems().forEach(item -> item.setOrder(existing));
            existing.setOrderItems(order.getOrderItems());
        }

        existing.setUser(order.getUser());

        Order updated = orderService.saveOrder(existing);
        return ResponseEntity.ok(updated);

    }

    // Get orders for a specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersForUser(@PathVariable Long userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    // Endpoint to create an order for a specific user (handles POST to /api/orders/user)
    @PostMapping("/user")
    public ResponseEntity<Order> createOrderForUser(@RequestBody Order order) {

        Order savedOrder = orderService.saveOrder(order);
        return ResponseEntity.ok(savedOrder);
    }





}
