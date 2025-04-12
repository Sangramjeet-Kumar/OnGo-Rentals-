const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Agent = require('../models/Agent');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');

// IMPORTANT: Order matters - put more specific routes before less specific ones
// GET current rentals for an agent
router.get('/bookings/current/agent/:agentId', async (req, res) => {
    try {
        // Always ensure JSON content type
        res.setHeader('Content-Type', 'application/json');
        
        const { agentId } = req.params;
        
        if (!agentId) {
            return res.status(400).json({
                message: 'Agent ID is required'
            });
        }
        
        console.log(`Fetching current rentals for agent: ${agentId}`);
        
        // Get current date
        const currentDate = new Date();
        
        // First, check if the agentId is a MongoDB ID or a Firebase UID
        let mongoAgentId = agentId;
        let firebaseAgentId = agentId; // Store the original Firebase UID
        
        try {
            // If it's not a valid MongoDB ObjectId, try to find the agent by Firebase UID
            if (!mongoose.Types.ObjectId.isValid(agentId)) {
                console.log(`Agent ID ${agentId} is not a valid MongoDB ID, assuming it's a Firebase UID`);
                
                // Find the agent by Firebase UID
                const agent = await Agent.findOne({ firebaseUID: agentId });
                
                if (!agent) {
                    console.log(`No agent found with Firebase UID: ${agentId}`);
                    return res.json([]);
                }
                
                // Use the MongoDB _id of the agent
                mongoAgentId = agent._id;
                console.log(`Found MongoDB agent ID: ${mongoAgentId} for Firebase UID: ${agentId}`);
            } else {
                // If it is a valid MongoDB ID, we should also get the Firebase UID for complete lookups
                const agent = await Agent.findById(agentId);
                if (agent && agent.firebaseUID) {
                    firebaseAgentId = agent.firebaseUID;
                    console.log(`Found Firebase UID: ${firebaseAgentId} for MongoDB agent ID: ${agentId}`);
                }
            }
        } catch (agentError) {
            console.error('Error finding agent:', agentError);
            // Continue with original ID values as fallback
        }
        
        // First, find all vehicles owned by this agent (by MongoDB ID or Firebase ID)
        let vehicles = [];
        try {
            vehicles = await Vehicle.find({
                $or: [
                    { agentId: mongoAgentId },
                    { firebaseId: firebaseAgentId }
                ]
            });
            
            console.log(`Found ${vehicles.length} vehicles belonging to agent ${mongoAgentId} (Firebase: ${firebaseAgentId})`);
        } catch (vehicleError) {
            console.error('Error finding vehicles:', vehicleError);
            // Continue with empty vehicles array
            vehicles = [];
        }
        
        // Create a map for efficient vehicle lookups
        const vehicleMap = {};
        vehicles.forEach(vehicle => {
            vehicleMap[vehicle._id.toString()] = vehicle;
            if (vehicle.firebaseId) {
                vehicleMap[vehicle.firebaseId] = vehicle;
            }
        });
        
        const vehicleIds = vehicles.map(v => v._id);
        const vehicleFirebaseIds = vehicles.map(v => v.firebaseId).filter(id => id); // Filter out null/undefined
        
        // Create query for MongoDB IDs
        const mongoQuery = {
            $or: [
                { agentId: mongoAgentId }
            ],
            status: { $in: ['confirmed', 'ongoing'] },
            returnDate: { $gt: currentDate }
        };
        
        // Add vehicle IDs if we have any
        if (vehicleIds.length > 0) {
            mongoQuery.$or.push({ vehicleId: { $in: vehicleIds } });
        }
        
        // Add Firebase ID conditions if we have any
        if (firebaseAgentId || vehicleFirebaseIds.length > 0) {
            if (firebaseAgentId) {
                mongoQuery.$or.push({ agentId: firebaseAgentId });
            }
            
            if (vehicleFirebaseIds.length > 0) {
                mongoQuery.$or.push({ vehicleId: { $in: vehicleFirebaseIds } });
            }
        }
        
        console.log('Query for current rentals:', JSON.stringify(mongoQuery));
        
        // Get current rentals with this comprehensive query including vehicle data
        let currentRentals = [];
        try {
            currentRentals = await Booking.find(mongoQuery)
                .populate('vehicleId') // Populate vehicle details
                .sort({ returnDate: 1 }); // Sort by return date ascending (earliest first)
            
            console.log(`Found ${currentRentals.length} current rentals for agent ${mongoAgentId}`);
        } catch (bookingError) {
            console.error('Error finding bookings:', bookingError);
            // Return empty array in case of error
            return res.json([]);
        }
        
        // Gather all unique customer IDs from the bookings
        const customerIds = Array.from(new Set(currentRentals
            .map(booking => booking.userId)
            .filter(id => id)
        ));
        
        // Create a map to store customer data for efficient lookups
        const customerMap = {};
        
        // If we have customer IDs to look up, fetch them from the database
        if (customerIds.length > 0) {
            try {
                console.log(`Looking up ${customerIds.length} unique customers`);
                
                // Prepare an array of valid MongoDB IDs and an array of Firebase UIDs
                const mongoIds = customerIds.filter(id => mongoose.Types.ObjectId.isValid(id));
                
                // Query conditions to match either MongoDB IDs or Firebase UIDs
                const customerQuery = {
                    $or: []
                };
                
                if (mongoIds.length > 0) {
                    customerQuery.$or.push({ _id: { $in: mongoIds } });
                }
                
                // Always include Firebase UIDs
                customerQuery.$or.push({ firebaseUID: { $in: customerIds } });
                
                // Find all customers that match any of the IDs
                const customers = await Customer.find(customerQuery);
                
                console.log(`Found ${customers.length} customers for the current rentals`);
                
                // Create maps for both MongoDB IDs and Firebase UIDs
                customers.forEach(customer => {
                    if (customer._id) {
                        customerMap[customer._id.toString()] = customer;
                    }
                    if (customer.firebaseUID) {
                        customerMap[customer.firebaseUID] = customer;
                    }
                    
                    // Log found customer for debugging
                    console.log(`Found customer: ${customer.name} (ID: ${customer._id}, Firebase: ${customer.firebaseUID})`);
                });
            } catch (customerLookupError) {
                console.error('Error looking up customers:', customerLookupError);
                // Continue without customer data
            }
        }
        
        // Format the response data with detailed customer and location information
        const formattedRentals = await Promise.all(currentRentals.map(async (booking) => {
            try {
                // Calculate time until return
                const returnDate = new Date(booking.returnDate);
                const timeUntilReturn = returnDate - currentDate;
                const hoursUntilReturn = Math.floor(timeUntilReturn / (1000 * 60 * 60));
                
                // Find the customer in our map - try both the userId field and additional lookups
                let customer = null;
                
                // First check if userId exists and can be found in our customer map
                if (booking.userId && customerMap[booking.userId]) {
                    customer = customerMap[booking.userId];
                } else {
                    // If no customer found yet, try additional strategies
                    
                    // Check if booking has a userId that's a Firebase UID but stored in a different format
                    if (booking.userId && typeof booking.userId === 'string' && booking.userId.length > 10) {
                        // Try direct lookup in Customer collection
                        try {
                            const directCustomer = await Customer.findOne({ 
                                $or: [
                                    { firebaseUID: booking.userId },
                                    { email: booking.userEmail || '' }
                                ]
                            });
                            
                            if (directCustomer) {
                                customer = directCustomer;
                                // Add to map for future use
                                customerMap[booking.userId] = directCustomer;
                                console.log(`Found customer via direct lookup: ${directCustomer.name}`);
                            }
                        } catch (directLookupError) {
                            console.error('Error in direct customer lookup:', directLookupError);
                        }
                    }
                }
                
                // Extract vehicle information, using direct vehicleId or fallback to lookup
                let vehicle = booking.vehicleId;
                
                // If vehicleId is a string, it might be a Firebase ID, so look it up in our map
                if (booking.vehicleId && typeof booking.vehicleId === 'string') {
                    if (vehicleMap[booking.vehicleId]) {
                        vehicle = vehicleMap[booking.vehicleId];
                    }
                }
                
                // Extract customer details with fallbacks
                const customerName = customer ? customer.name : (booking.userName || 'Unknown Customer');
                const customerId = customer ? (customer.firebaseUID || customer._id.toString()) : 
                                  (booking.userId || 'unknown');
                const customerPhone = customer ? (customer.phoneNumber || '') : '';
                const customerEmail = customer ? (customer.email || '') : (booking.userEmail || '');
                
                // Process location information with better fallbacks
                let pickupLocation = '';
                let returnLocation = '';
                
                // First try detailed location objects
                if (booking.pickupLocationDetails) {
                    if (booking.pickupLocationDetails.address) {
                        pickupLocation = booking.pickupLocationDetails.address;
                    } else if (booking.pickupLocationDetails.city) {
                        pickupLocation = `${booking.pickupLocationDetails.city}${booking.pickupLocationDetails.state ? ', ' + booking.pickupLocationDetails.state : ''}`;
                    }
                }
                
                // If no detailed pickup location, try simple pickupLocation field
                if (!pickupLocation && booking.pickupLocation) {
                    pickupLocation = booking.pickupLocation;
                }
                
                // Same logic for return location
                if (booking.dropoffLocationDetails) {
                    if (booking.dropoffLocationDetails.address) {
                        returnLocation = booking.dropoffLocationDetails.address;
                    } else if (booking.dropoffLocationDetails.city) {
                        returnLocation = `${booking.dropoffLocationDetails.city}${booking.dropoffLocationDetails.state ? ', ' + booking.dropoffLocationDetails.state : ''}`;
                    }
                }
                
                // If no detailed return location, try simple returnLocation field
                if (!returnLocation && booking.returnLocation) {
                    returnLocation = booking.returnLocation;
                }
                
                // If return location is still empty, use pickup location
                if (!returnLocation && pickupLocation) {
                    returnLocation = pickupLocation;
                }
                
                // Set fallback values if still empty
                if (!pickupLocation) pickupLocation = 'Not specified';
                if (!returnLocation) returnLocation = 'Not specified';
                
                // Get vehicle details with fallbacks
                const vehicleName = vehicle && typeof vehicle === 'object' ? 
                    (vehicle.name || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Unknown Vehicle') : 
                    (booking.vehicleName || 'Unknown Vehicle');
                
                const vehicleType = vehicle && typeof vehicle === 'object' ? 
                    (vehicle.type || 'Unknown') : 
                    (booking.vehicleType || 'Unknown');
                
                return {
                    bookingId: booking._id,
                    vehicleId: vehicle && typeof vehicle === 'object' ? vehicle._id : booking.vehicleId,
                    vehicleName: vehicleName,
                    vehicleType: vehicleType,
                    customerName: customerName,
                    customerId: customerId,
                    customerPhone: customerPhone,
                    customerEmail: customerEmail,
                    pickupDate: booking.pickupDate,
                    returnDate: booking.returnDate,
                    pickupLocation: pickupLocation,
                    returnLocation: returnLocation,
                    status: booking.status,
                    hoursUntilReturn: hoursUntilReturn,
                    isReturningToday: hoursUntilReturn <= 24,
                    isReturningInTwoHours: hoursUntilReturn <= 2,
                    totalAmount: booking.totalAmount || booking.pricing?.totalAmount || 0
                };
            } catch (formatError) {
                console.error('Error formatting rental:', formatError);
                // Return a minimal booking object in case of error
                return {
                    bookingId: booking._id,
                    vehicleId: booking.vehicleId,
                    vehicleName: booking.vehicleName || 'Vehicle name unavailable',
                    customerName: booking.userName || 'Unknown customer',
                    customerId: booking.userId || 'unknown',
                    pickupLocation: 'Not specified',
                    returnLocation: 'Not specified',
                    pickupDate: booking.pickupDate || new Date(),
                    returnDate: booking.returnDate || new Date(),
                    status: booking.status || 'unknown'
                };
            }
        }));
        
        return res.json(formattedRentals);
    } catch (error) {
        console.error('Error in current bookings endpoint:', error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ 
            message: 'Server error while fetching current rentals', 
            error: error.message 
        });
    }
});

