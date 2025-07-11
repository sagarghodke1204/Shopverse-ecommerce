document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

function loadProducts() {
  fetch('/api/products')
    .then(response => response.json())
    .then(products => {
      const container = document.getElementById('product-list');
      container.innerHTML = '';
      products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${product.imageUrl}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p>Price: $${product.price}</p>
          <a href="product-details.html?id=${product.id}">View Details</a>
        `;
        container.appendChild(card);
      });
    })
    .catch(error => console.error('Error loading products:', error));
}
