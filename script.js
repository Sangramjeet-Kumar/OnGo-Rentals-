// Generate buildings for the cityscape
function generateCityscape() {
    const cityscape = document.getElementById('cityscape');
    if (!cityscape) return; // Skip if element doesn't exist
    
    const numBuildings = Math.ceil(window.innerWidth / 64); // Adjust spacing as needed
    
    cityscape.innerHTML = ''; // Clear existing buildings
    
    for (let i = 0; i < numBuildings; i++) {
        const building = document.createElement('div');
        building.className = 'building';
        
        // Random height variation
        const height = 100 + Math.random() * 100;
        building.style.height = `${height}px`;
        
        // Add windows to buildings
        const numWindows = Math.floor(height / 20);
        for (let j = 0; j < numWindows; j++) {
            for (let k = 0; k < 3; k++) {
                const window = document.createElement('div');
                window.className = 'window';
                window.style.top = `${j * 20 + 5}px`;
                window.style.left = `${k * 15 + 5}px`;
                
                // Random window lighting
                if (Math.random() > 0.4) {
                    window.style.background = 'rgba(255, 255, 150, 0.5)';
                    window.style.boxShadow = '0 0 10px rgba(255, 255, 150, 0.5)';
                    
                    // Add flickering animation to some windows
                    if (Math.random() > 0.7) {
                        window.style.animation = `flicker ${2 + Math.random() * 4}s ease-in-out infinite`;
                    }
                } else {
                    window.style.background = 'rgba(30, 30, 30, 0.8)';
                }
                
                building.appendChild(window);
            }
        }
        
        cityscape.appendChild(building);
    }
}

