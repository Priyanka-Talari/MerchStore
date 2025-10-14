document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ JavaScript Loaded!");

    const auth = window.firebaseAuth;
    const db = window.firestoreDB;
    
    // Create and add floating particles
    createParticles();
    
    // Add CSS variable for staggered animations
    const inputGroups = document.querySelectorAll('.input-group');
    inputGroups.forEach((group, index) => {
        group.style.setProperty('--i', index + 1);
    });
    
    // 🔹 Toggle Login & Register Forms with animation
    window.toggleForm = function () {
        let registerForm = document.getElementById("register");
        let loginForm = document.getElementById("login");
        
        // Create message container if it doesn't exist
        if (!document.querySelector('.message')) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            document.body.appendChild(messageDiv);
        }

        // If register is visible, switch to login
        if (registerForm.style.display !== "none") {
            registerForm.classList.add('rotate-out');
            
            setTimeout(() => {
                registerForm.style.display = "none";
                loginForm.style.display = "block";
                
                // Reset form fields
                document.getElementById("username").value = "";
                document.getElementById("email").value = "";
                document.getElementById("password").value = "";
                document.getElementById("confirmPassword").value = "";
                
                // Reset animations for input groups
                const loginInputs = loginForm.querySelectorAll('.input-group');
                loginInputs.forEach((input, index) => {
                    input.style.animation = 'none';
                    setTimeout(() => {
                        input.style.removeProperty('animation');
                        input.style.setProperty('--i', index + 1);
                    }, 10);
                });
                
                loginForm.classList.add('rotate-in');
                loginForm.classList.remove('rotate-out');
            }, 300);
        } else {
            // If login is visible, switch to register
            loginForm.classList.add('rotate-out');
            
            setTimeout(() => {
                loginForm.style.display = "none";
                registerForm.style.display = "block";
                
                // Reset form fields
                document.getElementById("loginEmail").value = "";
                document.getElementById("loginPassword").value = "";
                
                // Reset animations for input groups
                const registerInputs = registerForm.querySelectorAll('.input-group');
                registerInputs.forEach((input, index) => {
                    input.style.animation = 'none';
                    setTimeout(() => {
                        input.style.removeProperty('animation');
                        input.style.setProperty('--i', index + 1);
                    }, 10);
                });
                
                registerForm.classList.add('rotate-in');
                registerForm.classList.remove('rotate-out');
            }, 300);
        }
    };

    // 🔹 Show/Hide Password with animation
    window.togglePassword = function (id) {
        let passwordField = document.getElementById(id);
        let eyeIcon = passwordField.nextElementSibling;

        // Add animation
        eyeIcon.style.transform = 'translateY(-50%) scale(1.2)';
        setTimeout(() => {
            eyeIcon.style.transform = 'translateY(-50%) scale(1)';
        }, 200);

        passwordField.type = passwordField.type === "password" ? "text" : "password";
        eyeIcon.innerText = passwordField.type === "password" ? "👀" : "🙈";
    };
    
    // Show message function
    function showMessage(text, type) {
        const messageDiv = document.querySelector('.message') || document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        
        if (!document.body.contains(messageDiv)) {
            document.body.appendChild(messageDiv);
        }
        
        // Reset animation
        messageDiv.classList.remove('show-message');
        
        // Trigger reflow
        void messageDiv.offsetWidth;
        
        // Show message
        messageDiv.classList.add('show-message');
        
        // Hide after delay
        setTimeout(() => {
            messageDiv.classList.remove('show-message');
        }, 3000);
    }

    // Create button loader
    function createLoader(button, text) {
        const originalText = button.textContent;
        button.innerHTML = `
            <div class="loader">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <span style="margin-left: 10px;">${text || 'Processing'}</span>
        `;
        button.disabled = true;
        
        return function() {
            button.innerHTML = originalText;
            button.disabled = false;
        };
    }

    // 🔹 Register User & Store in Firestore
    window.register = async function () {
        let username = document.getElementById("username").value.trim();
        let email = document.getElementById("email").value.trim();
        let password = document.getElementById("password").value.trim();
        let confirmPassword = document.getElementById("confirmPassword").value.trim();
        
        // Get button element
        const registerButton = document.querySelector('#register button');
        
        // Input validation
        if (!username) {
            showMessage("Username is required", "error");
            animateShake(document.getElementById("username").parentElement);
            return;
        }
        
        if (!email) {
            showMessage("Email is required", "error");
            animateShake(document.getElementById("email").parentElement);
            return;
        }
        
        if (password.length < 6 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
            showMessage("Password must be at least 6 characters with an uppercase letter and a number", "error");
            animateShake(document.getElementById("password").parentElement);
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage("Passwords don't match", "error");
            animateShake(document.getElementById("confirmPassword").parentElement);
            return;
        }

        // Show loader
        const resetLoader = createLoader(registerButton, "Registering");

        try {
            // ✅ Register User in Firebase Auth
            const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // ✅ Store user info in Firestore `users` collection
            const { collection, setDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            await setDoc(doc(collection(db, "users"), user.uid), {
                username: username,
                email: email,
                createdAt: new Date(),
                uid: user.uid
            });

            // Reset button
            resetLoader();
            
            // Show success message
            showMessage("✅ Registration successful!", "success");
            
            // Reset form fields with delay
            setTimeout(() => {
                // Switch to login form
                toggleForm();
            }, 1500);
            
        } catch (error) {
            console.error("🔥 Registration Error:", error);
            
            // Reset button
            resetLoader();
            
            // Show error message
            showMessage(`❌ ${error.message}`, "error");
            
            // Shake the container for feedback
            animateShake(document.querySelector('.container'));
        }
    };

    // 🔹 Login User & Check Firestore
    window.login = async function () {
        let email = document.getElementById("loginEmail").value.trim();
        let password = document.getElementById("loginPassword").value.trim();
        
        // Get button element
        const loginButton = document.querySelector('#login button');
        
        // Input validation
        if (!email) {
            showMessage("Email is required", "error");
            animateShake(document.getElementById("loginEmail").parentElement);
            return;
        }
        
        if (!password) {
            showMessage("Password is required", "error");
            animateShake(document.getElementById("loginPassword").parentElement);
            return;
        }

        // Show loader
        const resetLoader = createLoader(loginButton, "Logging in");

        try {
            // ✅ Sign in User
            const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // ✅ Check if user is an admin in Firestore
            const { collection, query, where, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            const adminsRef = collection(db, "admins");
            const q = query(adminsRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            // Reset button
            resetLoader();
            
            // Show success message
            showMessage("✅ Login successful!", "success");
            
            // Add page transition
            const pageTransition = document.createElement('div');
            pageTransition.style.position = 'fixed';
            pageTransition.style.top = '0';
            pageTransition.style.left = '0';
            pageTransition.style.width = '100%';
            pageTransition.style.height = '100%';
            pageTransition.style.background = 'white';
            pageTransition.style.zIndex = '9999';
            pageTransition.style.opacity = '0';
            pageTransition.style.transition = 'opacity 0.8s ease';
            document.body.appendChild(pageTransition);
            
            // Trigger transition
            setTimeout(() => {
                pageTransition.style.opacity = '1';
                
                setTimeout(() => {
                    if (!querySnapshot.empty) {
                        window.location.href = "admin-dashboard.html";
                    } else {
                        window.location.href = "index.html";
                    }
                }, 800);
            }, 500);
            
        } catch (error) {
            console.error("🔥 Login Error:", error);
            
            // Reset button
            resetLoader();
            
            // Show error message
            showMessage(`❌ ${error.message}`, "error");
            
            // Shake the container for feedback
            animateShake(document.querySelector('.container'));
        }
    };
    
    // Function to animate shake
    function animateShake(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 800);
    }
    
    // Create floating particles
    function createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        document.body.appendChild(particlesContainer);
        
        for (let i = 0; i < 20; i++) {
            createParticle(particlesContainer);
        }
        
        // Create particles at intervals
        setInterval(() => {
            createParticle(particlesContainer);
        }, 2000);
    }
    
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 10px and 30px
        const size = Math.random() * 20 + 10;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random horizontal position
        const left = Math.random() * 100;
        particle.style.left = `${left}%`;
        
        // Random opacity
        particle.style.opacity = (Math.random() * 0.6 + 0.2).toString();
        
        // Random animation duration between 10s and 20s
        const duration = Math.random() * 10 + 10;
        particle.style.animation = `float-up ${duration}s linear infinite`;
        
        // Set bottom position to start from below
        particle.style.bottom = '-100px';
        
        // Add to container
        container.appendChild(particle);
        
        // Remove after animation time to avoid memory issues
        setTimeout(() => {
            if (container.contains(particle)) {
                container.removeChild(particle);
            }
        }, duration * 1000);
    }

    // Add keypress events for better UX
    document.getElementById("confirmPassword").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            register();
        }
    });
    
    document.getElementById("loginPassword").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            login();
        }
    });

    console.log("✅ Enhanced event listeners and animations set up successfully.");
});