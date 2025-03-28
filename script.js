// Add this at the beginning of the file, after any other initialization
// Global flag to prevent multiple redirects
let redirectionInProgress = false;

// Use a localStorage flag instead of a variable that gets reset on page reload
if (localStorage.getItem('isRedirecting')) {
    console.log('Redirection flag found in localStorage, clearing it');
    localStorage.removeItem('isRedirecting');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - Starting initialization');
    
    // Generate visual elements first, before any auth checks
    try {
        generateStars();
        addBackgroundStyles();
        addFlickerAnimation();
        animateCar();
        addParallaxEffect();
        createSmokeEffect();
    } catch (error) {
        console.error('Error initializing visual elements:', error);
    }
    
    // IMPORTANT: Only perform redirection logic on the index page
    const onIndexPage = window.location.pathname.includes('index.html') || 
                       window.location.pathname.endsWith('/') ||
                       window.location.pathname === '';
                       
    if (onIndexPage) {
        console.log('On index page, setting up auth state change listener for redirection');
        
        // Check for recent redirects to prevent loops
        const lastRedirectTime = parseInt(sessionStorage.getItem('lastRedirectTime') || '0');
        const currentTime = Date.now();
        
        // If we've redirected within the last 3 seconds, don't check auth state yet
        if (currentTime - lastRedirectTime < 3000) {
            console.log('Recently redirected to index page, delaying auth check');
            // Set up login form handlers first
            setupLoginForm();
            setupRegistrationForm();
            setupForgotPasswordForm();
            
            // Wait a bit before checking auth state to prevent immediate redirects
            setTimeout(() => {
                setupAuthStateListener();
            }, 2000);
        } else {
            // Normal flow - check auth state immediately
            setupAuthStateListener();
            setupLoginForm();
            setupRegistrationForm();
            setupForgotPasswordForm();
        }
    } else {
        console.log('Not on index page, skipping automatic redirection on load');
    }
});

// Function to set up the auth state change listener
function setupAuthStateListener() {
    // Set up a one-time auth state listener to prevent multiple redirects
    const unsubscribe = auth.onAuthStateChanged(user => {
        console.log('Auth state change detected on index page');
        
        if (user) {
            console.log('User already logged in on index page, checking role...');
            
            // Get user data from Firestore to determine role
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const userData = doc.data();
                        console.log('User role found:', userData.userType);
                        
                        // Set timestamp to prevent redirect loops
                        const currentTime = Date.now();
                        sessionStorage.setItem('lastRedirectTime', currentTime.toString());
                        
                        // Redirect based on user type - use replace instead of href
                        if (userData.userType === 'agent') {
                            console.log('Redirecting agent to agent dashboard');
                            window.location.replace('agent-dashboard.html');
                        } else {
                            console.log('Redirecting customer to customer dashboard');
                            window.location.replace('dashboard.html');
                        }
                    } else {
                        // If no user data exists
                        console.error('User document does not exist');
                        
                        // Sign out user if no user data exists
                        auth.signOut().then(() => {
                            showNotification('User data not found. Please login again.', 'error');
                        });
                    }
                })
                .catch(error => {
                    console.error('Error checking user role:', error);
                    showNotification('Error verifying your account. Please try again.', 'error');
                });
        } else {
            console.log('No user logged in on index page - no redirection needed');
        }
        
        // Unsubscribe after first auth check to prevent multiple checks
        unsubscribe();
    });
}

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
    const form = document.querySelector('#loginForm form');
    
    // Set the title based on login type
    if (type === 'agent') {
        loginTitle.textContent = 'Agent Login';
        form.id = 'agent-login-form';
    } else {
        loginTitle.textContent = 'Customer Login';
        form.id = 'customer-login-form';
    }
    
    // Clear any previous inputs
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('rememberMe').checked = false;
    
    // Clear any previous errors
    const errorMessage = document.getElementById('loginErrorMessage');
    errorMessage.textContent = '';
    errorMessage.classList.remove('active');
    
    // Show the form with animation
    loginForm.style.display = 'flex';
    setTimeout(() => {
        loginForm.style.opacity = '1';
        loginForm.classList.add('active');
    }, 10);
    
    // Focus the email field
    document.getElementById('email').focus();
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
    hideLoginForm();
    const signupForm = document.getElementById('signupForm');
    
    // Add direct onclick attribute to signup button
    const signupButton = document.getElementById('signupButton');
    if (signupButton) {
        signupButton.onclick = handleSignup;
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
    hideLoginForm();
    const resetForm = document.getElementById('resetPasswordForm');
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

// Helper to show error message
function showError(message) {
    const errorElement = document.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('active');
    } else {
        console.error('Error element not found, message:', message);
    }
}

