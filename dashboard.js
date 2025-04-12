// Initialize date display
function initializeDateDisplay() {
    const dateElement = document.getElementById('currentDate');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Add CSS style for vehicle-type-display
const styleElement = document.createElement('style');
styleElement.textContent = `
    .vehicle-type-display {
        height: 160px;
        background-color: #f0f4ff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }
    
    .vehicle-type-display .type-icon {
        font-size: 48px;
        color: #3a86ff;
        margin-bottom: 10px;
    }
    
    .vehicle-type-display .type-label {
        font-size: 18px;
        font-weight: 600;
        color: #333;
    }
    
    .rental-type-display {
        width: 70px;
        height: 70px;
        background-color: #f0f4ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
    }
    
    .rental-type-display .type-icon {
        font-size: 32px;
        color: #3a86ff;
    }
    
    /* Booking History Table Styles */
    .rental-history-table {
        width: 100%;
        padding: 20px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    
    .rental-history-table h3 {
        font-size: 20px;
        margin-bottom: 20px;
        color: #333;
    }
    
    .bookings-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        text-align: left;
    }
    
    .bookings-table th {
        padding: 12px 15px;
        background-color: #f8f9fa;
        border-bottom: 2px solid #e9ecef;
        font-weight: 600;
        color: #495057;
    }
    
    .bookings-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #e9ecef;
        color: #495057;
    }
    
    .bookings-table tr:hover {
        background-color: #f8f9fa;
    }
    
    .vehicle-info {
        display: flex;
        align-items: center;
    }
    
    .vehicle-name {
        font-weight: 500;
    }
    
    .status-badge {
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        display: inline-block;
    }
    
    .status-badge.status-confirmed {
        background-color: #e3f2fd;
        color: #1976d2;
    }
    
    .status-badge.status-active {
        background-color: #e8f5e9;
        color: #388e3c;
    }
    
    .status-badge.status-completed {
        background-color: #e0f2f1;
        color: #00897b;
    }
    
    .status-badge.status-cancelled {
        background-color: #ffebee;
        color: #d32f2f;
    }
    
    .status-badge.status-pending {
        background-color: #fff8e1;
        color: #ffa000;
    }
    
    .actions-cell {
        white-space: nowrap;
    }
    
    .actions-cell button {
        padding: 5px 10px;
        margin-right: 5px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.3s;
    }
    
    .actions-cell .cancel-btn {
        background-color: #ffebee;
        color: #d32f2f;
    }
    
    .actions-cell .cancel-btn:hover {
        background-color: #ffcdd2;
    }
    
    .actions-cell .review-btn {
        background-color: #e3f2fd;
        color: #1976d2;
    }
    
    .actions-cell .review-btn:hover {
        background-color: #bbdefb;
    }
    
    .actions-cell .details-btn {
        background-color: #f5f5f5;
        color: #616161;
    }
    
    .actions-cell .details-btn:hover {
        background-color: #e0e0e0;
    }
    
    /* Booking Details Modal Styles */
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
    }
    
    .modal.show {
        opacity: 1;
        visibility: visible;
    }
    
    .modal-content {
        width: 90%;
        max-width: 600px;
        background-color: #fff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        transform: scale(0.9);
        transition: transform 0.3s;
    }
    
    .modal.show .modal-content {
        transform: scale(1);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 20px;
        color: #333;
    }
    
    .close-modal {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6c757d;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .booking-id {
        font-size: 14px;
        color: #6c757d;
        margin-bottom: 20px;
    }
    
    .booking-details-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .booking-vehicle-details {
        text-align: center;
        padding-bottom: 20px;
        border-bottom: 1px solid #e9ecef;
    }
    
    .vehicle-icon-large {
        width: 80px;
        height: 80px;
        background-color: #f0f4ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 15px;
    }
    
    .vehicle-icon-large i {
        font-size: 40px;
        color: #3a86ff;
    }
    
    .booking-vehicle-details h3 {
        margin: 0 0 5px;
        font-size: 18px;
        color: #333;
    }
    
    .booking-vehicle-details .vehicle-type {
        margin: 0;
        color: #6c757d;
    }
    
    .booking-info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }
    
    .info-item {
        display: flex;
        align-items: flex-start;
        gap: 15px;
    }
    
    .info-item i {
        color: #3a86ff;
        font-size: 18px;
        margin-top: 3px;
    }
    
    .info-item div {
        flex: 1;
    }
    
    .info-item strong {
        display: block;
        font-size: 14px;
        margin-bottom: 5px;
        color: #495057;
    }
    
    .info-item p {
        margin: 0;
        color: #212529;
    }
    
    .price-breakdown {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        margin-top: 10px;
    }
    
    .price-breakdown h4 {
        margin: 0 0 10px;
        font-size: 16px;
        color: #333;
    }
    
    .price-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 14px;
        color: #495057;
    }
    
    .price-item.total {
        border-top: 1px solid #e9ecef;
        margin-top: 8px;
        padding-top: 8px;
        font-weight: 600;
        color: #212529;
    }
    
    .booking-status-large {
        text-align: center;
        margin-top: 10px;
    }
    
    .booking-status-large .status-badge {
        font-size: 14px;
        padding: 8px 15px;
    }
    
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 15px 20px;
        background-color: #f8f9fa;
        border-top: 1px solid #e9ecef;
    }
    
    .modal-footer button {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
    }
    
    .cancel-booking-btn {
        background-color: #ffebee;
        color: #d32f2f;
    }
    
    .cancel-booking-btn:hover {
        background-color: #ffcdd2;
    }
    
    .close-modal-btn {
        background-color: #e9ecef;
        color: #495057;
    }
    
    .close-modal-btn:hover {
        background-color: #dee2e6;
    }
    
    /* Loading spinner */
    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: #6c757d;
    }
    
    .loading-spinner i {
        font-size: 30px;
        margin-bottom: 15px;
        color: #3a86ff;
    }
    
    /* Review Modal Styles */
    .review-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    
    .rating-selector {
        text-align: center;
    }
    
    .rating-selector p {
        margin-bottom: 10px;
        font-weight: 500;
        color: #333;
    }
    
    .stars-container {
        display: flex;
        justify-content: center;
        gap: 10px;
    }
    
    .stars-container i {
        font-size: 30px;
        color: #ffc107;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .stars-container i:hover {
        transform: scale(1.2);
    }
    
    .form-group {
        margin-top: 20px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
    }
    
    .form-group textarea {
        width: 100%;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #ddd;
        font-family: inherit;
        resize: vertical;
        min-height: 100px;
    }
    
    .submit-review-btn {
        background-color: #4caf50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.3s;
    }
    
    .submit-review-btn:hover {
        background-color: #388e3c;
    }
    
    .submit-review-btn:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
    
    /* Loading spinner */
`;
document.head.appendChild(styleElement);

// Show notification
function showNotification(message, type = 'success') {
    // Check if notification element exists, create if it doesn't
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        
        const notificationContent = document.createElement('div');
        notificationContent.className = 'notification-content';
        
        const notificationMessage = document.createElement('p');
        notificationMessage.id = 'notificationMessage';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.addEventListener('click', hideNotification);
        
        notificationContent.appendChild(notificationMessage);
        notification.appendChild(notificationContent);
        notification.appendChild(closeButton);
        
        document.body.appendChild(notification);
    }
    
    const messageElement = document.getElementById('notificationMessage');
    messageElement.textContent = message;
    
    // Set type class
    notification.className = 'notification';
    notification.classList.add(type);
    notification.classList.add('visible');
    
    // Auto-hide after 5 seconds
    setTimeout(hideNotification, 5000);
}

// Hide notification
function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
    notification.classList.remove('visible');
    }
}

// Handle navigation
function handleNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Get the section to show
            const sectionToShow = item.getAttribute('data-section');
            
            // Remove active class from all navigation items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Show the selected section
            const selectedSection = document.getElementById(sectionToShow);
            if (selectedSection) {
                selectedSection.classList.add('active');
                
                // Special handling for history section
                if (sectionToShow === 'history') {
                    const user = firebase.auth().currentUser;
                    if (user) {
                        console.log('Loading booking history on navigation to history tab');
                        loadBookingHistory(user.uid);
                    }
                }
                
                // Special handling for book section
                if (sectionToShow === 'book') {
                    console.log('Loading available vehicles on navigation to book tab');
                    loadAvailableVehicles();
                }
            }
        });
    });
    
    // Handle URL hash for direct navigation
    const handleHashChange = () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const targetNavItem = document.querySelector(`.nav-item[data-section="${hash}"]`);
            if (targetNavItem) {
                targetNavItem.click();
            }
        }
    };
    
    // Initial hash check
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
}

// Load user data
async function loadUserData() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.error('No user found when trying to load user data');
            return;
        }
        
        console.log('Loading user data for:', user.uid);
        
        // Update user name in the UI
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.displayName || user.email.split('@')[0];
        }
    
        // Fetch user data from Firestore
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
                console.log('User data loaded:', userData);
                
            // Update user name with data from Firestore if available
            if (userData.name && userNameElement) {
                userNameElement.textContent = userData.name;
            }
            
            // Update profile fields if they exist
            updateProfileFields(userData);
            
            // Update user metrics if they exist
            updateUserMetrics(userData);
        } else {
            console.warn('User document does not exist in Firestore');
            showNotification('User profile could not be loaded completely', 'warning');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Failed to load user profile data', 'error');
    }
}

// Update profile fields with user data
function updateProfileFields(userData) {
    // Only update if we're on the profile section
    const fullNameInput = document.getElementById('fullName');
    if (!fullNameInput) return;
    
    // Set values for all profile fields
    if (userData.name) fullNameInput.value = userData.name;
    
    const phoneNumberInput = document.getElementById('phoneNumber');
    if (phoneNumberInput && userData.phoneNumber) phoneNumberInput.value = userData.phoneNumber;
    
    const dateOfBirthInput = document.getElementById('dateOfBirth');
    if (dateOfBirthInput && userData.dateOfBirth) dateOfBirthInput.value = userData.dateOfBirth;
    
    const addressInput = document.getElementById('address');
    if (addressInput && userData.address) addressInput.value = userData.address;
    
    const cityInput = document.getElementById('city');
    if (cityInput && userData.city) cityInput.value = userData.city;
    
    const stateInput = document.getElementById('state');
    if (stateInput && userData.state) stateInput.value = userData.state;
    
    const postalCodeInput = document.getElementById('postalCode').value = userData.postalCode;
}

// Update user metrics in the dashboard
function updateUserMetrics(userData) {
    // Active rentals
    const activeRentalsElement = document.getElementById('activeRentals');
    if (activeRentalsElement && userData.activeRentals !== undefined) {
        activeRentalsElement.textContent = userData.activeRentals || '0';
                }
                
    // Total trips
    const totalTripsElement = document.getElementById('totalTrips');
    if (totalTripsElement && userData.totalTrips !== undefined) {
        totalTripsElement.textContent = userData.totalTrips || '0';
                }
                
    // Loyalty points
    const loyaltyPointsElement = document.getElementById('loyaltyPoints');
    if (loyaltyPointsElement && userData.loyaltyPoints !== undefined) {
        loyaltyPointsElement.textContent = userData.loyaltyPoints || '0';
                }
                
    // User rating
    const userRatingElement = document.getElementById('userRating');
    if (userRatingElement && userData.rating !== undefined) {
        userRatingElement.textContent = userData.rating || '5.0';
    }
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
        
        // Get all form values
        const fullName = document.getElementById('fullName').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        
        // Address fields
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const postalCode = document.getElementById('postalCode').value;
        
        // Driver information
        const driversLicense = document.getElementById('driversLicense').value;
        const licenseExpiration = document.getElementById('licenseExpiration').value;
        
        // Payment information
        const paymentMethod = document.getElementById('paymentMethod').value;
        
        // Validate inputs
        if (!fullName) {
            showNotification("Please enter your full name.", "error");
            return;
        }
        
        // Show loading state
        updateProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        updateProfileBtn.disabled = true;
        
        // Update user data in Firestore
        db.collection('users').doc(currentUser.uid).update({
            name: fullName,
            phoneNumber: phoneNumber,
            dateOfBirth: dateOfBirth,
            address: address,
            city: city,
            state: state,
            postalCode: postalCode,
            driversLicense: driversLicense,
            licenseExpiration: licenseExpiration,
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
            updateProfileBtn.innerHTML = 'Update Profile';
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
                console.log('User signed out');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error("Error signing out:", error);
                showNotification("Failed to log out. Please try again.", "error");
            });
    });
}