// GET booked vehicles for an agent (alternative way to view rentals)
router.get('/vehicles/booked/agent/:agentId', async (req, res) => {
    try {
        // Always ensure JSON content type
        res.setHeader('Content-Type', 'application/json');
        
        const { agentId } = req.params;
        
        if (!agentId) {
            return res.status(400).json({
                message: 'Agent ID is required'
            });
        }
        
        console.log(`Fetching booked vehicles for agent: ${agentId}`);
        
        // First, check if the agentId is a MongoDB ID or a Firebase UID
        let mongoAgentId = agentId;
        let firebaseAgentId = agentId; // Store the original Firebase UID
        
        try {
            // If it's not a valid MongoDB ObjectId, try to find the agent by Firebase UID
            if (!mongoose.Types.ObjectId.isValid(agentId)) {
                console.log(`Agent ID ${agentId} is not a valid MongoDB ID, assuming it's a Firebase UID`);
                
                // Find the agent by Firebase UID
                const agent = await Agent.findOne({ firebaseUID: agentId });
                
                if (!agent) {
                    console.log(`No agent found with Firebase UID: ${agentId}`);
                    return res.json([]);
                }
                
                // Use the MongoDB _id of the agent
                mongoAgentId = agent._id;
                console.log(`Found MongoDB agent ID: ${mongoAgentId} for Firebase UID: ${agentId}`);
            } else {
                // If it is a valid MongoDB ID, we should also get the Firebase UID for complete lookups
                const agent = await Agent.findById(agentId);
                if (agent && agent.firebaseUID) {
                    firebaseAgentId = agent.firebaseUID;
                    console.log(`Found Firebase UID: ${firebaseAgentId} for MongoDB agent ID: ${agentId}`);
                }
            }
        } catch (agentError) {
            console.error('Error finding agent:', agentError);
            // Continue with original ID values as fallback
        }
        
        // Find all vehicles owned by this agent that are marked as booked
        let bookedVehicles = [];
        try {
            bookedVehicles = await Vehicle.find({
                $and: [
                    {
                        $or: [
                            { agentId: mongoAgentId },
                            { firebaseId: firebaseAgentId }
                        ]
                    },
                    {
                        $or: [
                            { status: 'booked' },
                            { 'availability.isAvailable': false }
                        ]
                    }
                ]
            });
            
            console.log(`Found ${bookedVehicles.length} booked vehicles for agent ${mongoAgentId}`);
        } catch (vehicleError) {
            console.error('Error finding booked vehicles:', vehicleError);
            // Continue with empty array
            bookedVehicles = [];
        }
        
        // If there are no booked vehicles, return an empty array
        if (!bookedVehicles || bookedVehicles.length === 0) {
            return res.json([]);
        }
        
        // Get the bookings for these vehicles if available
        const vehicleIds = bookedVehicles.map(v => v._id);
        const vehicleFirebaseIds = bookedVehicles.map(v => v.firebaseId).filter(id => id);
        
        const currentDate = new Date();
        let bookings = [];
        try {
            bookings = await Booking.find({
                $or: [
                    { vehicleId: { $in: vehicleIds } },
                    { vehicleId: { $in: vehicleFirebaseIds } }
                ],
                status: { $in: ['confirmed', 'ongoing'] },
                returnDate: { $gt: currentDate }
            }).populate('vehicleId');
            
            console.log(`Found ${bookings.length} bookings for the booked vehicles`);
        } catch (bookingError) {
            console.error('Error finding bookings for vehicles:', bookingError);
            // Continue with empty bookings array
            bookings = [];
        }
        
        // Gather all unique customer IDs from the bookings
        const customerIds = Array.from(new Set(bookings
            .map(booking => booking.userId)
            .filter(id => id)
        ));
        
        // Create a map to store customer data for efficient lookups
        const customerMap = {};
        
        // If we have customer IDs to look up, fetch them from the database
        if (customerIds.length > 0) {
            try {
                console.log(`Looking up ${customerIds.length} unique customers for booked vehicles`);
                
                // Prepare an array of valid MongoDB IDs and an array of Firebase UIDs
                const mongoIds = customerIds.filter(id => mongoose.Types.ObjectId.isValid(id));
                
                // Query conditions to match either MongoDB IDs or Firebase UIDs
                const customerQuery = {
                    $or: []
                };
                
                if (mongoIds.length > 0) {
                    customerQuery.$or.push({ _id: { $in: mongoIds } });
                }
                
                // Always include Firebase UIDs
                customerQuery.$or.push({ firebaseUID: { $in: customerIds } });
                
                // Find all customers that match any of the IDs
                const customers = await Customer.find(customerQuery);
                
                console.log(`Found ${customers.length} customers for booked vehicles`);
                
                // Create maps for both MongoDB IDs and Firebase UIDs
                customers.forEach(customer => {
                    if (customer._id) {
                        customerMap[customer._id.toString()] = customer;
                    }
                    if (customer.firebaseUID) {
                        customerMap[customer.firebaseUID] = customer;
                    }
                    
                    // Log found customer for debugging
                    console.log(`Found customer for booked vehicle: ${customer.name} (ID: ${customer._id}, Firebase: ${customer.firebaseUID})`);
                });
            } catch (customerLookupError) {
                console.error('Error looking up customers for booked vehicles:', customerLookupError);
                // Continue without customer data
            }
        }
        
        // Create a map of vehicles for efficient lookups
        const vehicleMap = {};
        bookedVehicles.forEach(vehicle => {
            vehicleMap[vehicle._id.toString()] = vehicle;
            if (vehicle.firebaseId) {
                vehicleMap[vehicle.firebaseId] = vehicle;
            }
        });
        
        // Create a map of bookings for efficient vehicle-to-booking lookups
        const bookingMap = {};
        bookings.forEach(booking => {
            let vehicleKey = null;
            
            // If vehicleId is an object (populated), use its _id
            if (booking.vehicleId && typeof booking.vehicleId === 'object') {
                vehicleKey = booking.vehicleId._id.toString();
            } 
            // If it's a string, it could be a MongoDB ID or Firebase ID
            else if (booking.vehicleId && typeof booking.vehicleId === 'string') {
                vehicleKey = booking.vehicleId;
            }
            
            if (vehicleKey) {
                bookingMap[vehicleKey] = booking;
            }
        });
        
        // Process each booked vehicle
        const results = await Promise.all(bookedVehicles.map(async (vehicle) => {
            try {
                // Try to find an associated booking for this vehicle
                let booking = null;
                
                // First try to look up by the vehicle's MongoDB ID
                const vehicleId = vehicle._id.toString();
                if (bookingMap[vehicleId]) {
                    booking = bookingMap[vehicleId];
                } 
                // Then try the Firebase ID if available
                else if (vehicle.firebaseId && bookingMap[vehicle.firebaseId]) {
                    booking = bookingMap[vehicle.firebaseId];
                } 
                // If still not found, search in the bookings array
                else {
                    booking = bookings.find(b => {
                        const bookingVehicleId = typeof b.vehicleId === 'object' ? 
                            b.vehicleId._id.toString() : b.vehicleId;
                        
                        return bookingVehicleId === vehicleId || 
                               (vehicle.firebaseId && bookingVehicleId === vehicle.firebaseId);
                    });
                }
                
                // If we found a booking for this vehicle
                if (booking) {
                    // Calculate time until return
                    const returnDate = new Date(booking.returnDate);
                    const timeUntilReturn = returnDate - currentDate;
                    const hoursUntilReturn = Math.floor(timeUntilReturn / (1000 * 60 * 60));
                    
                    // Extract customer details with fallbacks
                    let customer = null;
                    if (booking.userId && customerMap[booking.userId]) {
                        customer = customerMap[booking.userId];
                    } else {
                        // Try direct lookup if not found in our map
                        try {
                            if (booking.userId && booking.userId.length > 10) {
                                const directCustomer = await Customer.findOne({
                                    $or: [
                                        { firebaseUID: booking.userId },
                                        { email: booking.userEmail || '' }
                                    ]
                                });
                                
                                if (directCustomer) {
                                    customer = directCustomer;
                                    console.log(`Found customer via direct lookup: ${directCustomer.name}`);
                                }
                            }
                        } catch (directLookupError) {
                            console.error('Error in direct customer lookup:', directLookupError);
                        }
                    }
                    
                    const customerName = customer ? customer.name : (booking.userName || 'Unknown Customer');
                    const customerId = customer ? (customer.firebaseUID || customer._id.toString()) : 
                                      (booking.userId || 'unknown');
                    const customerPhone = customer ? (customer.phoneNumber || '') : '';
                    const customerEmail = customer ? (customer.email || '') : (booking.userEmail || '');
                    
                    // Process location information with better fallbacks
                    let pickupLocation = '';
                    let returnLocation = '';
                    
                    // First try detailed location objects
                    if (booking.pickupLocationDetails) {
                        if (booking.pickupLocationDetails.address) {
                            pickupLocation = booking.pickupLocationDetails.address;
                        } else if (booking.pickupLocationDetails.city) {
                            pickupLocation = `${booking.pickupLocationDetails.city}${booking.pickupLocationDetails.state ? ', ' + booking.pickupLocationDetails.state : ''}`;
                        }
                    }
                    
                    // If no detailed pickup location, try simple pickupLocation field
                    if (!pickupLocation && booking.pickupLocation) {
                        pickupLocation = booking.pickupLocation;
                    }
                    
                    // Same logic for return location
                    if (booking.dropoffLocationDetails) {
                        if (booking.dropoffLocationDetails.address) {
                            returnLocation = booking.dropoffLocationDetails.address;
                        } else if (booking.dropoffLocationDetails.city) {
                            returnLocation = `${booking.dropoffLocationDetails.city}${booking.dropoffLocationDetails.state ? ', ' + booking.dropoffLocationDetails.state : ''}`;
                        }
                    }
                    
                    // If no detailed return location, try simple returnLocation field
                    if (!returnLocation && booking.returnLocation) {
                        returnLocation = booking.returnLocation;
                    }
                    
                    // If return location is still empty, use pickup location
                    if (!returnLocation && pickupLocation) {
                        returnLocation = pickupLocation;
                    }
                    
                    // Set fallback values if still empty
                    if (!pickupLocation) pickupLocation = 'Not specified';
                    if (!returnLocation) returnLocation = 'Not specified';
                    
                    return {
                        bookingId: booking._id,
                        vehicleId: vehicle._id,
                        vehicleName: vehicle.name || `${vehicle.make} ${vehicle.model}`,
                        vehicleType: vehicle.type,
                        customerName: customerName,
                        customerId: customerId,
                        customerPhone: customerPhone,
                        customerEmail: customerEmail,
                        pickupDate: booking.pickupDate,
                        returnDate: booking.returnDate,
                        pickupLocation: pickupLocation,
                        returnLocation: returnLocation,
                        status: booking.status,
                        hoursUntilReturn: hoursUntilReturn,
                        isReturningToday: hoursUntilReturn <= 24,
                        isReturningInTwoHours: hoursUntilReturn <= 2,
                        totalAmount: booking.totalAmount || booking.pricing?.totalAmount || 0
                    };
                } else {
                    // Create synthetic booking data based on vehicle status
                    // This is a fallback for vehicles marked as booked but without an active booking record
                    const unavailableDates = vehicle.availability?.unavailableDates || [];
                    const defaultReturnDate = new Date(Date.now() + 7*24*60*60*1000); // Default to 1 week
                    
                    let pickupDate = new Date();
                    let returnDate = defaultReturnDate;
                    
                    // Try to get real dates if available
                    if (unavailableDates.length > 0) {
                        const latestDate = unavailableDates.reduce((latest, current) => {
                            return current.startDate > latest.startDate ? current : latest;
                        }, unavailableDates[0]);
                        
                        if (latestDate) {
                            pickupDate = latestDate.startDate || pickupDate;
                            returnDate = latestDate.endDate || returnDate;
                        }
                    }
                    
                    // Make sure pickup date is not in the future
                    if (pickupDate > currentDate) {
                        pickupDate = currentDate;
                    }
                    
                    // Calculate time until return
                    const timeUntilReturn = returnDate - currentDate;
                    const hoursUntilReturn = Math.floor(timeUntilReturn / (1000 * 60 * 60));
                    
                    return {
                        bookingId: 'unknown',
                        vehicleId: vehicle._id,
                        vehicleName: vehicle.name || `${vehicle.make} ${vehicle.model}`,
                        vehicleType: vehicle.type,
                        customerName: 'Unknown Customer',
                        customerId: 'unknown',
                        customerPhone: '',
                        customerEmail: '',
                        pickupDate: pickupDate,
                        returnDate: returnDate,
                        pickupLocation: 'Not specified',
                        returnLocation: 'Not specified',
                        status: 'confirmed',
                        hoursUntilReturn: hoursUntilReturn,
                        isReturningToday: hoursUntilReturn <= 24,
                        isReturningInTwoHours: hoursUntilReturn <= 2,
                        totalAmount: vehicle.pricing?.dailyRate || 0,
                        isSyntheticBooking: true // Flag to indicate this is not from a real booking
                    };
                }
            } catch (formatError) {
                console.error('Error formatting booked vehicle:', formatError, vehicle);
                // Return minimal data in case of error
                return {
                    bookingId: 'error',
                    vehicleId: vehicle._id,
                    vehicleName: vehicle.name || `${vehicle.make || 'Unknown'} ${vehicle.model || 'Vehicle'}`,
                    vehicleType: vehicle.type || 'Unknown',
                    customerName: 'Data Error',
                    customerId: 'unknown',
                    pickupLocation: 'Not specified',
                    returnLocation: 'Not specified',
                    isSyntheticBooking: true
                };
            }
        }));
        
        return res.json(results);
    } catch (error) {
        console.error('Error in booked vehicles endpoint:', error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ 
            message: 'Server error while fetching booked vehicles', 
            error: error.message 
        });
    }
});

