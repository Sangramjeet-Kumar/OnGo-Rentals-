async function loadPastRentals() {
    console.log("Loading past rentals...");
    
    try {
        // Get the agent's ID from local storage
        const agentId = localStorage.getItem('agentId');
        console.log(`Agent ID from localStorage: ${agentId || 'Not found'}`);
        
        if (!agentId) {
            console.error("No agent ID found in localStorage");
            document.getElementById('past-rentals-container').innerHTML = `
                <div class="alert alert-danger">Unable to load past rentals. Agent ID not found. Please log in again.</div>
            `;
            return;
        }
        
        // Construct the API URL
        const apiUrl = `/api/bookings/completed/agent/${agentId}`;
        console.log(`Fetching from API URL: ${apiUrl}`);
        
        // Make the API request
        const response = await fetch(apiUrl);
        console.log(`API response status: ${response.status} ${response.ok ? 'OK' : 'Error'}`);
        
        // Check if response is unsuccessful
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API error response: ${errorText}`);
            document.getElementById('past-rentals-container').innerHTML = `
                <div class="alert alert-danger">Error loading past rentals. Server returned status ${response.status}.</div>
            `;
            return;
        }
        
        // Parse JSON response
        const pastRentals = await response.json();
        console.log(`Received ${pastRentals.length} past rentals from API`);
        console.log("Past rentals data:", JSON.stringify(pastRentals, null, 2));
        
        if (pastRentals.length === 0) {
            console.log("No past rentals found for this agent");
            document.getElementById('past-rentals-container').innerHTML = `
                <div class="alert alert-info">You don't have any completed rental bookings yet.</div>
            `;
            return;
        }
        
        // Start building the HTML for past rentals
        let pastRentalsHtml = `<div class="row">`;
        
        // Loop through each past rental
        pastRentals.forEach(rental => {
            console.log(`Processing rental ID: ${rental._id}, vehicle: ${rental.vehicleName}`);
            
            // Format dates
            const pickupDate = new Date(rental.pickupDate).toLocaleDateString();
            const returnDate = new Date(rental.returnDate).toLocaleDateString();
            
            // Add a card for each past rental
            pastRentalsHtml += `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-header bg-success text-white">
                            <h5 class="card-title mb-0">${rental.vehicleName}</h5>
                        </div>
                        <div class="card-body">
                            <p><strong>Booking ID:</strong> ${rental._id}</p>
                            <p><strong>Status:</strong> <span class="badge bg-success">Completed</span></p>
                            <p><strong>Pickup:</strong> ${pickupDate} at ${rental.pickupLocation}</p>
                            <p><strong>Return:</strong> ${returnDate} at ${rental.returnLocation}</p>
                            <p><strong>Total Amount:</strong> $${rental.totalAmount}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Close the row
        pastRentalsHtml += `</div>`;
        
        // Insert the HTML into the container
        document.getElementById('past-rentals-container').innerHTML = pastRentalsHtml;
        console.log("Past rentals display updated successfully");
        
    } catch (error) {
        console.error("Error loading past rentals:", error);
        document.getElementById('past-rentals-container').innerHTML = `
            <div class="alert alert-danger">Error loading past rentals: ${error.message}</div>
        `;
    }
} 