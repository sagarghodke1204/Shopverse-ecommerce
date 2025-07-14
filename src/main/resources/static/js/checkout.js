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
      placeOrder();
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
    return;
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
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const userId = localStorage.getItem('userId');

  if (!userId) {
    displayMessageBox("You must be logged in to place an order.", () => {
        window.location.href = "login.html";
    });
    return;
  }

  if (!fullName || !email || !address || cart.length === 0) {
    displayMessageBox("Please fill in all fields and ensure your cart is not empty.");
    return;
  }

  // Attempt to get user ID from backend based on email
  let actualUserId = parseInt(userId); // Start with userId from localStorage

  try {
      const userResponse = await fetch(`http://localhost:8087/api/users/by-email?email=${encodeURIComponent(email)}`);
      if (userResponse.ok) {
          const userData = await userResponse.json();
          actualUserId = userData.id;
      } else {
          // If user not found by email, log a warning and proceed with userId from localStorage or a default
          console.warn(`User with email ${email} not found in backend. Using userId from localStorage (${userId}).`);
          // For a robust app, you might want to force login/registration here.
      }
  } catch (error) {
      console.error("Error fetching user by email:", error);
      displayMessageBox("Could not verify user. Please check your email or try logging in again.");
      return; // Stop order placement if user verification fails
  }


  const orderItems = cart.map(item => ({
    productId: item.id, // Assuming cart items store 'id' as productId
    quantity: item.quantity,
    price: item.price
  }));

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const order = {
    user: { id: actualUserId }, // Use the fetched/validated user ID
    orderItems: orderItems,
    totalPrice: totalPrice,
    createdDate: new Date().toISOString()
  };

  console.log("Order Payload:", JSON.stringify(order, null, 2));

  try {
    const response = await fetch('http://localhost:8087/api/orders', { // Corrected API URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const orderConfirmation = await response.json();
    console.log("Order placed successfully:", orderConfirmation);

    displayMessageBox("Your order has been placed successfully!", () => {
      localStorage.removeItem('cart'); // Clear cart after successful order
      window.location.href = "index.html"; // Redirect to home or order confirmation page
    });

  } catch (error) {
    console.error("Order placement error:", error);
    displayMessageBox("Error placing order: " + error.message + ". Please try again.");
  }
}