// Generate stars in the background
function generateStars() {
    const background = document.getElementById('background');
    if (!background) return; // Skip if element doesn't exist
    
    // Clear existing stars
    const existingStars = background.querySelectorAll('.star, .shooting-star');
    existingStars.forEach(star => star.remove());
    
    // Generate regular stars (fewer stars)
    const numStars = Math.min(100, Math.floor(window.innerWidth / 10)); // Limit based on screen size
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 70}%`; // Keep stars in the sky
        
        // Random size
        const size = 1 + Math.random() * 2;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random twinkle animation delay
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        background.appendChild(star);
    }
    
    // Generate shooting stars (fewer)
    const numShootingStars = 3;
    for (let i = 0; i < numShootingStars; i++) {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        
        // Random position
        shootingStar.style.left = `${Math.random() * 70}%`;
        shootingStar.style.top = `${Math.random() * 40}%`;
        
        // Random animation delay
        shootingStar.style.animationDelay = `${i * 3 + Math.random() * 5}s`;
        
        background.appendChild(shootingStar);
    }
}

// Generate road lines
function generateRoadLines() {
    const road = document.querySelector('.road');
    if (!road) return; // Skip if element doesn't exist
    
    road.innerHTML = ''; // Clear existing lines
    
    const numLines = Math.min(15, Math.ceil(window.innerWidth / 100)); // Limit number of lines
    
    for (let i = 0; i < numLines; i++) {
        const line = document.createElement('div');
        line.className = 'road-line';
        line.style.left = `${(i / numLines) * 100}%`;
        line.style.width = '60px';
        road.appendChild(line);
    }
}

// Add styles for the natural scenery
function addBackgroundStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = `
        .hill {
            position: absolute;
            border-radius: 50% 50% 0 0;
            background: linear-gradient(0deg, #2c3e50 0%, #34495e 100%);
            z-index: 2;
        }
        
        .tree {
            position: absolute;
            width: 20px;
            height: 30px;
            background: linear-gradient(0deg, #2d6a4f 0%, #40916c 50%, #74c69d 100%);
            border-radius: 50% 50% 5% 5%;
            z-index: 3;
        }
        
        .tree::after {
            content: '';
            position: absolute;
            width: 4px;
            height: 10px;
            background: #6b4f2e;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2;
        }
        
        .cloud {
            position: absolute;
            width: 130px;
            height: 50px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            animation: floatCloud linear infinite;
            z-index: 1;
        }
        
        .cloud::before {
            content: '';
            position: absolute;
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            top: -20px;
            left: 20px;
        }
        
        .cloud::after {
            content: '';
            position: absolute;
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            top: -30px;
            right: 20px;
        }
        
        @keyframes floatCloud {
            0% {
                transform: translateX(-150%);
            }
            100% {
                transform: translateX(150vw);
            }
        }
        
        .star {
            position: absolute;
            width: 2px;
            height: 2px;
            background-color: white;
            border-radius: 50%;
            animation: twinkle 4s ease-in-out infinite;
        }
        
        .shooting-star {
            position: absolute;
            width: 80px;
            height: 1px;
            background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%);
            transform: rotate(-45deg);
            animation: shooting 10s linear infinite;
        }
        
        .road-line {
            position: absolute;
            height: 8px;
            width: 60px;
            background-color: rgba(255, 255, 255, 0.7);
            bottom: 30%;
            border-radius: 4px;
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
        }
        
        @keyframes shooting {
            0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateX(1000px) translateY(1000px) rotate(-45deg); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Add dynamic CSS keyframes for window flickering
function addFlickerAnimation() {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = `
        @keyframes flicker {
            0%, 100% { opacity: 1; }
            10% { opacity: 0.8; }
            20% { opacity: 1; }
            50% { opacity: 0.6; }
            60% { opacity: 0.9; }
            70% { opacity: 1; }
            90% { opacity: 0.7; }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Show login form with animation
function showLoginForm(type) {
    const loginForm = document.getElementById('loginForm');
    const loginTitle = document.getElementById('loginTitle');
    
    loginTitle.textContent = type === 'agent' 
        ? 'Agent Login' 
        : 'Customer Login';
    
    // Add direct onclick attribute to login button
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.onclick = handleLogin;
    }
    
    // Set up signup link to preserve login type
    const signupLink = document.getElementById('signupLink');
    if (signupLink) {
        signupLink.onclick = function() { showSignupForm(); return false; };
    }
    
    loginForm.style.display = 'flex';
    requestAnimationFrame(() => {
        loginForm.style.opacity = '1';
        loginForm.classList.add('active');
    });
}

// Hide login form with animation
function hideLoginForm() {
    const loginForm = document.getElementById('loginForm');
    loginForm.style.opacity = '0';
    loginForm.classList.remove('active');
    setTimeout(() => {
        loginForm.style.display = 'none';
    }, 300);
}

// Add this function to create smoke effect
function createSmokeEffect() {
    const car = document.querySelector('.car');
    const smokeContainer = car.querySelector('.smoke-container');
    
    function createSmokeParticle() {
        if (!car.classList.contains('reverse')) {
            const smoke = document.createElement('div');
            smoke.className = 'smoke-particle';
            
            // Position smoke behind the car
            smoke.style.left = '20px';
            smoke.style.bottom = '5px';
            
            smokeContainer.appendChild(smoke);
            
            // Remove smoke particle after animation
            setTimeout(() => {
                smoke.remove();
            }, 2000);
        }
    }
    
    // Create smoke particles at intervals
    setInterval(createSmokeParticle, 200);
}

// Update the animateCar function
function animateCar() {
    const car = document.querySelector('.car');
    
    // Make sure the car animation is running
    car.style.animation = 'moveCar 8s cubic-bezier(0.4, 0, 0.2, 1) infinite';
    
    // Add event listener to detect animation direction
    car.addEventListener('animationiteration', () => {
        car.classList.toggle('reverse');
    });
    
    // Start smoke effect
    createSmokeEffect();
}

// Add parallax effect to background elements
function addParallaxEffect() {
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        const shapes = document.querySelectorAll('.shape');
        const carImage = document.querySelector('.car-image');
        const accentShape = document.querySelector('.accent-shape');
        
        shapes.forEach((shape, index) => {
            const depth = 0.05 * (index + 1);
            const moveX = (x - 0.5) * depth * 50;
            const moveY = (y - 0.5) * depth * 50;
            shape.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${moveX * 0.05}deg)`;
        });
        
        if (carImage && accentShape) {
            const moveX = (x - 0.5) * 20;
            const moveY = (y - 0.5) * 10;
            carImage.style.transform = `translateX(${-10 + moveX * 0.5}%) translateY(${moveY * 0.5}px)`;
            accentShape.style.transform = `translateX(${moveX * 0.2}px) translateY(${moveY * 0.2}px)`;
        }
    });
}

