document.addEventListener('DOMContentLoaded', () => {
  loadAllProducts();
});

let allProducts = []; // This will store all products fetched from the API

function loadAllProducts() {
  const container = document.getElementById('product-list');
  container.innerHTML = '<p class="text-gray-600 text-center col-span-full py-8">Loading products...</p>'; // Show loading message

  fetch('http://localhost:8087/api/products') // API URL with full path
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(products => {
      allProducts = products; // Store all products
      renderProducts(products); // Render them
      populateCategoryFilter(products); // Populate filter based on all products
    })
    .catch(error => {
      console.error('Error loading products:', error);
      container.innerHTML = '<p class="text-red-600 text-center col-span-full py-8">Failed to load products. Please ensure your backend API is running on <span class="font-bold">http://localhost:8087</span> and accessible.</p>';
    });
}

function renderProducts(products) {
  const container = document.getElementById('product-list');
  container.innerHTML = ''; // Clear existing content

  if (products.length === 0) {
    container.innerHTML = '<p class="text-gray-600 text-center col-span-full py-8">No products found for this category.</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card'; // This class is styled in styles.css
    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/CCCCCC/000000?text=No+Image';" />
      <h3 class="text-xl font-semibold text-gray-900">${product.name}</h3>
      <p class="text-gray-700 text-sm mb-2">${product.description}</p>
      <p class="text-lg font-bold text-indigo-600">Price: ₹${product.price.toFixed(2)}</p>
      <a href="product-details.html?id=${product.id}" class="btn">View Details</a>
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

  // Remove previous event listener to avoid duplicates
  select.removeEventListener('change', handleCategoryChange);
  // Add new event listener
  select.addEventListener('change', handleCategoryChange);
}

function handleCategoryChange() {
  const select = document.getElementById('categorySelect');
  const selectedCategory = select.value;
  const container = document.getElementById('product-list');
  container.innerHTML = '<p class="text-gray-600 text-center col-span-full py-8">Loading products...</p>'; // Show loading message

  if (selectedCategory) {
    fetch(`http://localhost:8087/api/products/category/${encodeURIComponent(selectedCategory)}`) // API URL with full path
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(filteredProducts => renderProducts(filteredProducts))
      .catch(error => {
        console.error('Error filtering products:', error);
        container.innerHTML = '<p class="text-red-600 text-center col-span-full py-8">Failed to filter products. Please check your backend API.</p>';
      });
  } else {
    renderProducts(allProducts); // Show all products if 'All' is selected
  }
}
