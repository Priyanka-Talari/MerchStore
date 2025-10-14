document.addEventListener("DOMContentLoaded", function () {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    updateCartCount();

    // Load products from Flask backend
    loadProducts();

    // Initialize share functionality
    setupShareFunctionality();

    // Add cart navigation functionality
    setupCartNavigation();

    function updateCartCount() {
        const cartCount = document.getElementById("cartCount");
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    // Cart navigation setup - FIXED FOR FLASK
    function setupCartNavigation() {
        const cartLink = document.querySelector('a[href*="cart"]');
        if (cartLink) {
            cartLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Use Flask route instead of direct HTML file
                window.location.href = '/cart';
            });
        }
    }

    // Function to generate star rating HTML
    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star filled">★</span>';
        }
        
        if (hasHalfStar) {
            starsHTML += '<span class="star half">★</span>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span class="star">★</span>';
        }
        
        return starsHTML;
    }

    function getRandomRating() {
        return (Math.random() * 1.5 + 3.5).toFixed(1);
    }

    function getRandomReviewCount() {
        return Math.floor(Math.random() * 100) + 10;
    }

    function setupShareFunctionality() {
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.share-btn') && !e.target.closest('.share-dropdown')) {
                document.querySelectorAll('.share-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    }

    function loadProducts() {
        const productsContainer = document.getElementById("productsContainer");
        if (!productsContainer) return;

        console.log("Loading products from Flask backend...");
        
        // Use relative path for Flask
        fetch("/products")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(products => {
                console.log("Products loaded:", products);
                productsContainer.innerHTML = "";

                if (!products || products.length === 0) {
                    productsContainer.innerHTML = "<div class='no-products'>No products available at the moment.</div>";
                    return;
                }

                products.forEach(product => {
                    let imageUrl = product.image;
                    
                    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/static/')) {
                        imageUrl = `/static/uploads/${imageUrl}`;
                    }
                    
                    if (!imageUrl || imageUrl === 'null') {
                        imageUrl = '/static/images/placeholder.jpg';
                    }

                    const rating = parseFloat(getRandomRating());
                    const reviewCount = getRandomReviewCount();

                    const productCard = document.createElement("div");
                    productCard.className = "product-card";
                    productCard.innerHTML = `
                        <div class="product-image-container">
                            <img src="${imageUrl}" 
                                 alt="${product.name}" 
                                 class="product-image"
                                 onerror="this.src='/static/images/placeholder.jpg'">
                        </div>
                        <div class="product-content">
                            <div>
                                <h3 class="product-name">${product.name}</h3>
                                <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
                                
                                <div class="product-rating">
                                    <div class="stars">
                                        ${generateStarRating(rating)}
                                    </div>
                                    <span class="rating-count">${rating} (${reviewCount})</span>
                                </div>
                                
                                <p class="product-stock">In stock: ${product.stock || 0}</p>
                            </div>
                            
                            <div class="product-actions">
                                <button class="add-to-cart-btn" 
                                        data-product-id="${product.id}"
                                        data-product-name="${product.name}"
                                        data-product-price="${product.price}"
                                        data-product-image="${imageUrl}"
                                        data-product-stock="${product.stock || 0}">
                                    Add to Cart
                                </button>
                                
                                <div class="share-wrapper" style="position: relative;">
                                    <button class="share-btn" onclick="toggleShareDropdown(this)">
                                        <i class="fas fa-share-alt"></i>
                                    </button>
                                    <div class="share-dropdown">
                                        <a href="#" class="share-option" onclick="shareProduct(${product.id}, '${product.name.replace(/'/g, "\\'")}', 'facebook'); return false;">
                                            <i class="fab fa-facebook" style="color: #1877f2;"></i> Facebook
                                        </a>
                                        <a href="#" class="share-option" onclick="shareProduct(${product.id}, '${product.name.replace(/'/g, "\\'")}', 'twitter'); return false;">
                                            <i class="fab fa-twitter" style="color: #1da1f2;"></i> Twitter
                                        </a>
                                        <a href="#" class="share-option" onclick="shareProduct(${product.id}, '${product.name.replace(/'/g, "\\'")}', 'whatsapp'); return false;">
                                            <i class="fab fa-whatsapp" style="color: #25d366;"></i> WhatsApp
                                        </a>
                                        <a href="#" class="share-option" onclick="shareProduct(${product.id}, '${product.name.replace(/'/g, "\\'")}', 'copy'); return false;">
                                            <i class="fas fa-link"></i> Copy Link
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    productsContainer.appendChild(productCard);
                });

                setupAddToCartButtons();
            })
            .catch(error => {
                console.error("Error loading products:", error);
                productsContainer.innerHTML = `
                    <div class="error-message">
                        <p>Failed to load products. Please check if the server is running.</p>
                        <small>Error: ${error.message}</small>
                        <br>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 10px; background: #2c5aa0; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Retry
                        </button>
                    </div>
                `;
            });
    }

    function setupAddToCartButtons() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                const productName = this.getAttribute('data-product-name');
                const price = parseFloat(this.getAttribute('data-product-price'));
                const imageUrl = this.getAttribute('data-product-image');
                const stock = parseInt(this.getAttribute('data-product-stock'));
                
                addToCart(productId, productName, price, imageUrl, stock);
            });
        });
    }

    // Global function for adding to cart
    window.addToCart = function (productId, productName, price, imageUrl, stock) {
        try {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            
            console.log('Adding to cart:', { productId, productName, price, stock });
            
            if (stock <= 0) {
                showNotification(`${productName} is out of stock!`, 'error');
                return;
            }

            let cartItem = {
                id: productId,
                name: productName,
                price: parseFloat(price),
                image: imageUrl,
                quantity: 1
            };

            let existingItem = cart.find(item => item.id == productId);
            if (existingItem) {
                if (existingItem.quantity >= stock) {
                    showNotification(`Only ${stock} ${productName} available in stock!`, 'error');
                    return;
                }
                existingItem.quantity++;
            } else {
                cart.push(cartItem);
            }

            localStorage.setItem("cart", JSON.stringify(cart));
            updateCartCount();
            
            console.log('Cart after adding:', cart);
            showNotification(`${productName} added to cart!`, 'success');
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add item to cart!', 'error');
        }
    };

    function showNotification(message, type = 'success') {
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement("div");
        notification.className = "notification";
        const bgColor = type === 'success' ? '#2c5aa0' : '#dc3545';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}"></i>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(notification);
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            animation: slideInRight 0.3s ease-out forwards;
        `;
        
        const notificationContent = notification.querySelector(".notification-content");
        notificationContent.style.display = "flex";
        notificationContent.style.alignItems = "center";
        
        const iconElement = notification.querySelector("i");
        iconElement.style.marginRight = "10px";
        iconElement.style.fontSize = "18px";
        
        setTimeout(() => {
            notification.style.animation = "slideInRight 0.3s ease-out reverse";
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    window.shareProduct = function(productId, productName, platform) {
        const productUrl = `${window.location.origin}/product/${productId}`;
        const shareText = `Check out ${productName} on MerchStore!`;
        
        let shareUrl = '';
        
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(productUrl).then(() => {
                    showNotification('Product link copied to clipboard!', 'success');
                });
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    };

    window.toggleShareDropdown = function(button) {
        const dropdown = button.nextElementSibling;
        const allDropdowns = document.querySelectorAll('.share-dropdown');
        
        allDropdowns.forEach(d => {
            if (d !== dropdown) {
                d.classList.remove('active');
            }
        });
        
        dropdown.classList.toggle('active');
    };

    window.navigateToCart = function() {
        window.location.href = '/cart';
    };
});