// GET vehicle by ID
router.get('/vehicles/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('agentId');
        
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        res.json(vehicle);
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET all vehicles
router.get('/vehicles', async (req, res) => {
    try {
        const { agentId } = req.query;
        
        // Filter vehicles by agentId if provided
        let query = {};
        
        if (agentId) {
            // Check if it's a valid MongoDB ObjectId or Firebase UID
            if (mongoose.Types.ObjectId.isValid(agentId)) {
                query.agentId = agentId;
            } else {
                // Try to find the agent by Firebase UID
                const agent = await Agent.findOne({ firebaseUID: agentId });
                if (agent) {
                    query.agentId = agent._id;
                } else {
                    // If no agent found with this ID, return empty results
                    return res.json([]);
                }
            }
        }
        
        const vehicles = await Vehicle.find(query).populate('agentId');
        res.json(vehicles);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST create new vehicle
router.post('/vehicles', async (req, res) => {
    try {
        console.log('Received vehicle creation request');
        const {
            name,
            make,
            model,
            year,
            type,
            registrationNumber,
            color,
            image,
            pricing,
            status,
            specifications,
            description,
            agentId,
            firebaseId
        } = req.body;
        
        // Validate required fields
        const requiredFields = ['make', 'model', 'year', 'type', 'registrationNumber', 'agentId'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields
            });
        }
        
        console.log(`Processing vehicle: ${make} ${model}, agent: ${agentId}`);
        
        // Find the agent in MongoDB
        let agent = await Agent.findOne({ firebaseUID: agentId });
        
        // If agent doesn't exist, create it
        if (!agent) {
            console.log('Agent not found, creating placeholder agent');
            agent = new Agent({
                firebaseUID: agentId,
                name: 'Agent',
                email: 'placeholder@example.com',
                status: 'active'
            });
            await agent.save();
            console.log('Created new agent with ID:', agent._id);
        } else {
            console.log('Found existing agent with ID:', agent._id);
        }
        
        // Check if a vehicle with this registration number already exists
        const existingVehicle = await Vehicle.findOne({ registrationNumber });
        if (existingVehicle) {
            return res.status(400).json({
                message: 'A vehicle with this registration number already exists',
                registrationNumber
            });
        }
        
        // Create new vehicle
        console.log('Creating new vehicle with data:', JSON.stringify({
            make, model, type, registrationNumber
        }));
        
        // Normalize the vehicle type to lowercase
        const normalizedType = type.toLowerCase();
        
        // Validate vehicle type
        const validTypes = ['sedan', 'suv', 'hatchback', 'luxury', 'van', 'electric', 'standard', 'cruiser', 'sports', 'scooter', 'other'];
        if (!validTypes.includes(normalizedType)) {
            return res.status(400).json({
                message: 'Invalid vehicle type',
                type: normalizedType,
                validTypes
            });
        }
        
        // Normalize status value to match enum
        let normalizedStatus = status || 'active';
        if (normalizedStatus === 'available') {
            normalizedStatus = 'active';
        }
        
        // Log the status for debugging
        console.log('Status after normalization:', normalizedStatus);
        
        const vehicle = new Vehicle({
            agentId: agent._id,
            firebaseId: firebaseId,
            make,
            model,
            year,
            type: normalizedType,
            registrationNumber,
            pricing: {
                baseRate: pricing.dailyRate || 0,
                dailyRate: pricing.dailyRate || 0,
                weeklyRate: pricing.weeklyRate || 0,
                monthlyRate: pricing.monthlyRate || 0,
                deposit: pricing.deposit || 0
            },
            availability: {
                isAvailable: normalizedStatus === 'active',
                unavailableDates: []
            },
            specifications: {
                seats: specifications?.seats || 0,
                fuelType: specifications?.fuelType || 'petrol',
                transmission: specifications?.transmission || 'manual',
                color: color || ''
            },
            features: [],
            location: {
                city: 'Default City',
                state: 'Default State'
            },
            status: normalizedStatus,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        console.log('Saving vehicle to MongoDB...');
        await vehicle.save();
        console.log('Vehicle saved successfully with ID:', vehicle._id);
        
        res.status(201).json({
            message: 'Vehicle created successfully',
            vehicle
        });
    } catch (error) {
        console.error('Error creating vehicle:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            console.error('Validation error details:', error);
            
            const validationErrors = {};
            
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
                console.error(`Field '${field}' validation failed:`, error.errors[field]);
            }
            
            return res.status(400).json({
                message: 'Validation error',
                errors: validationErrors,
                // Include the error details for debugging
                details: error.toString()
            });
        }
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Duplicate key error',
                field: Object.keys(error.keyPattern)[0],
                value: error.keyValue[Object.keys(error.keyPattern)[0]]
            });
        }
        
        res.status(500).json({ 
            message: 'Server error while creating vehicle', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// PUT update vehicle
router.put('/vehicles/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        res.json({
            message: 'Vehicle updated successfully',
            vehicle
        });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE vehicle
router.delete('/vehicles/:id', async (req, res) => {
    try {
        const vehicleId = req.params.id;
        
        // First check if this vehicle has any active bookings
        const activeBookings = await Booking.find({
            vehicleId: vehicleId,
            status: { $in: ['pending', 'confirmed', 'ongoing'] }
        });
        
        if (activeBookings && activeBookings.length > 0) {
            return res.status(400).json({ 
                message: 'Vehicle cannot be deleted as it has active bookings',
                activeBookingsCount: activeBookings.length 
            });
        }
        
        // If no active bookings, delete the vehicle
        const vehicle = await Vehicle.findByIdAndDelete(vehicleId);
        
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        // Also delete any completed/cancelled bookings related to this vehicle
        await Booking.deleteMany({ 
            vehicleId: vehicleId,
            status: { $in: ['completed', 'cancelled'] }
        });
        
        res.json({ 
            message: 'Vehicle deleted successfully',
            deletedVehicle: {
                id: vehicle._id,
                name: vehicle.name || `${vehicle.make} ${vehicle.model}`,
                firebaseId: vehicle.firebaseId
            }
        });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST create a new booking
router.post('/bookings', async (req, res) => {
    try {
        console.log('Received booking creation request:', req.body);
        const {
            userId,
            userName,
            vehicleId,
            vehicleName,
            vehicleType,
            agentId,
            pickupDate,
            returnDate,
            pickupLocation,
            returnLocation,
            days,
            dailyRate,
            totalAmount,
            status,
            paymentStatus
        } = req.body;
        
        // Validate required fields
        const requiredFields = ['userId', 'vehicleId', 'agentId', 'pickupDate', 'returnDate'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields
            });
        }
        
        // Create booking object
        const booking = new Booking({
            userId: userId,
            userName: userName || '',
            vehicleId: vehicleId,
            vehicleName: vehicleName || '',
            vehicleType: vehicleType || '',
            agentId: agentId,
            pickupDate: new Date(pickupDate),
            returnDate: new Date(returnDate),
            days: days || 1,
            dailyRate: dailyRate || 0,
            totalAmount: totalAmount || 0,
            pickupLocation: pickupLocation || '',
            returnLocation: returnLocation || pickupLocation || '',
            pickupLocationDetails: {
                address: pickupLocation || ''
            },
            dropoffLocationDetails: {
                address: returnLocation || pickupLocation || ''
            },
            pricing: {
                baseRate: dailyRate || 0,
                totalAmount: totalAmount || 0
            },
            status: status || 'confirmed',
            paymentStatus: paymentStatus || 'completed',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        // Save booking to database
        await booking.save();
        console.log('Booking created successfully:', booking._id);
        
        // Update vehicle status to booked
        await Vehicle.findByIdAndUpdate(vehicleId, {
            status: 'booked',
            'availability.isAvailable': false,
            $push: {
                'availability.unavailableDates': {
                    startDate: new Date(pickupDate),
                    endDate: new Date(returnDate),
                    reason: 'booked'
                }
            }
        });
        
        res.status(201).json({
            message: 'Booking created successfully',
            _id: booking._id,
            booking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            
            return res.status(400).json({
                message: 'Validation error',
                errors: validationErrors
            });
        }
        
        // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid ID format',
                field: error.path,
                value: error.value
            });
        }
        
        res.status(500).json({ 
            message: 'Server error while creating booking', 
            error: error.message
        });
    }
});

// GET bookings for a user
router.get('/bookings/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required'
            });
        }
        
        console.log(`Fetching bookings for user: ${userId}`);
        
        const bookings = await Booking.find({ userId: userId })
            .sort({ createdAt: -1 });
        
        console.log(`Found ${bookings.length} bookings for user ${userId}`);
        
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ 
            message: 'Server error while fetching bookings', 
            error: error.message
        });
    }
});

