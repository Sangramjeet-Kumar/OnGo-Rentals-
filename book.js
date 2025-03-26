// Elements
const rentalTabs = document.querySelectorAll('.rental-tab');
const favoriteButtons = document.querySelectorAll('.favorite-btn');
const priceRangeThumbLeft = document.querySelector('.thumb.left');
const priceRangeThumbRight = document.querySelector('.thumb.right');
const priceTrack = document.querySelector('.range-slider .track');
const priceValueMin = document.querySelector('.price-inputs .price-value:first-child');
const priceValueMax = document.querySelector('.price-inputs .price-value:last-child');
const resetButton = document.querySelector('.reset-button');
const moreOptionsButton = document.querySelector('.more-options');
const carCards = document.querySelectorAll('.car-card');

// Minimum and maximum price values
const MIN_PRICE = 10;
const MAX_PRICE = 150;

// Initialize booking date inputs with current date
document.addEventListener('DOMContentLoaded', () => {
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    const pickupDateInput = document.getElementById('pickupDate');
    const returnDateInput = document.getElementById('returnDate');
    
    if (pickupDateInput && returnDateInput) {
        pickupDateInput.min = today;
        pickupDateInput.value = today;
        
        returnDateInput.min = today;
        
        // Set return date to tomorrow by default
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        returnDateInput.value = tomorrow.toISOString().split('T')[0];
        
        // Update return date min when pickup date changes
        pickupDateInput.addEventListener('change', () => {
            returnDateInput.min = pickupDateInput.value;
            
            // If return date is before pickup date, update it
            if (returnDateInput.value < pickupDateInput.value) {
                returnDateInput.value = pickupDateInput.value;
            }
        });
    }
    
    // Set up interactions
    setupRentalTabs();
    setupFavoriteButtons();
    setupPriceRangeSlider();
    setupResetButton();
    setupMoreOptionsButton();
    setupCarCardSelection();
});

// Toggle between rental tabs
function setupRentalTabs() {
    rentalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            rentalTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update pricing displays to show per day or per hour
            const isPriceHourly = tab.textContent.trim() === 'Hourly';
            const priceDurations = document.querySelectorAll('.price-duration');
            
            priceDurations.forEach(span => {
                span.textContent = isPriceHourly ? '/hour' : '/day';
            });
            
            // You might want to adjust the price amounts based on hourly vs daily
            const priceAmounts = document.querySelectorAll('.price-amount');
            priceAmounts.forEach(span => {
                const price = parseInt(span.textContent.replace('$', ''), 10);
                if (isPriceHourly) {
                    span.textContent = '$' + (price / 24).toFixed(0); // Rough conversion
                } else {
                    span.textContent = '$' + (price * 24).toFixed(0); // Rough conversion
                }
            });
        });
    });
}

// Handle favorite buttons
function setupFavoriteButtons() {
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const icon = btn.querySelector('i');
            
            if (btn.classList.contains('active')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
            
            showNotification(
                btn.classList.contains('active') 
                    ? 'Car added to favorites!' 
                    : 'Car removed from favorites!'
            );
        });
    });
}

