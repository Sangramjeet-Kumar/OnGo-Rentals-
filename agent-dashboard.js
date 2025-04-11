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
            
            .customer-info h4 {
                font-size: 15px;
                margin: 0 0 2px;
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
            }
            
            // Animate section entry
            const activeSection = document.getElementById(sectionId);
            activeSection.style.animation = 'none';
            // Trigger reflow
            void activeSection.offsetWidth;
            activeSection.style.animation = 'fadeIn 0.5s ease-in-out';
        });
    });
    
    // Handle "Add Vehicle" button in inventory
    const addVehicleBtn = document.querySelector('.add-vehicle-btn');
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', () => {
            // Switch to add vehicle section
            navItems.forEach(navItem => navItem.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Find and activate the add vehicle nav item and section
            const addVehicleNavItem = document.querySelector('.nav-item[data-section="add-vehicle"]');
            addVehicleNavItem.classList.add('active');
            const addVehicleSection = document.getElementById('add-vehicle');
            addVehicleSection.classList.add('active');
            
            // Animate section entry
            addVehicleSection.style.animation = 'none';
            void addVehicleSection.offsetWidth;
            addVehicleSection.style.animation = 'fadeIn 0.5s ease-in-out';
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

// Animate counter
function animateCounter(elementId, start, end, duration, prefix = '') {
    const element = document.getElementById(elementId);
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        // Format currency
        if (elementId === 'monthlyRevenue') {
            element.textContent = `${prefix}${current.toLocaleString()}`;
        } else {
            element.textContent = current;
        }
        
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
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
        
        // Add a timestamp parameter to avoid browser caching
        const timestamp = new Date().getTime();
        const response = await ipcRenderer.invoke('api-call', {
            method: 'GET',
            url: `/api/vehicles?nocache=${timestamp}`
        });
        
        // Remove loading row
        inventoryTable.innerHTML = '';
        
        if (!response.ok || !response.data || response.data.length === 0) {
            inventoryTable.innerHTML = '<tr><td colspan="7" class="empty-row">No vehicles found in database</td></tr>';
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
        inventoryTable.innerHTML = `<tr><td colspan="7" class="error-row">Error loading inventory: ${error.message}</td></tr>`;
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
                        // Check for specific error about active bookings
                        if (response.data && response.data.message && response.data.message.includes('active bookings')) {
                            throw new Error(`Cannot delete vehicle: It has ${response.data.activeBookingsCount || 'active'} booking(s)`);
                        }
                        throw new Error(response.data?.message || 'Failed to delete vehicle from MongoDB');
                    }
                    
                    // Also delete from Firebase if the ID exists
                    if (firebaseId) {
                        try {
                            await firebase.firestore().collection('vehicles').doc(firebaseId).delete();
                            console.log(`Deleted vehicle from Firebase with ID: ${firebaseId}`);
                        } catch (firebaseError) {
                            console.warn('Could not delete from Firebase:', firebaseError);
                            // Continue anyway as MongoDB is the source of truth
                        }
                    }
                    
                    // Visual feedback - fade out row
                    row.style.animation = 'fadeOut 0.5s ease-in-out forwards';
                    setTimeout(() => {
                        row.remove();
                        showNotification(`${vehicleName} has been deleted`, 'success');
                        
                        // Check if table is now empty and add empty message if needed
                        const inventoryTable = document.querySelector('.inventory-table tbody');
                        if (inventoryTable.children.length === 0) {
                            inventoryTable.innerHTML = '<tr><td colspan="7" class="empty-row">No vehicles found in database</td></tr>';
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
                
                // Save to Firebase first for compatibility
                console.log('Saving to Firebase...');
                const vehicleRef = firebase.firestore().collection('vehicles').doc();
                await vehicleRef.set({
                    ...formData,
                    firebaseId: vehicleRef.id
                });
                
                console.log('Firebase save successful. Vehicle ID:', vehicleRef.id);
                console.log('Now saving to MongoDB...');
                
                // Prepare data for MongoDB - ensure type is lowercase to match validation
                const vehicleData = {
                    ...formData,
                    firebaseId: vehicleRef.id,
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
        
        // Update dashboard active rentals count - add null check
        const activeRentalsElement = document.getElementById('activeRentals');
        if (activeRentalsElement) {
            activeRentalsElement.textContent = allRentals.length.toString();
        } else {
            console.warn('activeRentals element not found, cannot update count with total:', allRentals.length);
        }
        
        // Process and display each rental - add null check
        if (rentalsListElement) {
            allRentals.forEach((rental, index) => {
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

// Create a rental card element
function createRentalCard(rental) {
    const rentalCard = document.createElement('div');
    rentalCard.className = 'rental-card';
    rentalCard.dataset.returning = rental.isReturningToday ? 'today' : 'later';
    
    // Format dates
    const pickupDate = new Date(rental.pickupDate);
    const returnDate = new Date(rental.returnDate);
    const formattedPickupDate = formatDate(pickupDate);
    const formattedReturnDate = formatDate(returnDate);
    
    // Determine vehicle icon
    const isMotorcycle = rental.vehicleType && 
        (rental.vehicleType.toLowerCase().includes('bike') || 
         rental.vehicleType.toLowerCase().includes('cruiser') || 
         rental.vehicleType.toLowerCase().includes('scooter') || 
         rental.vehicleType.toLowerCase().includes('sports'));
         
    const vehicleIcon = isMotorcycle ? 'fa-motorcycle' : 'fa-car-alt';
    
    // Create badge based on return time or synthetic booking
    let badgeHTML = '';
    if (rental.isSyntheticBooking) {
        badgeHTML = `<span class="rental-badge returning-soon">Auto-generated</span>`;
    } else if (rental.isReturningInTwoHours) {
        badgeHTML = `<span class="rental-badge returning-soon">Returning in ${rental.hoursUntilReturn} hour${rental.hoursUntilReturn === 1 ? '' : 's'}</span>`;
    } else if (rental.isReturningToday) {
        badgeHTML = `<span class="rental-badge returning-today">Returning Today</span>`;
    }
    
    rentalCard.innerHTML = `
        <div class="rental-header">
            <div class="rental-vehicle">
                <div class="rental-vehicle-icon">
                    <i class="fas ${vehicleIcon}"></i>
                </div>
                <div class="rental-vehicle-info">
                    <h3>${rental.vehicleName || 'Vehicle'}</h3>
                    <p>${rental.vehicleType || 'Unknown'}</p>
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
                    <h4>${rental.customerName || 'Customer'}</h4>
                    <p>ID: ${rental.customerId ? (rental.customerId === 'unknown' ? 'Unknown' : rental.customerId.substring(0, 8) + '...') : 'Unknown'}</p>
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
                    <span>Pickup: ${rental.pickupLocation || 'Not specified'}</span>
                </div>
                <div class="rental-detail-item">
                    <i class="fas fa-map-marker"></i>
                    <span>Return: ${rental.returnLocation || rental.pickupLocation || 'Not specified'}</span>
                </div>
            </div>
            
            <div class="rental-actions">
                <button class="contact-btn" data-customer-id="${rental.customerId}" ${rental.isSyntheticBooking ? 'disabled' : ''}>
                    <i class="fas fa-phone-alt"></i>
                    Contact
                </button>
                <button class="details-btn" data-booking-id="${rental.bookingId}" ${rental.bookingId === 'unknown' ? 'disabled' : ''}>
                    <i class="fas fa-info-circle"></i>
                    Details
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners to buttons
    const contactBtn = rentalCard.querySelector('.contact-btn');
    const detailsBtn = rentalCard.querySelector('.details-btn');
    
    if (!rental.isSyntheticBooking) {
        contactBtn.addEventListener('click', function() {
            const customerId = this.getAttribute('data-customer-id');
            showNotification(`Contacting customer ${rental.customerName}...`, 'info');
            // Implement contact functionality in a real app
        });
    }
    
    if (rental.bookingId !== 'unknown') {
        detailsBtn.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            showNotification(`Viewing details for booking ${bookingId.substring(0, 8)}...`, 'info');
            // Implement details view functionality in a real app
        });
    }
    
    return rentalCard;
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