// GET booking by ID
router.get('/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ 
            message: 'Server error while fetching booking', 
            error: error.message
        });
    }
});

// PUT update booking status
router.put('/bookings/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                message: 'Status is required'
            });
        }
        
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: new Date() },
            { new: true }
        );
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json({
            message: 'Booking status updated successfully',
            booking
        });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ 
            message: 'Server error while updating booking status', 
            error: error.message
        });
    }
});

// PUT update vehicle status
router.put('/vehicles/:id/status', async (req, res) => {
    try {
        const { status, bookedDates } = req.body;
        
        const updateData = {};
        
        if (status) {
            updateData.status = status;
            updateData['availability.isAvailable'] = status === 'active';
        }
        
        if (bookedDates) {
            updateData.$push = {
                'availability.unavailableDates': {
                    startDate: new Date(bookedDates.start),
                    endDate: new Date(bookedDates.end),
                    reason: 'booked'
                }
            };
        }
        
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        res.json({
            message: 'Vehicle status updated successfully',
            vehicle
        });
    } catch (error) {
        console.error('Error updating vehicle status:', error);
        res.status(500).json({ 
            message: 'Server error while updating vehicle status', 
            error: error.message
        });
    }
});

// PUT update booking
router.put('/bookings/:id', async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json({
            message: 'Booking updated successfully',
            booking
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ 
            message: 'Server error while updating booking', 
            error: error.message
        });
    }
});

