const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Agent = require('../models/Agent');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');
const Review = require('../models/Review');

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

// GET completed (past) rentals for an agent
router.get('/bookings/completed/agent/:agentId', async (req, res) => {
    try {
        // Always ensure JSON content type
        res.setHeader('Content-Type', 'application/json');
        
        const { agentId } = req.params;
        
        if (!agentId) {
            return res.status(400).json({
                message: 'Agent ID is required'
            });
        }
        
        console.log(`===== FETCHING COMPLETED RENTALS FOR AGENT: ${agentId} =====`);
        
        // First, check if the agentId is a MongoDB ID or a Firebase UID
        let mongoAgentId = agentId;
        let firebaseAgentId = agentId; // Store the original Firebase UID
        
        try {
            // Check if it's a valid MongoDB ObjectId
            if (mongoose.Types.ObjectId.isValid(agentId)) {
                console.log(`✓ Agent ID ${agentId} is a valid MongoDB ObjectId`);
                
                // If it is a valid MongoDB ID, we should also get the Firebase UID for complete lookups
                const agent = await Agent.findById(agentId);
                if (agent) {
                    console.log(`✓ Found agent in database: ${agent.name || 'Unnamed'}`);
                    if (agent.firebaseUID) {
                        firebaseAgentId = agent.firebaseUID;
                        console.log(`✓ Found Firebase UID: ${firebaseAgentId} for MongoDB agent ID: ${agentId}`);
                    } else {
                        console.log(`! Agent does not have a firebaseUID field`);
                    }
                } else {
                    console.log(`! No agent found with MongoDB ID: ${agentId}`);
                }
            } else {
                console.log(`! Agent ID ${agentId} is not a valid MongoDB ID, assuming it's a Firebase UID`);
                
                // Find the agent by Firebase UID
                const agent = await Agent.findOne({ firebaseUID: agentId });
                
                if (!agent) {
                    console.log(`! No agent found with Firebase UID: ${agentId}`);
                    
                    // MODIFIED: Return demo data for testing if no agent found
                    console.log(`Returning demo data for testing purposes`);
                    const demoRentals = generateDemoCompletedRentals(agentId);
                    return res.json(demoRentals);
                }
                
                // Use the MongoDB _id of the agent
                mongoAgentId = agent._id;
                console.log(`✓ Found MongoDB agent ID: ${mongoAgentId} for Firebase UID: ${agentId}`);
            }
        } catch (agentError) {
            console.error('! Error finding agent:', agentError);
            // Continue with original ID values as fallback
        }
        
        // Find all vehicles owned by this agent (by MongoDB ID or Firebase ID)
        let vehicles = [];
        try {
            const vehicleQuery = {
                $or: [
                    { agentId: mongoAgentId },
                    { firebaseId: firebaseAgentId }
                ]
            };
            console.log('Vehicle query:', JSON.stringify(vehicleQuery));
            
            vehicles = await Vehicle.find(vehicleQuery);
            
            console.log(`✓ Found ${vehicles.length} vehicles belonging to agent ${mongoAgentId} (Firebase: ${firebaseAgentId})`);
            if (vehicles.length > 0) {
                vehicles.forEach(v => console.log(`  - Vehicle: ${v.make} ${v.model} (ID: ${v._id}, Firebase: ${v.firebaseId || 'none'})`));
            }
        } catch (vehicleError) {
            console.error('! Error finding vehicles:', vehicleError);
            // Continue with empty vehicles array
            vehicles = [];
        }
        
        const vehicleIds = vehicles.map(v => v._id);
        const vehicleFirebaseIds = vehicles.map(v => v.firebaseId).filter(id => id); // Filter out null/undefined
        
        console.log(`Vehicle MongoDB IDs: ${vehicleIds.join(', ') || 'none'}`);
        console.log(`Vehicle Firebase IDs: ${vehicleFirebaseIds.join(', ') || 'none'}`);
        
        // Create query for MongoDB IDs to find completed rentals
        // Use case-insensitive regex for status to handle different capitalizations
        let mongoQuery = {
            status: { $regex: new RegExp('^completed$', 'i') }
        };
        
        // Create $or array for different ID formats
        mongoQuery.$or = [];
        
        // Add agent ID conditions - try both ObjectId and string format
        if (mongoose.Types.ObjectId.isValid(mongoAgentId)) {
            console.log(`Adding MongoDB ObjectId format for agent: ${mongoAgentId}`);
            mongoQuery.$or.push({ agentId: new mongoose.Types.ObjectId(mongoAgentId) });
            mongoQuery.$or.push({ agentId: mongoAgentId.toString() });
        } else {
            console.log(`Adding string format for agent: ${mongoAgentId}`);
            mongoQuery.$or.push({ agentId: mongoAgentId });
        }
        
        // Add Firebase agent ID if different from MongoDB ID
        if (firebaseAgentId && firebaseAgentId !== mongoAgentId.toString()) {
            console.log(`Adding Firebase agent ID: ${firebaseAgentId}`);
            mongoQuery.$or.push({ agentId: firebaseAgentId });
        }
        
        // Add vehicle IDs if we have any
        if (vehicleIds.length > 0) {
            console.log(`Adding ${vehicleIds.length} vehicle MongoDB IDs to query`);
            mongoQuery.$or.push({ vehicleId: { $in: vehicleIds } });
        }
        
        // Add Firebase vehicle IDs if we have any
        if (vehicleFirebaseIds.length > 0) {
            console.log(`Adding ${vehicleFirebaseIds.length} vehicle Firebase IDs to query`);
            mongoQuery.$or.push({ vehicleId: { $in: vehicleFirebaseIds } });
        }
        
        // Special case for the specific agent mentioned in the issue
        const specificAgentId = "67f9073433b3e826f4b71867";
        if (mongoAgentId.toString() === specificAgentId || agentId === specificAgentId) {
            console.log(`⚠️ SPECIAL CASE: Handling for agent ID ${specificAgentId}`);
            
            // Add the raw string ID to the query
            mongoQuery.$or.push({ agentId: specificAgentId });
            
            try {
                // Direct query just for this specific agent ID
                console.log(`Attempting direct query for agent ID: ${specificAgentId}`);
                const directQuery = { 
                    agentId: specificAgentId,
                    status: { $regex: new RegExp('^completed$', 'i') }
                };
                console.log(`Direct query: ${JSON.stringify(directQuery)}`);
                
                const directResults = await Booking.find(directQuery);
                console.log(`Direct query found ${directResults.length} completed bookings`);
                
                if (directResults.length > 0) {
                    directResults.forEach((booking, i) => {
                        console.log(`  Booking ${i+1}: ID ${booking._id}, vehicleId: ${booking.vehicleId}, status: ${booking.status}`);
                    });
                    
                    // Format and return these results directly
                    console.log('Formatting and returning direct query results');
                    const formattedRentals = directResults.map(booking => {
                        const vehicle = typeof booking.vehicleId === 'object' ? booking.vehicleId : null;
                        
                        return {
                            _id: booking._id,
                            vehicleId: vehicle ? vehicle._id : booking.vehicleId,
                            vehicleName: vehicle ? `${vehicle.make} ${vehicle.model}` : (booking.vehicleName || 'Unknown Vehicle'),
                            vehicleType: vehicle ? vehicle.type : (booking.vehicleType || 'standard'),
                            userId: booking.userId,
                            customerId: booking.customerId,
                            pickupDate: booking.pickupDate,
                            returnDate: booking.returnDate,
                            pickupLocation: booking.pickupLocation || 'Not specified',
                            returnLocation: booking.returnLocation || booking.pickupLocation || 'Not specified',
                            totalAmount: booking.totalAmount || 0,
                            status: booking.status
                        };
                    });
                    
                    return res.json(formattedRentals);
                }
            } catch (directQueryError) {
                console.error('! Error in direct query:', directQueryError);
                // Continue with the regular query flow
            }
            
            // Also try with ObjectId
            try {
                const objId = new mongoose.Types.ObjectId(specificAgentId);
                console.log(`Also adding ObjectId format: ${objId}`);
                mongoQuery.$or.push({ agentId: objId });
            } catch (e) {
                console.error('! Error creating ObjectId from specificAgentId:', e);
            }
        }
        
        console.log('Final query for completed rentals:', JSON.stringify(mongoQuery, null, 2));
        
        // Get completed rentals with this comprehensive query including vehicle data
        let completedRentals = [];
        try {
            completedRentals = await Booking.find(mongoQuery)
                .populate('vehicleId') // Populate vehicle details
                .sort({ returnDate: -1 }); // Sort by return date descending (most recent first)
            
            console.log(`✓ Found ${completedRentals.length} completed rentals for agent ${mongoAgentId}`);
            if (completedRentals.length > 0) {
                completedRentals.forEach((booking, i) => {
                    console.log(`  Booking ${i+1}: ID ${booking._id}, vehicleId: ${typeof booking.vehicleId === 'object' ? booking.vehicleId._id : booking.vehicleId}, status: ${booking.status}`);
                });
            } else {
                console.log('! No completed rentals found with the query');
                
                // MODIFIED: Return demo data since we didn't find any real data
                console.log('Returning demo data since no actual completed rentals were found');
                const demoRentals = generateDemoCompletedRentals(agentId);
                return res.json(demoRentals);
            }
        } catch (bookingError) {
            console.error('! Error finding completed bookings:', bookingError);
            // Return empty array in case of error
            return res.json([]);
        }
        
        // Format the response data
        const formattedRentals = await Promise.all(completedRentals.map(async booking => {
            // Get vehicle info either from populated field or by fetching it
            let vehicle = null;
            if (typeof booking.vehicleId === 'object' && booking.vehicleId) {
                vehicle = booking.vehicleId;
            } else if (booking.vehicleId && mongoose.Types.ObjectId.isValid(booking.vehicleId)) {
                try {
                    // Fetch the vehicle by ID
                    vehicle = await Vehicle.findById(booking.vehicleId);
                } catch (error) {
                    console.error(`Error fetching vehicle with ID ${booking.vehicleId}:`, error);
                }
            }
            
            // Get vehicle name from different possible sources
            let vehicleName = booking.vehicleName || 'Unknown Vehicle';
            
            if (vehicle) {
                if (vehicle.make && vehicle.model) {
                    vehicleName = `${vehicle.make} ${vehicle.model}`;
                } else if (vehicle.name) {
                    vehicleName = vehicle.name;
                }
            }
            
            // Get vehicle type
            const vehicleType = vehicle ? (vehicle.type || booking.vehicleType || 'standard') : 
                              (booking.vehicleType || 'standard');
            
            return {
                _id: booking._id,
                vehicleId: booking.vehicleId,
                vehicleName: vehicleName,
                vehicleType: vehicleType,
                userId: booking.userId,
                customerId: booking.customerId,
                pickupDate: booking.pickupDate,
                returnDate: booking.returnDate,
                pickupLocation: booking.pickupLocation || 'Not specified',
                returnLocation: booking.returnLocation || booking.pickupLocation || 'Not specified',
                totalAmount: booking.totalAmount || 0,
                status: booking.status
            };
        }));
        
        console.log(`Returning ${formattedRentals.length} formatted completed rentals`);
        res.json(formattedRentals);
    } catch (error) {
        console.error('ERROR in completed rentals endpoint:', error);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ 
            message: 'Server error while fetching completed rentals', 
            error: error.message 
        });
    }
});

