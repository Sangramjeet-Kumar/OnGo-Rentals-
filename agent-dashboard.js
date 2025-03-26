// Initialize Firebase
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Agent dashboard initializing...');
    
    try {
        // Initialize Firebase if not already done
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const auth = firebase.auth();
        const db = firebase.firestore();
        
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
                console.log('Role check returned no data but user exists');
                // Don't do anything - let checkUserRole handle the redirection
                return;
            }
            
            // At this point, we have confirmed this is an agent on the right page
            console.log('Agent confirmed on correct dashboard, loading data');
            loadAgentData(user, db);
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
                
                // Load dashboard metrics (normally would be loaded from database)
                loadDashboardMetrics(db);
                loadInventory(db);
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
                                loadInventory(db);
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
                                loadInventory(db);
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
        animateCounter('activeRentals', 0, 8, 1500);
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
function loadInventory(db) {
    // In a real application, you would load inventory data from the database
    // For now, we'll use the hard-coded data in the HTML
    
    // Setup event handlers for action buttons
    setupInventoryActionButtons();
}

// Setup inventory action buttons
function setupInventoryActionButtons() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const vehicleId = row.cells[0].textContent;
            const vehicleName = row.cells[2].textContent;
            
            showNotification(`Editing ${vehicleName} (${vehicleId})`, 'info');
            // Would normally open edit form
        });
    });
    
    // View buttons
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const vehicleId = row.cells[0].textContent;
            const vehicleName = row.cells[2].textContent;
            
            showNotification(`Viewing details for ${vehicleName} (${vehicleId})`, 'info');
            // Would normally open details modal
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            const vehicleId = row.cells[0].textContent;
            const vehicleName = row.cells[2].textContent;
            
            if (confirm(`Are you sure you want to delete ${vehicleName} (${vehicleId})?`)) {
                // Would normally delete from database
                row.style.animation = 'fadeOut 0.5s ease-in-out forwards';
                setTimeout(() => {
                    row.remove();
                    showNotification(`${vehicleName} has been deleted`, 'success');
                }, 500);
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
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // In a real application, you would save the form data to the database
            showNotification('Vehicle added successfully!', 'success');
            
            // Reset form
            form.reset();
            
            // Navigate back to inventory
            setTimeout(() => {
                const inventoryNavItem = document.querySelector('.nav-item[data-section="inventory"]');
                inventoryNavItem.click();
            }, 1000);
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