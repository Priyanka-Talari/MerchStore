document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("productsContainer");
  
    fetch("http://127.0.0.1:5000/products")
      .then(response => response.json())
      .then(products => {
        container.innerHTML = ""; // clear old content
        products.forEach(product => {
          container.innerHTML += `
            <div class="product-card">
              <img src="${product.image}" alt="${product.name}">
              <h3>${product.name}</h3>
              <p>₹${product.price}</p>
              <button class="add-to-cart-btn">Add to Cart</button>
            </div>
          `;
        });
      })
      .catch(error => {
        console.error("Error loading products:", error);
        container.innerHTML = "<p>Failed to load products.</p>";
      });
  });
  