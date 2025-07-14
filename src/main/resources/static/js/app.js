document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

// Function to map product names to local image paths
function getProductImagePath(productName) {
  // Normalize product name for consistent file naming
  const normalizedName = productName.toLowerCase().replace(/\s/g, '-');

  // Define a mapping for products that should use local images
  const localImageMap = {
    'gaming-mouse': '/images/gaming-mouse.png',
    'backpack': '/images/backpack.png',
    'smartwatch': '/images/smartwatch.png',
    'bluetooth-speaker': '/images/bluetooth-speaker.png',
    'coffee-maker': '/images/coffee-maker.png',
    'office-chair': '/images/office-chair.png' // Added this mapping
    // Add more mappings here if you add more local images
  };

  // Check if the product name exists in our local image map
  if (localImageMap[normalizedName]) {
    return localImageMap[normalizedName];
  }
  // If not found in local map, return null or original imageUrl
  return null;
}


function loadProducts() {
  const container = document.getElementById('product-list');
  container.innerHTML = '<p class="text-gray-600 text-center col-span-full py-8">Loading featured products...</p>'; // Show loading message

  // FIXED: Explicitly using full API URL
  fetch('http://localhost:8087/api/products')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(products => {
      container.innerHTML = ''; // Clear loading message
      if (products.length === 0) {
        container.innerHTML = '<p class="text-gray-600 text-center col-span-full py-8">No featured products available at the moment.</p>';
        return;
      }

      products.forEach(product => {
        // Determine the image URL: check for local image first, then fall back to API's imageUrl
        const localImagePath = getProductImagePath(product.name);
        const imageUrlToUse = localImagePath || product.imageUrl;

        const card = document.createElement('div');
        card.className = 'product-card'; // This class is styled in styles.css
        card.innerHTML = `
          <img src="${imageUrlToUse}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/CCCCCC/000000?text=No+Image';">
          <h3 class="text-xl font-semibold text-gray-900">${product.name}</h3>
          <p class="text-gray-700 text-sm mb-2">${product.description}</p>
          <p class="text-lg font-bold text-indigo-600">Price: ₹${product.price.toFixed(2)}</p>
          <a href="product-details.html?id=${product.id}" class="btn">View Details</a>
        `;
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading products:', error);
      container.innerHTML = '<p class="text-red-600 text-center col-span-full py-8">Failed to load featured products. Please ensure your backend API is running on <span class="font-bold">http://localhost:8087</span> and accessible.</p>';
    });
}