// Handle login form submission
async function handleLogin() {
    console.log('Login button clicked');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Track if this is an agent login
    const isAgentLogin = document.getElementById('loginTitle') && 
                         document.getElementById('loginTitle').textContent.includes('Agent');
    
    console.log('Login attempt with email:', email, 'as', isAgentLogin ? 'agent' : 'customer');
    
    if (!email || !password) {
        showError('Please enter both email and password.');
        return;
    }
    
    // Show loading state
    const loginButton = document.getElementById('loginButton');
    loginButton.textContent = 'Logging in...';
    loginButton.disabled = true;
    
    try {
        // Check if Firebase is initialized properly
        if (!firebase || !auth || !db) {
            throw new Error('Firebase is not properly initialized');
        }
        
        // Try to sign in
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Sign in successful');
        
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
        
        if (!userDoc.exists) {
            console.error('User document does not exist');
            throw new Error('User data not found');
        }
        
        const userData = userDoc.data();
        
        // Check if user type matches login attempt type
        if (isAgentLogin && userData.userType !== 'agent') {
            console.log('Customer attempting to log in as agent');
            await auth.signOut();
            showError('This account does not have agent privileges.');
            loginButton.textContent = 'Login';
            loginButton.disabled = false;
            return;
        }
        
        // Login successful
        hideLoginForm();
        showNotification('Login successful! Redirecting to dashboard...', 'success');
        
        // Set redirection flag to prevent loops
        localStorage.setItem('isRedirecting', 'true');
        
        // Redirect to appropriate dashboard based on user type
        setTimeout(() => {
            if (userData.userType === 'agent') {
                window.location.replace('agent-dashboard.html');
            } else {
                window.location.replace('dashboard.html');
            }
        }, 1000);
    } catch (error) {
        console.error('Login error details:', error);
        
        // Handle errors
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
            default:
                errorMessage = `Error: ${error.message || error}`;
        }
        
        showError(errorMessage);
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
    
    // Track if the signup is from agent login form
    const isAgentSignup = document.getElementById('loginTitle') && 
                          document.getElementById('loginTitle').textContent.includes('Agent');
    
    console.log('Signup attempt with email:', email);
    
    if (!name || !email || !password || !confirmPassword) {
        showError('Please fill in all fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match.');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long.');
        return;
    }
    
    // Show loading state
    const signupButton = document.getElementById('signupButton');
    signupButton.textContent = 'Creating Account...';
    signupButton.disabled = true;
    
    try {
        console.log('Attempting to create user...');
        
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('User account created:', userCredential);
        
        // Update display name
        await userCredential.user.updateProfile({
            displayName: name
        });
        console.log('Display name updated');
        
        // Determine user type based on signup source
        const userType = isAgentSignup ? 'agent' : 'customer';
        
        // Add user data to Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            userType: userType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('User data added to Firestore');
        
        // Signup successful, hide form
        hideSignupForm();
        
        // Show success notification
        showNotification('Account created successfully! Redirecting to dashboard...', 'success');
        
        // Redirect to appropriate dashboard based on user type
        setTimeout(() => {
            if (userType === 'agent') {
                window.location.href = 'agent-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 1500);
    } catch (error) {
        console.error('Signup error details:', error);
        
        // Handle specific errors
        let errorMessage = 'Failed to create account. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already in use. Please try another email or login.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak. Please choose a stronger password.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your internet connection.';
                break;
            default:
                console.error('Signup error:', error);
                errorMessage = `An unexpected error occurred: ${error.message || error}. Please try again.`;
        }
        
        showError(errorMessage);
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
        showError('Please enter your email address.');
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
            
            showError(errorMessage);
        })
        .finally(() => {
            // Reset button state
            resetButton.textContent = 'Send Reset Link';
            resetButton.disabled = false;
        });
}

// Tab navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabLinks = document.querySelectorAll('.nav-links a[data-tab]');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    console.log('Tab links found:', tabLinks.length);
    console.log('Tab panes found:', tabPanes.length);
    
    // Show home tab by default
    document.querySelector('.tab-pane[data-tab="home"]')?.classList.add('active');
    document.querySelector('.nav-links a[data-tab="home"]')?.classList.add('active');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetTab = this.getAttribute('data-tab');
            console.log('Tab clicked:', targetTab);
            
            // Remove active class from all tabs and panes
            tabLinks.forEach(link => link.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to current tab and pane
            this.classList.add('active');
            
            const targetPane = document.querySelector(`.tab-pane[data-tab="${targetTab}"]`);
            if (targetPane) {
                targetPane.classList.add('active');
                console.log('Tab activated:', targetTab);
            } else {
                console.error('Tab pane not found for:', targetTab);
            }
        });
    });
});

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
        
        // Initialize button event listeners
        const bookNowBtn = document.querySelector('.book-now');
        if (bookNowBtn) {
            bookNowBtn.addEventListener('click', function() {
                showLoginForm('customer');
            });
        }

        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                showLoginForm('agent');
            });
        }

        // Don't run these if the elements don't exist
        const carImage = document.querySelector('.car-image');
        if (carImage) {
            animateCar();
        }
        
        // Add parallax effect
        addParallaxEffect();
    } catch (error) {
        console.error('Error initializing UI components:', error);
    }

    // Tab Navigation
    const navLinks = document.querySelectorAll('.nav-links a');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and tabs
            navLinks.forEach(l => l.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked link and corresponding tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });
});

