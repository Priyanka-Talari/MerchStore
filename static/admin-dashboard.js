document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin Dashboard loaded");
    checkServerStatus();
    fetchProducts();
    document.getElementById("productForm").addEventListener("submit", addProduct);
    document.getElementById("image").addEventListener("change", previewImage);
});

const API_BASE_URL = "http://127.0.0.1:5000";

// Check if server is running
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
            console.log("✅ Backend server is running");
        }
    } catch (error) {
        console.error("❌ Backend server is not running");
        alert("❌ Backend server is not accessible. Please make sure the server is running on http://127.0.0.1:5000");
    }
}

// Fetch and display regular products
async function fetchProducts() {
    try {
        console.log("Fetching products from:", `${API_BASE_URL}/get-products`);
        
        const response = await fetch(`${API_BASE_URL}/get-products`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        const tableBody = document.getElementById("productList");
        tableBody.innerHTML = "";

        if (!products || products.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No products available</td></tr>`;
            return;
        }

        products.forEach(product => {
            const imageUrl = product.image_url ? 
                `${API_BASE_URL}/static/uploads/${product.image}` : 
                `${API_BASE_URL}/static/images/placeholder.jpg`;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <img src="${imageUrl}" width="50" height="50" alt="Product Image" 
                         style="object-fit: cover; border-radius: 4px;"
                         onerror="this.src='${API_BASE_URL}/static/images/placeholder.jpg'">
                </td>
                <td class="action-buttons">
                    <button onclick="editProduct(${product.id})">✏️ Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="delete-btn">🗑️ Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        console.log(`✅ Loaded ${products.length} products`);
    } catch (error) {
        console.error("Error fetching products:", error);
        const tableBody = document.getElementById("productList");
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color: red;">
                    ❌ Error loading products: ${error.message}<br>
                    <small>Make sure the backend server is running on http://127.0.0.1:5000</small>
                </td>
            </tr>
        `;
    }
}

// Function to add a new product
async function addProduct(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const price = document.getElementById("price").value.trim();
    const stock = document.getElementById("stock").value.trim();
    const image = document.getElementById("image").files[0];

    // Validation
    if (!name || !price || !stock || !image) {
        alert("Please fill in all fields and upload an image!");
        return;
    }

    if (parseFloat(price) <= 0) {
        alert("Price must be greater than 0!");
        return;
    }

    if (parseInt(stock) < 0) {
        alert("Stock cannot be negative!");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", parseFloat(price).toFixed(2));
    formData.append("stock", parseInt(stock));
    formData.append("image", image);

    try {
        console.log("Adding product...");
        
        const response = await fetch(`${API_BASE_URL}/add-product`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ Product added successfully!");
            document.getElementById("productForm").reset();
            document.getElementById("imagePreview").classList.add("hidden");
            fetchProducts();
        } else {
            alert("❌ Error: " + (result.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ Failed to add product. Please check if server is running.");
    }
}

// Preview image before uploading
function previewImage() {
    const file = document.getElementById("image").files[0];
    const preview = document.getElementById("imagePreview");
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    } else {
        preview.classList.add("hidden");
    }
}

// Function to edit product
async function editProduct(productId) {
    const newName = prompt("Enter new name:");
    if (!newName) return;

    const newPrice = prompt("Enter new price:");
    if (!newPrice || parseFloat(newPrice) <= 0) {
        alert("Please enter a valid price greater than 0");
        return;
    }

    const newStock = prompt("Enter new stock:");
    if (!newStock || parseInt(newStock) < 0) {
        alert("Please enter a valid stock quantity (0 or greater)");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/edit-product/${productId}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                name: newName, 
                price: parseFloat(newPrice), 
                stock: parseInt(newStock) 
            })
        });

        if (response.ok) {
            alert("✅ Product updated successfully!");
            fetchProducts();
        } else {
            const result = await response.json();
            alert("❌ Failed to update product: " + (result.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ Failed to update product. Check if server is running.");
    }
}

// Function to delete product
async function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/delete-product/${productId}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("✅ Product deleted successfully!");
            fetchProducts();
        } else {
            const result = await response.json();
            alert("❌ Failed to delete product: " + (result.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("❌ Failed to delete product. Check if server is running.");
    }
}