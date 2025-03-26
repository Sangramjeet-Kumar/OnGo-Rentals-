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
    console.log("Loading user data...");
    
    // Check if user is logged in
    const user = auth.currentUser;
    
    if (user) {
        // Get user data from Firestore
        db.collection("users").doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    
                    // Update UI with user data
                    document.getElementById("userName").textContent = userData.name || user.displayName || user.email;
                    
                    // Set profile picture if available
                    if (userData.photoURL || user.photoURL) {
                        document.getElementById("userAvatar").src = userData.photoURL || user.photoURL;
                    }
                    
                    // Initialize booking UI
                    initBookingUI();
                    
                    console.log("User data loaded successfully");
                } else {
                    console.log("No user data found in database");
                    showNotification("No user profile found", "warning");
                    
                    // Create new user document
                    db.collection("users").doc(user.uid).set({
                        name: user.displayName || "",
                        email: user.email,
                        createdAt: new Date(),
                        photoURL: user.photoURL || ""
                    })
                    .then(() => {
                        console.log("User profile created");
                        document.getElementById("userName").textContent = user.displayName || user.email;
                        
                        // Initialize booking UI
                        initBookingUI();
                    })
                    .catch((error) => {
                        console.error("Error creating user profile: ", error);
                    });
                }
            })
            .catch((error) => {
                console.error("Error getting user data: ", error);
                showNotification("Error loading user data", "error");
                
                // Still initialize booking UI even if user data loading fails
                initBookingUI();
            });
    } else {
        console.log("No user is currently signed in");
        window.location.href = "index.html";
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

// Book Now UI functionality
function initBookingUI() {
    // Set today's date for the date pickers
    const today = new Date().toISOString().split('T')[0];
    const pickupDateInput = document.getElementById('pickupDate');
    const returnDateInput = document.getElementById('returnDate');
    
    if (pickupDateInput && returnDateInput) {
        pickupDateInput.min = today;
        pickupDateInput.value = today;
        
        // Set min return date to pickup date
        returnDateInput.min = today;
        
        // Set default return date to next day
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        returnDateInput.value = tomorrow.toISOString().split('T')[0];
        
        // Update return date min when pickup date changes
        pickupDateInput.addEventListener('change', function() {
            returnDateInput.min = this.value;
            
            // If return date is before new pickup date, update it
            if (returnDateInput.value < this.value) {
                returnDateInput.value = this.value;
            }
        });
    }
    
    // Price range slider functionality
    const priceMinInput = document.getElementById('priceMin');
    const priceMaxInput = document.getElementById('priceMax');
    const priceValues = document.querySelectorAll('.price-value');
    const sliderTrack = document.querySelector('.slider-track');
    
    if (priceMinInput && priceMaxInput) {
        // Update slider track based on range inputs
        function updateSliderTrack() {
            const min = parseInt(priceMinInput.value);
            const max = parseInt(priceMaxInput.value);
            const minPercent = ((min - 200) / (2000 - 200)) * 100;
            const maxPercent = ((max - 200) / (2000 - 200)) * 100;
            
            if (sliderTrack) {
                sliderTrack.style.background = `linear-gradient(to right, #e0e0e0 ${minPercent}%, var(--primary) ${minPercent}%, var(--primary) ${maxPercent}%, #e0e0e0 ${maxPercent}%)`;
            }
            
            // Update displayed values with rupee format
            if (priceValues.length >= 2) {
                priceValues[0].textContent = `₹${min.toLocaleString('en-IN')}`;
                priceValues[1].textContent = `₹${max.toLocaleString('en-IN')}`;
            }
            
            // Update the car display based on price filter
            filterCars();
        }
        
        // Initialize track and prevent min > max and max < min
        updateSliderTrack();
        
        priceMinInput.addEventListener('input', () => {
            const min = parseInt(priceMinInput.value);
            const max = parseInt(priceMaxInput.value);
            
            if (min > max) {
                priceMinInput.value = max;
            }
            
            updateSliderTrack();
        });
        
        priceMaxInput.addEventListener('input', () => {
            const min = parseInt(priceMinInput.value);
            const max = parseInt(priceMaxInput.value);
            
            if (max < min) {
                priceMaxInput.value = min;
            }
            
            updateSliderTrack();
        });
    }
    
    // Vehicle type toggle
    const vehicleButtons = document.querySelectorAll('.vehicle-btn');
    const carCategorySection = document.querySelector('.car-category');
    
    vehicleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            vehicleButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show/hide car category section based on vehicle type
            const vehicleType = this.getAttribute('data-type');
            if (vehicleType === 'car') {
                carCategorySection.style.display = 'block';
            } else {
                carCategorySection.style.display = 'none';
            }
            
            // Filter vehicles based on type
            filterCars();
        });
    });
    
    // Car brand and model relationship
    const carBrandSelect = document.getElementById('carBrand');
    const carModelSelect = document.getElementById('carModel');
    
    // Define models for each brand
    const carModels = {
        'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Brezza', 'Fronx', 'Ertiga', 'XL6', 'Ciaz', 'Wagon R'],
        'Tata Motors': ['Nexon', 'Punch', 'Tiago', 'Altroz', 'Harrier', 'Safari', 'Tigor', 'Curvv'],
        'Mahindra': ['Scorpio-N', 'XUV700', 'Thar', 'XUV300', 'Bolero', 'Bolero Neo', 'XUV400 EV'],
        'Hyundai': ['Creta', 'Venue', 'i20', 'i10', 'Verna', 'Alcazar', 'Tucson', 'Aura'],
        'Honda': ['City', 'Amaze', 'Elevate', 'WR-V', 'Jazz'],
        'Toyota': ['Innova Crysta', 'Fortuner', 'Urban Cruiser', 'Glanza', 'Camry', 'Vellfire'],
        'Kia': ['Seltos', 'Sonet', 'Carens', 'EV6', 'Carnival']
    };
    
    // Update models when brand changes
    if (carBrandSelect && carModelSelect) {
        carBrandSelect.addEventListener('change', function() {
            const selectedBrand = this.value;
            
            // Clear current models
            carModelSelect.innerHTML = '<option>Select Model</option>';
            
            // Skip if "All Brands" selected
            if (selectedBrand === 'All Brands') {
                return;
            }
            
            // Add models for selected brand
            const models = carModels[selectedBrand] || [];
            models.forEach(model => {
                const option = document.createElement('option');
                option.textContent = model;
                option.value = model;
                carModelSelect.appendChild(option);
            });
            
            // Filter cars based on brand
            filterCars();
        });
        
        // Filter cars when model changes
        carModelSelect.addEventListener('change', filterCars);
    }
    
    // Handle favorite buttons
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Toggle active class
            this.classList.toggle('active');
            
            // Toggle heart icon
            const icon = this.querySelector('i');
            if (icon) {
                if (this.classList.contains('active')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            }
            
            // Here you could add code to save favorites to user profile
            const carCard = this.closest('.car-card');
            if (carCard) {
                const carModel = carCard.querySelector('.car-header h3')?.textContent || 'Unknown';
                console.log(`${this.classList.contains('active') ? 'Added' : 'Removed'} ${carModel} ${this.classList.contains('active') ? 'to' : 'from'} favorites`);
                
                // Example of how to send to Firebase
                if (auth.currentUser) {
                    // This is just placeholder - you would implement the actual Firestore update
                    showNotification(`${this.classList.contains('active') ? 'Added to' : 'Removed from'} favorites!`, 'success');
                }
            }
        });
    });
    
    // Handle filter reset button
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // Reset vehicle type
            document.querySelectorAll('.vehicle-btn').forEach((btn, index) => {
                btn.classList.remove('active');
                if (index === 0) btn.classList.add('active'); // Car button active
            });
            
            // Show car category section
            if (carCategorySection) {
                carCategorySection.style.display = 'block';
            }
            
            // Reset car categories
            document.querySelectorAll('.category-item input[type="checkbox"]').forEach((checkbox, index) => {
                // Check first 4 categories, uncheck others
                checkbox.checked = index < 4;
            });
            
            // Reset brand and model dropdowns
            if (carBrandSelect) {
                carBrandSelect.selectedIndex = 0;
            }
            
            if (carModelSelect) {
                carModelSelect.innerHTML = '<option>Select Model</option>';
            }
            
            // Reset color selection to first
            const firstColor = document.querySelector('.color-item input[type="radio"]');
            if (firstColor) firstColor.checked = true;
            
            // Reset toggle switches
            document.querySelectorAll('.switch input').forEach(toggle => {
                toggle.checked = false;
            });
            
            // Reset button toggles
            document.querySelectorAll('.toggle-btn').forEach((btn, index) => {
                btn.classList.remove('active');
                if (index === 0) btn.classList.add('active'); // First button active
            });
            
            // Reset price range
            if (priceMinInput && priceMaxInput) {
                priceMinInput.value = 200;
                priceMaxInput.value = 2000;
                updateSliderTrack();
            }
            
            // Reset pickup dates to today/tomorrow
            if (pickupDateInput && returnDateInput) {
                pickupDateInput.value = today;
                
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                returnDateInput.value = tomorrow.toISOString().split('T')[0];
            }
            
            // Reset pickup time
            const pickupTimeInput = document.getElementById('pickupTime');
            if (pickupTimeInput) {
                pickupTimeInput.value = '10:00';
            }
            
            // Show all cars
            showAllCars();
            
            showNotification('Filters have been reset', 'info');
        });
    }
    
    // Apply filters button
    const applyFiltersBtn = document.querySelector('.apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            filterCars();
            showNotification('Filters applied', 'success');
        });
    }
    
    // Book now buttons
    const bookNowBtns = document.querySelectorAll('.book-now-btn:not([disabled])');
    bookNowBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const carCard = this.closest('.car-card');
            if (carCard) {
                const carModel = carCard.querySelector('.car-header h3')?.textContent || 'Unknown';
                const priceText = carCard.querySelector('.car-price p')?.textContent || '';
                
                // Would normally open a booking modal or navigate to booking page
                showNotification(`Booking initiated for ${carModel}`, 'success');
                
                // Example of booking data that would be sent to Firebase
                const bookingData = {
                    vehicleModel: carModel,
                    price: priceText,
                    pickupDate: pickupDateInput ? pickupDateInput.value : today,
                    returnDate: returnDateInput ? returnDateInput.value : '',
                    pickupTime: document.getElementById('pickupTime') ? document.getElementById('pickupTime').value : '10:00',
                    timestamp: new Date()
                };
                
                console.log('Booking data:', bookingData);
            }
        });
    });
    
    // Toggle buttons for rental type
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons in group
            const btnGroup = this.parentElement;
            btnGroup.querySelectorAll('.toggle-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter cars
            filterCars();
        });
    });
    
    // Function to filter cars based on selected filters
    function filterCars() {
        const carCards = document.querySelectorAll('.car-card:not(.promo-card)');
        const vehicleType = document.querySelector('.vehicle-btn.active').getAttribute('data-type');
        const minPrice = parseInt(priceMinInput.value);
        const maxPrice = parseInt(priceMaxInput.value);
        const selectedBrand = carBrandSelect.value;
        const selectedModel = carModelSelect.value;
        const availableOnly = document.querySelector('.toggle-option input[type="checkbox"]').checked;
        
        // Gather selected categories
        const selectedCategories = [];
        document.querySelectorAll('.category-item input[type="checkbox"]:checked').forEach(checkbox => {
            selectedCategories.push(checkbox.parentElement.querySelector('span:not(.checkmark)').textContent);
        });
        
        // Hide all cards initially
        carCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // Filter cars based on criteria
        carCards.forEach(card => {
            // Skip non-matching vehicle types
            if (vehicleType === 'bike' && !card.classList.contains('bike-card')) {
                return;
            }
            
            // Check if car is available (if filter is active)
            if (availableOnly && card.querySelector('.status-pill.booked')) {
                return;
            }
            
            // Check price range
            const priceText = card.querySelector('.car-price p').textContent;
            const price = parseInt(priceText.replace(/[₹,]/g, ''));
            if (price < minPrice || price > maxPrice) {
                return;
            }
            
            // Check brand
            if (selectedBrand !== 'All Brands') {
                const brand = card.querySelector('.car-header h3').textContent.split('|')[0].trim();
                if (brand !== selectedBrand) {
                    return;
                }
                
                // Check model (only if a specific model is selected)
                if (selectedModel !== 'Select Model') {
                    const model = card.querySelector('.car-header h3').textContent.split('|')[1].trim();
                    if (model !== selectedModel) {
                        return;
                    }
                }
            }
            
            // Check category (skip for bikes)
            if (vehicleType === 'car' && selectedCategories.length > 0) {
                const category = card.querySelector('.car-model').textContent.split(',')[0].trim();
                if (!selectedCategories.some(cat => category.includes(cat))) {
                    return;
                }
            }
            
            // If all filters pass, show the card
            card.style.display = 'flex';
        });
        
        // Update car count
        updateCarCount();
    }
    
    // Function to show all cars
    function showAllCars() {
        const carCards = document.querySelectorAll('.car-card:not(.promo-card)');
        carCards.forEach(card => {
            card.style.display = 'flex';
        });
        
        // Update car count
        updateCarCount();
    }
    
    // Update car count display
    function updateCarCount() {
        const carCount = document.getElementById('car-count');
        const visibleCards = document.querySelectorAll('.car-card:not(.promo-card):not([style*="display: none"])');
        if (carCount) {
            carCount.textContent = `${visibleCards.length} ${visibleCards.length === 1 ? 'vehicle' : 'vehicles'} to rent`;
        }
    }
    
    // Initialize car count
    updateCarCount();
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
            handlePasswordToggles();
            handlePasswordStrength();
            handlePasswordChange();
            handleStarRating();
            handleReviewSubmission();
            loadUserReviews();
            loadRentalOptions();
            const rentalHistoryHandler = handleRentalHistory();
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