// GET check if a booking with firebase ID exists
router.get('/bookings/check/:firebaseId', async (req, res) => {
    try {
        const { firebaseId } = req.params;
        
        if (!firebaseId) {
            return res.status(400).json({
                message: 'Firebase ID is required'
            });
        }
        
        console.log(`Checking if booking with Firebase ID ${firebaseId} exists`);
        
        const booking = await Booking.findOne({ firebaseId: firebaseId });
        
        res.json({
            exists: !!booking,
            booking: booking
        });
    } catch (error) {
        console.error('Error checking booking existence:', error);
        res.status(500).json({ 
            message: 'Server error while checking booking', 
            error: error.message
        });
    }
});

// POST sync booking from Firebase
router.post('/bookings/sync', async (req, res) => {
    try {
        console.log('Received booking sync request:', req.body);
        const {
            userId,
            vehicleId,
            vehicleName,
            pickupDate,
            returnDate,
            totalAmount,
            status,
            firebaseId
        } = req.body;
        
        // Validate required fields
        const requiredFields = ['userId', 'vehicleId', 'pickupDate', 'returnDate', 'firebaseId'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields
            });
        }
        
        // Check if vehicle exists
        let vehicleObj;
        let agentId;
        
        try {
            vehicleObj = await Vehicle.findById(vehicleId);
            if (vehicleObj) {
                agentId = vehicleObj.agentId;
            }
        } catch (error) {
            console.log('Vehicle not found, using default values');
        }
        
        // If vehicle not found, look up by Firebase ID
        if (!vehicleObj) {
            try {
                vehicleObj = await Vehicle.findOne({ firebaseId: vehicleId });
                if (vehicleObj) {
                    agentId = vehicleObj.agentId;
                }
            } catch (error) {
                console.log('Vehicle not found by Firebase ID either');
            }
        }
        
        // If still no vehicle, use a default agent ID
        if (!agentId) {
            // Find any agent to use as default
            const anyAgent = await Agent.findOne({});
            agentId = anyAgent ? anyAgent._id : null;
        }
        
        // Calculate days between dates
        const start = new Date(pickupDate);
        const end = new Date(returnDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
        
        // Create booking object
        const booking = new Booking({
            userId: userId,
            vehicleId: vehicleObj ? vehicleObj._id : vehicleId,
            vehicleName: vehicleName || 'Unknown Vehicle',
            agentId: agentId,
            pickupDate: start,
            returnDate: end,
            days: days,
            totalAmount: parseFloat(totalAmount) || 0,
            status: status || 'confirmed',
            firebaseId: firebaseId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        // Save booking to database
        await booking.save();
        console.log('Synced booking created successfully:', booking._id);
        
        res.status(201).json({
            message: 'Booking synced successfully',
            _id: booking._id,
            booking
        });
    } catch (error) {
        console.error('Error syncing booking:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            
            return res.status(400).json({
                message: 'Validation error',
                errors: validationErrors
            });
        }
        
        // Handle invalid ObjectId format
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid ID format',
                field: error.path,
                value: error.value
            });
        }
        
        res.status(500).json({ 
            message: 'Server error while syncing booking', 
            error: error.message
        });
    }
});