function loginUser(formData, userType) {
    const emailInput = formData.get('email');
    const passwordInput = formData.get('password');
    
    console.log('Login attempt:', emailInput, passwordInput ? '******' : 'empty');
    
    if (!emailInput || !passwordInput) {
        showError('Please enter both email and password');
        return;
    }
    
    // Reset any previous errors
    document.querySelector('.error-message').classList.remove('active');
    
    // Add loading state
    const submitBtn = document.querySelector(`#${userType}-login-form .submit-btn`);
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    // Authentication with Firebase
    firebase.auth().signInWithEmailAndPassword(emailInput, passwordInput)
        .then((userCredential) => {
            // Successful login
            const user = userCredential.user;
            showNotification(`Welcome back, ${user.email.split('@')[0]}!`, 'success');
            
            // Redirect based on user type
            setTimeout(() => {
                if (userType === 'agent') {
                    window.location.href = 'agent-dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);
        })
        .catch((error) => {
            console.error('Login error:', error.code, error.message);
            let errorMessage = 'Invalid email or password';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else {
                errorMessage = 'An error occurred. Please try again.';
            }
            showError(errorMessage);
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// Event listeners for login form submission
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up form submission handlers');
    
    // Listen for form submission event in the login modal
    document.addEventListener('submit', function(e) {
        const form = e.target;
        
        // Check if this is a login form
        if (form.id === 'customer-login-form' || form.id === 'agent-login-form') {
            e.preventDefault();
            console.log('Login form submitted:', form.id);
            
            const formData = new FormData(form);
            const userType = form.id === 'agent-login-form' ? 'agent' : 'customer';
            loginUser(formData, userType);
        }
    });
    
    // Setup buttons to show forms
    const bookNowBtn = document.querySelector('.book-now');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', function() {
            showLoginForm('customer');
        });
    }

    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            showLoginForm('agent');
        });
    }
}); 