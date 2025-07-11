document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (productId) {
    loadProductDetails(productId);
  }
});

function loadProductDetails(id) {
  fetch(`/api/products/${id}`)
    .then(res => res.json())
    .then(product => {
      renderProduct(product);
      loadRelatedProducts(product.category, product.id);
    })
    .catch(err => console.error('Error fetching product:', err));
}

function renderProduct(product) {
  const container = document.getElementById('product-container');

  container.innerHTML = `
    <h2>${product.name}</h2>
    <img src="${product.imageUrl}" alt="${product.name}">
    <p>${product.description}</p>
    <p>Price: $${product.price}</p>
    <p>Category: ${product.category}</p>

    <div class="quantity-control">
      <button id="decrease-btn">−</button>
      <input type="number" id="quantity" value="1" min="1" readonly>
      <button id="increase-btn">+</button>
    </div>

    <button id="add-to-cart-btn" class="btn">Add to Cart</button>
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
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: quantity
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`Added ${quantity} x ${product.name} to cart!`);
}

function loadRelatedProducts(category, excludeId) {
  fetch(`/api/products/category/${category}`)
    .then(res => res.json())
    .then(products => {
      const relatedContainer = document.getElementById('related-list');
      relatedContainer.innerHTML = '';

      products
        .filter(p => p.id !== parseInt(excludeId))
        .forEach(product => {
          const card = document.createElement('div');
          card.className = 'product-card';
          card.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Price: $${product.price}</p>
            <a href="product-details.html?id=${product.id}">View Details</a>
          `;
          relatedContainer.appendChild(card);
        });
    })
    .catch(err => console.error('Error fetching related products:', err));
}
