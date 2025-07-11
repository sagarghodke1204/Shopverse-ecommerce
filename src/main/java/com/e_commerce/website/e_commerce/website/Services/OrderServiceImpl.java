    package com.e_commerce.website.e_commerce.website.Services;

    import com.e_commerce.website.e_commerce.website.Entities.Order;
    import com.e_commerce.website.e_commerce.website.Entities.OrderItem;
    import com.e_commerce.website.e_commerce.website.Exceptions.ResourceNotFoundException;
    import com.e_commerce.website.e_commerce.website.Repositories.OrderRepository;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.stereotype.Service;

    import java.util.List;
    import java.util.Optional;

    @Service
    public class OrderServiceImpl implements OrderService{

       private final OrderRepository orderRepository;

        public OrderServiceImpl(OrderRepository orderRepository) {
            this.orderRepository = orderRepository;
        }


        @Override
        public Order saveOrder(Order order) {

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

            return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        }

        @Override
        public void deleteOrder(Long id) {
            orderRepository.deleteById(id);
        }
    }
