// Initialize date display
function initializeDateDisplay() {
    const dateElement = document.getElementById('currentDate');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');
    const iconElement = notification.querySelector('.notification-icon i');
    
    // Set message and icon based on type
    messageElement.textContent = message;
    
    if (type === 'success') {
        iconElement.className = 'fas fa-check-circle';
        notification.className = 'notification success visible';
    } else if (type === 'error') {
        iconElement.className = 'fas fa-exclamation-circle';
        notification.className = 'notification error visible';
    } else if (type === 'info') {
        iconElement.className = 'fas fa-info-circle';
        notification.className = 'notification info visible';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(hideNotification, 5000);
}

// Hide notification
function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('visible');
}

// Handle navigation
function handleNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items and sections
            navItems.forEach(navItem => navItem.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Show corresponding section
            const sectionId = item.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// Load user data from Firebase
function loadUserData() {
    const currentUser = auth.currentUser;
    
    console.log('Current user in loadUserData:', currentUser);
    
    if (!currentUser) {
        console.log('No user found, redirecting to login page...');
        window.location.href = 'index.html';
        return;
    }
    
    // Get user data from Firestore
    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                console.log('User data loaded:', userData);
                
                // Update user name in welcome message
                const userNameElements = document.querySelectorAll('#userName, #profileName');
                userNameElements.forEach(element => {
                    element.textContent = userData.name || 'User';
                });
                
                // Update profile email
                const profileEmailElement = document.getElementById('profileEmail');
                if (profileEmailElement) {
                    profileEmailElement.textContent = userData.email || currentUser.email;
                }
                
                // Update member since date
                const memberSinceElement = document.getElementById('memberSince');
                if (memberSinceElement && userData.createdAt) {
                    const createdDate = userData.createdAt.toDate();
                    const options = { year: 'numeric', month: 'long' };
                    memberSinceElement.textContent = createdDate.toLocaleDateString('en-US', options);
                }
                
                // Fill profile form fields if they exist
                if (userData.phoneNumber) {
                    document.getElementById('phoneNumber').value = userData.phoneNumber;
                }
                
                if (userData.address) {
                    document.getElementById('address').value = userData.address;
                }
                
                if (userData.driversLicense) {
                    document.getElementById('driversLicense').value = userData.driversLicense;
                }
                
                if (userData.paymentMethod) {
                    document.getElementById('paymentMethod').value = userData.paymentMethod;
                }
                
                // Set full name field
                document.getElementById('fullName').value = userData.name || '';
            } else {
                console.log('No user document found');
                showNotification("Your profile information could not be loaded.", "error");
            }
        })
        .catch((error) => {
            console.error("Error getting user data:", error);
            showNotification("Failed to load user data. Please try again.", "error");
        });
}

// Handle profile update
function handleProfileUpdate() {
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    
    updateProfileBtn.addEventListener('click', () => {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            showNotification("You must be logged in to update your profile.", "error");
            return;
        }
        
        const fullName = document.getElementById('fullName').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const address = document.getElementById('address').value;
        const driversLicense = document.getElementById('driversLicense').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        
        // Validate inputs
        if (!fullName) {
            showNotification("Please enter your full name.", "error");
            return;
        }
        
        // Show loading state
        updateProfileBtn.textContent = "Updating...";
        updateProfileBtn.disabled = true;
        
        // Update user data in Firestore
        db.collection('users').doc(currentUser.uid).update({
            name: fullName,
            phoneNumber: phoneNumber,
            address: address,
            driversLicense: driversLicense,
            paymentMethod: paymentMethod,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            showNotification("Profile updated successfully!", "success");
            
            // Update displayed name
            const userNameElements = document.querySelectorAll('#userName, #profileName');
            userNameElements.forEach(element => {
                element.textContent = fullName;
            });
        })
        .catch((error) => {
            console.error("Error updating profile:", error);
            showNotification("Failed to update profile. Please try again.", "error");
        })
        .finally(() => {
            // Reset button state
            updateProfileBtn.textContent = "Update Profile";
            updateProfileBtn.disabled = false;
        });
    });
}

// Handle logout
function handleLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', () => {
        signOutUser()
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error("Error signing out:", error);
                showNotification("Failed to log out. Please try again.", "error");
            });
    });
}

// Initialize dashboard
window.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard DOM content loaded');
    
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        console.log('Auth state changed:', user);
        if (user) {
            // User is signed in, initialize dashboard
            console.log('User is signed in, initializing dashboard');
            initializeDateDisplay();
            handleNavigation();
            loadUserData();
            handleProfileUpdate();
            handleLogout();
            
            // Set minimum date for booking form
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('pickupDate').min = today;
            document.getElementById('returnDate').min = today;
            
            // Handle pickup date change to update return date minimum
            document.getElementById('pickupDate').addEventListener('change', function() {
                document.getElementById('returnDate').min = this.value;
            });
        } else {
            // User is not signed in, redirect to login page
            console.log('User is not signed in, redirecting to login page');
            window.location.href = 'index.html';
        }
    });
}); 