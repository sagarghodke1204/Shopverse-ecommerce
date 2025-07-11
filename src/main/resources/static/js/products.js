document.addEventListener('DOMContentLoaded', () => {
  loadAllProducts();
});

let allProducts = [];

function loadAllProducts() {
  fetch('/api/products')
    .then(res => res.json())
    .then(products => {
      allProducts = products;
      renderProducts(products);
      populateCategoryFilter(products);
    })
    .catch(err => console.error('Error loading products:', err));
}

function renderProducts(products) {
  const container = document.getElementById('product-list');
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = '<p>No products found.</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p>Price: $${product.price}</p>
      <a href="product-details.html?id=${product.id}">View Details</a>
    `;
    container.appendChild(card);
  });
}

function populateCategoryFilter(products) {
  const categories = new Set(products.map(p => p.category));
  const select = document.getElementById('categorySelect');

  // Clear any existing options except 'All'
  select.innerHTML = '<option value="">All</option>';

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  // Add event listener to filter
  select.addEventListener('change', () => {
    const selectedCategory = select.value;
    if (selectedCategory) {
      fetch(`/api/products/category/${encodeURIComponent(selectedCategory)}`)
        .then(res => res.json())
        .then(filtered => renderProducts(filtered))
        .catch(err => console.error('Error filtering products:', err));
    } else {
      renderProducts(allProducts);
    }
  });
}
