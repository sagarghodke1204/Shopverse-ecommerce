document.addEventListener('DOMContentLoaded', () => {
  loadCheckoutItems();

  const form = document.getElementById('checkout-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    placeOrder();
  });
});

function loadCheckoutItems() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('checkout-items');
  container.innerHTML = '';

  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('checkout-total').textContent = 'Total: $0.00';
    return;
  }

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'checkout-item';
    div.innerHTML = `
      <p><strong>${item.name}</strong></p>
      <p>Price: $${item.price.toFixed(2)}</p>
      <p>Quantity: ${item.quantity}</p>
      <p>Subtotal: $${itemTotal.toFixed(2)}</p>
      <hr>
    `;
    container.appendChild(div);
  });

  document.getElementById('checkout-total').textContent = `Total: $${total.toFixed(2)}`;
}

function placeOrder() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();

  if (!name || !email || !address) {
    alert('Please fill out all fields.');
    return;
  }

  // Simulate sending order
  alert(`Thank you for your order, ${name}!\nA confirmation has been sent to ${email}.`);

  // Clear cart
  localStorage.removeItem('cart');
  window.location.href = 'index.html';
}