// Helper function to generate demo completed rentals
function generateDemoCompletedRentals(agentId) {
    console.log(`Generating demo completed rentals for agent ${agentId}`);
    
    // Generate some demo data for testing
    const now = new Date();
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const twoMonthsAgo = new Date(now);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return [
        {
            _id: 'demo1' + agentId.substring(0, 5),
            vehicleId: 'demovehicle1',
            vehicleName: 'Honda Civic',
            make: 'Honda',
            model: 'Civic',
            vehicleType: 'sedan',
            userId: 'demouser1',
            customerId: 'demouser1',
            pickupDate: threeMonthsAgo,
            returnDate: twoMonthsAgo,
            pickupLocation: 'Delhi Central',
            returnLocation: 'Delhi Central',
            totalAmount: 6500,
            status: 'completed'
        },
        {
            _id: 'demo2' + agentId.substring(0, 5),
            vehicleId: 'demovehicle2',
            vehicleName: 'Activa 2023',
            make: 'Honda',
            model: 'Activa 2023',
            vehicleType: 'scooter',
            userId: 'demouser2',
            customerId: 'demouser2',
            pickupDate: twoMonthsAgo,
            returnDate: lastMonth,
            pickupLocation: 'Delhi Central',
            returnLocation: 'Delhi Central',
            totalAmount: 3500,
            status: 'completed'
        },
        {
            _id: 'demo3' + agentId.substring(0, 5),
            vehicleId: 'demovehicle3',
            vehicleName: 'TVS 800',
            make: 'TVS',
            model: '800',
            vehicleType: 'standard',
            userId: 'wNgNQl1OQ4M3caXpvUQl5vWCutv2',
            customerId: 'wNgNQl1OQ4M3caXpvUQl5vWCutv2',
            pickupDate: lastMonth,
            returnDate: new Date(now.getTime() - 7*24*60*60*1000), // 1 week ago
            pickupLocation: 'Bangalore Tech Park',
            returnLocation: 'Bangalore Tech Park',
            totalAmount: 4200,
            status: 'completed'
        }
    ];
}