// Price range slider functionality
function setupPriceRangeSlider() {
    if (!priceRangeThumbLeft || !priceRangeThumbRight || !priceTrack) return;
    
    let isDraggingLeft = false;
    let isDraggingRight = false;
    
    function updatePriceDisplay(leftPos, rightPos) {
        const leftPrice = Math.floor(MIN_PRICE + (leftPos * (MAX_PRICE - MIN_PRICE)));
        const rightPrice = Math.floor(MIN_PRICE + (rightPos * (MAX_PRICE - MIN_PRICE)));
        
        priceValueMin.textContent = '$' + leftPrice;
        priceValueMax.textContent = '$' + rightPrice;
        
        // Filter car cards based on price
        filterCarsByPrice(leftPrice, rightPrice);
    }
    
    function handleMouseDown(e, isLeft) {
        if (isLeft) {
            isDraggingLeft = true;
        } else {
            isDraggingRight = true;
        }
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
    }
    
    function handleMouseMove(e) {
        const rangeRect = document.querySelector('.range-slider').getBoundingClientRect();
        const rangeWidth = rangeRect.width;
        
        let leftPos = parseFloat(priceRangeThumbLeft.style.left) / 100;
        let rightPos = parseFloat(priceRangeThumbRight.style.left) / 100;
        
        if (isDraggingLeft) {
            let newPos = (e.clientX - rangeRect.left) / rangeWidth;
            newPos = Math.max(0, Math.min(newPos, rightPos - 0.05));
            leftPos = newPos;
            priceRangeThumbLeft.style.left = (newPos * 100) + '%';
        }
        
        if (isDraggingRight) {
            let newPos = (e.clientX - rangeRect.left) / rangeWidth;
            newPos = Math.max(leftPos + 0.05, Math.min(newPos, 1));
            rightPos = newPos;
            priceRangeThumbRight.style.left = (newPos * 100) + '%';
        }
        
        priceTrack.style.left = (leftPos * 100) + '%';
        priceTrack.style.width = ((rightPos - leftPos) * 100) + '%';
        
        updatePriceDisplay(leftPos, rightPos);
    }
    
    function handleMouseUp() {
        isDraggingLeft = false;
        isDraggingRight = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
    
    // Touch events for mobile support
    function handleTouchStart(e, isLeft) {
        if (isLeft) {
            isDraggingLeft = true;
        } else {
            isDraggingRight = true;
        }
        
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        e.preventDefault();
    }
    
    function handleTouchMove(e) {
        const touch = e.touches[0];
        const rangeRect = document.querySelector('.range-slider').getBoundingClientRect();
        const rangeWidth = rangeRect.width;
        
        let leftPos = parseFloat(priceRangeThumbLeft.style.left) / 100;
        let rightPos = parseFloat(priceRangeThumbRight.style.left) / 100;
        
        if (isDraggingLeft) {
            let newPos = (touch.clientX - rangeRect.left) / rangeWidth;
            newPos = Math.max(0, Math.min(newPos, rightPos - 0.05));
            leftPos = newPos;
            priceRangeThumbLeft.style.left = (newPos * 100) + '%';
        }
        
        if (isDraggingRight) {
            let newPos = (touch.clientX - rangeRect.left) / rangeWidth;
            newPos = Math.max(leftPos + 0.05, Math.min(newPos, 1));
            rightPos = newPos;
            priceRangeThumbRight.style.left = (newPos * 100) + '%';
        }
        
        priceTrack.style.left = (leftPos * 100) + '%';
        priceTrack.style.width = ((rightPos - leftPos) * 100) + '%';
        
        updatePriceDisplay(leftPos, rightPos);
        e.preventDefault();
    }
    
    function handleTouchEnd() {
        isDraggingLeft = false;
        isDraggingRight = false;
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
    }
    
    // Event listeners for mouse
    priceRangeThumbLeft.addEventListener('mousedown', (e) => handleMouseDown(e, true));
    priceRangeThumbRight.addEventListener('mousedown', (e) => handleMouseDown(e, false));
    
    // Event listeners for touch
    priceRangeThumbLeft.addEventListener('touchstart', (e) => handleTouchStart(e, true), { passive: false });
    priceRangeThumbRight.addEventListener('touchstart', (e) => handleTouchStart(e, false), { passive: false });
}

// Filter cars based on price range
function filterCarsByPrice(minPrice, maxPrice) {
    carCards.forEach(card => {
        const priceText = card.querySelector('.price-amount').textContent;
        const price = parseInt(priceText.replace('$', ''), 10);
        
        if (price >= minPrice && price <= maxPrice) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    updateAvailableCarsCount();
}

// Reset all filters
function setupResetButton() {
    if (!resetButton) return;
    
    resetButton.addEventListener('click', () => {
        // Reset dropdown filters
        document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
            if (dropdown.tagName === 'SELECT') {
                dropdown.selectedIndex = 0;
            }
        });
        
        // Reset checkboxes
        document.querySelectorAll('.checkbox-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = checkbox.id === 'sedan-check';
        });
        
        // Reset radio buttons
        document.querySelectorAll('.color-option input[type="radio"]').forEach((radio, index) => {
            radio.checked = index === 0;
        });
        
        // Reset toggle switch
        document.querySelector('.toggle-switch input[type="checkbox"]').checked = true;
        
        // Reset price range
        priceRangeThumbLeft.style.left = '10%';
        priceRangeThumbRight.style.left = '80%';
        priceTrack.style.left = '10%';
        priceTrack.style.width = '70%';
        priceValueMin.textContent = '$15';
        priceValueMax.textContent = '$120';
        
        // Reset car display
        carCards.forEach(card => {
            card.style.display = 'block';
        });
        
        updateAvailableCarsCount();
        
        showNotification('All filters have been reset!');
    });
}

// More options button
function setupMoreOptionsButton() {
    if (!moreOptionsButton) return;
    
    let isExpanded = false;
    
    moreOptionsButton.addEventListener('click', () => {
        isExpanded = !isExpanded;
        const icon = moreOptionsButton.querySelector('i');
        
        if (isExpanded) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
            moreOptionsButton.querySelector('span').textContent = 'Less Options';
        } else {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            moreOptionsButton.querySelector('span').textContent = 'More Options';
        }
        
        // Here you would show/hide additional filter options
        // For demo purposes, we'll just show a notification
        showNotification(isExpanded ? 'Showing more options' : 'Showing less options');
    });
}

// Car card selection
function setupCarCardSelection() {
    carCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking favorite button or if car is booked
            if (e.target.closest('.favorite-btn') || card.querySelector('.status-booked')) {
                return;
            }
            
            // Get car details
            const model = card.querySelector('.car-model').textContent;
            const price = card.querySelector('.price-amount').textContent;
            const duration = card.querySelector('.price-duration').textContent;
            
            // Show notification
            showNotification(`Selected ${model} for ${price}${duration}`);
            
            // You could redirect to a booking confirmation page or show a modal
            setTimeout(() => {
                showBookingConfirmation(card);
            }, 500);
        });
    });
}

// Update available cars count
function updateAvailableCarsCount() {
    const visibleCars = Array.from(carCards).filter(card => 
        card.style.display !== 'none' && !card.querySelector('.status-booked')
    ).length;
    
    const carCountElement = document.querySelector('.car-list-header h2');
    if (carCountElement) {
        carCountElement.textContent = `Available Cars (${visibleCars})`;
    }
}

// Show notification
function showNotification(message) {
    // Use the existing notification system
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    if (notification && notificationMessage) {
        notificationMessage.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Show booking confirmation
function showBookingConfirmation(carCard) {
    // In a real implementation, this would show a modal or redirect to a confirmation page
    // For now, we'll just change the car status
    const statusElement = carCard.querySelector('.car-status');
    
    if (statusElement && !statusElement.classList.contains('status-booked')) {
        const originalClass = statusElement.className;
        const originalText = statusElement.textContent;
        
        statusElement.className = 'car-status status-booked';
        statusElement.textContent = 'Processing';
        
        // Simulate booking process
        setTimeout(() => {
            statusElement.textContent = 'Booked';
            updateAvailableCarsCount();
            showNotification('Booking confirmed! Check your email for details.');
        }, 1500);
    }
} 