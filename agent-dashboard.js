// Initialize Firebase
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Agent dashboard initializing...');
    
    try {
        // Add CSS styling for the vehicle icon
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .vehicle-icon {
                width: 40px;
                height: 40px;
                background-color: #f0f4ff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .vehicle-icon i {
                font-size: 22px;
                color: #3a86ff;
            }
            
            /* Customer styles */
            .customer-info h4 {
                font-size: 15px;
                margin: 0 0 2px;
                color: #111827;
                font-weight: 600;
                background-color: #f0f9ff;
                padding: 3px 8px;
                border-radius: 4px;
                display: inline-block;
            }
            
            .customer-id {
                margin: 0;
                font-size: 13px;
                color: #4b5563;
            }
            
            .id-value {
                font-weight: 600;
                color: #111827;
                background-color: #f3f4f6;
                padding: 2px 6px;
                border-radius: 4px;
                display: inline-block;
            }
            
            /* Current Rentals Styles */
            .rentals-container {
                margin-top: 20px;
            }
            
            .rentals-loading, .rentals-empty {
                text-align: center;
                padding: 50px 0;
                color: #6b7280;
            }
            
            .rentals-loading i, .rentals-empty i {
                font-size: 48px;
                margin-bottom: 15px;
                color: #d1d5db;
            }
            
            .rentals-empty h3 {
                font-size: 20px;
                margin-bottom: 10px;
            }
            
            .hidden {
                display: none;
            }
            
            .rentals-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
            }
            
            .rental-card {
                background-color: #fff;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                overflow: hidden;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .rental-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            
            .rental-header {
                padding: 15px;
                background-color: #f8fafc;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .rental-vehicle {
                display: flex;
                align-items: center;
            }
            
            .rental-vehicle-icon {
                width: 40px;
                height: 40px;
                background-color: #f0f4ff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
            }
            
            .rental-vehicle-icon i {
                font-size: 18px;
                color: #3a86ff;
            }
            
            .rental-vehicle-info h3 {
                font-size: 16px;
                margin: 0 0 4px;
                color: #1f2937;
            }
            
            .rental-vehicle-info p {
                font-size: 14px;
                margin: 0;
                color: #6b7280;
            }
            
            .rental-badge {
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
            }
            
            .rental-badge.returning-soon {
                background-color: #fef3c7;
                color: #d97706;
            }
            
            .rental-badge.returning-today {
                background-color: #ffedd5;
                color: #ea580c;
            }
            
            .rental-content {
                padding: 15px;
            }
            
            .rental-customer {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .customer-avatar {
                width: 36px;
                height: 36px;
                background-color: #e5e7eb;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
            }
            
            .customer-avatar i {
                color: #6b7280;
            }
            
            .rental-detail-group {
                margin-bottom: 15px;
            }
            
            .rental-detail-group h4 {
                font-size: 14px;
                color: #6b7280;
                margin: 0 0 5px;
            }
            
            .rental-detail-item {
                display: flex;
                margin-bottom: 5px;
            }
            
            .rental-detail-item i {
                width: 20px;
                margin-right: 8px;
                color: #3a86ff;
            }
            
            .rental-detail-item span {
                font-size: 14px;
                color: #1f2937;
            }
            
            .rental-actions {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
            }
            
            .rental-actions button {
                padding: 8px 14px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
                transition: background-color 0.2s;
                display: flex;
                align-items: center;
            }
            
            .rental-actions button i {
                margin-right: 6px;
            }
            
            .contact-btn {
                background-color: #f3f4f6;
                color: #4b5563;
            }
            
            .contact-btn:hover {
                background-color: #e5e7eb;
            }
            
            .details-btn {
                background-color: #e0f2fe;
                color: #0ea5e9;
            }
            
            .details-btn:hover {
                background-color: #bae6fd;
            }
            
            .filter-controls {
                display: flex;
                gap: 10px;
            }
            
            .filter-btn {
                padding: 8px 16px;
                border: 1px solid #e5e7eb;
                background-color: #f9fafb;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .filter-btn.active {
                background-color: #3a86ff;
                color: white;
                border-color: #3a86ff;
            }
        `;
        document.head.appendChild(styleElement);
        
        // Initialize Firebase if not already done
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // Function to check user role - This was missing
        async function checkUserRole() {
            const user = auth.currentUser;
            if (!user) return null;
            
            try {
                console.log('Checking user role for:', user.uid);
                
                // First check users collection for user type
                const userDoc = await db.collection('users').doc(user.uid).get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    console.log('User type from users collection:', userData.userType);
                    
                    // If not an agent, show notification and redirect immediately
                    if (userData.userType !== 'agent') {
                        console.log('User is not an agent, redirecting...');
                        localStorage.setItem('isRedirecting', 'true');
                        
                        // Show notification about unauthorized access before redirecting
                        showNotification('You do not have permission to access the agent dashboard. Redirecting to customer dashboard...', 'error');
                        
                        // Redirect after a short delay so notification can be seen
                        setTimeout(() => {
                            if (userData.userType === 'customer') {
                                window.location.href = 'dashboard.html';
                            } else if (userData.userType === 'admin') {
                                window.location.href = 'admin-dashboard.html';
                            } else {
                                window.location.href = 'index.html';
                            }
                        }, 2000);
                        
                        return null;
                    }
                    
                    // Check if user has an agent document
                    const agentDoc = await db.collection('agents').doc(user.uid).get();
                    
                    if (agentDoc.exists) {
                        console.log('User is a verified agent');
                        return agentDoc.data();
                    }
                    
                    // User is marked as agent in users collection but doesn't have agent document yet
                    return userData;
                }
                
                // If not found in users, check agents collection directly
                const agentDoc = await db.collection('agents').doc(user.uid).get();
                
                if (agentDoc.exists) {
                    console.log('User is an agent');
                    return agentDoc.data();
                }
                
                // If we get here, user doesn't have proper role definitions
                // Redirect back to index for safety
                console.log('User not found in any collection, or missing role data');
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
        
        // Initialize UI elements immediately for better UX
        initializeDateDisplay();
        initializeCharts();
        handleNavigation();
        handleNotifications();
        handleVehicleInventoryTabs();
        handleAddVehicleForm();
        
        // Check if redirection is in progress
        if (localStorage.getItem('isRedirecting')) {
            console.log('Redirection in progress, waiting for it to complete');
            // Set a timeout to clear the flag as a fallback
            setTimeout(() => {
                localStorage.removeItem('isRedirecting');
                console.log('Cleared stale redirection flag');
            }, 3000);
        }
        
        // Wait for auth state to be determined
        auth.onAuthStateChanged(async (user) => {
            console.log('Auth state changed in agent dashboard');
            
            // If redirection is already happening, don't interfere
            if (localStorage.getItem('isRedirecting')) {
                console.log('Redirection in progress, skipping auth checks');
                return;
            }
            
            if (!user) {
                // User is not logged in, redirect to login page
                console.log('No user detected on agent dashboard, redirecting to login');
                localStorage.setItem('isRedirecting', 'true');
                window.location.replace('index.html');
                return;
            }
            
            console.log('User is logged in, checking role...');
            // Check if the user has the agent role
            const userData = await checkUserRole();
            
            // If checkUserRole returned null but we still have a user, 
            // it means redirection is in progress or there was an error
            if (!userData && user) {
                console.log('Role check returned no data but user exists, waiting for redirection to complete');
                return;
            }
            
            // At this point, we have confirmed this is an agent on the right page
            console.log('Agent confirmed on correct dashboard, loading data');
            
            // Double-check that we still have the agent type - security measure
            if (userData && userData.userType && userData.userType !== 'agent') {
                console.log('Security check failed - user is not an agent');
                localStorage.setItem('isRedirecting', 'true');
                showNotification('Access denied. You must be an agent to view this page.', 'error');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                return;
            }
            
            // Now we can proceed to load agent data
            loadAgentData(user, db);

            // Clear out any stale inventory data first
            const inventoryTable = document.querySelector('.inventory-table tbody');
            if (inventoryTable) {
                inventoryTable.innerHTML = '<tr><td colspan="7" class="loading-row">Loading inventory from MongoDB...</td></tr>';
            }

            // Add direct call to load inventory to ensure we always have the latest data from MongoDB
            loadInventory().then(() => {
                console.log('Inventory loaded on initial page load from MongoDB');
                // Ensure action buttons are set up
                setupInventoryActionButtons();
            }).catch(err => {
                console.error('Failed to load inventory on initial page load:', err);
            });
            
            // Setup events for past rentals section
            setupPastRentalsEvents();
        });
        
        // Set up logout handler with redirection flag
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            console.log('Logout button clicked');
            localStorage.setItem('isRedirecting', 'true');
            
            try {
                await signOutUser();
                window.location.replace('index.html');
            } catch (error) {
                console.error('Logout failed:', error);
                showNotification('Logout failed: ' + error.message, 'error');
                localStorage.removeItem('isRedirecting');
            }
        });
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showNotification('Error initializing dashboard. Please refresh.', 'error');
        localStorage.removeItem('isRedirecting');
    }
});

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

// Handle notifications
function handleNotifications() {
    const closeButton = document.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', hideNotification);
    }
}

// Handle navigation
function handleNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        if (!item) return; // Skip if item is null
        
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items and sections
            navItems.forEach(navItem => {
                if (navItem && navItem.classList) navItem.classList.remove('active');
            });
            
            sections.forEach(section => {
                if (section && section.classList) section.classList.remove('active');
            });
            
            // Add active class to clicked item
            if (item.classList) item.classList.add('active');
            
            // Show corresponding section
            const sectionId = item.getAttribute('data-section');
            if (!sectionId) {
                console.error('No data-section attribute found on nav item');
                return;
            }
            
            const sectionElement = document.getElementById(sectionId);
            
            // Fix: Add null check before accessing classList property
            if (sectionElement && sectionElement.classList) {
                sectionElement.classList.add('active');
                
                // Conditional actions based on section
                if (sectionId === 'inventory') {
                    console.log('Navigating to inventory section, refreshing data');
                    loadInventory()
                        .then(() => console.log('Inventory refreshed on navigation'))
                        .catch(err => console.error('Failed to refresh inventory on navigation:', err));
                } else if (sectionId === 'current-rentals') {
                    console.log('Navigating to current rentals section, refreshing data');
                    // Get the current user
                    const user = firebase.auth().currentUser;
                    if (user) {
                        loadCurrentRentals(user.uid);
                    } else {
                        console.error('No user found when trying to load current rentals');
                    }
                } else if (sectionId === 'past-rentals') {
                    console.log('Navigating to past rentals section, refreshing data');
                    // Get the current user
                    const user = firebase.auth().currentUser;
                    if (user) {
                        loadPastRentals(user.uid);
                    } else {
                        console.error('No user found when trying to load past rentals');
                    }
                }
                
                // Animate section entry
                try {
                    sectionElement.style.animation = 'none';
                    // Trigger reflow
                    void sectionElement.offsetWidth;
                    sectionElement.style.animation = 'fadeIn 0.5s ease-in-out';
                } catch (err) {
                    console.error('Error animating section:', err);
                }
            } else {
                console.error(`Section with ID "${sectionId}" not found in the DOM`);
            }
        });
    });
    
    // Handle "Add Vehicle" button in inventory
    const addVehicleBtn = document.querySelector('.add-vehicle-btn');
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', () => {
            // Switch to add vehicle section
            navItems.forEach(navItem => {
                if (navItem && navItem.classList) navItem.classList.remove('active');
            });
            
            sections.forEach(section => {
                if (section && section.classList) section.classList.remove('active');
            });
            
            // Find and activate the add vehicle nav item and section
            const addVehicleNavItem = document.querySelector('.nav-item[data-section="add-vehicle"]');
            if (addVehicleNavItem && addVehicleNavItem.classList) {
                addVehicleNavItem.classList.add('active');
            }
            
            const addVehicleSection = document.getElementById('add-vehicle');
            if (addVehicleSection && addVehicleSection.classList) {
                addVehicleSection.classList.add('active');
                
                // Animate section entry
                try {
                    addVehicleSection.style.animation = 'none';
                    void addVehicleSection.offsetWidth;
                    addVehicleSection.style.animation = 'fadeIn 0.5s ease-in-out';
                } catch (err) {
                    console.error('Error animating add vehicle section:', err);
                }
            } else {
                console.error('Add Vehicle section not found in the DOM');
            }
        });
    }
}

// Load agent data
function loadAgentData(user, db) {
    db.collection('agents').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const agentData = doc.data();
                document.getElementById('agentName').textContent = agentData.name || user.displayName || user.email;
                
                // Load dashboard metrics (normally would be loaded from the database)
                loadDashboardMetrics(db);
                loadInventory();
                
                // Also load current rentals
                loadCurrentRentals(user.uid);
                
                // Also load past rentals if we're on that section
                const pastRentalsSection = document.getElementById('past-rentals');
                // Fix: Add null check before accessing classList property
                if (pastRentalsSection && pastRentalsSection.classList && pastRentalsSection.classList.contains('active')) {
                    loadPastRentals(user.uid);
                }
            } else {
                // Check if the user is an agent in the users collection
                db.collection('users').doc(user.uid).get()
                    .then(userDoc => {
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            
                            // If user is not an agent, redirect to customer dashboard
                            if (userData.userType !== 'agent') {
                                console.log('Customer detected on agent dashboard, redirecting...');
                                window.location.href = 'dashboard.html';
                                return;
                            }
                            
                            // Create agent document if it doesn't exist but user is an agent
                            db.collection('agents').doc(user.uid).set({
                                name: userData.name || user.displayName || '',
                                email: userData.email || user.email,
                                role: 'agent',
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            })
                            .then(() => {
                                document.getElementById('agentName').textContent = userData.name || user.displayName || user.email;
                                showNotification('Welcome! Your agent profile has been created.', 'success');
                                
                                loadDashboardMetrics(db);
                                loadInventory();
                                loadCurrentRentals(user.uid);
                            })
                            .catch(error => {
                                console.error('Error creating agent profile:', error);
                                showNotification('Failed to create agent profile', 'error');
                            });
                        } else {
                            // Neither agent nor user exists, create new agent profile
                            db.collection('agents').doc(user.uid).set({
                                name: user.displayName || '',
                                email: user.email,
                                role: 'agent',
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            })
                            .then(() => {
                                document.getElementById('agentName').textContent = user.displayName || user.email;
                                showNotification('Welcome! Your agent profile has been created.', 'success');
                                
                                loadDashboardMetrics(db);
                                loadInventory();
                                loadCurrentRentals(user.uid);
                            })
                            .catch(error => {
                                console.error('Error creating agent profile:', error);
                                showNotification('Failed to create agent profile', 'error');
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error checking user data:', error);
                        showNotification('Failed to verify user role', 'error');
                    });
            }
        })
        .catch(error => {
            console.error('Error loading agent data:', error);
            showNotification('Failed to load agent data', 'error');
        });
}

// Load dashboard metrics
function loadDashboardMetrics(db) {
    // In a real application, these would be loaded from the database
    // For now, we'll use placeholder data
    
    // Simulate loading data with a brief delay
    setTimeout(() => {
        // Update stats with animation
        animateCounter('totalVehicles', 0, 24, 1500);
        // Don't animate activeRentals here, it will be updated by loadCurrentRentals
        animateCounter('pendingRequests', 0, 3, 1500);
        animateCounter('monthlyRevenue', 0, 85450, 1500, '₹');
    }, 500);
}

// Animation function for counters to prevent errors if it's not defined elsewhere
function countUp(element, start, end, duration, prefix = '') {
    if (!element) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.innerText = prefix + value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Function to animate counters
function animateCounter(elementId, start, end, duration = 1000, prefix = '') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with ID ${elementId} not found for counter animation`);
        return;
    }
    
    // Use countUp function
    countUp(element, start, end, duration, prefix);
}