// Handle password visibility toggle
function handlePasswordToggles() {
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = button.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
}

// Check password strength and requirements
function handlePasswordStrength() {
    const newPasswordInput = document.getElementById('newPassword');
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');
    
    // Password requirement elements
    const lengthCheck = document.getElementById('length-check');
    const uppercaseCheck = document.getElementById('uppercase-check');
    const lowercaseCheck = document.getElementById('lowercase-check');
    const numberCheck = document.getElementById('number-check');
    const specialCheck = document.getElementById('special-check');
    
    newPasswordInput.addEventListener('input', () => {
        const password = newPasswordInput.value;
        let strength = 0;
        
        // Update requirement checks
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        
        updateRequirementCheck(lengthCheck, hasLength);
        updateRequirementCheck(uppercaseCheck, hasUppercase);
        updateRequirementCheck(lowercaseCheck, hasLowercase);
        updateRequirementCheck(numberCheck, hasNumber);
        updateRequirementCheck(specialCheck, hasSpecial);
        
        // Calculate strength
        if (hasLength) strength += 20;
        if (hasUppercase) strength += 20;
        if (hasLowercase) strength += 20;
        if (hasNumber) strength += 20;
        if (hasSpecial) strength += 20;
        
        // Update strength bar
        strengthBar.style.width = strength + '%';
        
        // Update strength text and color
        if (strength <= 20) {
            strengthBar.style.backgroundColor = '#ff4d4d'; // Red
            strengthText.textContent = 'Very Weak';
            strengthText.style.color = '#ff4d4d';
        } else if (strength <= 40) {
            strengthBar.style.backgroundColor = '#ffa64d'; // Orange
            strengthText.textContent = 'Weak';
            strengthText.style.color = '#ffa64d';
        } else if (strength <= 60) {
            strengthBar.style.backgroundColor = '#ffff4d'; // Yellow
            strengthText.textContent = 'Fair';
            strengthText.style.color = '#b3b300';
        } else if (strength <= 80) {
            strengthBar.style.backgroundColor = '#4dff4d'; // Light Green
            strengthText.textContent = 'Good';
            strengthText.style.color = '#4dff4d';
        } else {
            strengthBar.style.backgroundColor = '#00cc00'; // Green
            strengthText.textContent = 'Strong';
            strengthText.style.color = '#00cc00';
        }
    });
}

// Update requirement check icons
function updateRequirementCheck(element, isValid) {
    const icon = element.querySelector('i');
    
    if (isValid) {
        icon.className = 'fas fa-check-circle valid';
        element.style.color = 'var(--success-color)';
    } else {
        icon.className = 'fas fa-circle';
        element.style.color = 'var(--text-light)';
    }
}

// Handle password change
function handlePasswordChange() {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    
    changePasswordBtn.addEventListener('click', () => {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            showNotification("You must be logged in to change your password.", "error");
            return;
        }
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate inputs
        if (!currentPassword) {
            showNotification("Please enter your current password.", "error");
            return;
        }
        
        if (!newPassword) {
            showNotification("Please enter a new password.", "error");
            return;
        }
        
        if (newPassword.length < 8) {
            showNotification("Password must be at least 8 characters long.", "error");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification("New passwords do not match.", "error");
            return;
        }
        
        // Show loading state
        changePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        changePasswordBtn.disabled = true;
        
        // Reauthenticate before changing password
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );
        
        currentUser.reauthenticateWithCredential(credential)
            .then(() => {
                // User reauthenticated, now change password
                return currentUser.updatePassword(newPassword);
            })
            .then(() => {
                showNotification("Password updated successfully!", "success");
                
                // Clear password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                
                // Reset password strength indicator
                document.getElementById('passwordStrengthBar').style.width = '0';
                document.getElementById('passwordStrengthText').textContent = 'None';
                document.getElementById('passwordStrengthText').style.color = 'var(--text-light)';
                
                // Reset requirement checks
                const requirements = document.querySelectorAll('.requirements-list li');
                requirements.forEach(item => {
                    const icon = item.querySelector('i');
                    icon.className = 'fas fa-circle';
                    item.style.color = 'var(--text-light)';
                });
            })
            .catch((error) => {
                console.error("Error updating password:", error);
                
                if (error.code === 'auth/wrong-password') {
                    showNotification("Current password is incorrect.", "error");
                } else if (error.code === 'auth/weak-password') {
                    showNotification("New password is too weak.", "error");
                } else {
                    showNotification("Failed to update password. Please try again.", "error");
                }
            })
            .finally(() => {
                // Reset button state
                changePasswordBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Update Password';
                changePasswordBtn.disabled = false;
            });
    });
}

// Handle star rating selection
function handleStarRating() {
    const starRating = document.getElementById('ratingStars');
    const stars = starRating.querySelectorAll('i');
    const selectedRating = document.getElementById('selectedRating');
    
    // Handle star click
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            selectedRating.value = rating;
            
            // Update star display
            updateStars(stars, rating);
        });
        
        // Handle hover effects
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.className = 'fas fa-star';
                } else {
                    s.className = 'far fa-star';
                }
            });
        });
    });
    
    // Reset to selected rating on mouse leave
    starRating.addEventListener('mouseleave', () => {
        const rating = parseInt(selectedRating.value);
        updateStars(stars, rating);
    });
}

// Update stars based on rating
function updateStars(stars, rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fas fa-star';
        } else {
            star.className = 'far fa-star';
        }
    });
}

// Handle review submission
function handleReviewSubmission() {
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    
    submitReviewBtn.addEventListener('click', () => {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            showNotification("You must be logged in to submit a review.", "error");
            return;
        }
        
        const rentalId = document.getElementById('reviewRental').value;
        const rating = document.getElementById('selectedRating').value;
        const comments = document.getElementById('reviewComments').value;
        
        // Validate inputs
        if (!rentalId) {
            showNotification("Please select a rental to review.", "error");
            return;
        }
        
        if (rating === "0") {
            showNotification("Please select a rating.", "error");
            return;
        }
        
        if (!comments) {
            showNotification("Please share your experience in the comments.", "error");
            return;
        }
        
        // Show loading state
        submitReviewBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitReviewBtn.disabled = true;
        
        // Submit review to Firestore
        db.collection('reviews').add({
            userId: currentUser.uid,
            rentalId: rentalId,
            rating: parseInt(rating),
            comments: comments,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            // Update the rental with the review info
            return db.collection('rentals').doc(rentalId).update({
                hasReview: true,
                rating: parseInt(rating)
            });
        })
        .then(() => {
            showNotification("Review submitted successfully!", "success");
            
            // Reset form
            document.getElementById('reviewRental').value = '';
            document.getElementById('selectedRating').value = '0';
            document.getElementById('reviewComments').value = '';
            
            // Reset stars
            const stars = document.querySelectorAll('#ratingStars i');
            updateStars(stars, 0);
            
            // Refresh reviews list
            loadUserReviews();
        })
        .catch((error) => {
            console.error("Error submitting review:", error);
            showNotification("Failed to submit review. Please try again.", "error");
        })
        .finally(() => {
            // Reset button state
            submitReviewBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
            submitReviewBtn.disabled = false;
        });
    });
}

// Load user reviews
function loadUserReviews() {
    const currentUser = getCurrentUser();
    const reviewsList = document.getElementById('userReviewsList');
    
    if (!currentUser) {
        return;
    }
    
    // Clear current content
    reviewsList.innerHTML = '<div class="loading-reviews"><i class="fas fa-spinner fa-spin"></i><p>Loading your reviews...</p></div>';
    
    // Get user's reviews from Firestore
    db.collection('reviews')
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                reviewsList.innerHTML = `
                    <div class="empty-reviews">
                        <i class="fas fa-comment-slash"></i>
                        <p>You haven't submitted any reviews yet</p>
                    </div>
                `;
                return;
            }
            
            // Clear loading state
            reviewsList.innerHTML = '';
            
            // Process each review
            querySnapshot.forEach((doc) => {
                const reviewData = doc.data();
                
                // Get rental details
                db.collection('rentals').doc(reviewData.rentalId).get()
                    .then((rentalDoc) => {
                        if (rentalDoc.exists) {
                            const rentalData = rentalDoc.data();
                            const vehicleType = rentalData.vehicleType || 'Vehicle';
                            
                            // Format date
                            const reviewDate = reviewData.createdAt.toDate();
                            const formattedDate = reviewDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });
                            
                            // Create stars HTML
                            let starsHTML = '';
                            for (let i = 1; i <= 5; i++) {
                                if (i <= reviewData.rating) {
                                    starsHTML += '<i class="fas fa-star"></i>';
                                } else {
                                    starsHTML += '<i class="far fa-star"></i>';
                                }
                            }
                            
                            // Create review item
                            const reviewItem = document.createElement('div');
                            reviewItem.className = 'review-item';
                            reviewItem.innerHTML = `
                                <div class="review-item-header">
                                    <div class="review-car">${vehicleType}</div>
                                    <div class="review-date">${formattedDate}</div>
                                </div>
                                <div class="review-rating">
                                    ${starsHTML}
                                </div>
                                <p class="review-comment">${reviewData.comments}</p>
                            `;
                            
                            // Add to list
                            reviewsList.appendChild(reviewItem);
                        }
                    })
                    .catch((error) => {
                        console.error("Error getting rental:", error);
                    });
            });
        })
        .catch((error) => {
            console.error("Error loading reviews:", error);
            reviewsList.innerHTML = `
                <div class="empty-reviews">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load reviews. Please try again.</p>
                </div>
            `;
        });
}

// Load rental options for review
function loadRentalOptions() {
    const currentUser = getCurrentUser();
    const rentalSelect = document.getElementById('reviewRental');
    
    if (!currentUser) {
        return;
    }
    
    // Clear current options except the default
    while (rentalSelect.options.length > 1) {
        rentalSelect.remove(1);
    }
    
    // Get user's completed rentals from Firestore
    db.collection('rentals')
        .where('userId', '==', currentUser.uid)
        .where('status', '==', 'completed')
        .where('hasReview', '==', false)
        .orderBy('returnDate', 'desc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                const option = document.createElement('option');
                option.text = 'No completed rentals found';
                option.disabled = true;
                rentalSelect.add(option);
                return;
            }
            
            // Add each rental as an option
            querySnapshot.forEach((doc) => {
                const rentalData = doc.data();
                const vehicleType = rentalData.vehicleType || 'Vehicle';
                
                // Format dates
                const pickupDate = rentalData.pickupDate.toDate();
                const returnDate = rentalData.returnDate.toDate();
                
                const formattedDates = `${pickupDate.toLocaleDateString()} - ${returnDate.toLocaleDateString()}`;
                
                const option = document.createElement('option');
                option.value = doc.id;
                option.text = `${vehicleType} (${formattedDates})`;
                rentalSelect.add(option);
            });
        })
        .catch((error) => {
            console.error("Error loading rental options:", error);
            const option = document.createElement('option');
            option.text = 'Error loading rentals';
            option.disabled = true;
            rentalSelect.add(option);
        });
}