// GET bookings by vehicle ID
router.get('/bookings', async (req, res) => {
    try {
        const { vehicleId, status } = req.query;
        
        if (!vehicleId) {
            return res.status(400).json({
                message: 'Vehicle ID is required as a query parameter'
            });
        }
        
        console.log(`Fetching bookings for vehicle: ${vehicleId}, status: ${status || 'any'}`);
        
        // Build query
        const query = { vehicleId: vehicleId };
        
        // Add status filter if provided
        if (status) {
            query.status = status;
        }
        
        // Find bookings for this vehicle
        const bookings = await Booking.find(query).sort({ createdAt: -1 });
        
        console.log(`Found ${bookings.length} bookings for vehicle ${vehicleId}`);
        
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings for vehicle:', error);
        res.status(500).json({ 
            message: 'Server error while fetching bookings', 
            error: error.message
        });
    }
});

// GET bookings from Firebase by vehicle ID
router.get('/bookings/firebase', async (req, res) => {
    try {
        const { vehicleId } = req.query;
        
        if (!vehicleId) {
            return res.status(400).json({
                message: 'Vehicle ID is required as a query parameter'
            });
        }
        
        console.log(`Fetching Firebase bookings for vehicle: ${vehicleId}`);
        
        // Check if the vehicle exists in MongoDB
        const vehicle = await Vehicle.findOne({
            $or: [
                { _id: vehicleId },
                { firebaseId: vehicleId }
            ]
        });
        
        if (!vehicle) {
            return res.status(404).json({
                message: 'Vehicle not found'
            });
        }
        
        // Get all bookings from Firebase related to this vehicle
        // This requires custom implementation in your firebase service
        // For now, we'll return an empty array
        
        // In a real app, you would query Firebase here
        res.json([]);
    } catch (error) {
        console.error('Error fetching Firebase bookings:', error);
        res.status(500).json({ 
            message: 'Server error while fetching Firebase bookings', 
            error: error.message
        });
    }
});

// Export the router for use in other files
module.exports = router; 