// Add smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Show signup form
function showSignupForm() {
    // Get the login type from the login form title if it's visible
    const loginTitle = document.getElementById('loginTitle');
    const loginType = loginTitle && loginTitle.textContent.includes('Agent') ? 'agent' : 'customer';
    
    // Store the signup type in a data attribute for later use
    const signupForm = document.getElementById('signupForm');
    signupForm.setAttribute('data-signup-type', loginType);
    
    // Update the signup form title
    const signupTitle = signupForm.querySelector('.form-header h2');
    if (signupTitle) {
        signupTitle.textContent = loginType === 'agent' 
            ? 'Create Agent Account' 
            : 'Create Customer Account';
    }
    
    hideLoginForm();
    
    // Add direct onclick attribute to signup button
    const signupButton = document.getElementById('signupButton');
    if (signupButton) {
        signupButton.onclick = handleSignup;
    }
    
    // Update the login link to preserve the type
    const loginLink = signupForm.querySelector('.signup-link a');
    if (loginLink) {
        loginLink.onclick = function() { showLoginForm(loginType); return false; };
    }
    
    signupForm.style.display = 'flex';
    requestAnimationFrame(() => {
        signupForm.style.opacity = '1';
        signupForm.classList.add('active');
    });
}

// Hide signup form
function hideSignupForm() {
    const signupForm = document.getElementById('signupForm');
    signupForm.style.opacity = '0';
    signupForm.classList.remove('active');
    setTimeout(() => {
        signupForm.style.display = 'none';
    }, 300);
}

// Show reset password form
function showResetPasswordForm() {
    // Get the login type from the login form title if it's visible
    const loginTitle = document.getElementById('loginTitle');
    const loginType = loginTitle && loginTitle.textContent.includes('Agent') ? 'agent' : 'customer';
    
    // Store the reset type in a data attribute for later use
    const resetForm = document.getElementById('resetPasswordForm');
    resetForm.setAttribute('data-reset-type', loginType);
    
    hideLoginForm();
    
    // Update the login link to preserve the type
    const loginLink = document.getElementById('resetLoginLink');
    if (loginLink) {
        loginLink.onclick = function() { showLoginForm(loginType); return false; };
    }
    
    resetForm.style.display = 'flex';
    requestAnimationFrame(() => {
        resetForm.style.opacity = '1';
        resetForm.classList.add('active');
    });
}

// Hide reset password form
function hideResetPasswordForm() {
    const resetForm = document.getElementById('resetPasswordForm');
    resetForm.style.opacity = '0';
    resetForm.classList.remove('active');
    setTimeout(() => {
        resetForm.style.display = 'none';
    }, 300);
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('active');
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorElement.classList.remove('active');
    }, 5000);
}

