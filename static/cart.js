document.addEventListener("DOMContentLoaded", function () {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    updateCartDisplay();

    // Payment method toggle
    document.querySelectorAll('input[name="payment-method"]').forEach((radio) => {
        radio.addEventListener("change", function () {
            const cardForm = document.getElementById("card-payment-form");
            const upiForm = document.getElementById("upi-payment-form");
            const checkoutBtn = document.getElementById("checkout-btn");
            
            cardForm.style.display = this.value === "card" ? "block" : "none";
            upiForm.style.display = this.value === "upi" ? "block" : "none";
            
            checkoutBtn.textContent = this.value === "card" ? 'Pay Now' : 'Place Order (COD)';
        });
    });

    // Clear cart button
    const clearCartBtn = document.getElementById("clear-cart");
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", function () {
            if (cart.length === 0) return;
            
            if (confirm("Are you sure you want to clear your cart?")) {
                let cartItems = document.querySelectorAll(".cart-item");
                let delay = 0;

                cartItems.forEach((item) => {
                    setTimeout(() => {
                        item.style.opacity = "0";
                        item.style.transform = "translateX(-20px)";
                    }, delay);
                    delay += 100;
                });

                setTimeout(() => {
                    localStorage.removeItem("cart");
                    cart = [];
                    updateCartDisplay();
                }, delay + 300);
            }
        });
    }

    // Checkout button
    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", function() {
            if (cart.length === 0) {
                alert("Your cart is empty! Add some items first.");
                return;
            }

            const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
            if (!paymentMethod) {
                alert("Please select a payment method");
                return;
            }
            
            if (paymentMethod.value === "card" && !validateCardDetails()) {
                return;
            }
            
            if (paymentMethod.value === "upi" && !validateUPIDetails()) {
                return;
            }

            processPayment();
        });
    }

    // Format credit card number with spaces
    const cardNumberInput = document.getElementById("cardNumber");
    if (cardNumberInput) {
        cardNumberInput.addEventListener("input", function (e) {
            let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
            let formattedValue = "";
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += " ";
                }
                formattedValue += value[i];
            }
            e.target.value = formattedValue;
        });
    }

    // Format expiry date with slash
    const expiryInput = document.getElementById("expiry");
    if (expiryInput) {
        expiryInput.addEventListener("input", function (e) {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 2) {
                value = value.slice(0, 2) + "/" + value.slice(2);
            }
            e.target.value = value;
        });
    }
});

function updateCartDisplay() {
    const cartContainer = document.getElementById("cart-items-container");
    const totalPriceElement = document.getElementById("total-price");
    const clearCartBtn = document.getElementById("clear-cart");
    
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    console.log('Cart contents:', cart);

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <!-- FIXED: Use Flask route instead of direct HTML -->
                <a href="/" class="btn btn-primary">
                    <i class="fas fa-shopping-bag btn-icon"></i>Start Shopping
                </a>
            </div>
        `;
        if (totalPriceElement) {
            totalPriceElement.textContent = "₹0.00";
        }
        if (clearCartBtn) {
            clearCartBtn.style.display = 'none';
        }
        return;
    }

    if (clearCartBtn) {
        clearCartBtn.style.display = 'block';
    }

    let totalPrice = 0;
    let cartItemsHtml = "";

    cart.forEach((item, index) => {
        const itemTotal = (item.price * item.quantity);
        totalPrice += itemTotal;

        cartItemsHtml += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='/static/images/placeholder.jpg'">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>₹${parseFloat(item.price).toFixed(2)} each</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <p><strong>Subtotal: ₹${itemTotal.toFixed(2)}</strong></p>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
    });

    cartItemsHtml += `
        <div class="total-section">
            <h3>Total Amount</h3>
            <span class="total-price">₹${totalPrice.toFixed(2)}</span>
        </div>
    `;

    cartContainer.innerHTML = cartItemsHtml;
    
    if (totalPriceElement) {
        totalPriceElement.textContent = `₹${totalPrice.toFixed(2)}`;
    }
}

function updateQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (confirm("Are you sure you want to remove this item from your cart?")) {
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
    }
}

function validateCardDetails() {
    const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "");
    const expiry = document.getElementById("expiry").value;
    const cvv = document.getElementById("cvv").value;

    if (!cardNumber || !expiry || !cvv) {
        alert("Please fill in all card details");
        return false;
    }

    if (!/^\d{16}$/.test(cardNumber)) {
        alert("Invalid card number! Must be 16 digits.");
        return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        alert("Invalid expiry format! Use MM/YY.");
        return false;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        alert("Invalid CVV! Must be 3 or 4 digits.");
        return false;
    }

    return true;
}

function validateUPIDetails() {
    const upiID = document.getElementById("upiID").value;
    
    if (!upiID) {
        alert("Please enter your UPI ID");
        return false;
    }
    
    if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiID)) {
        alert("Please enter a valid UPI ID (e.g., yourname@bank)");
        return false;
    }
    
    return true;
}

function processPayment() {
    const modal = document.getElementById("successModal");
    if (modal) {
        modal.style.display = "block";

        setTimeout(() => {
            modal.classList.add("active");
        }, 10);

        // Clear cart after successful payment
        setTimeout(() => {
            localStorage.removeItem("cart");
            
            // FIXED: Redirect to Flask home route
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        }, 1500);
    }
}

// Make functions available globally
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.processPayment = processPayment;
window.updateCartDisplay = updateCartDisplay;