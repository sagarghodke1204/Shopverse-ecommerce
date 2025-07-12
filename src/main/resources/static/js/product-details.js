document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (productId) {
    // Ensure productId is an integer for comparison with API data if IDs are numbers
    loadProductDetails(parseInt(productId));
  } else {
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = '<p class="text-red-600 text-center text-lg py-8">Product ID not found in URL. Please navigate from a product listing.</p>';
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

function loadProductDetails(id) {
  const productContainer = document.getElementById('product-container');
  productContainer.innerHTML = '<div class="flex items-center justify-center min-h-[300px] text-indigo-600 text-lg font-semibold">Loading product details...</div>';

  // FIXED: Explicitly using full API URL
  fetch(`http://localhost:8087/api/products/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(product => {
      renderProduct(product);
      loadRelatedProducts(product.category, product.id);
    })
    .catch(error => {
      console.error('Error fetching product:', error);
      productContainer.innerHTML = '<p class="text-red-600 text-center text-lg py-8">Failed to load product details. Please ensure your backend API is running on <span class="font-bold">http://localhost:8087</span> and the product ID is valid.</p>';
    });
}

function renderProduct(product) {
  const container = document.getElementById('product-container');

  container.innerHTML = `
    <div class="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div class="md:w-1/2 flex-shrink-0">
            <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-auto object-cover rounded-lg shadow-md border border-gray-200" onerror="this.onerror=null;this.src='https://placehold.co/400x300/CCCCCC/000000?text=No+Image';">
        </div>
        <div class="md:w-1/2 text-center md:text-left">
            <h2 class="text-4xl font-bold text-gray-900 mb-3">${product.name}</h2>
            <p class="text-gray-700 text-lg mb-4">${product.description}</p>
            <p class="text-3xl font-bold text-indigo-600 mb-4">Price: ₹${product.price.toFixed(2)}</p>
            <p class="text-gray-600 text-md mb-6">Category: <span class="font-semibold">${product.category}</span></p>

            <div class="quantity-control flex items-center justify-center md:justify-start space-x-3 mb-6">
                <button id="decrease-btn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150">−</button>
                <input type="number" id="quantity" value="1" min="1" readonly class="w-20 text-center border border-gray-300 rounded-md py-2 text-gray-800 font-medium">
                <button id="increase-btn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150">+</button>
            </div>

            <button id="add-to-cart-btn" class="btn-primary inline-block px-8 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-200">Add to Cart</button>
        </div>
    </div>
  `;

  document.getElementById('increase-btn').addEventListener('click', () => {
    const qtyInput = document.getElementById('quantity');
    qtyInput.value = parseInt(qtyInput.value) + 1;
  });

  document.getElementById('decrease-btn').addEventListener('click', () => {
    const qtyInput = document.getElementById('quantity');
    if (parseInt(qtyInput.value) > 1) {
      qtyInput.value = parseInt(qtyInput.value) - 1;
    }
  });

  document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    const quantity = parseInt(document.getElementById('quantity').value);
    addToCart(product, quantity);
  });
}

function addToCart(product, quantity) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingIndex = cart.findIndex(item => item.id === product.id);
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price, // Ensure price is stored as a number
      imageUrl: product.imageUrl,
      quantity: quantity
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  displayMessageBox(`Added ${quantity} x ${product.name} to cart!`); // Use displayMessageBox
}

function loadRelatedProducts(category, excludeId) {
  const relatedContainer = document.getElementById('related-list');
  relatedContainer.innerHTML = '<p class="text-gray-600 text-center col-span-full py-8">Loading related products...</p>';

  // FIXED: Explicitly using full API URL
  fetch(`http://localhost:8087/api/products/category/${encodeURIComponent(category)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(products => {
      relatedContainer.innerHTML = ''; // Clear loading message

      const relatedProducts = products
        .filter(p => p.id !== excludeId) // Filter by category and exclude current product
        .slice(0, 4); // Limit to 4 related products

      if (relatedProducts.length === 0) {
          relatedContainer.innerHTML = '<p class="text-gray-600 text-center col-span-full py-8">No related products found in this category.</p>';
          return;
      }

      relatedProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card'; // This class is styled in styles.css
        card.innerHTML = `
          <img src="${product.imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/CCCCCC/000000?text=No+Image';">
          <h3 class="text-xl font-semibold text-gray-900">${product.name}</h3>
          <p class="text-gray-700 text-sm mb-2">${product.description}</p>
          <p class="text-lg font-bold text-indigo-600">Price: ₹${product.price.toFixed(2)}</p>
          <a href="product-details.html?id=${product.id}" class="btn">View Details</a>
        `;
        relatedContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error fetching related products:', error);
      relatedContainer.innerHTML = '<p class="text-red-600 text-center col-span-full py-8">Failed to load related products. Please check your backend API.</p>';
    });
}