// Handle login form submission
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showError('loginErrorMessage', 'Please enter both email and password');
        return;
    }

    // Show loading state
    const loginButton = document.getElementById('loginButton');
    loginButton.textContent = 'Logging in...';
    loginButton.disabled = true;

    try {
        // Sign in user and get user data
        const { userCredential, userData } = await signInUser(email, password, rememberMe);
        
        // Get the login type from the login form title
        const loginTitle = document.getElementById('loginTitle').textContent;
        const isAgentLogin = loginTitle.includes('Agent');
        const isCustomerLogin = loginTitle.includes('Customer');
        
        // Check if a customer is trying to log in through agent login
        if (isAgentLogin && userData.userType === 'customer') {
            throw {
                code: 'auth/unauthorized-access',
                message: 'Customer accounts cannot access the agent section. Please use the regular login.'
            };
        }
        
        // Check if an agent is trying to log in through customer login
        if (isCustomerLogin && userData.userType === 'agent') {
            throw {
                code: 'auth/unauthorized-access',
                message: 'Agent accounts cannot access the customer section. Please use the agent login.'
            };
        }
        
        // Show success notification with actual name
        const displayName = userData.name || 'User';
        const userType = userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1);
        showNotification(`Welcome back, ${displayName}!`, 'success');
        
        // Redirect based on user type after a short delay
        setTimeout(() => {
            if (userData.userType === 'customer') {
                window.location.href = 'dashboard.html';
            } else if (userData.userType === 'agent') {
                window.location.href = 'agent-dashboard.html';
            } else if (userData.userType === 'admin') {
                window.location.href = 'admin-dashboard.html';
            }
        }, 1000);
    } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        let errorMessage = 'Failed to login. Please check your credentials.';
        
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = 'Invalid email or password.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many failed login attempts. Please try again later.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your internet connection.';
                break;
            case 'auth/unauthorized-access':
                errorMessage = error.message;
                break;
            default:
                errorMessage = `An unexpected error occurred: ${error.message}`;
        }
        
        showError('loginErrorMessage', errorMessage);
    } finally {
        // Reset button state
        loginButton.textContent = 'Login';
        loginButton.disabled = false;
    }
}

// Add this function to show notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        </div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Add event listener to close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.add('hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
}

// Handle signup form submission
async function handleSignup() {
    console.log('Signup button clicked');
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Get the signup type from the data attribute
    const signupForm = document.getElementById('signupForm');
    const signupType = signupForm.getAttribute('data-signup-type') || 'customer';
    
    console.log('Signup attempt with email:', email, 'type:', signupType);
    
    if (!name || !email || !password || !confirmPassword) {
        showError('signupErrorMessage', 'Please fill in all fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('signupErrorMessage', 'Passwords do not match.');
        return;
    }
    
    if (password.length < 6) {
        showError('signupErrorMessage', 'Password must be at least 6 characters long.');
        return;
    }
    
    // Show loading state
    const signupButton = document.getElementById('signupButton');
    signupButton.textContent = 'Creating Account...';
    signupButton.disabled = true;
    
    try {
        console.log('Attempting to create user...');
        
        // Check if Firebase is initialized properly
        if (!firebase || !auth || !db) {
            throw new Error('Firebase is not properly initialized');
        }
        
        // Create user in Authentication
        let userCredential;
        try {
            userCredential = await auth.createUserWithEmailAndPassword(email, password);
            console.log('User created in authentication:', userCredential.user.uid);
        } catch (authError) {
            console.error('Firebase auth error during signup:', authError);
            throw authError;
        }
        
        // Save user data to Firestore
        try {
            // Set userType based on signup type
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                userType: signupType, // 'agent' or 'customer'
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('User data saved to Firestore');
            
            // Create agent document if this is an agent signup
            if (signupType === 'agent') {
                await db.collection('agents').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    role: 'agent',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('Agent data saved to Firestore');
            }
        } catch (firestoreError) {
            console.error('Firestore error during signup:', firestoreError);
            // Try to delete the auth user since Firestore failed
            try {
                await userCredential.user.delete();
                console.log('Rolled back auth user creation');
            } catch (deleteError) {
                console.error('Failed to roll back auth user:', deleteError);
            }
            throw firestoreError;
        }
        
        console.log('User created successfully');
        
        // Signup successful
        hideSignupForm();
        
        // Show success notification with user type
        const userTypeCapitalized = signupType.charAt(0).toUpperCase() + signupType.slice(1);
        showNotification(`${userTypeCapitalized} account created successfully! You can now log in.`, 'success');
        
        // Show login form after a short delay with the appropriate type
        setTimeout(() => {
            showLoginForm(signupType);
        }, 1500);
    } catch (error) {
        console.error('Signup error details:', error);
        
        // Handle errors
        let errorMessage = 'Failed to create account. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email is already in use. Please use a different email or login.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak. Please use a stronger password.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your internet connection.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password accounts are not enabled. Please contact support.';
                break;
            default:
                console.error('Signup error:', error);
                errorMessage = `An unexpected error occurred: ${error.message || error}. Please try again.`;
        }
        
        showError('signupErrorMessage', errorMessage);
    } finally {
        // Reset button state
        signupButton.textContent = 'Create Account';
        signupButton.disabled = false;
    }
}