// Handle rental history display and filtering
function handleRentalHistory() {
    const historyTableBody = document.getElementById('historyTableBody');
    const emptyHistoryContainer = document.getElementById('emptyHistoryContainer');
    const historySearch = document.getElementById('historySearch');
    const historyFilter = document.getElementById('historyFilter');
    const bookFromHistoryBtn = document.getElementById('bookFromHistoryBtn');
    
    let allRentals = []; // Store all rentals for filtering
    
    // Load rental history from Firestore
    function loadRentalHistory() {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            return;
        }
        
        // Show loading state
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 20px; margin-bottom: 10px; display: block;"></i>
                    <p>Loading your rental history...</p>
                </td>
            </tr>
        `;
        
        // Get user's rentals from Firestore
        db.collection('rentals')
            .where('userId', '==', currentUser.uid)
            .orderBy('pickupDate', 'desc')
            .get()
            .then((querySnapshot) => {
                allRentals = []; // Clear previous rentals
                
                if (querySnapshot.empty) {
                    // Show empty state
                    historyTableBody.innerHTML = '';
                    emptyHistoryContainer.style.display = 'flex';
                    return;
                }
                
                // Hide empty state
                emptyHistoryContainer.style.display = 'none';
                
                // Process each rental
                querySnapshot.forEach((doc) => {
                    const rentalData = doc.data();
                    
                    // Store rental with doc ID for filtering
                    allRentals.push({
                        id: doc.id,
                        ...rentalData
                    });
                });
                
                // Apply current filter
                filterRentals();
            })
            .catch((error) => {
                console.error("Error loading rental history:", error);
                historyTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 30px; color: var(--danger-color);">
                            <i class="fas fa-exclamation-circle" style="font-size: 20px; margin-bottom: 10px; display: block;"></i>
                            <p>Failed to load rental history. Please try again.</p>
                        </td>
                    </tr>
                `;
            });
    }
    
    // Filter rentals based on search and filter selections
    function filterRentals() {
        const searchTerm = historySearch.value.toLowerCase();
        const filterValue = historyFilter.value;
        
        // Clear table
        historyTableBody.innerHTML = '';
        
        // Filter rentals
        const filteredRentals = allRentals.filter(rental => {
            // Apply status filter
            if (filterValue !== 'all' && rental.status !== filterValue) {
                return false;
            }
            
            // Apply search filter (check vehicle type and location)
            if (searchTerm) {
                const vehicleType = (rental.vehicleType || '').toLowerCase();
                const location = (rental.location || '').toLowerCase();
                
                return vehicleType.includes(searchTerm) || location.includes(searchTerm);
            }
            
            return true;
        });
        
        // Check if we have any results after filtering
        if (filteredRentals.length === 0) {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-light);">
                        <i class="fas fa-search" style="font-size: 20px; margin-bottom: 10px; display: block;"></i>
                        <p>No rentals found matching your filters.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Render filtered rentals
        filteredRentals.forEach(rental => {
            // Format dates
            const pickupDate = rental.pickupDate.toDate();
            const returnDate = rental.returnDate.toDate();
            
            const formattedPickup = pickupDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const formattedReturn = returnDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Format location
            const location = formatLocation(rental.location);
            
            // Format total price
            const totalPrice = formatCurrency(rental.totalPrice);
            
            // Create status badge
            const statusBadge = `<span class="status-badge status-${rental.status}">${capitalizeFirstLetter(rental.status)}</span>`;
            
            // Create table row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rental.vehicleType || 'Vehicle'}</td>
                <td>${formattedPickup}</td>
                <td>${formattedReturn}</td>
                <td>${location}</td>
                <td>${totalPrice}</td>
                <td>${statusBadge}</td>
            `;
            
            historyTableBody.appendChild(row);
        });
    }
    
    // Format location from code to readable name
    function formatLocation(locationCode) {
        const locationMap = {
            'new-york': 'New York',
            'los-angeles': 'Los Angeles',
            'chicago': 'Chicago',
            'miami': 'Miami',
            'san-francisco': 'San Francisco'
        };
        
        return locationMap[locationCode] || locationCode || 'Unknown';
    }
    
    // Format currency
    function formatCurrency(amount) {
        if (!amount) return '$0.00';
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    // Capitalize first letter
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Set up event listeners
    historySearch.addEventListener('input', filterRentals);
    historyFilter.addEventListener('change', filterRentals);
    
    // Handle "Book Your First Rental" button click
    bookFromHistoryBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Switch to the booking section
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');
        
        // Remove active class from all items and sections
        navItems.forEach(navItem => navItem.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        
        // Add active class to booking nav item
        document.querySelector('[data-section="book"]').classList.add('active');
        
        // Show booking section
        document.getElementById('book').classList.add('active');
    });
    
    // Initial load
    loadRentalHistory();
    
    return { loadRentalHistory }; // Return method for external access
}

// Handle vehicle booking process
function handleVehicleBooking() {
    // Add CSS styling for the booking form
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Modern Booking Form Styles */
        .booking-form-container {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 8px 30px rgba(0, 0, 40, 0.12);
            overflow: hidden;
        }
        
        .booking-form-header {
            padding: 24px 32px;
            background: linear-gradient(135deg, #4a6cf7, #2541b2);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .booking-form-header h2 {
            font-size: 28px;
            font-weight: 600;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .booking-form-header .vehicle-title {
            font-size: 20px;
            font-weight: 500;
        }
        
        .back-button {
            display: flex;
            align-items: center;
            color: white;
            background: rgba(255,255,255,0.2);
            border: none;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 15px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .back-button:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        
        .back-button i {
            margin-right: 8px;
        }
        
        .booking-form-body {
            padding: 32px;
        }
        
        .booking-form-section {
            margin-bottom: 32px;
        }
        
        .booking-form-section h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #333;
            border-bottom: 2px solid #f2f4f8;
            padding-bottom: 8px;
        }
        
        .form-row {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .form-group {
            flex: 1;
        }
        
        .form-group label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
            color: #555;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 16px;
            font-size: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9fafc;
            transition: all 0.2s;
        }
        
        .form-control:focus {
            border-color: #4a6cf7;
            background-color: #fff;
            box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.15);
            outline: none;
        }
        
        .input-with-icon {
            position: relative;
        }
        
        .input-with-icon i {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #aaa;
        }
        
        .booking-summary {
            background-color: #f8faff;
            border-radius: 12px;
            padding: 24px;
            margin-top: 20px;
        }
        
        .booking-summary-header {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #333;
        }
        
        .booking-summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .booking-summary-row:last-child {
            border-bottom: none;
        }
        
        .booking-summary-label {
            font-size: 15px;
            color: #555;
        }
        
        .booking-summary-value {
            font-size: 15px;
            font-weight: 500;
            color: #333;
        }
        
        .booking-total {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 2px solid #e0e7ff;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .booking-total-label {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        
        .booking-total-value {
            font-size: 20px;
            font-weight: 700;
            color: #4a6cf7;
        }
        
        .terms-container {
            margin: 24px 0;
            display: flex;
            align-items: center;
        }
        
        .terms-container input[type="checkbox"] {
            width: 18px;
            height: 18px;
            margin-right: 10px;
            accent-color: #4a6cf7;
        }
        
        .terms-container label {
            font-size: 14px;
            color: #555;
        }
        
        .terms-container a {
            color: #4a6cf7;
            text-decoration: none;
        }
        
        .booking-actions {
            margin-top: 32px;
            display: flex;
            justify-content: flex-end;
        }
        
        .complete-booking-btn {
            padding: 14px 28px;
            background: linear-gradient(135deg, #4a6cf7, #2541b2);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 10px rgba(74, 108, 247, 0.2);
        }
        
        .complete-booking-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(74, 108, 247, 0.3);
        }
        
        .complete-booking-btn:active {
            transform: translateY(0);
        }
        
        @media screen and (max-width: 768px) {
            .form-row {
                flex-direction: column;
                gap: 15px;
            }
            
            .booking-form-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }
            
            .booking-form-body {
                padding: 20px;
            }
        }
    `;
    document.head.appendChild(styleElement);
    
    const bookBtns = document.querySelectorAll('.book-now-btn');
    const vehicleContainer = document.querySelector('.vehicle-showcase');
    const summaryContainer = document.getElementById('bookingSummary');
    const backToSelectionBtn = document.getElementById('backToVehicleSelection');
    const confirmBookingBtn = document.getElementById('confirmBookingBtn');
    
    // Set minimum dates for booking dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('summaryPickupDate').min = today;
    document.getElementById('summaryReturnDate').min = today;
    
    // Store the currently selected vehicle
    let selectedVehicle = {
        id: '',
        name: '',
        price: 0,
        seats: 0,
        luggage: 0,
        mpg: 0
    };
    
    // Handle vehicle selection
    bookBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Store vehicle data
            selectedVehicle = {
                id: btn.getAttribute('data-vehicle-id'),
                name: btn.getAttribute('data-vehicle-name'),
                price: parseFloat(btn.getAttribute('data-price')),
                seats: parseInt(btn.getAttribute('data-seats')),
                luggage: parseInt(btn.getAttribute('data-luggage')),
                mpg: parseInt(btn.getAttribute('data-mpg'))
            };
            
            // Get vehicle image
            const vehicleCard = btn.closest('.vehicle-card');
            const vehicleImage = vehicleCard.querySelector('.vehicle-image img').src;
            
            // Update summary data
            document.getElementById('selectedVehicleImage').src = vehicleImage;
            document.getElementById('selectedVehicleName').textContent = selectedVehicle.name;
            document.getElementById('selectedVehicleType').textContent = getVehicleType(selectedVehicle.id);
            document.getElementById('selectedVehiclePrice').textContent = `$${selectedVehicle.price}`;
            document.getElementById('selectedVehicleSeats').textContent = selectedVehicle.seats;
            document.getElementById('selectedVehicleLuggage').textContent = selectedVehicle.luggage;
            document.getElementById('selectedVehicleMpg').textContent = selectedVehicle.mpg;
            
            // Copy pickup/return dates from main form if set
            const pickupDate = document.getElementById('pickupDate').value;
            const returnDate = document.getElementById('returnDate').value;
            const location = document.getElementById('location').value;
            
            if (pickupDate) {
                document.getElementById('summaryPickupDate').value = pickupDate;
            }
            
            if (returnDate) {
                document.getElementById('summaryReturnDate').value = returnDate;
            }
            
            if (location) {
                document.getElementById('summaryPickupLocation').value = location;
            }
            
            // Update pricing summary
            updatePricingSummary();
            
            // Show summary, hide vehicle selection
            vehicleContainer.style.display = 'none';
            summaryContainer.style.display = 'block';
        });
    });
    
    // Handle back button click
    backToSelectionBtn.addEventListener('click', () => {
        vehicleContainer.style.display = 'block';
        summaryContainer.style.display = 'none';
    });
    
    // Update pricing when dates change
    document.getElementById('summaryPickupDate').addEventListener('change', updatePricingSummary);
    document.getElementById('summaryReturnDate').addEventListener('change', updatePricingSummary);
    
    // Handle date validation
    document.getElementById('summaryPickupDate').addEventListener('change', function() {
        document.getElementById('summaryReturnDate').min = this.value;
        
        // If return date is now before pickup date, update it
        const returnDateInput = document.getElementById('summaryReturnDate');
        if (returnDateInput.value && returnDateInput.value < this.value) {
            returnDateInput.value = this.value;
        }
        
        updatePricingSummary();
    });
    
    // Handle booking confirmation
    confirmBookingBtn.addEventListener('click', () => {
        const pickupDate = document.getElementById('summaryPickupDate').value;
        const returnDate = document.getElementById('summaryReturnDate').value;
        const pickupLocation = document.getElementById('summaryPickupLocation').value;
        const dropoffLocation = document.getElementById('summaryDropoffLocation').value;
        
        // Validate inputs
        if (!pickupDate) {
            showNotification("Please select a pick-up date.", "error");
            return;
        }
        
        if (!returnDate) {
            showNotification("Please select a return date.", "error");
            return;
        }
        
        if (!pickupLocation) {
            showNotification("Please select a pick-up location.", "error");
            return;
        }
        
        // Show loading state
        confirmBookingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        confirmBookingBtn.disabled = true;
        
        // Get the total price and days for the booking
        const { days, total } = calculatePricing();
        
        // Handle the booking (example with Firebase)
        createBooking(selectedVehicle, pickupDate, returnDate, pickupLocation, dropoffLocation, days, total)
            .then(() => {
                // Show success notification
                showNotification("Booking confirmed successfully!", "success");
                
                // Optionally redirect to confirmation page
                // window.location.href = 'confirmation.html'; 
                
                // Or redirect to history/bookings page
                const navItems = document.querySelectorAll('.nav-item');
                const sections = document.querySelectorAll('.content-section');
                
                // Remove active class from all items and sections
                navItems.forEach(navItem => navItem.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));
                
                // Add active class to history nav item
                document.querySelector('[data-section="history"]').classList.add('active');
                
                // Show history section
                document.getElementById('history').classList.add('active');
                
                // Refresh rental history
                if (typeof rentalHistoryHandler !== 'undefined' && 
                    typeof rentalHistoryHandler.loadRentalHistory === 'function') {
                    rentalHistoryHandler.loadRentalHistory();
                }
            })
            .catch((error) => {
                console.error("Error creating booking:", error);
                showNotification("Failed to confirm booking. Please try again.", "error");
            })
            .finally(() => {
                // Reset button state
                confirmBookingBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Booking';
                confirmBookingBtn.disabled = false;
            });
    });
    
    // Calculate pricing based on dates and selected vehicle
    function calculatePricing() {
        const pickupDate = new Date(document.getElementById('summaryPickupDate').value);
        const returnDate = new Date(document.getElementById('summaryReturnDate').value);
        
        // Default values if dates not selected
        if (isNaN(pickupDate.getTime()) || isNaN(returnDate.getTime())) {
            return {
                days: 0,
                subtotal: 0,
                taxes: 0,
                total: 0
            };
        }
        
        // Calculate number of days
        const timeDiff = returnDate.getTime() - pickupDate.getTime();
        const days = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        
        // Calculate costs
        const subtotal = selectedVehicle.price * days;
        const taxRate = 0.12; // 12% tax rate
        const taxes = subtotal * taxRate;
        const total = subtotal + taxes;
        
        return {
            days,
            subtotal,
            taxes,
            total
        };
    }
    
    // Update pricing summary in the UI
    function updatePricingSummary() {
        const { days, subtotal, taxes, total } = calculatePricing();
        
        document.getElementById('dailyRateDisplay').textContent = `$${selectedVehicle.price}`;
        document.getElementById('numberOfDaysDisplay').textContent = days;
        document.getElementById('subtotalDisplay').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('taxesDisplay').textContent = `$${taxes.toFixed(2)}`;
        document.getElementById('totalDisplay').textContent = `$${total.toFixed(2)}`;
    }
    
    // Create booking in Firestore
    function createBooking(vehicle, pickupDate, returnDate, pickupLocation, dropoffLocation, days, total) {
        const currentUser = getCurrentUser();
        
        if (!currentUser) {
            return Promise.reject(new Error("User not logged in"));
        }
        
        return db.collection('rentals').add({
            userId: currentUser.uid,
            vehicleId: vehicle.id,
            vehicleType: vehicle.name,
            pickupDate: firebase.firestore.Timestamp.fromDate(new Date(pickupDate)),
            returnDate: firebase.firestore.Timestamp.fromDate(new Date(returnDate)),
            location: pickupLocation,
            dropoffLocation: dropoffLocation || pickupLocation,
            totalDays: days,
            dailyRate: vehicle.price,
            totalCost: total,
            status: 'active',
            hasReview: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    // Helper function to get vehicle type description
    function getVehicleType(id) {
        const typeMap = {
            'economy': 'Economy Class',
            'compact': 'Compact Class',
            'suv': 'SUV / Crossover',
            'luxury': 'Luxury Class'
        };
        
        return typeMap[id] || 'Vehicle';
    }
}

// Set up booking buttons
function setupBookingButtons() {
    console.log('Setting up booking buttons');
    
    // Use event delegation instead of attaching listeners to each button
    // This is more efficient for large numbers of buttons
    const vehiclesGrid = document.querySelector('.vehicles-grid');
    
    if (!vehiclesGrid) {
        console.warn('Vehicles grid not found when setting up booking buttons');
        
        // Retry once after a short delay if grid isn't found
        setTimeout(() => {
            const retryGrid = document.querySelector('.vehicles-grid');
            if (retryGrid) {
                setupBookingButtonsDelegated(retryGrid);
            } else {
                console.error('Vehicles grid still not found after retry');
            }
        }, 50);
        
        return;
    }
    
    setupBookingButtonsDelegated(vehiclesGrid);
    
    function setupBookingButtonsDelegated(grid) {
        // Remove any existing listeners to prevent duplicates
        grid.removeEventListener('click', handleBookingButtonClick);
        
        // Add a single listener to the container
        grid.addEventListener('click', handleBookingButtonClick);
        
        function handleBookingButtonClick(e) {
            // Check if the clicked element is a booking button or is inside one
            const bookButton = e.target.closest('.book-now-btn');
            
            if (!bookButton) return; // Not a booking button click
            
            try {
                e.preventDefault();
                const vehicleId = bookButton.getAttribute('data-vehicle-id');
                if (!vehicleId) {
                    console.error('Missing vehicle ID on booking button');
                    showNotification('Error: Unable to identify selected vehicle', 'error');
                    return;
                }
                
                const vehicleCard = bookButton.closest('.vehicle-card');
                if (!vehicleCard) {
                    console.error('Could not find parent vehicle card for button');
                    showNotification('Error: Unable to process booking', 'error');
                    return;
                }
                
                const vehicleNameElement = vehicleCard.querySelector('.vehicle-name-type h3');
                const vehicleName = vehicleNameElement ? vehicleNameElement.textContent : 'Selected Vehicle';
                
                console.log(`Booking button clicked for vehicle: ${vehicleName} (${vehicleId})`);
                
                // Show booking form section
                const bookingFormSection = document.getElementById('booking-form-section');
                const vehiclesSection = document.getElementById('vehicles-section');
                
                if (bookingFormSection && vehiclesSection) {
                    // Hide vehicles section and show booking form
                    vehiclesSection.style.display = 'none';
                    bookingFormSection.style.display = 'block';
                    
                    // Scroll to booking form (use behavior: 'auto' for faster scrolling)
                    bookingFormSection.scrollIntoView({ behavior: 'auto' });
                    
                    // Update booking form with selected vehicle
                    populateBookingForm(vehicleId, vehicleName);
                } else {
                    // Switch to booking section via nav
                    const bookSection = document.querySelector('#book');
                    if (bookSection) {
                        // Get the parent of the current displayed section
                        const currentSection = document.querySelector('.content-section.active');
                        if (currentSection) {
                            currentSection.classList.remove('active');
                        }
                        
                        // Show booking section
                        bookSection.classList.add('active');
                        
                        // Update nav items - find all at once to minimize DOM queries
                        const navItems = document.querySelectorAll('.nav-item');
                        navItems.forEach(item => item.classList.remove('active'));
                        
                        const bookNavItem = document.querySelector('.nav-item[data-section="book"]');
                        if (bookNavItem) {
                            bookNavItem.classList.add('active');
                        }
                        
                        // Store the vehicle ID in a hidden field
                        let hiddenField = document.getElementById('selectedVehicleId');
                        const bookingForm = document.querySelector('.booking-form');
                        
                        if (!hiddenField && bookingForm) {
                            hiddenField = document.createElement('input');
                            hiddenField.type = 'hidden';
                            hiddenField.id = 'selectedVehicleId';
                            bookingForm.appendChild(hiddenField);
                        }
                        
                        if (hiddenField) {
                            hiddenField.value = vehicleId;
                        } else {
                            console.error('Could not find or create hidden vehicle ID field');
                        }
                    } else {
                        console.error('Booking section not found');
                        showNotification('Error: Booking section not found', 'error');
                    }
                }
                
                // Show notification
                showNotification(`Vehicle "${vehicleName}" selected. Please complete your booking details.`, 'info');
            } catch (error) {
                console.error('Error handling booking button click:', error);
                showNotification('An error occurred while processing your selection', 'error');
            }
        }
    }
}

// Load available vehicles from MongoDB
async function loadAvailableVehicles() {
    try {
        console.log('Loading vehicle inventory from MongoDB...');
        const vehiclesContainer = document.querySelector('.vehicles-container');
        
        if (!vehiclesContainer) {
            console.error('Vehicles container not found. DOM structure:', 
                document.querySelector('.content-section.active')?.id || 'No active section');
            
            // Try to find the book section and add container without delay
            const bookSection = document.getElementById('book');
            if (bookSection) {
                console.log('Book section found, creating vehicles container');
                const newContainer = document.createElement('div');
                newContainer.className = 'vehicles-container';
                bookSection.appendChild(newContainer);
                
                // Continue with this new container instead of recursively calling
                loadAvailableVehicles();
                return;
            }
            
            showNotification('Error: Vehicle container not found in the DOM', 'error');
            return;
        }
        
        // Show loading state - Use a simpler loading indicator to reduce DOM operations
        vehiclesContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Loading...</div>';
        
        // Pre-prepare DOM elements for better performance
        const headerHTML = document.createElement('div');
        headerHTML.className = 'vehicles-header';
        
        const filtersSection = document.createElement('div');
        filtersSection.className = 'booking-filters';
        
        const vehiclesGrid = document.createElement('div');
        vehiclesGrid.className = 'vehicles-grid';
        
        // Fetch vehicles from MongoDB using IPC
        const { ipcRenderer } = require('electron');
        
        if (!ipcRenderer) {
            console.error('Electron IPC renderer is not available');
            vehiclesContainer.innerHTML = '<div class="error-state"><p>Error: IPC renderer not available</p></div>';
            throw new Error('Electron IPC renderer is not available');
        }
        
        // Add a timestamp parameter to avoid browser caching
        const timestamp = new Date().getTime();
        console.time('vehicleApiCall'); // Add performance measurement
        
        // Single API call with shorter timeout and better error handling
        try {
            console.log('Sending API request to fetch vehicles...');
            const response = await Promise.race([
                ipcRenderer.invoke('api-call', {
                    method: 'GET',
                    url: `/api/vehicles?nocache=${timestamp}`
                }),
                // Timeout after 5 seconds
                new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
            ]);
            
            console.timeEnd('vehicleApiCall');
            
            if (!response || !response.ok) {
                throw new Error(response?.statusText || 'Failed to fetch vehicles');
            }
            
            if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
                console.log('No vehicles data received or empty array');
                vehiclesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-car-alt" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                        <h3>No vehicles available</h3>
                        <p>There are no vehicles available right now. Please check back later.</p>
                        <button id="retryLoadVehicles" class="retry-btn">Retry</button>
                    </div>
                `;
                
                document.getElementById('retryLoadVehicles')?.addEventListener('click', () => {
                    loadAvailableVehicles();
                });
                
                return;
            }
            
            const vehicles = response.data;
            console.log(`Vehicles loaded successfully: ${vehicles.length} vehicles found`);
            
            // Extract unique values for filters once to avoid multiple iterations
            const uniqueBrands = [...new Set(vehicles.map(v => v.make))];
            const uniqueTypes = [...new Set(vehicles.map(v => v.type))];
            
            // Clear container
            vehiclesContainer.innerHTML = '';
            
            // Build header
            headerHTML.innerHTML = `
                <h2>${vehicles.length} vehicles available</h2>
                <div class="view-all">
                    <a href="#" id="viewAllVehicles">View all</a>
                </div>
            `;
            
            // Add filter tabs directly without creating a string first
            const filterTabs = document.createElement('div');
            filterTabs.className = 'filter-tabs';
            filterTabs.innerHTML = `
                <button class="filter-tab active" data-filter="all">All Vehicles</button>
                <button class="filter-tab" data-filter="available">Available</button>
                <button class="filter-tab" data-filter="cars">Cars</button>
                <button class="filter-tab" data-filter="bikes">Bikes</button>
                <button class="filter-tab" data-filter="maintenance">Maintenance</button>
            `;
            
            // Build filters section
            const filterSection = document.createElement('div');
            filterSection.className = 'filter-section';
            filterSection.innerHTML = `
                <h3>Filters</h3>
                <div class="filter-item">
                    <label>Brand</label>
                    <select id="brandFilter">
                        <option value="">All Brands</option>
                        ${uniqueBrands.map(brand => 
                            `<option value="${brand}">${brand}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="filter-item">
                    <label>Vehicle Type</label>
                    <select id="typeFilter">
                        <option value="">All Types</option>
                        ${uniqueTypes.map(type => 
                            `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="filter-item">
                    <label>Price range per day</label>
                    <div class="price-range">
                        <input type="number" id="minPrice" placeholder="₹ Min" min="0">
                        <input type="number" id="maxPrice" placeholder="₹ Max" min="0">
                    </div>
                </div>
                
                <div class="filter-item">
                    <label>Vehicle Status</label>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="availableCheckbox" value="available" checked> Available Now
                        </label>
                    </div>
                </div>
                
                <button id="applyFilters" class="apply-filters-btn">Apply Filters</button>
                <button id="resetFilters" class="reset-filters-btn">Reset</button>
            `;
            
            filtersSection.appendChild(filterSection);
            
            // Use DocumentFragment for better performance
            const fragment = document.createDocumentFragment();
            
            // Batch process vehicle cards (max 20 at a time) for better browser responsiveness
            const batchSize = 20;
            const batchCount = Math.ceil(vehicles.length / batchSize);
            
            console.time('vehicleCardCreation');
            
            // Initial batch synchronously for faster initial display
            vehicles.slice(0, Math.min(batchSize, vehicles.length)).forEach(vehicle => {
                try {
                    const vehicleCard = createVehicleCard(vehicle);
                    fragment.appendChild(vehicleCard);
                } catch (cardError) {
                    console.error('Error creating vehicle card:', cardError);
                }
            });
            
            // Add the header, filters, and grid to the container
            vehiclesContainer.appendChild(headerHTML);
            vehiclesContainer.appendChild(filterTabs);
            
            const bookingContent = document.createElement('div');
            bookingContent.className = 'booking-content';
            
            bookingContent.appendChild(filtersSection);
            bookingContent.appendChild(vehiclesGrid);
            vehiclesContainer.appendChild(bookingContent);
            
            // Add initial batch of vehicles
            vehiclesGrid.appendChild(fragment);
            
            // Process remaining batches asynchronously for better responsiveness
            if (batchCount > 1) {
                let currentBatch = 1;
                
                function processNextBatch() {
                    if (currentBatch >= batchCount) {
                        console.timeEnd('vehicleCardCreation');
                        return;
                    }
                    
                    const start = currentBatch * batchSize;
                    const end = Math.min((currentBatch + 1) * batchSize, vehicles.length);
                    const batchFragment = document.createDocumentFragment();
                    
                    vehicles.slice(start, end).forEach(vehicle => {
                        try {
                            const vehicleCard = createVehicleCard(vehicle);
                            batchFragment.appendChild(vehicleCard);
                        } catch (cardError) {
                            console.error('Error creating vehicle card:', cardError);
                        }
                    });
                    
                    vehiclesGrid.appendChild(batchFragment);
                    currentBatch++;
                    
                    // Use requestAnimationFrame for smoother UI
                    requestAnimationFrame(processNextBatch);
                }
                
                // Start processing the next batch
                requestAnimationFrame(processNextBatch);
            } else {
                console.timeEnd('vehicleCardCreation');
            }
            
            // Set up event listeners for booking buttons
            setupBookingButtons();
            
            // Set up filter functionality
            setupFilterFunctionality(vehicles);
            
            console.log('Vehicle loading complete');
            
        } catch (error) {
            console.timeEnd('vehicleApiCall');
            console.error('API call failed:', error);
            vehiclesContainer.innerHTML = `<div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load vehicles: ${error.message}</p>
                <button id="retryLoadVehicles" class="retry-btn">Retry</button>
            </div>`;
            
            document.getElementById('retryLoadVehicles')?.addEventListener('click', () => {
                loadAvailableVehicles();
            });
        }
    } catch (error) {
        console.error('Error loading available vehicles:', error);
        const vehiclesContainer = document.querySelector('.vehicles-container');
        if (vehiclesContainer) {
            vehiclesContainer.innerHTML = `<div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load vehicles: ${error.message}</p>
                <button id="retryLoadVehicles" class="retry-btn">Retry</button>
            </div>`;
            
            document.getElementById('retryLoadVehicles')?.addEventListener('click', () => {
                loadAvailableVehicles();
            });
        }
    }
}

function createVehicleCard(vehicle) {
    try {
        if (!vehicle || typeof vehicle !== 'object') {
            console.error('Invalid vehicle data:', vehicle);
            return document.createElement('div'); // Return empty div to avoid errors
        }
        
        const card = document.createElement('div');
        card.className = 'vehicle-card';
        card.setAttribute('data-id', vehicle._id || 'unknown');
        card.setAttribute('data-type', vehicle.type || 'other');
        card.setAttribute('data-status', vehicle.status || 'inactive');
        card.setAttribute('data-price', (vehicle.pricing?.dailyRate || 0).toString());
        
        // Format price
        const formattedPrice = vehicle.pricing?.dailyRate 
            ? `₹${vehicle.pricing.dailyRate.toLocaleString()}`
            : 'Price unavailable';
        
        // Determine availability badge text and class
        let statusBadge = '';
        let isFavorited = false; // This would come from user data in a real app
        
        if (vehicle.status === 'active') {
            statusBadge = '<span class="status-badge available">Available</span>';
        } else if (vehicle.status === 'booked') {
            statusBadge = '<span class="status-badge booked">Booked till 10 PM</span>';
        } else if (vehicle.status === 'maintenance') {
            statusBadge = '<span class="status-badge maintenance">Maintenance</span>';
        } else {
            statusBadge = '<span class="status-badge inactive">Not Available</span>';
        }
        
        // Use proper vehicle name
        const vehicleName = vehicle.name || `${vehicle.make || 'Unknown'} ${vehicle.model || ''}`.trim() || 'Unknown Vehicle';
        const vehicleType = (vehicle.type || 'other').charAt(0).toUpperCase() + (vehicle.type || 'other').slice(1);
        
        // Handle undefined values for vehicle properties
        const seats = vehicle.specifications?.seats || 5;
        const fuelType = vehicle.specifications?.fuelType || 'Petrol';
        const transmission = vehicle.specifications?.transmission || 'Manual';
        const rating = vehicle.rating?.average || '4.5';
        const ratingCount = vehicle.rating?.count || '10';
        
        // Default icon based on type or fallback to car
        const typeIcon = (vehicle.type || '').toLowerCase().includes('bike') ? 'fa-motorcycle' : 'fa-car';
        
        // Create the card HTML
        card.innerHTML = `
            <div class="card-header">
                ${statusBadge}
                <button class="favorite-btn${isFavorited ? ' active' : ''}" data-id="${vehicle._id || ''}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="vehicle-type-display">
                <div class="type-icon">
                    <i class="fas ${typeIcon}"></i>
                </div>
                <div class="type-label">${vehicleType}</div>
            </div>
            <div class="vehicle-details">
                <div class="vehicle-name-type">
                    <h3>${vehicleName}</h3>
                    <p class="vehicle-type">${vehicleType}</p>
                </div>
                <div class="vehicle-features">
                    <span><i class="fas fa-user"></i> ${seats} Seats</span>
                    <span><i class="fas fa-gas-pump"></i> ${fuelType}</span>
                    <span><i class="fas fa-cog"></i> ${transmission}</span>
                </div>
                <div class="price-rating">
                    <span class="price">${formattedPrice}/day</span>
                    <span class="rating">
                        <i class="fas fa-star"></i> ${rating} (${ratingCount})
                    </span>
                </div>
            </div>
            <button class="book-now-btn" data-vehicle-id="${vehicle._id || ''}" ${vehicle.status !== 'active' ? 'disabled' : ''}>
                Book Now
            </button>
        `;
        
        return card;
    } catch (error) {
        console.error('Error creating vehicle card:', error, vehicle);
        const errorCard = document.createElement('div');
        errorCard.className = 'vehicle-card error';
        errorCard.innerHTML = `
            <div class="vehicle-details">
                <div class="vehicle-name-type">
                    <h3>Error Loading Vehicle</h3>
                </div>
                <div class="price-rating">
                    <span class="price">Data error</span>
                </div>
            </div>
        `;
        return errorCard;
    }
}

// Setup filter functionality
function setupFilterFunctionality(allVehicles) {
    // Get filter elements
    const filterTabs = document.querySelectorAll('.filter-tab');
    const brandFilter = document.getElementById('brandFilter');
    const typeFilter = document.getElementById('typeFilter');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const availableCheckbox = document.querySelector('input[value="available"]');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const resetFiltersBtn = document.getElementById('resetFilters');
    
    // Set up event listeners
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            const filter = tab.getAttribute('data-filter');
            filterVehicles(filter);
        });
    });
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyCustomFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            // Reset all filter inputs
            if (brandFilter) brandFilter.value = '';
            if (typeFilter) typeFilter.value = '';
            if (minPriceInput) minPriceInput.value = '';
            if (maxPriceInput) maxPriceInput.value = '';
            if (availableCheckbox) availableCheckbox.checked = true;
            
            // Reset to showing all vehicles
            filterVehicles('all');
            
            // Reset active tab
            filterTabs.forEach(t => t.classList.remove('active'));
            filterTabs[0].classList.add('active');
        });
    }
    
    // Filter function for tabs
    function filterVehicles(filter) {
        const vehicleCards = document.querySelectorAll('.vehicle-card');
        
        vehicleCards.forEach(card => {
            const type = card.getAttribute('data-type').toLowerCase();
            const status = card.getAttribute('data-status');
            
            if (filter === 'all') {
                card.style.display = '';
            } else if (filter === 'available' && status === 'active') {
                card.style.display = '';
            } else if (filter === 'cars' && !['bike', 'scooter', 'cruiser', 'sports'].includes(type)) {
                card.style.display = '';
            } else if (filter === 'bikes' && ['bike', 'scooter', 'cruiser', 'sports'].includes(type)) {
                card.style.display = '';
            } else if (filter === 'maintenance' && status === 'maintenance') {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
        
        updateVisibleCount();
    }
    
    // Apply custom filters function
    function applyCustomFilters() {
        const vehicleCards = document.querySelectorAll('.vehicle-card');
        const brand = brandFilter ? brandFilter.value.toLowerCase() : '';
        const type = typeFilter ? typeFilter.value.toLowerCase() : '';
        const minPrice = minPriceInput && minPriceInput.value ? parseFloat(minPriceInput.value) : 0;
        const maxPrice = maxPriceInput && maxPriceInput.value ? parseFloat(maxPriceInput.value) : Infinity;
        const onlyAvailable = availableCheckbox && availableCheckbox.checked;
        
        vehicleCards.forEach(card => {
            const cardBrand = card.querySelector('.vehicle-name-type h3').textContent.toLowerCase();
            const cardType = card.getAttribute('data-type').toLowerCase();
            const cardPrice = parseFloat(card.getAttribute('data-price'));
            const cardStatus = card.getAttribute('data-status');
            
            let shouldShow = true;
            
            if (brand && !cardBrand.includes(brand)) shouldShow = false;
            if (type && cardType !== type) shouldShow = false;
            if (cardPrice < minPrice || cardPrice > maxPrice) shouldShow = false;
            if (onlyAvailable && cardStatus !== 'active') shouldShow = false;
            
            card.style.display = shouldShow ? '' : 'none';
        });
        
        updateVisibleCount();
    }
    
    // Update the visible vehicles count
    function updateVisibleCount() {
        const visibleCards = document.querySelectorAll('.vehicle-card[style=""]').length;
        const header = document.querySelector('.vehicles-header h2');
        if (header) {
            header.textContent = `${visibleCards} cars to rent`;
        }
    }
    
    // Setup favorite button functionality
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent triggering parent card click
            btn.classList.toggle('active');
            
            const vehicleId = btn.getAttribute('data-id');
            const isFavorite = btn.classList.contains('active');
            
            // In a real app, would save this to user preferences in the database
            console.log(`Vehicle ${vehicleId} ${isFavorite ? 'added to' : 'removed from'} favorites`);
            
            showNotification(`Vehicle ${isFavorite ? 'added to' : 'removed from'} favorites`, isFavorite ? 'success' : 'info');
        });
    });
}

// Populate booking form with selected vehicle data
function populateBookingForm(vehicleId, vehicleName) {
    console.time('bookingFormPopulation');
    
    // Get all needed form elements at once to minimize DOM queries
    const elements = {
        vehicleNameField: document.getElementById('selectedVehicleName'),
        vehicleIdField: document.getElementById('selectedVehicleId'),
        bookingHeader: document.querySelector('.booking-form h2'),
        pickupDateInput: document.getElementById('pickupDate'),
        returnDateInput: document.getElementById('returnDate')
    };
    
    // Update vehicle name and ID
    if (elements.vehicleNameField) {
        elements.vehicleNameField.textContent = vehicleName;
    }
    
    if (elements.vehicleIdField) {
        elements.vehicleIdField.value = vehicleId;
    }
    
    if (elements.bookingHeader) {
        elements.bookingHeader.textContent = `Book ${vehicleName}`;
    }
    
    // Set minimum date for booking - calculate dates once
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (elements.pickupDateInput) {
        elements.pickupDateInput.min = todayStr;
        elements.pickupDateInput.value = todayStr;
    }
    
    if (elements.returnDateInput) {
        elements.returnDateInput.min = tomorrowStr;
        elements.returnDateInput.value = tomorrowStr;
    }
    
    // Start fetching the vehicle details immediately
    fetchVehicleDetails(vehicleId);
    console.timeEnd('bookingFormPopulation');
}

// Fetch vehicle details for booking form
async function fetchVehicleDetails(vehicleId) {
    console.time('vehicleDetailsFetch');
    try {
        // Cache vehicle details for repeat access
        if (window.vehicleDetailsCache && window.vehicleDetailsCache[vehicleId]) {
            console.log('Using cached vehicle details');
            updateBookingFormWithVehicleDetails(window.vehicleDetailsCache[vehicleId]);
            console.timeEnd('vehicleDetailsFetch');
            return;
        }
        
        const { ipcRenderer } = require('electron');
        
        // Use Promise.race to set a timeout
        const response = await Promise.race([
            ipcRenderer.invoke('api-call', {
                method: 'GET',
                url: `/api/vehicles/${vehicleId}`
            }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout fetching vehicle details')), 3000)
            )
        ]);
        
        if (!response || !response.ok || !response.data) {
            throw new Error(response?.statusText || 'Failed to fetch vehicle details');
        }
        
        const vehicle = response.data;
        console.log('Vehicle details loaded');
        
        // Cache the vehicle details for future use
        if (!window.vehicleDetailsCache) window.vehicleDetailsCache = {};
        window.vehicleDetailsCache[vehicleId] = vehicle;
        
        // Update the booking form with vehicle details
        updateBookingFormWithVehicleDetails(vehicle);
        
    } catch (error) {
        console.error('Error fetching vehicle details:', error);
        showNotification('Error loading vehicle details. Please try again.', 'error');
    } finally {
        console.timeEnd('vehicleDetailsFetch');
    }
}

// Update booking form with vehicle details
function updateBookingFormWithVehicleDetails(vehicle) {
    console.time('updateBookingForm');
    
    // Get all form elements at once
    const elements = {
        vehicleTypeField: document.getElementById('vehicleTypeDisplay'),
        dailyRateField: document.getElementById('dailyRateDisplay'),
        totalAmountField: document.getElementById('totalAmount'),
        pickupDate: document.getElementById('pickupDate'),
        returnDate: document.getElementById('returnDate')
    };
    
    // Type-safe updates with default values
    const vehicleType = (vehicle.type || 'standard').charAt(0).toUpperCase() + (vehicle.type || 'standard').slice(1);
    const rate = vehicle.pricing?.dailyRate || 0;
    
    // Update fields all at once
    if (elements.vehicleTypeField) {
        elements.vehicleTypeField.textContent = vehicleType;
    }
    
    if (elements.dailyRateField) {
        elements.dailyRateField.textContent = `₹${rate.toLocaleString()}`;
    }
    
    // Calculate initial total amount
    if (elements.totalAmountField) {
        calculateBookingTotal(vehicle);
    }
    
    // Add event listeners to date inputs - use debounce to avoid excessive calculations
    if (elements.pickupDate && elements.returnDate) {
        // Remove any existing listeners to prevent duplicates
        const newPickupDate = elements.pickupDate.cloneNode(true);
        const newReturnDate = elements.returnDate.cloneNode(true);
        
        elements.pickupDate.parentNode.replaceChild(newPickupDate, elements.pickupDate);
        elements.returnDate.parentNode.replaceChild(newReturnDate, elements.returnDate);
        
        // Add debounced event listeners
        newPickupDate.addEventListener('change', () => calculateBookingTotal(vehicle));
        newReturnDate.addEventListener('change', () => calculateBookingTotal(vehicle));
    }
    
    console.timeEnd('updateBookingForm');
}

// Calculate booking total amount
function calculateBookingTotal(vehicle) {
    const pickupDate = document.getElementById('pickupDate');
    const returnDate = document.getElementById('returnDate');
    const totalAmountField = document.getElementById('totalAmount');
    const daysCountField = document.getElementById('daysCount');
    
    if (!pickupDate || !returnDate || !totalAmountField) return;
    
    const start = new Date(pickupDate.value);
    const end = new Date(returnDate.value);
    
    // Validate dates
    if (start >= end) {
        showNotification('Return date must be after pickup date', 'error');
        
        // Reset return date to be one day after pickup date
        const tomorrow = new Date(start);
        tomorrow.setDate(tomorrow.getDate() + 1);
        returnDate.value = tomorrow.toISOString().split('T')[0];
        
        // Use setTimeout to avoid possible recursion issues
        setTimeout(() => calculateBookingTotal(vehicle), 0);
        return;
    }
    
    // Calculate number of days
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    // Get daily rate
    const dailyRate = vehicle.pricing?.dailyRate || 0;
    
    // Calculate total
    const total = days * dailyRate;
    
    // Update UI
    totalAmountField.textContent = `₹${total.toLocaleString()}`;
    
    // Update days count if field exists
    if (daysCountField) {
        daysCountField.textContent = days;
    }
    
    return { days, total };
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Customer dashboard initializing...');
        
        // Initialize Firebase if not already done
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        // Initialize UI elements
        initializeUI();
        setupEventListeners();
        
        // Function to check user role
        async function checkUserRole(user) {
            if (!user) return null;
            
            try {
                console.log('Checking user role for:', user.uid);
                
                // First check users collection for user type
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    console.log('User type from users collection:', userData.userType);
                    
                    // If not a customer, show notification and redirect immediately
                    if (userData.userType !== 'customer') {
                        console.log('User is not a customer, redirecting...');
                        localStorage.setItem('isRedirecting', 'true');
                        
                        // Show notification about unauthorized access before redirecting
                        showNotification('You do not have permission to access the customer dashboard. Redirecting to agent dashboard...', 'error');
                        
                        // Redirect after a short delay so notification can be seen
                        setTimeout(() => {
                            if (userData.userType === 'agent') {
                                window.location.href = 'agent-dashboard.html';
                            } else if (userData.userType === 'admin') {
                                window.location.href = 'admin-dashboard.html';
                            } else {
                                window.location.href = 'index.html';
                            }
                        }, 2000);
                        
                        return null;
                    }
                    
                    return userData;
                }
                
                // If we get here, user doesn't have proper role definitions
                // Redirect back to index for safety
                console.log('User not found in users collection, or missing role data');
                localStorage.setItem('isRedirecting', 'true');
                showNotification('User account not properly configured. Redirecting to login...', 'error');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                
                return null;
            } catch (error) {
                console.error('Error checking user role:', error);
                return null;
            }
        }
        
        // Check if redirection is in progress
        if (localStorage.getItem('isRedirecting')) {
            console.log('Redirection in progress, waiting for it to complete');
            // Set a timeout to clear the flag as a fallback
            setTimeout(() => {
                localStorage.removeItem('isRedirecting');
                console.log('Cleared stale redirection flag');
            }, 3000);
        }
        
        // Check if user is logged in
        const auth = firebase.auth();
        auth.onAuthStateChanged(async (user) => {
            // If redirection is already happening, don't interfere
            if (localStorage.getItem('isRedirecting')) {
                console.log('Redirection in progress, skipping auth checks');
                return;
            }
            
            if (user) {
                console.log('User is logged in:', user.uid);
                
                // Check if the user has the customer role
                const userData = await checkUserRole(user);
                
                // If checkUserRole returned null but we still have a user, 
                // it means redirection is in progress or there was an error
                if (!userData && user) {
                    console.log('Role check returned no data but user exists, waiting for redirection to complete');
                    return;
                }
                
                // At this point, we have confirmed this is a customer on the right page
                console.log('Customer confirmed on correct dashboard, loading data');
                
                // Double-check that we still have the customer type - security measure
                if (userData && userData.userType && userData.userType !== 'customer') {
                    console.log('Security check failed - user is not a customer');
                    localStorage.setItem('isRedirecting', 'true');
                    showNotification('Access denied. You must be a customer to view this page.', 'error');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                    return;
                }
                
                // Load user data
                await loadUserData();
                
                // Load booking history if we're on the history tab
                const historySection = document.getElementById('history');
                if (historySection && historySection.classList.contains('active')) {
                    await loadBookingHistory(user.uid);
                }
                
                // For any navigation to history tab, make sure to load booking history
                const historyNavItem = document.querySelector('.nav-item[data-section="history"]');
                if (historyNavItem) {
                    historyNavItem.addEventListener('click', () => {
                        loadBookingHistory(user.uid);
                    });
                }
                
                // Set up a timer to refresh booking history every 60 seconds if the history tab is active
                setInterval(() => {
                    const historySection = document.getElementById('history');
                    if (historySection && historySection.classList.contains('active')) {
                        loadBookingHistory(user.uid);
                    }
                }, 60000);
                
                // Show user info on the profile section
                const userNameElement = document.getElementById('userName');
                if (userNameElement) {
                    userNameElement.textContent = userData.name || user.displayName || user.email || 'User';
                }
                
                // Make sure the DOM is fully ready, then load available vehicles
                setTimeout(() => {
                    console.log('Loading available vehicles with delay to ensure DOM is ready');
                    try {
                        const vehiclesContainer = document.querySelector('.vehicles-container');
                        if (!vehiclesContainer) {
                            console.error('Vehicles container not found in DOM. Current sections:', 
                                Array.from(document.querySelectorAll('.content-section')).map(s => s.id).join(', '));
                        } else {
                            console.log('Vehicles container found, proceeding with loadAvailableVehicles()');
                        }
                        loadAvailableVehicles();
                    } catch (e) {
                        console.error('Error while loading vehicles:', e);
                    }
                }, 100); // Reduced from 500ms to 100ms
            } else {
                console.log('No user logged in, redirecting to login page');
                window.location.href = 'index.html';
            }
        });
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
});

// Initialize UI elements
function initializeUI() {
    // Initialize date display
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
            
            // Set minimum date for booking form
            const today = new Date().toISOString().split('T')[0];
    const pickupDateInput = document.getElementById('pickupDate');
    const returnDateInput = document.getElementById('returnDate');
    
    if (pickupDateInput) pickupDateInput.min = today;
    if (returnDateInput) returnDateInput.min = today;
            
            // Handle pickup date change to update return date minimum
    if (pickupDateInput) {
        pickupDateInput.addEventListener('change', function() {
            if (returnDateInput) returnDateInput.min = this.value;
        });
    }
    
    // Handle back button in booking form
    const backToVehiclesBtn = document.getElementById('backToVehicles');
    if (backToVehiclesBtn) {
        backToVehiclesBtn.addEventListener('click', function() {
            // Hide booking form and show vehicles section
            const bookingFormSection = document.getElementById('booking-form-section');
            const vehiclesSection = document.getElementById('vehicles-section');
            
            if (bookingFormSection && vehiclesSection) {
                bookingFormSection.style.display = 'none';
                vehiclesSection.style.display = 'block';
            }
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Handle navigation
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
    
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            firebase.auth().signOut()
                .then(() => {
                    console.log('User signed out');
            window.location.href = 'index.html';
                })
                .catch(error => {
                    console.error('Sign out error:', error);
    });
        });
    }
    
    // Handle booking form submission
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
}

// Handle booking form submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    try {
        // Get the current user
        const user = firebase.auth().currentUser;
        if (!user) {
            showNotification('You must be logged in to book a vehicle', 'error');
            return;
        }
        
        // Get form data
        const pickupDate = document.getElementById('pickupDate').value;
        const returnDate = document.getElementById('returnDate').value;
        const location = document.getElementById('location')?.value || 'Default Location';
        const vehicleId = document.getElementById('selectedVehicleId')?.value;
        
        if (!pickupDate || !returnDate) {
            showNotification('Please select pickup and return dates', 'error');
            return;
        }
        
        if (!vehicleId) {
            showNotification('Please select a vehicle', 'error');
            return;
        }
        
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitButton.disabled = true;
        }
        
        // Get vehicle details using IPC
        const { ipcRenderer } = require('electron');
        
        const vehicleResponse = await ipcRenderer.invoke('api-call', {
            method: 'GET',
            url: `/api/vehicles/${vehicleId}`
        });
        
        if (!vehicleResponse.ok || !vehicleResponse.data) {
            throw new Error('Failed to get vehicle details');
        }
        
        const vehicle = vehicleResponse.data;
        
        // Calculate dates and total
        const start = new Date(pickupDate);
        const end = new Date(returnDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const dailyRate = vehicle.pricing?.dailyRate || 0;
        const total = days * dailyRate;
        
        // Generate a unique ID for the Firebase booking
        const firebaseBookingId = `booking_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        
        // Create booking object for MongoDB
        const bookingData = {
            userId: user.uid,
            userName: user.displayName || user.email.split('@')[0],
            vehicleId: vehicleId,
            vehicleName: `${vehicle.make} ${vehicle.model}`,
            vehicleType: vehicle.type,
            agentId: vehicle.agentId,
            pickupDate: start.toISOString(),
            returnDate: end.toISOString(),
            pickupLocation: location,
            returnLocation: location,
            days: days,
            dailyRate: dailyRate,
            totalAmount: total,
            status: 'confirmed',
            paymentStatus: 'completed',
            firebaseId: firebaseBookingId,
            createdAt: new Date().toISOString()
        };
        
        console.log('Sending booking data to API:', bookingData);
        
        // First create the booking in Firebase
        console.log('Creating booking in Firebase first');
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        
        // Add to Firebase rentals
        await userRef.update({
            'rentals': firebase.firestore.FieldValue.arrayUnion({
                id: firebaseBookingId,
                vehicleId: vehicleId,
                vehicleName: `${vehicle.make} ${vehicle.model}`,
                pickupDate: firebase.firestore.Timestamp.fromDate(start),
                returnDate: firebase.firestore.Timestamp.fromDate(end),
                status: 'confirmed',
                amount: total
            }),
            'activeRentals': firebase.firestore.FieldValue.increment(1),
            'totalTrips': firebase.firestore.FieldValue.increment(1),
            'lastActivity': {
                type: 'booking',
                vehicleName: `${vehicle.make} ${vehicle.model}`,
                date: firebase.firestore.Timestamp.now()
            }
        });
        
        console.log('Firebase booking created, now sending to MongoDB');
        
        // Submit booking to API
        const response = await ipcRenderer.invoke('api-call', {
            method: 'POST',
            url: '/api/bookings',
            body: JSON.stringify(bookingData)
        });
        
        // Check response
        if (!response.ok) {
            const errorMessage = response.data?.message || 'Failed to create booking';
            throw new Error(errorMessage);
        }
        
        console.log('Booking created successfully in MongoDB:', response.data);
        
        // Now update the vehicle status in MongoDB
        const updateVehicleResponse = await ipcRenderer.invoke('api-call', {
            method: 'PUT',
            url: `/api/vehicles/${vehicleId}/status`,
            body: JSON.stringify({ 
                status: 'booked',
                bookedDates: {
                    start: start.toISOString(),
                    end: end.toISOString()
                }
            })
        });
        
        if (!updateVehicleResponse.ok) {
            console.warn('Failed to update vehicle status in MongoDB, but booking was created');
        }
        
        // Show success message
        showNotification('Booking completed successfully!', 'success');
        
        // Reset form and UI
        if (submitButton) {
            submitButton.innerHTML = 'Complete Booking';
            submitButton.disabled = false;
        }
        
        // Redirect to booking history after a delay
        setTimeout(() => {
            // Redirect to history section
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            
            const historyNavItem = document.querySelector('.nav-item[data-section="history"]');
            if (historyNavItem) {
                historyNavItem.classList.add('active');
                document.getElementById('history').classList.add('active');
                
                // Reload booking history
                loadBookingHistory(user.uid);
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error creating booking:', error);
        showNotification('Error: ' + error.message, 'error');
        
        // Reset button state
        const submitButton = e.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = 'Complete Booking';
            submitButton.disabled = false;
        }
    }
}

// Load booking history for user
async function loadBookingHistory(userId) {
    try {
        console.log(`Loading booking history for user: ${userId}`);
        const historySection = document.querySelector('#history .rental-history');
        if (!historySection) {
            console.error('History section element not found');
            return;
        }
        
        // Show loading state only if no data is already displayed
        if (!historySection.querySelector('.bookings-table')) {
            historySection.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Loading booking history...</div>';
        }
        
        // Get the IPC renderer
        const { ipcRenderer } = require('electron');
        
        // Fetch booking history from MongoDB API using IPC
        console.log(`Sending API request to: /api/bookings/user/${userId}`);
        const response = await ipcRenderer.invoke('api-call', {
            method: 'GET',
            url: `/api/bookings/user/${userId}`
        });
        
        console.log('API response:', response);
        
        if (!response.ok) {
            throw new Error('Failed to fetch booking history: ' + (response.error || 'Unknown error'));
        }
        
        const bookings = response.data || [];
        console.log(`Loaded ${bookings.length} bookings from MongoDB:`, bookings);
        
        // Cache bookings in localStorage for persistence across page reloads
        localStorage.setItem('userBookings', JSON.stringify(bookings));
        
        if (bookings.length === 0) {
            // Check localStorage for cached bookings first
            const cachedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
            if (cachedBookings.length > 0) {
                console.log('Using cached bookings from localStorage:', cachedBookings);
                displayBookings(cachedBookings);
                return;
            }
            
            historySection.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No booking history yet</h3>
                    <p>Your booking history will appear here once you've made a reservation.</p>
                    <button class="book-now-redirect">Book a Vehicle Now</button>
                </div>
            `;
            
            // Add event listener to redirect button
            const redirectButton = historySection.querySelector('.book-now-redirect');
            if (redirectButton) {
                redirectButton.addEventListener('click', () => {
                    document.querySelector('.nav-item[data-section="book"]').click();
                });
            }
            
            // Also check Firebase for rentals
            checkFirebaseRentals(userId);
            
            return;
        }
        
        // Display the bookings
        displayBookings(bookings);
    } catch (error) {
        console.error('Error loading booking history:', error);
        
        // Try to use cached bookings from localStorage
        const cachedBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
        if (cachedBookings.length > 0) {
            console.log('Using cached bookings from localStorage due to error:', cachedBookings);
            displayBookings(cachedBookings);
            return;
        }
        
        // Show error state
        const historySection = document.querySelector('#history .rental-history');
        if (historySection) {
            historySection.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Could not load booking history</h3>
                    <p>${error.message}</p>
                    <button class="retry-btn">Retry</button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryButton = historySection.querySelector('.retry-btn');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    loadBookingHistory(userId);
                });
            }
            
            // Try to load from Firebase as fallback
            checkFirebaseRentals(userId);
        }
    }
}

// Display bookings in the UI
function displayBookings(bookings) {
    const historySection = document.querySelector('#history .rental-history');
    if (!historySection) return;
    
    // Create booking cards
    historySection.innerHTML = '<div class="rental-history-table"><h3>Your Booking History</h3></div>';
    const historyTable = document.createElement('table');
    historyTable.className = 'bookings-table';
    historyTable.innerHTML = `
        <thead>
            <tr>
                <th>Vehicle</th>
                <th>Dates</th>
                <th>Location</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="historyTableBody"></tbody>
    `;
    
    historySection.querySelector('.rental-history-table').appendChild(historyTable);
    const tableBody = document.getElementById('historyTableBody');
    
    bookings.forEach(booking => {
        console.log('Creating row for booking:', booking);
        const row = createBookingHistoryRow(booking);
        tableBody.appendChild(row);
    });
}

// Check Firebase for rentals as a fallback
async function checkFirebaseRentals(userId) {
    try {
        console.log('Checking Firebase for rental history');
        const userRef = firebase.firestore().collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            console.log('User data from Firebase:', userData);
            
            if (userData.rentals && Array.isArray(userData.rentals) && userData.rentals.length > 0) {
                console.log(`Found ${userData.rentals.length} rentals in Firebase`);
                
                // If we got here, it means MongoDB had no bookings but Firebase has them
                // Let's sync Firebase rentals to MongoDB
                syncRentalsToMongoDB(userId, userData.rentals);
            } else {
                console.log('No rentals found in Firebase');
            }
        } else {
            console.log('User document not found in Firebase');
        }
    } catch (error) {
        console.error('Error checking Firebase rentals:', error);
    }
}

// Sync Firebase rentals to MongoDB if needed
async function syncRentalsToMongoDB(userId, rentals) {
    try {
        console.log('Syncing rentals from Firebase to MongoDB');
        const { ipcRenderer } = require('electron');
        
        for (const rental of rentals) {
            console.log('Processing rental for sync:', rental);
            
            // Check if this rental was already synced
            const checkResponse = await ipcRenderer.invoke('api-call', {
                method: 'GET',
                url: `/api/bookings/check/${rental.id}`
            });
            
            if (checkResponse.ok && checkResponse.data && checkResponse.data.exists) {
                console.log(`Booking already exists in MongoDB with ID: ${rental.id}`);
                continue;
            }
            
            // Create a booking object from the rental
            const bookingData = {
                userId: userId,
                vehicleId: rental.vehicleId,
                vehicleName: rental.vehicleName,
                pickupDate: rental.pickupDate.toDate().toISOString(),
                returnDate: rental.returnDate.toDate().toISOString(),
                totalAmount: rental.amount,
                status: rental.status || 'confirmed',
                synced: true,
                firebaseId: rental.id
            };
            
            console.log('Creating MongoDB booking from Firebase rental:', bookingData);
            
            const response = await ipcRenderer.invoke('api-call', {
                method: 'POST',
                url: '/api/bookings/sync',
                body: JSON.stringify(bookingData)
            });
            
            if (response.ok) {
                console.log('Successfully synced rental to MongoDB:', response.data);
            } else {
                console.error('Failed to sync rental:', response.error || 'Unknown error');
            }
        }
        
        // Reload booking history after sync
        loadBookingHistory(userId);
    } catch (error) {
        console.error('Error syncing rentals to MongoDB:', error);
    }
}

// Create a booking history row
function createBookingHistoryRow(booking) {
    const row = document.createElement('tr');
    
    // Format dates
    const pickupDate = new Date(booking.pickupDate).toLocaleDateString();
    const returnDate = new Date(booking.returnDate).toLocaleDateString();
    
    // Determine status class
    let statusClass = '';
    switch (booking.status) {
        case 'confirmed':
            statusClass = 'confirmed';
            break;
        case 'active':
            statusClass = 'active';
            break;
        case 'completed':
            statusClass = 'completed';
            break;
        case 'cancelled':
            statusClass = 'cancelled';
            break;
        default:
            statusClass = 'pending';
    }
    
    // Format vehicle name
    const vehicleName = booking.vehicleName || 'Unknown Vehicle';
    
    // Format total
    const totalAmount = booking.totalAmount 
        ? `₹${booking.totalAmount.toLocaleString()}` 
        : '₹0';
    
    row.innerHTML = `
        <td>
            <div class="vehicle-info">
                <div class="rental-type-display">
                    <i class="type-icon fas ${booking.vehicleType?.toLowerCase().includes('bike') ? 'fa-motorcycle' : 'fa-car'}"></i>
                </div>
                <div class="vehicle-name">${vehicleName}</div>
            </div>
        </td>
        <td>${pickupDate} - ${returnDate}</td>
        <td>${booking.pickupLocation || 'N/A'}</td>
        <td>${totalAmount}</td>
        <td><span class="status-badge status-${statusClass}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></td>
        <td class="actions-cell">
            ${booking.status === 'confirmed' ? 
                `<button class="cancel-btn" data-booking-id="${booking._id}">Cancel</button>` : ''}
            ${booking.status === 'completed' ? 
                `<button class="review-btn" data-booking-id="${booking._id}" data-vehicle-id="${booking.vehicleId}">Review</button>` : ''}
            <button class="details-btn" data-booking-id="${booking._id}">Details</button>
        </td>
    `;
    
    // Add event listeners
    setTimeout(() => {
        const cancelBtn = row.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => handleCancelBooking(booking._id));
        }
        
        const reviewBtn = row.querySelector('.review-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => handleAddReview(booking._id, booking.vehicleId));
        }
        
        const detailsBtn = row.querySelector('.details-btn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', () => handleViewBookingDetails(booking));
        }
    }, 0);
    
    return row;
}

// Handle cancel booking
async function handleCancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const { ipcRenderer } = require('electron');
        
        // Show cancellation in progress notification
        showNotification('Cancelling your booking...', 'info');
        
        // Update booking status in MongoDB
        const response = await ipcRenderer.invoke('api-call', {
            method: 'PUT',
            url: `/api/bookings/${bookingId}/status`,
            body: JSON.stringify({ status: 'cancelled' })
        });
        
        if (!response.ok) {
            throw new Error('Failed to cancel booking: ' + (response.error || 'Unknown error'));
        }
        
        console.log('Booking cancelled successfully in MongoDB');
        
        // Update user's Firebase data to reflect the cancellation
        const user = firebase.auth().currentUser;
        if (user) {
            // Get the booking details to update vehicle status
            const bookingResponse = await ipcRenderer.invoke('api-call', {
                method: 'GET',
                url: `/api/bookings/${bookingId}`
            });
            
            if (bookingResponse.ok && bookingResponse.data) {
                const booking = bookingResponse.data;
                
                // Update vehicle status back to active
                await ipcRenderer.invoke('api-call', {
                    method: 'PUT',
                    url: `/api/vehicles/${booking.vehicleId}/status`,
                    body: JSON.stringify({ status: 'active' })
                });
                
                // Update user data in Firebase
                const userRef = firebase.firestore().collection('users').doc(user.uid);
                await userRef.update({
                    'activeRentals': firebase.firestore.FieldValue.increment(-1),
                    'lastActivity': {
                        type: 'cancellation',
                        vehicleName: booking.vehicleName,
                        date: firebase.firestore.Timestamp.now()
                    }
                });
                
                // Also update the rental in the user's rentals array
                const userDoc = await userRef.get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    if (userData.rentals && Array.isArray(userData.rentals)) {
                        const updatedRentals = userData.rentals.map(rental => {
                            if (rental.id === bookingId) {
                                return { ...rental, status: 'cancelled' };
                            }
                            return rental;
                        });
                        
                        await userRef.update({ rentals: updatedRentals });
                    }
                }
            }
            
            // Show success message
            showNotification('Booking cancelled successfully', 'success');
            
            // Reload booking history
            loadBookingHistory(user.uid);
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showNotification('Error cancelling booking: ' + error.message, 'error');
    }
}

// Handle add review
async function handleAddReview(bookingId, vehicleId) {
    // Create modal for review submission
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'reviewModal';
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Leave a Review</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="review-form">
                    <div class="rating-selector">
                        <p>Rate your experience:</p>
                        <div class="stars-container">
                            <i class="far fa-star" data-rating="1"></i>
                            <i class="far fa-star" data-rating="2"></i>
                            <i class="far fa-star" data-rating="3"></i>
                            <i class="far fa-star" data-rating="4"></i>
                            <i class="far fa-star" data-rating="5"></i>
                        </div>
                        <input type="hidden" id="selectedRating" value="0">
                    </div>
                    
                    <div class="form-group">
                        <label for="reviewComment">Your Review:</label>
                        <textarea id="reviewComment" rows="5" placeholder="Share your experience with this vehicle..."></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="submitReviewBtn" class="submit-review-btn" disabled>Submit Review</button>
                <button class="close-modal-btn">Cancel</button>
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modal);
    
    // Show the modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Add event listeners
    const closeButtons = modal.querySelectorAll('.close-modal, .close-modal-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    });
    
    // Handle star rating selection
    const stars = modal.querySelectorAll('.stars-container i');
    const selectedRating = modal.querySelector('#selectedRating');
    const submitButton = modal.querySelector('#submitReviewBtn');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            selectedRating.value = rating;
            
            // Update stars display
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.className = 'fas fa-star';
                } else {
                    s.className = 'far fa-star';
                }
            });
            
            // Enable submit button if a rating is selected
            const commentField = modal.querySelector('#reviewComment');
            if (commentField.value.trim().length > 0) {
                submitButton.disabled = false;
            }
        });
        
        // Handle hover effects
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.className = 'fas fa-star';
                } else {
                    s.className = 'far fa-star';
                }
            });
        });
    });
    
    // Reset to selected rating on mouse leave
    const starsContainer = modal.querySelector('.stars-container');
    starsContainer.addEventListener('mouseleave', () => {
        const rating = parseInt(selectedRating.value);
        
        stars.forEach((s, index) => {
            if (index < rating) {
                s.className = 'fas fa-star';
            } else {
                s.className = 'far fa-star';
            }
        });
    });
    
    // Enable/disable submit button based on comment field
    const commentField = modal.querySelector('#reviewComment');
    commentField.addEventListener('input', () => {
        const rating = parseInt(selectedRating.value);
        submitButton.disabled = !(rating > 0 && commentField.value.trim().length > 0);
    });
    
    // Handle review submission
    submitButton.addEventListener('click', async () => {
        try {
            const rating = parseInt(selectedRating.value);
            const comment = commentField.value.trim();
            
            if (rating === 0) {
                showNotification('Please select a rating before submitting.', 'error');
                return;
            }
            
            if (comment.length === 0) {
                showNotification('Please enter a review comment before submitting.', 'error');
                return;
            }
            
            // Show loading state
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitButton.disabled = true;
            
            // Get current user
            const user = firebase.auth().currentUser;
            if (!user) {
                showNotification('You must be logged in to submit a review.', 'error');
                return;
            }
            
            // Prepare review data
            const reviewData = {
                userId: user.uid,
                userName: user.displayName || user.email.split('@')[0],
                bookingId: bookingId,
                vehicleId: vehicleId,
                rating: rating,
                comment: comment,
                createdAt: new Date().toISOString()
            };
            
            // Submit review using IPC
            const { ipcRenderer } = require('electron');
            
            const response = await ipcRenderer.invoke('api-call', {
                method: 'POST',
                url: '/api/reviews',
                body: JSON.stringify(reviewData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit review: ' + (response.error || 'Unknown error'));
            }
            
            console.log('Review submitted successfully:', response.data);
            
            // Update booking status to indicate review was added
            await ipcRenderer.invoke('api-call', {
                method: 'PUT',
                url: `/api/bookings/${bookingId}`,
                body: JSON.stringify({ hasReview: true })
            });
            
            // Also update rating in Firebase user data
            await firebase.firestore().collection('users').doc(user.uid).update({
                'lastActivity': {
                    type: 'review',
                    rating: rating,
                    date: firebase.firestore.Timestamp.now()
                }
            });
            
            // Close modal
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                
                // Show success notification
                showNotification('Your review has been submitted successfully!', 'success');
                
                // Refresh booking history to update UI
                loadBookingHistory(user.uid);
            }, 300);
            
        } catch (error) {
            console.error('Error submitting review:', error);
            showNotification('Error submitting review: ' + error.message, 'error');
            
            // Reset button state
            submitButton.innerHTML = 'Submit Review';
            submitButton.disabled = false;
        }
    });
}

// Handle view booking details
function handleViewBookingDetails(booking) {
    // Create modal for booking details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'bookingDetailsModal';
    
    // Format dates for display
    const pickupDate = new Date(booking.pickupDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const returnDate = new Date(booking.returnDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Format amount
    const amount = `₹${booking.totalAmount?.toLocaleString() || '0'}`;
    
    // Format status
    const statusClass = booking.status.toLowerCase();
    const statusDisplay = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Booking Details</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="booking-id">
                    <strong>Booking ID:</strong> ${booking._id || 'N/A'}
                </div>
                
                <div class="booking-details-container">
                    <div class="booking-vehicle-details">
                        <div class="vehicle-icon-large">
                            <i class="fas ${booking.vehicleType?.toLowerCase().includes('bike') ? 'fa-motorcycle' : 'fa-car'}"></i>
                        </div>
                        <h3>${booking.vehicleName || 'Unknown Vehicle'}</h3>
                        <p class="vehicle-type">${booking.vehicleType || 'Standard'}</p>
                    </div>
                    
                    <div class="booking-info-grid">
                        <div class="info-item">
                            <i class="fas fa-calendar-alt"></i>
                            <div>
                                <strong>Pickup Date</strong>
                                <p>${pickupDate}</p>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <i class="fas fa-calendar-check"></i>
                            <div>
                                <strong>Return Date</strong>
                                <p>${returnDate}</p>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <strong>Location</strong>
                                <p>${booking.pickupLocation || 'Not specified'}</p>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <strong>Duration</strong>
                                <p>${booking.days || '1'} day(s)</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="price-breakdown">
                        <h4>Price Details</h4>
                        <div class="price-item">
                            <span>Daily Rate:</span>
                            <span>₹${booking.dailyRate?.toLocaleString() || '0'}</span>
                        </div>
                        <div class="price-item">
                            <span>Duration:</span>
                            <span>${booking.days || '1'} day(s)</span>
                        </div>
                        <div class="price-item total">
                            <span>Total Amount:</span>
                            <span>${amount}</span>
                        </div>
                    </div>
                    
                    <div class="booking-status-large">
                        <span class="status-badge status-${statusClass}">${statusDisplay}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                ${booking.status === 'confirmed' ? `<button id="cancelBookingBtn" class="cancel-booking-btn">Cancel Booking</button>` : ''}
                <button class="close-modal-btn">Close</button>
            </div>
        </div>
    `;
    
    // Add modal to the document
    document.body.appendChild(modal);
    
    // Show the modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Add event listeners
    const closeButtons = modal.querySelectorAll('.close-modal, .close-modal-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
    });
    
    // Add cancel button event listener
    const cancelButton = modal.querySelector('#cancelBookingBtn');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                handleCancelBooking(booking._id);
            }, 300);
        });
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    });
}

// Get current user
function getCurrentUser() {
    return firebase.auth().currentUser;
}