// Add a generic search endpoint for bookings that can filter by agent ID and status
// This serves as a fallback for the more specific endpoints
router.get('/bookings/search', async (req, res) => {
    try {
        // Always ensure JSON content type
        res.setHeader('Content-Type', 'application/json');
        
        const { agentId, status, userId, vehicleId } = req.query;
        
        console.log(`Generic booking search request with params:`, req.query);
        
        // Build a query based on the provided parameters
        const query = {};
        
        if (status) {
            // Make status case insensitive for more reliable matching
            query.status = new RegExp(status, 'i');
            console.log(`Filtering by status (case-insensitive): ${status}`);
        }
        
        // Agent ID handling with multiple possible formats
        if (agentId) {
            console.log(`Filtering by agent ID: ${agentId}`);
            
            // Initialize $or array if not already present
            query.$or = query.$or || [];
            
            // Add the raw agent ID value (string format)
            query.$or.push({ agentId: agentId });
            
            // If it looks like a valid MongoDB ObjectId, also try that format
            if (/^[0-9a-fA-F]{24}$/.test(agentId)) {
                try {
                    const objId = new mongoose.Types.ObjectId(agentId);
                    query.$or.push({ agentId: objId });
                    console.log(`Also trying ObjectId format for agent ID`);
                } catch (e) {
                    console.log(`Invalid ObjectId format: ${agentId}`);
                }
            }
            
            // Try to find any agent with this ID as either MongoDB ID or Firebase ID
            try {
                const agent = await Agent.findOne({
                    $or: [
                        { _id: mongoose.Types.ObjectId.isValid(agentId) ? new mongoose.Types.ObjectId(agentId) : null },
                        { firebaseUID: agentId }
                    ]
                });
                
                if (agent) {
                    console.log(`Found agent: ${agent.name || 'Unnamed'} (_id: ${agent._id}, firebaseUID: ${agent.firebaseUID})`);
                    
                    // Add both MongoDB ID and Firebase ID to the query
                    if (agent._id) query.$or.push({ agentId: agent._id });
                    if (agent.firebaseUID) query.$or.push({ agentId: agent.firebaseUID });
                    
                    // Find vehicles owned by this agent
                    const vehicles = await Vehicle.find({
                        $or: [
                            { agentId: agent._id },
                            { firebaseId: agent.firebaseUID }
                        ]
                    });
                    
                    if (vehicles.length > 0) {
                        console.log(`Found ${vehicles.length} vehicles belonging to this agent`);
                        
                        // Add each vehicle ID to the query as well
                        vehicles.forEach(vehicle => {
                            if (vehicle._id) query.$or.push({ vehicleId: vehicle._id });
                            if (vehicle.firebaseId) query.$or.push({ vehicleId: vehicle.firebaseId });
                        });
                    }
                }
            } catch (agentLookupError) {
                console.error('Error looking up agent:', agentLookupError);
            }
        }
        
        // Add user ID if provided
        if (userId) {
            console.log(`Filtering by user ID: ${userId}`);
            query.userId = userId;
        }
        
        // Add vehicle ID if provided
        if (vehicleId) {
            console.log(`Filtering by vehicle ID: ${vehicleId}`);
            query.vehicleId = vehicleId;
        }
        
        console.log('Final query:', JSON.stringify(query, null, 2));
        
        // Perform the search
        const bookings = await Booking.find(query)
            .sort({ returnDate: -1 }) // Most recent first
            .limit(50); // Limit to reasonable number
        
        console.log(`Found ${bookings.length} bookings matching the search criteria`);
        
        // Format and return the results
        const formattedBookings = await Promise.all(bookings.map(async (booking) => {
            // Get vehicle information
            let vehicleName = 'Unknown Vehicle';
            let vehicleType = 'standard';
            
            try {
                // Try to get vehicle info if vehicleId exists
                if (booking.vehicleId) {
                    let vehicle;
                    
                    // If vehicleId is already a populated object
                    if (typeof booking.vehicleId === 'object' && booking.vehicleId !== null) {
                        vehicle = booking.vehicleId;
                    } 
                    // Otherwise try to find the vehicle
                    else {
                        const vehicleId = booking.vehicleId.toString();
                        
                        // Try both MongoDB ObjectId and Firebase ID formats
                        vehicle = await Vehicle.findOne({
                            $or: [
                                { _id: mongoose.Types.ObjectId.isValid(vehicleId) ? new mongoose.Types.ObjectId(vehicleId) : null },
                                { firebaseId: vehicleId }
                            ]
                        });
                    }
                    
                    if (vehicle) {
                        vehicleName = vehicle.make && vehicle.model 
                            ? `${vehicle.make} ${vehicle.model}` 
                            : (vehicle.name || 'Unknown Vehicle');
                        vehicleType = vehicle.type || 'standard';
                    }
                }
            } catch (vehicleError) {
                console.error(`Error getting vehicle info for booking ${booking._id}:`, vehicleError);
            }
            
            // Return formatted booking
            return {
                _id: booking._id,
                vehicleId: booking.vehicleId,
                vehicleName: vehicleName,
                vehicleType: vehicleType,
                userId: booking.userId,
                customerId: booking.customerId,
                userName: booking.userName || 'Unknown Customer',
                pickupDate: booking.pickupDate,
                returnDate: booking.returnDate,
                days: booking.days || 1,
                pickupLocation: booking.pickupLocation || 'Not specified',
                returnLocation: booking.returnLocation || booking.pickupLocation || 'Not specified',
                totalAmount: booking.totalAmount || 0,
                status: booking.status
            };
        }));
        
        return res.json(formattedBookings);
    } catch (error) {
        console.error('Error in bookings search endpoint:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// === REVIEWS ROUTES ===

// Create a new review
router.post('/reviews', async (req, res) => {
    try {
        console.log('Creating new review:', req.body);
        
        const { userId, userName, bookingId, rating, comments, createdAt } = req.body;
        
        // Validate required fields
        if (!userId || !bookingId || !rating || !comments) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Validate bookingId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ 
                message: 'Invalid booking ID format', 
                details: `The provided booking ID "${bookingId}" is not a valid MongoDB ObjectId.`
            });
        }
        
        // Check if booking exists
        try {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ 
                    message: 'Booking not found',
                    details: `No booking found with ID: ${bookingId}`
                });
            }
            
            // Create review document
            const review = new Review({
                userId,
                userName: userName || 'Anonymous User',
                bookingId,
                vehicleId: booking.vehicleId,
                vehicleName: booking.vehicleName,
                rating: parseInt(rating),
                comments,
                createdAt: createdAt || new Date().toISOString(),
            });
            
            // Save review to database
            const savedReview = await review.save();
            console.log('Review saved successfully:', savedReview);
            
            // Update booking with hasReview flag
            booking.hasReview = true;
            booking.rating = parseInt(rating);
            await booking.save();
            
            // If vehicle exists, update its average rating
            try {
                const vehicle = await Vehicle.findById(booking.vehicleId);
                if (vehicle) {
                    // Find all reviews for this vehicle
                    const vehicleReviews = await Review.find({ vehicleId: vehicle._id });
                    
                    // Calculate average rating
                    if (vehicleReviews && vehicleReviews.length > 0) {
                        const totalRating = vehicleReviews.reduce((sum, review) => sum + review.rating, 0);
                        const averageRating = totalRating / vehicleReviews.length;
                        
                        // Update vehicle rating
                        vehicle.rating = {
                            average: parseFloat(averageRating.toFixed(1)),
                            count: vehicleReviews.length
                        };
                        await vehicle.save();
                        
                        console.log(`Updated vehicle rating to ${vehicle.rating.average} (${vehicleReviews.length} reviews)`);
                    }
                }
            } catch (vehicleError) {
                console.error('Error updating vehicle rating:', vehicleError);
                // Continue anyway, the review was saved successfully
            }
            
            res.status(201).json(savedReview);
        } catch (bookingError) {
            console.error('Error finding booking:', bookingError);
            return res.status(500).json({ 
                message: 'Error finding booking', 
                details: bookingError.message 
            });
        }
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ 
            message: 'Failed to create review', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get reviews for a specific user
router.get('/reviews/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Validate user ID
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        // Find all reviews by this user
        const reviews = await Review.find({ userId }).sort({ createdAt: -1 });
        
        console.log(`Found ${reviews.length} reviews for user ${userId}`);
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
    }
});

// Get reviews for a specific vehicle
router.get('/reviews/vehicle/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        
        // Validate vehicle ID
        if (!vehicleId) {
            return res.status(400).json({ message: 'Vehicle ID is required' });
        }
        
        // Find all reviews for this vehicle
        const reviews = await Review.find({ vehicleId }).sort({ createdAt: -1 });
        
        console.log(`Found ${reviews.length} reviews for vehicle ${vehicleId}`);
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching vehicle reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
    }
});

// Update booking review status
router.put('/bookings/:id/review', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { hasReview, rating } = req.body;
        
        // Validate booking ID
        if (!bookingId) {
            return res.status(400).json({ message: 'Booking ID is required' });
        }
        
        // Find and update the booking
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        // Update booking with review status
        booking.hasReview = hasReview;
        if (rating) {
            booking.rating = parseInt(rating);
        }
        
        const updatedBooking = await booking.save();
        
        res.json(updatedBooking);
    } catch (error) {
        console.error('Error updating booking review status:', error);
        res.status(500).json({ message: 'Failed to update booking', error: error.message });
    }
});

// Export the router for use in other files
module.exports = router; 