// Handle reset password form submission
function handleResetPassword() {
    const email = document.getElementById('resetEmail').value;
    
    if (!email) {
        showError('resetErrorMessage', 'Please enter your email address.');
        return;
    }
    
    // Show loading state
    const resetButton = document.getElementById('resetPasswordButton');
    resetButton.textContent = 'Sending...';
    resetButton.disabled = true;
    
    resetPassword(email)
        .then(() => {
            // Reset email sent
            hideResetPasswordForm();
            alert('Password reset email sent. Please check your inbox.');
        })
        .catch((error) => {
            // Handle errors
            let errorMessage = 'Failed to send reset email. Please try again.';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            }
            
            showError('resetErrorMessage', errorMessage);
        })
        .finally(() => {
            // Reset button state
            resetButton.textContent = 'Send Reset Link';
            resetButton.disabled = false;
        });
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing application');
    
    try {
        // Add styles first
        addBackgroundStyles();
        addFlickerAnimation();
        
        // Generate background elements with a slight delay for better performance
        setTimeout(() => {
            generateCityscape();
            generateStars();
            generateRoadLines();
        }, 100);
        
        // Don't run these if the elements don't exist
        const carImage = document.querySelector('.car-image');
        if (carImage) {
            animateCar();
        }
        
        // Add parallax effect
        addParallaxEffect();
        
        // Check if we're on a dashboard page
        const isDashboard = window.location.pathname.includes('dashboard');
        
        // Only check auth state on non-dashboard pages
        if (!isDashboard) {
            // Check if user is already logged in
            const storedUser = getStoredUserData();
            if (storedUser) {
                // User is already logged in, redirect to appropriate dashboard
                if (storedUser.userType === 'customer') {
                    window.location.href = 'dashboard.html';
                } else if (storedUser.userType === 'agent') {
                    window.location.href = 'agent-dashboard.html';
                } else if (storedUser.userType === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                }
            }
        }
        
        // Add event listeners to buttons
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            loginButton.onclick = function(e) {
                e.preventDefault();
                console.log('Login button clicked directly');
                handleLogin();
            };
        }
        
        const signupButton = document.getElementById('signupButton');
        if (signupButton) {
            signupButton.onclick = function(e) {
                e.preventDefault();
                console.log('Signup button clicked directly');
                handleSignup();
            };
        }
        
        const resetPasswordButton = document.getElementById('resetPasswordButton');
        if (resetPasswordButton) {
            resetPasswordButton.onclick = function(e) {
                e.preventDefault(); 
                console.log('Reset password button clicked directly');
                handleResetPassword();
            };
        }
    } catch (error) {
        console.error('Error initializing UI components:', error);
    }
    
    // Periodically regenerate shooting stars for continuous effect
    setInterval(() => {
        const shootingStars = document.querySelectorAll('.shooting-star');
        shootingStars.forEach(star => star.remove());
        
        const background = document.getElementById('background');
        if (background) {
            const numShootingStars = 5;
            
            for (let i = 0; i < numShootingStars; i++) {
                const shootingStar = document.createElement('div');
                shootingStar.className = 'shooting-star';
                shootingStar.style.left = `${Math.random() * 70}%`;
                shootingStar.style.top = `${Math.random() * 40}%`;
                shootingStar.style.animationDelay = `${i * 1.5}s`;
                background.appendChild(shootingStar);
            }
        }
    }, 15000);
    
    // Resize event to adjust elements
    window.addEventListener('resize', () => {
        generateCityscape();
        generateRoadLines();
        generateStars();
    });

    // Add active class to current nav link
    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
        }
    });
    
    // Add animation to form inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });
}); 