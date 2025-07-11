document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  document.getElementById('checkout-btn').addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });
});

function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cart-items');
  container.innerHTML = '';

  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('total').textContent = 'Total: $0.00';
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const card = document.createElement('div');
    card.className = 'cart-item';
    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}">
      <div class="cart-details">
        <h3>${item.name}</h3>
        <p>Price: $${item.price.toFixed(2)}</p>
        <div class="quantity-control">
          <button class="decrease-btn" data-index="${index}">−</button>
          <input type="number" value="${item.quantity}" readonly>
          <button class="increase-btn" data-index="${index}">+</button>
        </div>
        <p>Subtotal: $${itemTotal.toFixed(2)}</p>
        <button class="remove-btn" data-index="${index}">Remove</button>
      </div>
    `;
    container.appendChild(card);
  });

  document.getElementById('total').textContent = `Total: $${total.toFixed(2)}`;

  addCartEventListeners();
}

function addCartEventListeners() {
  document.querySelectorAll('.increase-btn').forEach(btn =>
    btn.addEventListener('click', () => updateQuantity(btn.dataset.index, 1))
  );

  document.querySelectorAll('.decrease-btn').forEach(btn =>
    btn.addEventListener('click', () => updateQuantity(btn.dataset.index, -1))
  );

  document.querySelectorAll('.remove-btn').forEach(btn =>
    btn.addEventListener('click', () => removeItem(btn.dataset.index))
  );
}

function updateQuantity(index, change) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const item = cart[index];

  if (!item) return;

  item.quantity += change;
  if (item.quantity < 1) item.quantity = 1;

  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
}
