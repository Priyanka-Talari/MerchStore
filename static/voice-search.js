// Check if Speech Recognition is supported
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false; // Get final result only

    document.addEventListener("DOMContentLoaded", function () {
        const voiceButton = document.getElementById('voiceSearchButton');
        if (voiceButton) {
            voiceButton.addEventListener('click', () => {
                recognition.start();
            });
        }
    });

    recognition.onresult = (event) => {
        let voiceText = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Recognized:", voiceText);

        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.value = voiceText; // Show text in search box
        }

        searchProducts(voiceText); // Filter products
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        alert("Voice recognition error. Please try again.");
    };
} else {
    alert("Your browser does not support voice search.");
}

// Dummy product list
const products = [
    { id: 1, name: "Spider-man T-Shirt", price: "₹500", image: "images/spdtshirt.jpg" },
    { id: 2, name: "Spider-man Cup", price: "₹50", image: "images/spdcup.jpg" },
    { id: 3, name: "Spiderman Bobblehead", price: "₹500", image: "images/spdfig.jpg" },
    { id: 4, name: "Spiderman Silver Ring", price: "₹3000", image: "images/spdring.jpg" },
    { id: 5, name: "Sneakers", price: "₹3400", image: "images/spdshoes.jpg" },
    { id: 6, name: "Princess Jasmine T-Shirt", price: "₹599", image: "images/jtshirt.webp" },
    { id: 7, name: "Doraemon Toy", price: "₹199", image: "images/doraemon_toy.webp" },
    { id: 8, name: "Jasmine Necklace", price: "₹120", image: "images/jneck.webp" },
    { id: 9, name: "Jasmine Ring", price: "₹350", image: "images/jring.jpg" },
    { id: 10, name: "Rapunzel Perfume", price: "₹1350", image: "images/rapperfume.jpg" },
    { id: 11, name: "Squid-Game T-Shirt", price: "₹799", image: "images/sgtshirt.jpg" },
    { id: 12, name: "Squid-Game Cosplay Costume", price: "₹1999", image: "images/sgcostume.jpg" },
    { id: 13, name: "Squid-Game Crocs", price: "₹150", image: "images/sgcrocs.jpg" },
    { id: 14, name: "Squid-Game Cap", price: "₹100", image: "images/sgcap.jpg" },
    { id: 15, name: "Squid-Game Phone Case", price: "₹2000", image: "images/sgcase.jpg" },
    { id: 16, name: "Squid-Game Pillow", price: "₹550", image: "images/sgpillow.jpg" }
];

// Function to filter products based on search input
function searchProducts(query) {
    let results = products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
    );

    displayResults(results, query);
}

// Function to display search results dynamically with exact match prioritization
function displayResults(results, query) {
    let resultsContainer = document.getElementById("searchResults");
    if (!resultsContainer) return;

    resultsContainer.innerHTML = ""; // Clear previous results

    if (results.length === 0) {
        resultsContainer.innerHTML = "<p>No products found.</p>";
        return;
    }

    // Prioritize exact matches first
    results.sort((a, b) => {
        if (a.name.toLowerCase() === query.toLowerCase()) return -1;
        if (b.name.toLowerCase() === query.toLowerCase()) return 1;
        return 0;
    });

    results.forEach(product => {
        let productCard = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" />
                </div>
                <h3>${product.name}</h3>
                <p>${product.price}</p>
                <button onclick="addToCart('${product.name}', '${product.price}', '${product.image}')">Buy Now</button>
            </div>
        `;
        resultsContainer.innerHTML += productCard;
    });
}

// Improved addToCart function
function addToCart(name, price, image) {
    alert(`Added ${name} to cart!`);
}