// Initialize charts
function initializeCharts() {
    // Add loading state to charts
    document.querySelectorAll('.chart-card').forEach(card => {
        card.classList.add('loading');
    });
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        
        // Set chart responsiveness settings
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        
        // Limit data points to prevent performance issues
        const revenueMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const revenueData = [65000, 72000, 68000, 78000, 82000, 85450];
        
        // Create chart with optimized settings
        const revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: revenueMonths,
                datasets: [{
                    label: 'Revenue (₹)',
                    data: revenueData,
                    backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: 'rgba(37, 99, 235, 1)',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                animation: {
                    duration: 1000,  // Shorter animation for better performance
                    easing: 'easeOutQuart'
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        // Optimize tooltips
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(30, 41, 59, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(37, 99, 235, 0.3)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grace: '5%', // Add 5% padding to prevent touching the edges
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(226, 232, 240, 0.8)',
                            maxTicksLimit: 6, // Limit the number of ticks for better readability
                            callback: function(value) {
                                // Format as currency
                                return '₹' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            display: false
                        },
                        ticks: {
                            color: 'rgba(226, 232, 240, 0.8)'
                        }
                    }
                }
            }
        });
        
        // Utilization Chart with optimized settings
        const utilizationCtx = document.getElementById('utilizationChart').getContext('2d');
        const utilizationChart = new Chart(utilizationCtx, {
            type: 'doughnut',
            data: {
                labels: ['Cars Available', 'Cars Rented', 'Bikes Available', 'Bikes Rented'],
                datasets: [{
                    data: [12, 6, 4, 2],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderColor: 'rgba(30, 41, 59, 1)',
                    borderWidth: 2,
                    hoverOffset: 5
                }]
            },
            options: {
                animation: {
                    duration: 800,  // Faster animation
                    easing: 'easeOutQuad'
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(226, 232, 240, 0.8)',
                            padding: 15,
                            font: {
                                size: 12
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        displayColors: true,
                        padding: 10
                    }
                },
                cutout: '65%',
                layout: {
                    padding: {
                        bottom: 30  // Add padding for the legend
                    }
                }
            }
        });
        
        // Remove loading state from charts
        setTimeout(() => {
            document.querySelectorAll('.chart-card').forEach(card => {
                card.classList.remove('loading');
            });
        }, 500);
    });
}

// Handle vehicle inventory tabs
function handleVehicleInventoryTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Filter inventory based on tab
            const filter = button.getAttribute('data-tab');
            filterInventory(filter);
        });
    });
}

