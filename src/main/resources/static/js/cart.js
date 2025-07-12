document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  document.getElementById('checkout-btn').addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });
});

// --- Message Box Function (replaces alert() and confirm()) ---
function displayMessageBox(message, onConfirm = null, showCancel = false) {
    const messageBox = document.createElement('div');
    messageBox.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50';
    messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-auto">
            <p class="text-lg font-semibold text-gray-800 mb-4">${message}</p>
            <div class="flex justify-center space-x-4">
                <button id="msg-box-ok" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200">OK</button>
                ${showCancel ? `<button id="msg-box-cancel" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200">Cancel</button>` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(messageBox);

    document.getElementById('msg-box-ok').onclick = () => {
        messageBox.remove();
        if (onConfirm) {
            onConfirm();
        }
    };

    if (showCancel) {
        document.getElementById('msg-box-cancel').onclick = () => {
            messageBox.remove();
        };
    }
}


function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cart-items');
  container.innerHTML = ''; // Clear existing content

  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = '<p class="text-gray-600 text-center text-lg py-8">Your cart is empty. Start adding some amazing products!</p>';
    document.getElementById('total').textContent = 'Total: ₹0.00';
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const card = document.createElement('div');
    card.className = 'cart-item flex items-center border border-gray-200 p-4 rounded-lg shadow-sm bg-gray-50';
    card.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}" class="w-24 h-24 object-cover rounded-md mr-4 border border-gray-300" onerror="this.onerror=null;this.src='https://placehold.co/96x96/CCCCCC/000000?text=No+Image';">
      <div class="cart-details flex-grow">
        <h3 class="text-xl font-semibold text-gray-800 mb-1">${item.name}</h3>
        <p class="text-gray-700 text-lg font-medium mb-2">Price: ₹${item.price.toFixed(2)}</p>
        <div class="quantity-control flex items-center space-x-2 mb-2">
          <button class="decrease-btn bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400 transition duration-150" data-index="${index}">−</button>
          <input type="number" value="${item.quantity}" readonly class="w-16 text-center border border-gray-300 rounded-md py-1 text-gray-800 font-medium">
          <button class="increase-btn bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400 transition duration-150">+</button>
        </div>
        <p class="text-gray-800 text-lg font-bold">Subtotal: ₹${itemTotal.toFixed(2)}</p>
      </div>
      <button class="remove-btn bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition duration-200" data-index="${index}">Remove</button>
    `;
    container.appendChild(card);
  });

  document.getElementById('total').textContent = `Total: ₹${total.toFixed(2)}`;

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
  displayMessageBox("Are you sure you want to remove this item from your cart?", () => {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    displayMessageBox("Item removed from cart.");
  }, true); // Pass true to indicate it's a confirmation
}
