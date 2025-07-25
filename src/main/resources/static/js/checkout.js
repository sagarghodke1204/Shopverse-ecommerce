document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    displayMessageBox("You must be logged in to access checkout. Redirecting to login...", () => {
        window.location.href = "login.html";
    });
    return;
  }

  displayCheckoutCart();

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function (e) {
      e.preventDefault();
      placeOrder(); // This will now trigger the address selection flow
    });
  }
});

// --- Message Box Function (consistent across pages) ---
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

function displayCheckoutCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const checkoutItemsContainer = document.getElementById('checkout-items');
  let total = 0;

  checkoutItemsContainer.innerHTML = ''; // Clear existing content

  if (cart.length === 0) {
    checkoutItemsContainer.innerHTML = '<p class="text-gray-600 text-center py-4">Your cart is empty. Please add items before checking out.</p>';
    document.getElementById('checkout-total').innerText = `Total: ₹0.00`;
    // Disable place order button if cart is empty
    const placeOrderButton = document.querySelector('#checkout-form button[type="submit"]');
    if (placeOrderButton) {
        placeOrderButton.disabled = true;
        placeOrderButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
    return;
  } else {
      // Enable place order button if cart has items
      const placeOrderButton = document.querySelector('#checkout-form button[type="submit"]');
      if (placeOrderButton) {
          placeOrderButton.disabled = false;
          placeOrderButton.classList.remove('opacity-50', 'cursor-not-allowed');
      }
  }

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-4 p-2 border-b border-gray-100 last:border-b-0'; // Added styling
    div.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md border border-gray-200" onerror="this.onerror=null;this.src='https://placehold.co/64x64/CCCCCC/000000?text=No+Image';">
      <div class="flex-grow">
        <p class="text-base font-medium text-gray-900"><strong>${item.name}</strong></p>
        <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
      </div>
      <p class="text-base font-semibold text-gray-800">₹${itemTotal.toFixed(2)}</p>
    `;
    checkoutItemsContainer.appendChild(div);
  });

  document.getElementById('checkout-total').innerText = `Total: ₹${total.toFixed(2)}`;
}

async function placeOrder() {
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = localStorage.getItem('userId');
    const emailOfLoggedInUser = user ? user.email : null;

    if (!userId || !emailOfLoggedInUser) {
        displayMessageBox("User not logged in or session expired. Redirecting to login...", () => {
            window.location.href = "login.html";
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:8087/api/addresses/user/${userId}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch addresses: ${response.status} - ${errorText}`);
        }
        const userAddresses = await response.json();

        if (userAddresses.length === 0) {
            displayMessageBox("No addresses found. Please add an address to proceed with your order.", () => {
                window.location.href = "account.html?tab=addresses";
            }, true);
            return;
        }

        showAddressSelectionModal(userAddresses, emailOfLoggedInUser);

    } catch (error) {
        console.error('Error fetching addresses for checkout:', error);
        displayMessageBox('An error occurred while fetching your addresses. Please try again.');
    }
}

function showAddressSelectionModal(addresses, userEmail) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-md mx-auto">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Select Delivery Address</h3>
            <div class="space-y-3 text-left mb-4" id="address-options">
                ${addresses.map(address => `
                    <label class="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition duration-200">
                        <input type="radio" name="selectedAddress" value="${address.id}" class="form-radio h-4 w-4 text-indigo-600" ${address.isDefault ? 'checked' : ''}>
                        <span class="ml-3 text-gray-700">
                            <p class="font-medium">${address.name || address.fullName || 'Unnamed Address'}</p>
                            <p class="text-sm text-gray-500">${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}</p>
                        </span>
                    </label>
                `).join('')}
            </div>
            <div class="flex flex-col space-y-3">
                <button id="confirm-address-btn" class="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200">Confirm Selection</button>
                <button id="add-new-address-modal-btn" class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200">Add New Address</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirm-address-btn').onclick = () => {
        const selectedAddressRadio = document.querySelector('input[name="selectedAddress"]:checked');
        if (selectedAddressRadio) {
            const selectedAddressId = parseInt(selectedAddressRadio.value, 10);
            modal.remove(); // Close modal
            proceedWithOrder(selectedAddressId, userEmail);
        } else {
            displayMessageBox("Please select an address to proceed.");
        }
    };

    document.getElementById('add-new-address-modal-btn').onclick = () => {
        modal.remove(); // Close modal
        window.location.href = "account.html?tab=addresses";
    };
}

async function proceedWithOrder(addressId, userEmail) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const userId = localStorage.getItem('userId');

    if (cart.length === 0) {
        displayMessageBox("Your cart is empty. Please add items before placing an order.", () => {
            window.location.href = "products.html";
        });
        return;
    }

    // Create order using selected address
    const order = {
        user: {
            id: parseInt(userId, 10)
        },
        // Changed 'products' to 'orderItems' to match backend Order entity
        orderItems: cart.map(item => ({
            productId: item.id, // Ensure this is the product ID
            quantity: item.quantity,
            // These fields will be populated by the backend's OrderService
            // productName: item.name,
            // imageUrl: item.imageUrl,
            // price: item.price
        })),
        // totalAmount will be calculated by the backend for consistency
        // totalAmount: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
        addressId: addressId,
        createdDate: new Date().toISOString()
    };

    try {
        const orderResponse = await fetch('http://localhost:8087/api/orders/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        if (!orderResponse.ok) {
            const errorText = await orderResponse.text();
            throw new Error(`Order placement failed: ${orderResponse.status} - ${errorText}`);
        }

        const orderResult = await orderResponse.json();

        displayMessageBox('Order placed successfully!', () => {
            localStorage.removeItem('cart');
            window.location.href = '/index.html';
        });
    } catch (error) {
        console.error('Error placing order:', error);
        displayMessageBox('An error occurred while placing the order. Please try again.');
    }
}