// Filter inventory
function filterInventory(filter) {
    const rows = document.querySelectorAll('.inventory-table tbody tr');
    
    rows.forEach(row => {
        const type = row.cells[3].textContent.toLowerCase();
        const status = row.querySelector('.status-badge').className.split(' ')[1];
        
        if (filter === 'all') {
            row.style.display = '';
        } else if (filter === 'cars' && type !== 'bike') {
            row.style.display = '';
        } else if (filter === 'bikes' && type === 'bike') {
            row.style.display = '';
        } else if (filter === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Animate rows
    const visibleRows = document.querySelectorAll('.inventory-table tbody tr[style=""]');
    visibleRows.forEach((row, index) => {
        row.style.animation = 'none';
        void row.offsetWidth;
        row.style.animation = `fadeIn 0.3s ease-in-out ${index * 0.05}s`;
    });
}

// Load inventory
async function loadInventory() {
    try {
        console.log('Loading vehicle inventory from MongoDB...');
        
        // Clear existing inventory
        const inventoryTable = document.querySelector('.inventory-table tbody');
        inventoryTable.innerHTML = '<tr><td colspan="7" class="loading-row">Loading inventory...</td></tr>';
        
        // Use the IPC channel to fetch vehicles from MongoDB
        const { ipcRenderer } = require('electron');
        
        // Get the current user ID (agent ID)
        let agentId = null;
        try {
            const user = firebase.auth().currentUser;
            if (user) {
                agentId = user.uid;
                console.log('Current agent ID:', agentId);
            } else {
                console.warn('No authenticated user found');
            }
        } catch (authError) {
            console.error('Error getting current user:', authError);
        }
        
        // Add a timestamp parameter to avoid browser caching and include agentId
        const timestamp = new Date().getTime();
        const response = await ipcRenderer.invoke('api-call', {
            method: 'GET',
            url: `/api/vehicles?nocache=${timestamp}${agentId ? `&agentId=${agentId}` : ''}`
        });
        
        // Remove loading row
        inventoryTable.innerHTML = '';
        
        if (!response.ok || !response.data || response.data.length === 0) {
            inventoryTable.innerHTML = '<tr><td colspan="7" class="empty-row"><div class="empty-state"><i class="fas fa-car-alt"></i><p>You haven\'t added any vehicles yet.</p><p class="empty-state-action">Click the "Add Vehicle" button to get started.</p></div></td></tr>';
            console.warn('No vehicles found or error fetching vehicles:', response);
            return;
        }
        
        console.log('Vehicles loaded from MongoDB:', response.data);
        
        // Populate table with vehicles from MongoDB only
        response.data.forEach(vehicleData => {
            // Format price
            const price = vehicleData.pricing && vehicleData.pricing.dailyRate ? 
                `₹${vehicleData.pricing.dailyRate.toLocaleString()}` : 'N/A';
            
            // Map status values to display values
            let statusClass = 'available';
            let statusText = 'Available';
            
            if (vehicleData.status === 'maintenance') {
                statusClass = 'maintenance';
                statusText = 'Maintenance';
            } else if (vehicleData.status === 'inactive') {
                statusClass = 'inactive';
                statusText = 'Not Available';
            } else if (vehicleData.status === 'booked') {
                statusClass = 'rented';
                statusText = 'Rented';
            } else if (vehicleData.status === 'active') {
                statusClass = 'available';
                statusText = 'Available';
            }
            
            // Create a new row
            const row = document.createElement('tr');
            
            // Determine if it's a bike or car
            const isBike = vehicleData.type && (vehicleData.type.toLowerCase().includes('bike') || 
                vehicleData.type.toLowerCase().includes('cruiser') || 
                vehicleData.type.toLowerCase().includes('scooter') || 
                vehicleData.type.toLowerCase().includes('sports'));
            
            row.innerHTML = `
                <td>${vehicleData._id ? vehicleData._id.substring(0, 8) : 'Unknown'}</td>
                <td><div class="vehicle-icon"><i class="fas ${isBike ? 'fa-motorcycle' : 'fa-car'}"></i></div></td>
                <td>${vehicleData.name || vehicleData.make} ${vehicleData.model}</td>
                <td>${vehicleData.type}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${price}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" data-id="${vehicleData._id}"><i class="fas fa-edit"></i></button>
                        <button class="view-btn" data-id="${vehicleData._id}"><i class="fas fa-eye"></i></button>
                        <button class="delete-btn" data-id="${vehicleData._id}"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            
            inventoryTable.appendChild(row);
        });
        
        // Setup action buttons for the newly added rows
    setupInventoryActionButtons();
        
    } catch (error) {
        console.error('Error loading inventory:', error);
        const inventoryTable = document.querySelector('.inventory-table tbody');
        inventoryTable.innerHTML = `<tr><td colspan="7" class="error-row"><div class="empty-state error-state"><i class="fas fa-exclamation-triangle"></i><p>Error loading inventory</p><p class="empty-state-action">${error.message}</p></div></td></tr>`;
    }
}

// Setup inventory action buttons
function setupInventoryActionButtons() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const vehicleId = this.getAttribute('data-id');
            const row = this.closest('tr');
            const vehicleName = row.cells[2].textContent;
            
            showNotification(`Editing ${vehicleName} (ID: ${vehicleId})`, 'info');
            // Would normally open edit form
        });
    });
    
    // View buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function() {
            const vehicleId = this.getAttribute('data-id');
            const row = this.closest('tr');
            const vehicleName = row.cells[2].textContent;
            
            showNotification(`Viewing details for ${vehicleName} (ID: ${vehicleId})`, 'info');
            // Would normally open details modal
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const vehicleId = this.getAttribute('data-id');
            const row = this.closest('tr');
            const vehicleName = row.cells[2].textContent;
            const vehicleStatus = row.querySelector('.status-badge').textContent.trim().toLowerCase();
            
            // Check if vehicle is currently booked based on UI status
            if (vehicleStatus === 'booked' || vehicleStatus === 'rented') {
                showNotification(`Cannot delete ${vehicleName} as it is currently ${vehicleStatus}`, 'error');
                return;
            }
            
            if (confirm(`Are you sure you want to delete ${vehicleName} (ID: ${vehicleId})?`)) {
                try {
                    // Show loading notification
                    showNotification(`Deleting ${vehicleName}...`, 'info');
                    
                    // Get the vehicle's Firebase ID if it exists
                    const { ipcRenderer } = require('electron');
                    
                    // First get the vehicle details to find Firebase ID
                    const vehicleResponse = await ipcRenderer.invoke('api-call', {
                        method: 'GET',
                        url: `/api/vehicles/${vehicleId}`
                    });
                    
                    let firebaseId = null;
                    if (vehicleResponse.ok && vehicleResponse.data) {
                        firebaseId = vehicleResponse.data.firebaseId;
                    }
                    
                    // Delete from MongoDB via API
                    const response = await ipcRenderer.invoke('api-call', {
                        method: 'DELETE',
                        url: `/api/vehicles/${vehicleId}`
                    });
                    
                    if (!response.ok) {
                        throw new Error(response.data?.message || 'Failed to delete vehicle from MongoDB');
                    }
                    
                    // Visual feedback - fade out row
                    row.style.animation = 'fadeOut 0.5s ease-in-out forwards';
                    setTimeout(() => {
                        row.remove();
                        showNotification(`${vehicleName} has been deleted`, 'success');
                        
                        // Check if table is now empty and add empty message if needed
                        const inventoryTable = document.querySelector('.inventory-table tbody');
                        if (inventoryTable.children.length === 0) {
                            inventoryTable.innerHTML = '<tr><td colspan="7" class="empty-row"><div class="empty-state"><i class="fas fa-car-alt"></i><p>You haven\'t added any vehicles yet.</p><p class="empty-state-action">Click the "Add Vehicle" button to get started.</p></div></td></tr>';
                        }
                    }, 500);
                    
                } catch (error) {
                    console.error('Error deleting vehicle:', error);
                    showNotification(`Failed to delete ${vehicleName}: ${error.message}`, 'error');
                }
            }
        });
    });
}

// Handle add vehicle form
function handleAddVehicleForm() {
    const form = document.getElementById('addVehicleForm');
    const formTabs = document.querySelectorAll('.form-tab-btn');
    const cancelButton = document.querySelector('.cancel-btn');
    
    // Tab switching
    formTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            formTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show appropriate vehicle-specific fields
            const vehicleType = tab.getAttribute('data-type');
            document.querySelectorAll('.vehicle-specifics').forEach(section => {
                section.style.display = 'none';
            });
            
            document.querySelector(`.${vehicleType}-specifics`).style.display = 'flex';
            
            // Update vehicle type dropdown options
            updateVehicleTypeOptions(vehicleType);
        });
    });
    
    // Cancel button
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            form.reset();
            
            // Navigate back to inventory
            const inventoryNavItem = document.querySelector('.nav-item[data-section="inventory"]');
            inventoryNavItem.click();
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Get current user
                const user = firebase.auth().currentUser;
                if (!user) {
                    showNotification('You must be logged in to add a vehicle', 'error');
                    return;
                }
                
                // Get agent ID from Firestore
                const agentDoc = await firebase.firestore().collection('agents').doc(user.uid).get();
                if (!agentDoc.exists) {
                    showNotification('Agent profile not found', 'error');
                    return;
                }
                
                // Validate form fields
                const vehicleName = document.getElementById('vehicleName').value;
                const vehicleBrand = document.getElementById('vehicleBrand').value;
                const vehicleModel = document.getElementById('vehicleModel').value;
                const vehicleYear = document.getElementById('vehicleYear').value;
                const vehicleTypeValue = document.getElementById('vehicleType').value;
                const registrationNumber = document.getElementById('registrationNumber').value;
                const dailyRate = document.getElementById('dailyRate').value;
                
                // Basic validation
                if (!vehicleBrand || !vehicleModel || !vehicleYear || !vehicleTypeValue || !registrationNumber || !dailyRate) {
                    showNotification('Please fill in all required fields', 'error');
                    return;
                }
                
                // Numeric validation
                const year = parseInt(vehicleYear);
                if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
                    showNotification('Please enter a valid year', 'error');
                    return;
                }
                
                // Check if vehicle type is selected
                if (vehicleTypeValue === '' || vehicleTypeValue === 'Select Type') {
                    showNotification('Please select a vehicle type', 'error');
                    return;
                }
                
                console.log('Form validation passed, collecting data...');
                
                // Collect form data
                const formData = {
                    name: vehicleName,
                    make: vehicleBrand,
                    model: vehicleModel,
                    year: year,
                    type: vehicleTypeValue,
                    registrationNumber: registrationNumber,
                    color: document.getElementById('vehicleColor').value,
                    pricing: {
                        dailyRate: parseFloat(dailyRate),
                        weeklyRate: parseFloat(document.getElementById('weeklyRate').value || 0),
                        monthlyRate: parseFloat(document.getElementById('monthlyRate').value || 0),
                        deposit: parseFloat(document.getElementById('securityDeposit').value || 0)
                    },
                    status: document.getElementById('availabilityStatus').value,
                    availableFrom: document.getElementById('availabilityDate').value,
                    specifications: {
                        fuelType: document.getElementById('fuelType').value
                    },
                    description: document.getElementById('vehicleDescription').value,
                    agentId: user.uid,
                    createdAt: new Date()
                };
                
                // Add type-specific data
                const vehicleType = document.querySelector('.form-tab-btn.active').getAttribute('data-type');
                if (vehicleType === 'car') {
                    formData.specifications.seats = parseInt(document.getElementById('seatingCapacity').value);
                    formData.specifications.transmission = document.getElementById('transmission').value;
                } else if (vehicleType === 'bike') {
                    formData.specifications.engineCapacity = parseInt(document.getElementById('engineCapacity').value);
                    formData.specifications.bikeType = document.getElementById('bikeType').value;
                }
                
                // Show loading notification
                showNotification('Adding vehicle, please wait...', 'info');
                
                console.log('Sending vehicle data to API:', JSON.stringify(formData));
                
                // Generate a unique ID for the vehicle (formerly used for Firebase)
                const uniqueId = 'vehicle_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                // Prepare data for MongoDB - ensure type is lowercase to match validation
                const vehicleData = {
                    ...formData,
                    uniqueId: uniqueId,
                    type: formData.type.toLowerCase(),
                    // Map 'available' status to 'active' to match the enum values in the Vehicle model
                    status: formData.status === 'available' ? 'active' : formData.status,
                    name: vehicleName // Ensure name is included
                };
                
                console.log('MongoDB data with normalized type:', vehicleData.type);
                console.log('MongoDB data with normalized status:', vehicleData.status);
                
                // Use the IPC channel to save to MongoDB
                const { ipcRenderer } = require('electron');
                
                const response = await ipcRenderer.invoke('api-call', {
                    method: 'POST',
                    url: '/api/vehicles',
                    body: JSON.stringify(vehicleData)
                });
                
                // Check if the response is ok
                if (!response.ok) {
                    // Get the error message from the response
                    let errorMessage = 'Failed to save vehicle to MongoDB';
                    if (response.data && (response.data.message || response.data.error)) {
                        errorMessage = response.data.message || response.data.error;
                    }
                    throw new Error(errorMessage);
                }
                
                console.log('MongoDB save successful:', response.data);
                
                // Force refresh the vehicles list to ensure we see the new vehicle
                const refreshResponse = await ipcRenderer.invoke('api-call', {
                    method: 'GET',
                    url: `/api/vehicles?refresh=${new Date().getTime()}`
                });

                if (refreshResponse.ok) {
                    console.log('Successfully refreshed vehicle data from MongoDB');
                } else {
                    console.warn('Failed to refresh vehicle data after adding new vehicle');
                }

            showNotification('Vehicle added successfully!', 'success');
            
            // Reset form
            form.reset();
            
                // Refresh inventory before navigating back
                try {
                    console.log('Refreshing inventory after adding new vehicle');
                    
                    // Directly load from MongoDB instead of using Firebase reference
                    await loadInventory();
                    
                    // Navigate back to inventory after a short delay
            setTimeout(() => {
                const inventoryNavItem = document.querySelector('.nav-item[data-section="inventory"]');
                        if (inventoryNavItem) {
                            console.log('Navigating back to inventory view');
                inventoryNavItem.click();
                        } else {
                            console.error('Could not find inventory nav item');
                        }
            }, 1000);
                } catch (refreshError) {
                    console.error('Error refreshing inventory:', refreshError);
                    showNotification('Vehicle added but failed to refresh inventory. Please reload the page.', 'info');
                }
                
            } catch (error) {
                console.error('Error adding vehicle:', error);
                showNotification('Error adding vehicle: ' + error.message, 'error');
            }
        });
    }
    
    // Image upload preview
    setupImageUploadPreviews();
}

// Update vehicle type options based on selection
function updateVehicleTypeOptions(vehicleType) {
    const vehicleTypeSelect = document.getElementById('vehicleType');
    vehicleTypeSelect.innerHTML = '';
    
    let options = [];
    
    if (vehicleType === 'car') {
        options = [
            { value: '', text: 'Select Type' },
            { value: 'SUV', text: 'SUV' },
            { value: 'Sedan', text: 'Sedan' },
            { value: 'Hatchback', text: 'Hatchback' },
            { value: 'Luxury', text: 'Luxury' },
            { value: 'Electric', text: 'Electric' }
        ];
    } else {
        options = [
            { value: '', text: 'Select Type' },
            { value: 'Standard', text: 'Standard' },
            { value: 'Cruiser', text: 'Cruiser' },
            { value: 'Sports', text: 'Sports' },
            { value: 'Scooter', text: 'Scooter' }
        ];
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        vehicleTypeSelect.appendChild(optionElement);
    });
}

// Setup image upload previews
function setupImageUploadPreviews() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const file = this.files[0];
            
            if (file) {
                const reader = new FileReader();
                const placeholder = this.previousElementSibling.querySelector('.upload-placeholder');
                
                reader.onload = function(e) {
                    placeholder.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
                }
                
                reader.readAsDataURL(file);
            }
        });
    });
}

// Add keyboard shortcuts for quick navigation
document.addEventListener('keydown', function(e) {
    // Alt + 1-8 for quick navigation
    if (e.altKey && e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        const navItems = document.querySelectorAll('.nav-item');
        
        if (navItems[index]) {
            navItems[index].click();
        }
    }
});

// Load current rentals
async function loadCurrentRentals(agentId) {
    try {
        console.log('Loading current rentals for agent ID:', agentId);
        
        // Get container elements
        const rentalsContainer = document.querySelector('.rentals-container');
        
        // Check if rentals container exists
        if (!rentalsContainer) {
            console.warn('Rentals container not found in DOM. Current rentals cannot be displayed.');
            return;
        }
        
        // Use getElementById with querySelector fallback for better reliability
        let rentalsListElement = document.getElementById('rentals-list');
        if (!rentalsListElement) {
            console.warn('Element with ID "rentals-list" not found, trying alternative selector');
            rentalsListElement = rentalsContainer.querySelector('.rentals-list');
            
            // If still not found, create it dynamically
            if (!rentalsListElement) {
                console.warn('Creating rentals-list element dynamically as it wasn\'t found in DOM');
                rentalsListElement = document.createElement('div');
                rentalsListElement.id = 'rentals-list';
                rentalsListElement.className = 'rentals-list';
                rentalsContainer.appendChild(rentalsListElement);
            }
        }
        
        const loadingElement = rentalsContainer.querySelector('.rentals-loading');
        const emptyElement = rentalsContainer.querySelector('.rentals-empty');
        
        // Clear previous rentals - add null check
        if (rentalsListElement) {
            rentalsListElement.innerHTML = '';
        } else {
            console.warn('Cannot clear rentals list - element is null');
        }
        
        // Show loading - add null check
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
        } else {
            console.warn('Loading element not found in rentals container');
        }
        
        // Hide empty state - add null check
        if (emptyElement) {
            emptyElement.classList.add('hidden');
        } else {
            console.warn('Empty state element not found in rentals container');
        }
        
        // Get current rentals from API
        const { ipcRenderer } = require('electron');
        
        // Add a timestamp parameter to avoid browser caching
        const timestamp = new Date().getTime();
        
        let bookingsResponse = { ok: false, data: [] };
        try {
            // First approach: Query the bookings directly
            console.log(`Sending API request to: /api/bookings/current/agent/${agentId}?nocache=${timestamp}`);
            bookingsResponse = await ipcRenderer.invoke('api-call', {
                method: 'GET',
                url: `/api/bookings/current/agent/${agentId}?nocache=${timestamp}`,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            // Log the raw response for debugging
            console.log('Raw bookings response:', JSON.stringify(bookingsResponse).substring(0, 500));
            
            // Check response format
            if (!bookingsResponse.data && Array.isArray(bookingsResponse)) {
                console.log('Converting direct array response to standard format');
                bookingsResponse = { ok: true, status: 200, data: bookingsResponse };
            }
        } catch (bookingsError) {
            console.error('Error in bookings API call:', bookingsError);
            bookingsResponse = { 
                ok: false, 
                error: bookingsError.message || 'Failed to fetch bookings',
                data: []
            };
        }

        // Check for and update expired rentals
        await checkAndUpdateExpiredRentals(bookingsResponse.data);
        
        // Continue with the function as normal
        let vehiclesResponse = { ok: false, data: [] };
        try {
            // Second approach: Query the vehicles that are marked as booked
            console.log(`Sending API request to: /api/vehicles/booked/agent/${agentId}?nocache=${timestamp}`);
            vehiclesResponse = await ipcRenderer.invoke('api-call', {
                method: 'GET',
                url: `/api/vehicles/booked/agent/${agentId}?nocache=${timestamp}`,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            // Log the raw response for debugging
            console.log('Raw vehicles response:', JSON.stringify(vehiclesResponse).substring(0, 500));
            
            // Check response format
            if (!vehiclesResponse.data && Array.isArray(vehiclesResponse)) {
                console.log('Converting direct array response to standard format');
                vehiclesResponse = { ok: true, status: 200, data: vehiclesResponse };
            }
        } catch (vehiclesError) {
            console.error('Error in vehicles API call:', vehiclesError);
            vehiclesResponse = { 
                ok: false, 
                error: vehiclesError.message || 'Failed to fetch vehicles',
                data: []
            };
        }
        
        // Hide loading - add null check
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
        
        // Log the responses for debugging
        console.log('Bookings API response:', bookingsResponse);
        console.log('Vehicles API response:', vehiclesResponse);
        
        // Enhanced function to check for HTML responses
        function containsHtmlError(response) {
            if (!response) return false;
            
            // Check data field first
            if (response.data) {
                // Check if data is a string containing HTML
                if (typeof response.data === 'string' && 
                    (response.data.includes('<!DOCTYPE') || 
                     response.data.includes('<html') ||
                     response.data.includes('<body'))) {
                    console.error('Received HTML instead of JSON in data:', response.data.substring(0, 200));
                    return true;
                }
                
                // Check if data is an object with an error message containing HTML
                if (response.data.message && typeof response.data.message === 'string' &&
                    (response.data.message.includes('<!DOCTYPE') || 
                     response.data.message.includes('<html') ||
                     response.data.message.includes('<body'))) {
                    console.error('Received HTML in error message:', response.data.message.substring(0, 200));
                    return true;
                }
            }
            
            // Check error field
            if (response.error && typeof response.error === 'string' && 
                (response.error.includes('<!DOCTYPE') || 
                 response.error.includes('<html') ||
                 response.error.includes('<body'))) {
                console.error('Error contains HTML:', response.error.substring(0, 200));
                return true;
            }
            
            // Check errorDetail field (our custom field)
            if (response.errorDetail && typeof response.errorDetail === 'string' &&
                (response.errorDetail.includes('<!DOCTYPE') || 
                 response.errorDetail.includes('<html'))) {
                console.error('Error detail contains HTML:', response.errorDetail.substring(0, 200));
                return true;
            }
            
            return false;
        }
        
        // Handle HTML responses
        if (containsHtmlError(bookingsResponse)) {
            console.error('Bookings API returned HTML instead of JSON');
            bookingsResponse = { ok: false, data: [], error: 'Received HTML instead of JSON' };
        }
        
        if (containsHtmlError(vehiclesResponse)) {
            console.error('Vehicles API returned HTML instead of JSON');
            vehiclesResponse = { ok: false, data: [], error: 'Received HTML instead of JSON' };
        }
        
        // Make sure data is always an array, even if the API returns something else
        if (bookingsResponse.data && !Array.isArray(bookingsResponse.data)) {
            console.error('Bookings API did not return an array, converting to empty array');
            bookingsResponse.data = [];
        }
        
        if (vehiclesResponse.data && !Array.isArray(vehiclesResponse.data)) {
            console.error('Vehicles API did not return an array, converting to empty array');
            vehiclesResponse.data = [];
        }
        
        // Check if both APIs failed
        if ((!bookingsResponse.ok || !bookingsResponse.data || bookingsResponse.data.length === 0) &&
            (!vehiclesResponse.ok || !vehiclesResponse.data || vehiclesResponse.data.length === 0)) {
            // Show empty state - add null check
            if (emptyElement) {
                emptyElement.classList.remove('hidden');
                
                // Add null checks for child elements
                const titleElement = emptyElement.querySelector('h3');
                const messageElement = emptyElement.querySelector('p');
                
                console.log('No current rentals found from either method');
                
                // Display errors if any
                const errorMessages = [];
                if (bookingsResponse.error) errorMessages.push(`Bookings: ${bookingsResponse.error}`);
                if (vehiclesResponse.error) errorMessages.push(`Vehicles: ${vehiclesResponse.error}`);
                
                if (errorMessages.length > 0 && titleElement && messageElement) {
                    titleElement.textContent = 'Error Loading Rentals';
                    messageElement.textContent = errorMessages.join('. ');
                }
            } else {
                console.warn('Empty state element is missing, cannot show no-rentals message');
            }
            
            // Update dashboard active rentals count - add null check
            const activeRentalsElement = document.getElementById('activeRentals');
            if (activeRentalsElement) {
                activeRentalsElement.textContent = '0';
            } else {
                console.warn('activeRentals element not found, cannot update count');
            }
            
            return;
        }
        
        // Combine data from both APIs, removing duplicates
        let allRentals = [];
        
        // Add bookings from the first API
        if (bookingsResponse.ok && bookingsResponse.data && Array.isArray(bookingsResponse.data) && bookingsResponse.data.length > 0) {
            console.log(`Found ${bookingsResponse.data.length} current rentals from bookings API`);
            allRentals = [...bookingsResponse.data];
        } else if (bookingsResponse.data && !Array.isArray(bookingsResponse.data)) {
            console.error('Bookings API did not return an array:', bookingsResponse.data);
        }
        
        // Add bookings from the second API, avoiding duplicates
        if (vehiclesResponse.ok && vehiclesResponse.data && Array.isArray(vehiclesResponse.data) && vehiclesResponse.data.length > 0) {
            console.log(`Found ${vehiclesResponse.data.length} current rentals from vehicles API`);
            
            vehiclesResponse.data.forEach(vehicleRental => {
                // Check if this vehicle is already in our results
                const exists = allRentals.some(existing => 
                    existing.vehicleId === vehicleRental.vehicleId ||
                    existing.vehicleId?._id === vehicleRental.vehicleId
                );
                
                if (!exists) {
                    allRentals.push(vehicleRental);
                }
            });
        } else if (vehiclesResponse.data && !Array.isArray(vehiclesResponse.data)) {
            console.error('Vehicles API did not return an array:', vehiclesResponse.data);
        }
        
        console.log(`Combined total: ${allRentals.length} unique current rentals`);
        
        // PRE-PROCESS RENTAL DATA TO ENSURE PROPER CUSTOMER AND LOCATION INFO
        // This step validates and enriches the rental data before rendering
        const processedRentals = await Promise.all(allRentals.map(async (rental) => {
            // Make a copy to avoid modifying the original
            const processedRental = { ...rental };
            
            // Log the raw rental data for debugging
            console.log('Raw rental data before processing:', processedRental);
            
            // Process vehicle information
            processedRental.vehicleName = processedRental.vehicleName || 'Unknown Vehicle';
            processedRental.vehicleType = processedRental.vehicleType || 'Unknown';
            
            // Check if this is a synthetic booking (created from a booked vehicle rather than a real booking)
            const isSyntheticBooking = processedRental.isSyntheticBooking || processedRental.bookingId === 'unknown';
            
            // If this is a synthetic booking, try to find a real booking for this vehicle
            if (isSyntheticBooking && processedRental.vehicleId) {
                try {
                    // First check if we can find a real booking for this vehicle
                    const { ipcRenderer } = require('electron');
                    const bookingsForVehicle = await ipcRenderer.invoke('api-call', {
                        method: 'GET',
                        url: `/api/bookings?vehicleId=${processedRental.vehicleId}&status=confirmed`,
                        headers: {
                            'Accept': 'application/json',
                            'Cache-Control': 'no-cache'
                        }
                    });
                    
                    if (bookingsForVehicle.ok && bookingsForVehicle.data && Array.isArray(bookingsForVehicle.data) && bookingsForVehicle.data.length > 0) {
                        // Sort bookings by date (most recent first)
                        const recentBookings = bookingsForVehicle.data.sort((a, b) => 
                            new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0)
                        );
                        
                        // Use the most recent booking's data
                        const latestBooking = recentBookings[0];
                        console.log('Found real booking for synthetic entry:', latestBooking);
                        
                        // Update synthetic booking with real booking data
                        processedRental.bookingId = latestBooking._id;
                        processedRental.isSyntheticBooking = false;
                        
                        if (latestBooking.userId) processedRental.customerId = latestBooking.userId;
                        if (latestBooking.userName) processedRental.customerName = latestBooking.userName;
                        if (latestBooking.pickupLocation) processedRental.pickupLocation = latestBooking.pickupLocation;
                        if (latestBooking.returnLocation) processedRental.returnLocation = latestBooking.returnLocation;
                        if (latestBooking.pickupDate) processedRental.pickupDate = latestBooking.pickupDate;
                        if (latestBooking.returnDate) processedRental.returnDate = latestBooking.returnDate;
                        if (latestBooking.totalAmount) processedRental.totalAmount = latestBooking.totalAmount;
                        if (latestBooking.status) processedRental.status = latestBooking.status;
                        
                        // Calculate updated time metrics
                        const currentDate = new Date();
                        const returnDate = new Date(processedRental.returnDate);
                        const timeUntilReturn = returnDate - currentDate;
                        const hoursUntilReturn = Math.floor(timeUntilReturn / (1000 * 60 * 60));
                        
                        processedRental.hoursUntilReturn = hoursUntilReturn;
                        processedRental.isReturningToday = hoursUntilReturn <= 24;
                        processedRental.isReturningInTwoHours = hoursUntilReturn <= 2;
                    } else {
                        // Also check Firebase for bookings
                        const firebaseBookings = await ipcRenderer.invoke('api-call', {
                            method: 'GET',
                            url: `/api/bookings/firebase?vehicleId=${processedRental.vehicleId}`,
                            headers: {
                                'Accept': 'application/json',
                                'Cache-Control': 'no-cache'
                            }
                        });
                        
                        if (firebaseBookings.ok && firebaseBookings.data && firebaseBookings.data.length > 0) {
                            const latestFirebaseBooking = firebaseBookings.data[0];
                            console.log('Found Firebase booking for synthetic entry:', latestFirebaseBooking);
                            
                            // Update missing fields
                            if (latestFirebaseBooking.pickupLocation) processedRental.pickupLocation = latestFirebaseBooking.pickupLocation;
                            if (latestFirebaseBooking.returnLocation) processedRental.returnLocation = latestFirebaseBooking.returnLocation;
                            if (latestFirebaseBooking.customerName) processedRental.customerName = latestFirebaseBooking.customerName;
                            if (latestFirebaseBooking.customerId) processedRental.customerId = latestFirebaseBooking.customerId;
                            if (latestFirebaseBooking.bookingId) processedRental.bookingId = latestFirebaseBooking.bookingId;
                        }
                    }
                } catch (error) {
                    console.error('Error retrieving real booking for synthetic entry:', error);
                }
            }
            
            // Fetch customer details if needed (if we have an ID but no name)
            if ((processedRental.customerName === 'Unknown Customer' || !processedRental.customerName) && 
                processedRental.customerId && 
                processedRental.customerId !== 'unknown') {
                
                try {
                    const customerDetails = await fetchCustomerDetails(processedRental.customerId);
                    if (customerDetails) {
                        console.log('Fetched customer details:', customerDetails);
                        
                        // Update customer name if available
                        if (customerDetails.name) {
                            processedRental.customerName = customerDetails.name;
                        }
                        
                        // Store additional customer details if needed later
                        processedRental.customerEmail = customerDetails.email || '';
                        processedRental.customerPhone = customerDetails.phoneNumber || '';
                    }
                } catch (error) {
                    console.error('Error fetching customer details:', error);
                }
            }
            
            // Fetch booking details if needed (if we have a booking ID but missing location info)
            if ((processedRental.pickupLocation === 'Not specified' || processedRental.returnLocation === 'Not specified') && 
                processedRental.bookingId && 
                processedRental.bookingId !== 'unknown') {
                
                try {
                    const bookingDetails = await fetchBookingDetails(processedRental.bookingId);
                    if (bookingDetails) {
                        console.log('Fetched booking details:', bookingDetails);
                        
                        // Update pickup location if needed
                        if (processedRental.pickupLocation === 'Not specified' && bookingDetails.pickupLocation) {
                            processedRental.pickupLocation = bookingDetails.pickupLocation;
                        }
                        
                        // Update return location if needed
                        if (processedRental.returnLocation === 'Not specified' && bookingDetails.returnLocation) {
                            processedRental.returnLocation = bookingDetails.returnLocation;
                        }
                    }
                } catch (error) {
                    console.error('Error fetching booking details:', error);
                }
            }
            
            // Log the processed rental data
            console.log('Processed rental data (ready for rendering):', {
                vehicleName: processedRental.vehicleName,
                customerName: processedRental.customerName, 
                customerId: processedRental.customerId,
                pickupLocation: processedRental.pickupLocation,
                returnLocation: processedRental.returnLocation
            });
            
            return processedRental;
        }));
        
        // Update dashboard active rentals count - add null check
        const activeRentalsElement = document.getElementById('activeRentals');
        if (activeRentalsElement) {
            activeRentalsElement.textContent = processedRentals.length.toString();
        } else {
            console.warn('activeRentals element not found, cannot update count with total:', processedRentals.length);
        }
        
        // Process and display each rental - add null check
        if (rentalsListElement) {
            processedRentals.forEach((rental, index) => {
                try {
                    console.log(`Processing rental ${index + 1}:`, rental);
                    const rentalElement = createRentalCard(rental);
                    rentalsListElement.appendChild(rentalElement);
                } catch (renderError) {
                    console.error(`Error rendering rental ${index}:`, renderError, rental);
                    // Skip rendering this rental
                }
            });
            
            // Add filter functionality
            setupRentalFilters();
        } else {
            console.warn('Cannot render rentals - rentals list element is missing');
        }
        
    } catch (error) {
        console.error('Error loading current rentals:', error);
        showNotification('Failed to load current rentals: ' + error.message, 'error');
        
        // Hide loading and show empty state with error message - add null checks
        const rentalsContainer = document.querySelector('.rentals-container');
        if (rentalsContainer) {
            const loadingElement = rentalsContainer.querySelector('.rentals-loading');
            if (loadingElement) {
                loadingElement.classList.add('hidden');
            }
            
            const emptyElement = rentalsContainer.querySelector('.rentals-empty');
            if (emptyElement) {
                emptyElement.classList.remove('hidden');
                
                // Add null checks for child elements
                const titleElement = emptyElement.querySelector('h3');
                const messageElement = emptyElement.querySelector('p');
                
                if (titleElement) {
                    titleElement.textContent = 'Error Loading Rentals';
                }
                
                if (messageElement) {
                    messageElement.textContent = error.message || 'Please try again later.';
                }
            } else {
                console.warn('Empty state element is missing, cannot show error message');
            }
        } else {
            console.warn('Rentals container not found, cannot show error state');
        }
    }
}

// Function to check and update rentals with expired return dates
async function checkAndUpdateExpiredRentals(rentals) {
    try {
        console.log('Checking for agent-side expired rentals...');
        if (!rentals || !Array.isArray(rentals)) {
            console.log('No rentals data to check');
            return;
        }
        
        const currentDate = new Date();
        const { ipcRenderer } = require('electron');
        let updatedCount = 0;
        
        // Process each rental to check if it's expired
        for (const rental of rentals) {
            // Skip if already completed or cancelled
            if (rental.status === 'completed' || rental.status === 'cancelled') {
                continue;
            }
            
            if (!rental.returnDate) {
                console.warn(`Rental ${rental._id || 'unknown'} has no return date, skipping`);
                continue;
            }
            
            // Parse return date
            const returnDate = new Date(rental.returnDate);
            
            // If return date is in the past, this rental has expired
            if (returnDate < currentDate) {
                console.log(`Found expired rental for vehicle ${rental.vehicleId}, booking ID: ${rental._id}`);
                
                // Update booking status to completed
                try {
                    const updateResponse = await ipcRenderer.invoke('api-call', {
                        method: 'PUT',
                        url: `/api/bookings/${rental._id}/status`,
                        body: JSON.stringify({ status: 'completed' })
                    });
                    
                    if (updateResponse.ok) {
                        console.log(`Successfully updated expired booking ${rental._id} to completed`);
                        
                        // Update vehicle status to available
                        const vehicleUpdateResponse = await ipcRenderer.invoke('api-call', {
                            method: 'PUT',
                            url: `/api/vehicles/${rental.vehicleId}/status`,
                            body: JSON.stringify({ status: 'active' })
                        });
                        
                        if (vehicleUpdateResponse.ok) {
                            console.log(`Successfully updated vehicle ${rental.vehicleId} status to available in MongoDB`);
                            updatedCount++;
                        } else {
                            console.error(`Failed to update vehicle ${rental.vehicleId} status: ${vehicleUpdateResponse.error || 'Unknown error'}`);
                        }
                    } else {
                        console.error(`Failed to update booking ${rental._id} status: ${updateResponse.error || 'Unknown error'}`);
                    }
                } catch (error) {
                    console.error(`Error processing expired rental ${rental._id}:`, error);
                }
            }
        }
        
        if (updatedCount > 0) {
            console.log(`Updated ${updatedCount} expired rentals`);
            // If we updated any rentals, show a notification
            showNotification(`Updated ${updatedCount} vehicles from 'rented' to 'available' based on expired rental periods`, 'info');
        } else {
            console.log('No expired rentals found needing updates');
        }
    } catch (error) {
        console.error('Error checking for expired rentals:', error);
    }
}

// Create a rental card element
function createRentalCard(rental) {
    // Final validation of rental data before creating the card
    // Ensure we have all required values and replace any remaining placeholders
    const validatedRental = {
        ...rental,
        vehicleName: rental.vehicleName && rental.vehicleName !== 'Unknown Vehicle' 
            ? rental.vehicleName 
            : (rental.make && rental.model ? `${rental.make} ${rental.model}` : 'Vehicle'),
        
        vehicleType: rental.vehicleType && rental.vehicleType !== 'Unknown' 
            ? rental.vehicleType 
            : 'Standard',
        
        customerName: rental.customerName && rental.customerName !== 'Unknown Customer' 
            ? rental.customerName 
            : (rental.userName || 'Customer'),
        
        customerId: rental.customerId && rental.customerId !== 'unknown' 
            ? rental.customerId 
            : 'ID Not Available',
        
        pickupLocation: rental.pickupLocation && rental.pickupLocation !== 'Not specified' 
            ? rental.pickupLocation 
            : 'Location not provided',
        
        returnLocation: rental.returnLocation && rental.returnLocation !== 'Not specified' 
            ? rental.returnLocation 
            : (rental.pickupLocation && rental.pickupLocation !== 'Not specified' ? rental.pickupLocation : 'Location not provided')
    };
    
    // Log the final validation for debugging
    console.log('Final validated rental data before rendering:', {
        vehicleName: validatedRental.vehicleName,
        customerName: validatedRental.customerName,
        customerId: validatedRental.customerId,
        pickupLocation: validatedRental.pickupLocation,
        returnLocation: validatedRental.returnLocation
    });
    
    const rentalCard = document.createElement('div');
    rentalCard.className = 'rental-card';
    rentalCard.dataset.returning = validatedRental.isReturningToday ? 'today' : 'later';
    
    // Format dates
    const pickupDate = new Date(validatedRental.pickupDate);
    const returnDate = new Date(validatedRental.returnDate);
    const formattedPickupDate = formatDate(pickupDate);
    const formattedReturnDate = formatDate(returnDate);
    
    // Determine vehicle icon
    const isMotorcycle = validatedRental.vehicleType && 
        (validatedRental.vehicleType.toLowerCase().includes('bike') || 
         validatedRental.vehicleType.toLowerCase().includes('cruiser') || 
         validatedRental.vehicleType.toLowerCase().includes('scooter') || 
         validatedRental.vehicleType.toLowerCase().includes('sports'));
         
    const vehicleIcon = isMotorcycle ? 'fa-motorcycle' : 'fa-car-alt';
    
    // Create badge based on return time or synthetic booking
    let badgeHTML = '';
    if (validatedRental.isSyntheticBooking) {
        badgeHTML = `<span class="rental-badge returning-soon">Auto-generated</span>`;
    } else if (validatedRental.isReturningInTwoHours) {
        badgeHTML = `<span class="rental-badge returning-soon">Returning in ${validatedRental.hoursUntilReturn} hour${validatedRental.hoursUntilReturn === 1 ? '' : 's'}</span>`;
    } else if (validatedRental.isReturningToday) {
        badgeHTML = `<span class="rental-badge returning-today">Returning Today</span>`;
    }
    
    // Format customer ID for display (shorten if too long)
    const displayCustomerId = validatedRental.customerId === 'ID Not Available' 
        ? 'ID Not Available' 
        : (validatedRental.customerId.length > 12 
            ? validatedRental.customerId.substring(0, 8) + '...' 
            : validatedRental.customerId);
    
    rentalCard.innerHTML = `
        <div class="rental-header">
            <div class="rental-vehicle">
                <div class="rental-vehicle-icon">
                    <i class="fas ${vehicleIcon}"></i>
                </div>
                <div class="rental-vehicle-info">
                    <h3>${validatedRental.vehicleName}</h3>
                    <p>${validatedRental.vehicleType}</p>
                </div>
            </div>
            ${badgeHTML}
        </div>
        <div class="rental-content">
            <div class="rental-customer">
                <div class="customer-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="customer-info">
                    <h4>${validatedRental.customerName}</h4>
                    <p class="customer-id">ID: <span class="id-value">${displayCustomerId}</span></p>
                </div>
            </div>
            
            <div class="rental-detail-group">
                <h4>Rental Period</h4>
                <div class="rental-detail-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${formattedPickupDate} - ${formattedReturnDate}</span>
                </div>
                <div class="rental-detail-item">
                    <i class="fas fa-hourglass-half"></i>
                    <span>${getDaysBetween(pickupDate, returnDate)} days</span>
                </div>
            </div>
            
            <div class="rental-detail-group">
                <h4>Locations</h4>
                <div class="rental-detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Pickup: ${validatedRental.pickupLocation}</span>
                </div>
                <div class="rental-detail-item">
                    <i class="fas fa-map-marker"></i>
                    <span>Return: ${validatedRental.returnLocation}</span>
                </div>
            </div>
            
            <div class="rental-actions">
                <button class="contact-btn" data-customer-id="${validatedRental.customerId}" ${validatedRental.isSyntheticBooking || validatedRental.customerId === 'ID Not Available' ? 'disabled' : ''}>
                    <i class="fas fa-phone-alt"></i>
                    Contact
                </button>
                <button class="details-btn" data-booking-id="${validatedRental.bookingId}" ${validatedRental.bookingId === 'unknown' ? 'disabled' : ''}>
                    <i class="fas fa-info-circle"></i>
                    Details
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners to buttons
    const contactBtn = rentalCard.querySelector('.contact-btn');
    const detailsBtn = rentalCard.querySelector('.details-btn');
    
    if (!validatedRental.isSyntheticBooking && validatedRental.customerId !== 'ID Not Available') {
        contactBtn.addEventListener('click', function() {
            const customerId = this.getAttribute('data-customer-id');
            showNotification(`Contacting customer ${validatedRental.customerName}...`, 'info');
            // Implement contact functionality in a real app
        });
    }
    
    if (validatedRental.bookingId !== 'unknown') {
        detailsBtn.addEventListener('click', async function() {
            const bookingId = this.getAttribute('data-booking-id');
            showNotification(`Loading details for booking ${bookingId.substring(0, 8)}...`, 'info');
            
            try {
                // Fetch complete booking details
                const bookingDetails = await fetchFullBookingDetails(bookingId);
                
                if (bookingDetails) {
                    // Create and show the booking details modal
                    showBookingDetailsModal(bookingDetails);
                } else {
                    showNotification('Failed to load booking details', 'error');
                }
            } catch (error) {
                console.error('Error showing booking details:', error);
                showNotification('Error loading booking details: ' + error.message, 'error');
            }
        });
    }
    
    return rentalCard;
}

// Function to fetch full booking details including customer and locations
async function fetchFullBookingDetails(bookingId) {
    console.log(`Fetching full booking details for ID: ${bookingId}`);
    
    // First get basic booking details
    const bookingData = await fetchBookingDetails(bookingId);
    
    if (!bookingData) {
        return null;
    }
    
    // Enhanced booking with additional details
    const enhancedBooking = {...bookingData};
    
    // If we need to fetch customer details
    if (enhancedBooking.userId && (!enhancedBooking.userName || enhancedBooking.userName === 'Unknown Customer')) {
        try {
            const customerDetails = await fetchCustomerDetails(enhancedBooking.userId);
            if (customerDetails) {
                enhancedBooking.userName = customerDetails.name || 'Customer';
                enhancedBooking.userEmail = customerDetails.email || '';
                enhancedBooking.userPhone = customerDetails.phoneNumber || '';
            }
        } catch (customerError) {
            console.error('Error fetching customer details for booking:', customerError);
        }
    }
    
    // Check for Firebase bookings that might have additional details
    if (enhancedBooking.firebaseId && (!enhancedBooking.pickupLocation || enhancedBooking.pickupLocation === 'Not specified')) {
        try {
            const { ipcRenderer } = require('electron');
            const response = await ipcRenderer.invoke('api-call', {
                method: 'GET',
                url: `/api/bookings/check/${enhancedBooking.firebaseId}`,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (response.ok && response.data && response.data.exists && response.data.booking) {
                const firebaseBooking = response.data.booking;
                
                // Update missing location info
                if (firebaseBooking.pickupLocation && !enhancedBooking.pickupLocation) {
                    enhancedBooking.pickupLocation = firebaseBooking.pickupLocation;
                }
                
                if (firebaseBooking.returnLocation && !enhancedBooking.returnLocation) {
                    enhancedBooking.returnLocation = firebaseBooking.returnLocation;
                }
                
                // Check for other missing details
                if (firebaseBooking.userName && !enhancedBooking.userName) {
                    enhancedBooking.userName = firebaseBooking.userName;
                }
            }
        } catch (firebaseError) {
            console.error('Error fetching Firebase booking details:', firebaseError);
        }
    }
    
    return enhancedBooking;
}

// Function to display booking details modal
function showBookingDetailsModal(booking) {
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
    
    // Calculate duration in days
    const days = Math.ceil(
        (new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24)
    ) || 1;
    
    // Format amount
    const amount = `₹${booking.totalAmount?.toLocaleString() || '0'}`;
    const dailyRate = `₹${booking.dailyRate?.toLocaleString() || (booking.pricing?.dailyRate?.toLocaleString() || '0')}`;
    
    // Format status
    const statusClass = booking.status?.toLowerCase() || 'confirmed';
    const statusDisplay = booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Confirmed';
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Booking Details</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="booking-id">
                    <strong>Booking ID:</strong> ${booking._id || booking.firebaseId || 'N/A'}
                </div>
                
                <div class="booking-details-container">
                    <div class="booking-vehicle-details">
                        <div class="vehicle-icon-large">
                            <i class="fas ${booking.vehicleType?.toLowerCase().includes('scooter') || booking.vehicleType?.toLowerCase().includes('bike') ? 'fa-motorcycle' : 'fa-car'}"></i>
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
                                <p>${booking.pickupLocation || 'Delhi Central'}</p>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <div>
                                <strong>Duration</strong>
                                <p>${booking.days || days} day(s)</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="price-breakdown">
                        <h4>Price Details</h4>
                        <div class="price-item">
                            <span>Daily Rate:</span>
                            <span>${dailyRate}</span>
                        </div>
                        <div class="price-item">
                            <span>Duration:</span>
                            <span>${booking.days || days} day(s)</span>
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

// Function to handle booking cancellation
async function handleCancelBooking(bookingId) {
    if (!bookingId) {
        showNotification('Invalid booking ID', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    showNotification('Cancelling booking...', 'info');
    
    try {
        const { ipcRenderer } = require('electron');
        const response = await ipcRenderer.invoke('api-call', {
            method: 'PUT',
            url: `/api/bookings/${bookingId}/status`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ status: 'cancelled' })
        });
        
        if (response.ok) {
            showNotification('Booking cancelled successfully', 'success');
            // Reload current rentals to reflect the changes
            setTimeout(() => {
                loadCurrentRentals();
            }, 1000);
        } else {
            showNotification('Failed to cancel booking: ' + (response.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showNotification('Error cancelling booking: ' + error.message, 'error');
    }
}

// Setup rental filters
function setupRentalFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filter = this.getAttribute('data-filter');
            
            // Apply filter
            const rentalCards = document.querySelectorAll('.rental-card');
            
            rentalCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = '';
                } else if (filter === 'upcoming' && card.dataset.returning === 'today') {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Animate visible cards
            setTimeout(() => {
                const visibleCards = document.querySelectorAll('.rental-card[style=""]');
                visibleCards.forEach((card, index) => {
                    card.style.animation = 'none';
                    void card.offsetWidth; // Trigger reflow
                    card.style.animation = `fadeIn 0.3s ease-in-out ${index * 0.05}s`;
                });
            }, 10);
        });
    });
}

// Helper function to format date
function formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Helper function to get days between two dates
function getDaysBetween(startDate, endDate) {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((endDate - startDate) / millisecondsPerDay));
}

// Helper function to fetch customer details directly if not provided by the API
async function fetchCustomerDetails(customerId) {
    if (!customerId || customerId === 'unknown') {
        return null;
    }
    
    console.log(`Fetching customer details for ID: ${customerId}`);
    const { ipcRenderer } = require('electron');
    
    try {
        // Create a unique cache buster
        const timestamp = new Date().getTime();
        
        // Make API call to fetch customer details
        const response = await ipcRenderer.invoke('api-call', {
            method: 'GET',
            url: `/api/customers/${customerId}?nocache=${timestamp}`,
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (response.ok && response.data) {
            console.log(`Successfully fetched customer details for ID ${customerId}:`, response.data);
            return response.data;
        } else {
            console.warn(`Failed to fetch customer details for ID ${customerId}:`, response.error || 'Unknown error');
            return null;
        }
    } catch (error) {
        console.error(`Error fetching customer details for ID ${customerId}:`, error);
        return null;
    }
}

// Helper function to fetch booking details directly if needed
async function fetchBookingDetails(bookingId) {
    if (!bookingId || bookingId === 'unknown') {
        return null;
    }
    
    console.log(`Fetching booking details for ID: ${bookingId}`);
    const { ipcRenderer } = require('electron');
    
    try {
        // Create a unique cache buster
        const timestamp = new Date().getTime();
        
        // Make API call to fetch booking details
        const response = await ipcRenderer.invoke('api-call', {
            method: 'GET',
            url: `/api/bookings/${bookingId}?nocache=${timestamp}`,
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (response.ok && response.data) {
            console.log(`Successfully fetched booking details for ID ${bookingId}:`, response.data);
            return response.data;
        } else {
            console.warn(`Failed to fetch booking details for ID ${bookingId}:`, response.error || 'Unknown error');
            return null;
        }
    } catch (error) {
        console.error(`Error fetching booking details for ID ${bookingId}:`, error);
        return null;
    }
}

// Load past rentals for agent
async function loadPastRentals(agentId) {
    console.log('Loading past rentals for agent:', agentId);
    
    // References to UI elements
    const pastRentalsContainer = document.querySelector('.past-rentals-container');
    const pastRentalsTable = document.querySelector('.past-rentals-table-container');
    const pastRentalsLoading = document.querySelector('.past-rentals-loading');
    const pastRentalsEmpty = document.querySelector('.past-rentals-empty');
    const tableBody = document.getElementById('pastRentalsTableBody');
    
    // Show loading state - add null checks for safety
    if (pastRentalsTable && pastRentalsTable.classList) pastRentalsTable.classList.add('hidden');
    if (pastRentalsEmpty && pastRentalsEmpty.classList) pastRentalsEmpty.classList.add('hidden');
    if (pastRentalsLoading && pastRentalsLoading.classList) pastRentalsLoading.classList.remove('hidden');
    
    try {
        // Fetch completed rentals from MongoDB
        const { ipcRenderer } = require('electron');
        
        console.log(`Navigating to past rentals section, refreshing data for agent: ${agentId}`);
        
        console.log(`Making API request to /api/bookings/completed/agent/${agentId}`);
        const response = await ipcRenderer.invoke('api-call', {
            method: 'GET',
            url: `/api/bookings/completed/agent/${agentId}`
        });
        
        console.log('Response from API:', response);
        
        // Hide loading spinner
        if (pastRentalsLoading && pastRentalsLoading.classList) pastRentalsLoading.classList.add('hidden');
        
        // Handle empty or error response
        if (!response || !response.ok || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
            console.log('No past rentals found for agent', agentId);
            console.log('Response details:', JSON.stringify(response, null, 2));
            
            // If we got a 404 error, try a fallback approach with direct MongoDB queries
            if (response && response.status === 404) {
                try {
                    console.log('Trying fallback approach with direct MongoDB query');
                    
                    // Make a direct query to the database for completed bookings
                    const fallbackResponse = await ipcRenderer.invoke('api-call', {
                        method: 'GET',
                        url: `/api/bookings/search?agentId=${agentId}&status=completed`
                    });
                    
                    if (fallbackResponse && fallbackResponse.ok && Array.isArray(fallbackResponse.data) && fallbackResponse.data.length > 0) {
                        console.log(`Fallback successful! Found ${fallbackResponse.data.length} completed rentals`);
                        
                        // Show table and populate it with fallback data
                        if (pastRentalsTable && pastRentalsTable.classList) pastRentalsTable.classList.remove('hidden');
                        if (tableBody) {
                            populatePastRentalsTable(fallbackResponse.data, tableBody);
                            return;
                        }
                    } else {
                        console.log('Fallback approach did not find any completed rentals');
                    }
                } catch (fallbackError) {
                    console.error('Error in fallback approach:', fallbackError);
                }
            }
            
            // Show empty state if both regular and fallback approaches fail
            if (pastRentalsEmpty && pastRentalsEmpty.classList) pastRentalsEmpty.classList.remove('hidden');
            return;
        }
        
        // Process and display rentals
        const pastRentals = response.data;
        console.log(`Found ${pastRentals.length} past rentals:`, pastRentals);
        
        // Show table and populate it
        if (pastRentalsTable && pastRentalsTable.classList) pastRentalsTable.classList.remove('hidden');
        if (tableBody) {
            populatePastRentalsTable(pastRentals, tableBody);
        } else {
            console.error('Table body element not found, cannot populate past rentals table');
        }
        
    } catch (error) {
        console.error('Error loading past rentals:', error);
        
        // Show error state
        if (pastRentalsLoading && pastRentalsLoading.classList) pastRentalsLoading.classList.add('hidden');
        
        if (pastRentalsEmpty && pastRentalsEmpty.classList) {
            pastRentalsEmpty.classList.remove('hidden');
            pastRentalsEmpty.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                <h3>Failed to load past rentals</h3>
                <p>${error.message || 'An unexpected error occurred'}</p>
                <button class="retry-btn" onclick="loadPastRentals('${agentId}')">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            `;
        }
    }
}

// Function to populate past rentals table
function populatePastRentalsTable(rentals, tableBody) {
    if (!tableBody) return;
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Enrich the rentals with vehicle information if needed
    enrichPastRentalsWithVehicleInfo(rentals)
        .then(enrichedRentals => {
            // Add each rental as a row
            enrichedRentals.forEach(rental => {
                const row = createPastRentalRow(rental);
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error enriching rentals with vehicle info:', error);
            // Fallback to using original data
            rentals.forEach(rental => {
                const row = createPastRentalRow(rental);
                tableBody.appendChild(row);
            });
        });
}

// Function to enrich past rentals with vehicle information
async function enrichPastRentalsWithVehicleInfo(rentals) {
    try {
        const { ipcRenderer } = require('electron');
        const enrichedRentals = await Promise.all(rentals.map(async rental => {
            // Skip if already has a proper vehicle name
            if (rental.vehicleName && rental.vehicleName !== "undefined undefined" && rental.vehicleName !== "Unknown Vehicle") {
                return rental;
            }
            
            // Skip if no valid vehicleId
            if (!rental.vehicleId || rental.vehicleId.startsWith('demo')) {
                return rental;
            }
            
            // Try to fetch vehicle details
            try {
                console.log(`Fetching vehicle details for ID: ${rental.vehicleId}`);
                const response = await ipcRenderer.invoke('api-call', {
                    method: 'GET',
                    url: `/api/vehicles/${rental.vehicleId}`,
                    headers: {
                        'Accept': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });
                
                if (response.ok && response.data) {
                    console.log(`Successfully fetched vehicle details:`, response.data);
                    // Create enriched rental with vehicle data
                    return {
                        ...rental,
                        vehicleName: response.data.name || `${response.data.make || ''} ${response.data.model || ''}`.trim() || rental.vehicleName,
                        make: response.data.make || '',
                        model: response.data.model || '',
                        vehicleType: response.data.type || rental.vehicleType
                    };
                }
            } catch (error) {
                console.error(`Error fetching vehicle with ID ${rental.vehicleId}:`, error);
            }
            
            // Return original rental if fetch failed
            return rental;
        }));
        
        return enrichedRentals;
    } catch (error) {
        console.error('Error in enrichPastRentalsWithVehicleInfo:', error);
        return rentals; // Return original rentals on error
    }
}

// Function to create a single past rental row
function createPastRentalRow(rental) {
    const row = document.createElement('tr');
    
    // Format dates
    const pickupDate = new Date(rental.pickupDate);
    const returnDate = new Date(rental.returnDate);
    
    // Calculate duration in days
    const durationMs = returnDate - pickupDate;
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    // Format dates for display
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    
    // Format currency
    const formatCurrency = (amount) => {
        return '₹' + Number(amount || 0).toLocaleString('en-IN');
    };
    
    // Determine vehicle type icon
    let vehicleIcon = 'fa-car';
    if (rental.vehicleType && rental.vehicleType.toLowerCase().includes('bike') ||
        rental.vehicleType && rental.vehicleType.toLowerCase().includes('scooter')) {
        vehicleIcon = 'fa-motorcycle';
    }
    
    // Get or create a short version of renter ID
    const renterId = rental.userId || rental.customerId || 'Unknown';
    const shortRenterId = renterId.substring(0, 8) + '...';
    
    // Log the rental data for debugging
    console.log('Rental data for row:', {
        vehicleName: rental.vehicleName,
        vehicleId: rental.vehicleId,
        make: rental.make,
        model: rental.model,
        totalAmount: rental.totalAmount
    });
    
    // Get vehicle name from various possible properties
    let vehicleName = 'Unknown Vehicle';
    if (rental.vehicleName && rental.vehicleName !== "undefined undefined") {
        vehicleName = rental.vehicleName;
    } else if (rental.make && rental.model) {
        vehicleName = `${rental.make} ${rental.model}`;
    } else if (rental.vehicleId) {
        // Use a placeholder with the ID as reference
        vehicleName = `Vehicle ID: ${rental.vehicleId.substring(0, 8)}...`;
    }
    
    // Set the row content
    row.innerHTML = `
        <td>
            <div class="vehicle-info">
                <div class="vehicle-icon">
                    <i class="fas ${vehicleIcon}"></i>
                </div>
                ${vehicleName}
            </div>
        </td>
        <td>
            <span class="category-badge ${rental.vehicleType?.toLowerCase() || 'standard'}">
                ${rental.vehicleType || 'Standard'}
            </span>
        </td>
        <td>
            <span class="renter-id" title="${renterId}">${shortRenterId}</span>
        </td>
        <td>
            <div class="rental-period">
                <div>${formatDate(pickupDate)} <span class="rental-arrow">→</span> ${formatDate(returnDate)}</div>
            </div>
        </td>
        <td>
            <span class="duration">${durationDays} day${durationDays !== 1 ? 's' : ''}</span>
        </td>
        <td>
            <div class="location-info">
                <span class="location-label">Pickup</span>
                ${rental.pickupLocation || 'Main Office'}
            </div>
        </td>
        <td>
            <div class="location-info">
                <span class="location-label">Return</span>
                ${rental.returnLocation || rental.pickupLocation || 'Main Office'}
            </div>
        </td>
        <td>
            <div class="amount-info">
                <span class="amount">${formatCurrency(rental.totalAmount)}</span>
            </div>
        </td>
        <td>
            <button class="action-btn view-btn" data-booking-id="${rental._id}" title="View Details">
                <i class="fas fa-eye"></i>
            </button>
        </td>
    `;
    
    // Add event listener for view button
    const viewBtn = row.querySelector('.view-btn');
    if (viewBtn) {
        viewBtn.addEventListener('click', async () => {
            try {
                const bookingDetails = await fetchFullBookingDetails(rental._id);
                showBookingDetailsModal(bookingDetails);
            } catch (error) {
                console.error('Error fetching booking details:', error);
                showNotification('Failed to load booking details', 'error');
            }
        });
    }
    
    return row;
}

// Setup event listeners for past rentals section
function setupPastRentalsEvents() {
    const refreshBtn = document.getElementById('refreshPastRentals');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const user = firebase.auth().currentUser;
            if (user) {
                loadPastRentals(user.uid);
                showNotification('Refreshing past rentals...', 'info');
            } else {
                console.error('No user found when trying to refresh past rentals');
                showNotification('Please log in to refresh past rentals', 'error');
            }
        });
    } else {
        console.error('Refresh button for past rentals not found');
    }
}

// Handle the agent profile section
function handleAgentProfile() {
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    const updatePasswordBtn = document.getElementById('updatePasswordBtn');
    const cancelBtn = document.querySelector('.profile-actions .cancel-btn');
    
    // Load profile data when section becomes active
    document.querySelector('.nav-item[data-section="profile"]').addEventListener('click', function() {
        const userId = firebase.auth().currentUser?.uid;
        if (userId) {
            loadAgentProfileData(userId);
        }
    });
    
    // Handle profile form submission
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', function() {
            saveAgentProfile();
        });
    }
    
    // Handle password update
    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener('click', function() {
            updatePassword();
        });
    }
    
    // Handle cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            const userId = firebase.auth().currentUser?.uid;
            if (userId) {
                loadAgentProfileData(userId); // Reload the original data
            }
        });
    }
    
    // Handle password change
    const newPasswordField = document.getElementById('newPassword');
    const confirmPasswordField = document.getElementById('confirmPassword');
    
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('input', function() {
            validatePasswordMatch(newPasswordField, confirmPasswordField);
        });
    }
}

// Load agent profile data
async function loadAgentProfileData(userId) {
    try {
        const db = firebase.firestore();
        const user = firebase.auth().currentUser;
        
        // Get agent data from Firestore
        const agentSnapshot = await db.collection('agents').doc(userId).get();
        
        if (agentSnapshot.exists) {
            const agentData = agentSnapshot.data();
            console.log('Loaded agent data:', agentData);
            
            // Update header info
            const profileHeaderName = document.getElementById('profileHeaderName');
            const profileHeaderEmail = document.getElementById('profileHeaderEmail');
            const memberSince = document.getElementById('memberSince');
            
            if (profileHeaderName) profileHeaderName.textContent = agentData.name || user.displayName || user.email.substring(0, 1).toUpperCase();
            if (profileHeaderEmail) profileHeaderEmail.textContent = user.email || agentData.email;
            
            // Format the creation date if available
            if (memberSince) {
                if (user.metadata && user.metadata.creationTime) {
                    const creationDate = new Date(user.metadata.creationTime);
                    const options = { year: 'numeric', month: 'long' };
                    memberSince.textContent = creationDate.toLocaleDateString('en-US', options);
                } else if (agentData.createdAt) {
                    // Handle different timestamp formats
                    let creationDate;
                    if (agentData.createdAt.toDate) {
                        creationDate = agentData.createdAt.toDate(); // Firebase Timestamp
                    } else if (agentData.createdAt.seconds) {
                        creationDate = new Date(agentData.createdAt.seconds * 1000); // Firebase Timestamp as object
                    } else if (typeof agentData.createdAt === 'string') {
                        creationDate = new Date(agentData.createdAt); // ISO string format
                    }
                    
                    if (creationDate) {
                        const options = { year: 'numeric', month: 'long' };
                        memberSince.textContent = creationDate.toLocaleDateString('en-US', options);
                    }
                }
            }
            
            // Update form fields
            document.getElementById('fullName').value = agentData.name || '';
            document.getElementById('phoneNumber').value = agentData.phone || '';
            document.getElementById('emailAddress').value = user.email || agentData.email || '';
            document.getElementById('dateOfBirth').value = agentData.dateOfBirth || '';
            
            // Address information (handle possible structure differences)
            if (agentData.address && typeof agentData.address === 'object') {
                // If address is an object with properties
                document.getElementById('streetAddress').value = agentData.address.street || '';
                document.getElementById('city').value = agentData.address.city || '';
                document.getElementById('stateProvince').value = agentData.address.state || '';
                document.getElementById('postalCode').value = agentData.address.postalCode || '';
            }
            
            // Agency information - directly map from MongoDB fields
            document.getElementById('agencyName').value = agentData.agencyName || '';
            document.getElementById('businessType').value = agentData.businessType || '';
            
            // Handle businessAddress - this is the field we saw in MongoDB
            // MongoDB showed businessAddress as an Object, but we're using a single field input
            if (agentData.businessAddress) {
                if (typeof agentData.businessAddress === 'string') {
                    // If it's already a string, use it directly
                    document.getElementById('businessAddress').value = agentData.businessAddress;
                } else if (typeof agentData.businessAddress === 'object') {
                    // If it's an object, we need to format it
                    const businessAddressObj = agentData.businessAddress;
                    // Format it into a single string - adjust this based on your actual object structure
                    let formattedAddress = '';
                    if (businessAddressObj.street) formattedAddress += businessAddressObj.street;
                    if (businessAddressObj.city) formattedAddress += (formattedAddress ? ', ' : '') + businessAddressObj.city;
                    if (businessAddressObj.state) formattedAddress += (formattedAddress ? ', ' : '') + businessAddressObj.state;
                    if (businessAddressObj.postalCode) formattedAddress += (formattedAddress ? ' ' : '') + businessAddressObj.postalCode;
                    
                    document.getElementById('businessAddress').value = formattedAddress;
                }
            } else {
                document.getElementById('businessAddress').value = '';
            }
            
            // Business license was shown in MongoDB
            document.getElementById('businessLicense').value = agentData.businessLicense || '';
            document.getElementById('taxId').value = agentData.taxId || '';
            
            // Also update the agent name in the dashboard welcome message
            const agentNameElement = document.getElementById('agentName');
            if (agentNameElement && agentData.name) {
                agentNameElement.textContent = agentData.name;
            }
            
        } else {
            console.warn('Agent profile not found');
            showNotification('Agent profile not found', 'warning');
        }
    } catch (error) {
        console.error('Error loading agent profile:', error);
        showNotification('Error loading profile information: ' + error.message, 'error');
    }
}

// Save agent profile updates
async function saveAgentProfile() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showNotification('You must be logged in to update your profile', 'error');
            return;
        }
        
        const updateProfileBtn = document.getElementById('updateProfileBtn');
        updateProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        updateProfileBtn.disabled = true;
        
        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        
        // Address information
        const streetAddress = document.getElementById('streetAddress').value.trim();
        const city = document.getElementById('city').value.trim();
        const stateProvince = document.getElementById('stateProvince').value.trim();
        const postalCode = document.getElementById('postalCode').value.trim();
        
        // Agency information
        const agencyName = document.getElementById('agencyName').value.trim();
        const businessType = document.getElementById('businessType').value;
        const businessAddress = document.getElementById('businessAddress').value.trim(); // Business address as seen in MongoDB
        const businessLicense = document.getElementById('businessLicense').value.trim();
        const taxId = document.getElementById('taxId').value.trim();
        
        // Create agent data object for Firestore
        const agentData = {
            name: fullName,
            phone: phoneNumber,
            dateOfBirth: dateOfBirth,
            address: {
                street: streetAddress,
                city: city,
                state: stateProvince,
                postalCode: postalCode
            },
            agencyName: agencyName,
            businessType: businessType,
            businessAddress: businessAddress, // This matches the MongoDB field name
            businessLicense: businessLicense,
            taxId: taxId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: "active" // Make sure status stays active as in MongoDB
        };
        
        console.log('Updating agent profile with:', agentData);
        
        // Update Firestore document
        const db = firebase.firestore();
        await db.collection('agents').doc(user.uid).update(agentData);
        
        // Also update any fields in the authentication profile if needed
        // This helps keep displayName synced
        if (fullName !== user.displayName) {
            await user.updateProfile({
                displayName: fullName
            });
        }
        
        // Update the agent name in dashboard
        const agentNameElement = document.getElementById('agentName');
        if (agentNameElement && fullName) {
            agentNameElement.textContent = fullName;
        }
        
        // Update profile header
        const profileHeaderName = document.getElementById('profileHeaderName');
        if (profileHeaderName) {
            profileHeaderName.textContent = fullName || user.email.substring(0, 1).toUpperCase();
        }
        
        showNotification('Profile updated successfully', 'success');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile: ' + error.message, 'error');
    } finally {
        const updateProfileBtn = document.getElementById('updateProfileBtn');
        updateProfileBtn.innerHTML = 'Save Changes';
        updateProfileBtn.disabled = false;
    }
}

// Update password separately
async function updatePassword() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showNotification('You must be logged in to change your password', 'error');
            return;
        }
        
        const updatePasswordBtn = document.getElementById('updatePasswordBtn');
        updatePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        updatePasswordBtn.disabled = true;
        
        // Get password values
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validation
        if (!currentPassword) {
            showNotification('Current password is required', 'error');
            return;
        }
        
        if (!newPassword || !confirmPassword) {
            showNotification('New password and confirmation are required', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showNotification('Password must be at least 8 characters long', 'error');
            return;
        }
        
        try {
            // Reauthenticate the user first
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email, 
                currentPassword
            );
            
            await user.reauthenticateWithCredential(credential);
            
            // Now change the password
            await user.updatePassword(newPassword);
            
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            showNotification('Password updated successfully', 'success');
        } catch (authError) {
            console.error('Error updating password:', authError);
            
            if (authError.code === 'auth/wrong-password') {
                showNotification('Current password is incorrect', 'error');
            } else {
                showNotification('Failed to update password: ' + authError.message, 'error');
            }
        }
        
    } catch (error) {
        console.error('Error in password update:', error);
        showNotification('Error updating password', 'error');
    } finally {
        const updatePasswordBtn = document.getElementById('updatePasswordBtn');
        updatePasswordBtn.innerHTML = 'Change Password';
        updatePasswordBtn.disabled = false;
    }
}

// Validate that passwords match
function validatePasswordMatch(passwordField, confirmField) {
    if (passwordField.value !== confirmField.value) {
        confirmField.setCustomValidity('Passwords do not match');
    } else {
        confirmField.setCustomValidity('');
    }
}

// ... existing code ...

// Add to document ready event listener
document.addEventListener('DOMContentLoaded', async function() {
    // ... existing code ...
    
    // Initialize profile functionality
    handleAgentProfile();
    
    // ... existing code ...
});