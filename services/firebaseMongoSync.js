const admin = require('firebase-admin');
const Customer = require('../models/Customer');
const Agent = require('../models/Agent');
const Admin = require('../models/Admin');
const Vehicle = require('../models/Vehicle');
const Review = require('../models/Review');
const connectDB = require('../config/db');

// Initialize MongoDB connection
connectDB();

const syncCustomersToMongo = async () => {
    try {
        // Get all users from Firebase
        const usersSnapshot = await admin.firestore()
            .collection('users')
            .get();
        console.log(`Found ${usersSnapshot.size} users in Firebase`);

        // Filter and process only customers
        const customers = usersSnapshot.docs
            .filter(doc => doc.data().userType === 'customer')
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        console.log(`Found ${customers.length} customers in Firebase`);

        // Process each customer
        for (const customer of customers) {
            if (!customer.id) {
                console.log('Skipping customer without Firebase UID');
                continue;
            }

            try {
                // Update or create customer in MongoDB
                await Customer.findOneAndUpdate(
                    { firebaseUID: customer.id },
                    {
                        firebaseUID: customer.id,
                        email: customer.email,
                        name: customer.name,
                        phoneNumber: customer.phoneNumber || '',
                        address: customer.address || '',
                        drivingLicense: customer.drivingLicense || '',
                        updatedAt: new Date()
                    },
                    { upsert: true, new: true }
                );
                console.log(`Synced customer: ${customer.name} (${customer.id})`);
            } catch (error) {
                console.error(`Error syncing customer ${customer.id}:`, error);
            }
        }

        console.log('Customer sync completed');
    } catch (error) {
        console.error('Error syncing customers:', error);
    }
};

const syncAgentsToMongo = async () => {
    try {
        // Get all agents from Firestore
        const agentsSnapshot = await admin.firestore()
            .collection('agents')
            .get();
        
        for (const doc of agentsSnapshot.docs) {
            const agentData = doc.data();
            
            // Skip if no Firebase UID
            if (!doc.id) {
                console.log('Skipping agent with no Firebase UID');
                continue;
            }
            
            // Update or create agent in MongoDB
            await Agent.findOneAndUpdate(
                { firebaseUID: doc.id },
                {
                    firebaseUID: doc.id,
                    email: agentData.email,
                    name: agentData.name,
                    phoneNumber: agentData.phoneNumber,
                    businessName: agentData.businessName,
                    businessAddress: agentData.businessAddress || {},
                    businessLicense: agentData.businessLicense || {},
                    documents: agentData.documents || [],
                    status: agentData.status || 'active',
                    rating: agentData.rating || { average: 0, count: 0 },
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );
            console.log(`Synced agent: ${doc.id}`);
        }
        console.log('Agent sync completed');
    } catch (error) {
        console.error('Error syncing agents:', error);
    }
};

const syncAdminsToMongo = async () => {
    try {
        // Get all admins from Firestore
        const adminsSnapshot = await admin.firestore()
            .collection('admins')
            .get();
        
        for (const doc of adminsSnapshot.docs) {
            const adminData = doc.data();
            
            // Update or create admin in MongoDB
            await Admin.findOneAndUpdate(
                { firebaseUID: doc.id },
                {
                    firebaseUID: doc.id,
                    email: adminData.email,
                    name: adminData.name,
                    phoneNumber: adminData.phoneNumber,
                    role: adminData.role || 'admin',
                    permissions: adminData.permissions || [],
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );
            console.log(`Synced admin: ${doc.id}`);
        }
        console.log('Admin sync completed');
    } catch (error) {
        console.error('Error syncing admins:', error);
    }
};

const syncVehiclesToMongo = async () => {
    try {
        // Get all vehicles from Firestore
        const vehiclesSnapshot = await admin.firestore()
            .collection('vehicles')
            .get();
        
        for (const doc of vehiclesSnapshot.docs) {
            const vehicleData = doc.data();
            
            // Update or create vehicle in MongoDB
            await Vehicle.findOneAndUpdate(
                { _id: doc.id },
                {
                    agentId: vehicleData.agentId,
                    make: vehicleData.make,
                    model: vehicleData.model,
                    year: vehicleData.year,
                    type: vehicleData.type,
                    registrationNumber: vehicleData.registrationNumber,
                    images: vehicleData.images || [],
                    features: vehicleData.features || [],
                    pricing: vehicleData.pricing || {},
                    availability: vehicleData.availability || {},
                    specifications: vehicleData.specifications || {},
                    location: vehicleData.location || {},
                    status: vehicleData.status || 'active',
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );
            console.log(`Synced vehicle: ${doc.id}`);
        }
        console.log('Vehicle sync completed');
    } catch (error) {
        console.error('Error syncing vehicles:', error);
    }
};

const syncReviewsToMongo = async () => {
    try {
        // Get all reviews from Firestore
        const reviewsSnapshot = await admin.firestore()
            .collection('reviews')
            .get();
        
        for (const doc of reviewsSnapshot.docs) {
            const reviewData = doc.data();
            
            // Update or create review in MongoDB
            await Review.findOneAndUpdate(
                { _id: doc.id },
                {
                    userId: reviewData.userId,
                    bookingId: reviewData.bookingId,
                    vehicleId: reviewData.vehicleId,
                    agentId: reviewData.agentId,
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    images: reviewData.images || [],
                    status: reviewData.status || 'pending',
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );
            console.log(`Synced review: ${doc.id}`);
        }
        console.log('Review sync completed');
    } catch (error) {
        console.error('Error syncing reviews:', error);
    }
};

// Set up real-time listeners
const setupRealtimeSync = () => {
    // Listen for customer changes
    admin.firestore()
        .collection('users')
        .where('userType', '==', 'customer')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                const customer = {
                    id: change.doc.id,
                    ...change.doc.data()
                };

                if (!customer.id) {
                    console.log('Skipping customer without Firebase UID');
                    return;
                }

                try {
                    if (change.type === 'added' || change.type === 'modified') {
                        await Customer.findOneAndUpdate(
                            { firebaseUID: customer.id },
                            {
                                firebaseUID: customer.id,
                                email: customer.email,
                                name: customer.name,
                                phoneNumber: customer.phoneNumber || '',
                                address: customer.address || '',
                                drivingLicense: customer.drivingLicense || '',
                                updatedAt: new Date()
                            },
                            { upsert: true, new: true }
                        );
                        console.log(`Real-time sync: Updated customer ${customer.name}`);
                    } else if (change.type === 'removed') {
                        await Customer.findOneAndDelete({ firebaseUID: customer.id });
                        console.log(`Real-time sync: Removed customer ${customer.name}`);
                    }
                } catch (error) {
                    console.error(`Error in real-time customer sync for ${customer.id}:`, error);
                }
            });
        });

    // Listen for agent changes
    admin.firestore()
        .collection('agents')
        .onSnapshot(async (snapshot) => {
            for (const change of snapshot.docChanges()) {
                const agentData = change.doc.data();
                const uid = change.doc.id;

                // Skip if no Firebase UID
                if (!uid) {
                    console.log('Skipping agent change with no Firebase UID');
                    continue;
                }

                try {
                    if (change.type === 'added' || change.type === 'modified') {
                        await Agent.findOneAndUpdate(
                            { firebaseUID: uid },
                            {
                                firebaseUID: uid,
                                email: agentData.email,
                                name: agentData.name,
                                phoneNumber: agentData.phoneNumber,
                                businessName: agentData.businessName,
                                businessAddress: agentData.businessAddress || {},
                                businessLicense: agentData.businessLicense || {},
                                documents: agentData.documents || [],
                                status: agentData.status || 'active',
                                rating: agentData.rating || { average: 0, count: 0 },
                                updatedAt: new Date()
                            },
                            { upsert: true, new: true }
                        );
                        console.log(`Real-time sync - Updated agent: ${uid}`);
                    } else if (change.type === 'removed') {
                        await Agent.deleteOne({ firebaseUID: uid });
                        console.log(`Real-time sync - Deleted agent: ${uid}`);
                    }
                } catch (error) {
                    console.error(`Error syncing agent ${uid}:`, error);
                }
            }
        });

    // Listen for admin changes
    admin.firestore()
        .collection('admins')
        .onSnapshot(async (snapshot) => {
            for (const change of snapshot.docChanges()) {
                const adminData = change.doc.data();
                const uid = change.doc.id;

                try {
                    if (change.type === 'added' || change.type === 'modified') {
                        await Admin.findOneAndUpdate(
                            { firebaseUID: uid },
                            {
                                firebaseUID: uid,
                                email: adminData.email,
                                name: adminData.name,
                                phoneNumber: adminData.phoneNumber,
                                role: adminData.role || 'admin',
                                permissions: adminData.permissions || [],
                                updatedAt: new Date()
                            },
                            { upsert: true, new: true }
                        );
                        console.log(`Real-time sync - Updated admin: ${uid}`);
                    } else if (change.type === 'removed') {
                        await Admin.deleteOne({ firebaseUID: uid });
                        console.log(`Real-time sync - Deleted admin: ${uid}`);
                    }
                } catch (error) {
                    console.error(`Error syncing admin ${uid}:`, error);
                }
            }
        });

    // Listen for vehicle changes
    admin.firestore()
        .collection('vehicles')
        .onSnapshot(async (snapshot) => {
            for (const change of snapshot.docChanges()) {
                const vehicleData = change.doc.data();
                const uid = change.doc.id;

                try {
                    if (change.type === 'added' || change.type === 'modified') {
                        await Vehicle.findOneAndUpdate(
                            { _id: uid },
                            {
                                agentId: vehicleData.agentId,
                                make: vehicleData.make,
                                model: vehicleData.model,
                                year: vehicleData.year,
                                type: vehicleData.type,
                                registrationNumber: vehicleData.registrationNumber,
                                images: vehicleData.images || [],
                                features: vehicleData.features || [],
                                pricing: vehicleData.pricing || {},
                                availability: vehicleData.availability || {},
                                specifications: vehicleData.specifications || {},
                                location: vehicleData.location || {},
                                status: vehicleData.status || 'active',
                                updatedAt: new Date()
                            },
                            { upsert: true, new: true }
                        );
                        console.log(`Real-time sync - Updated vehicle: ${uid}`);
                    } else if (change.type === 'removed') {
                        await Vehicle.deleteOne({ _id: uid });
                        console.log(`Real-time sync - Deleted vehicle: ${uid}`);
                    }
                } catch (error) {
                    console.error(`Error syncing vehicle ${uid}:`, error);
                }
            }
        });

    // Listen for review changes
    admin.firestore()
        .collection('reviews')
        .onSnapshot(async (snapshot) => {
            for (const change of snapshot.docChanges()) {
                const reviewData = change.doc.data();
                const uid = change.doc.id;

                try {
                    if (change.type === 'added' || change.type === 'modified') {
                        await Review.findOneAndUpdate(
                            { _id: uid },
                            {
                                userId: reviewData.userId,
                                bookingId: reviewData.bookingId,
                                vehicleId: reviewData.vehicleId,
                                agentId: reviewData.agentId,
                                rating: reviewData.rating,
                                comment: reviewData.comment,
                                images: reviewData.images || [],
                                status: reviewData.status || 'pending',
                                updatedAt: new Date()
                            },
                            { upsert: true, new: true }
                        );
                        console.log(`Real-time sync - Updated review: ${uid}`);
                    } else if (change.type === 'removed') {
                        await Review.deleteOne({ _id: uid });
                        console.log(`Real-time sync - Deleted review: ${uid}`);
                    }
                } catch (error) {
                    console.error(`Error syncing review ${uid}:`, error);
                }
            }
        });
};

// Initial sync and setup of real-time listeners
const initializeSync = async () => {
    console.log('Starting initial sync...');
    await syncCustomersToMongo();
    await syncAgentsToMongo();
    await syncAdminsToMongo();
    await syncVehiclesToMongo();
    await syncReviewsToMongo();
    console.log('Initial sync completed');
    
    console.log('Setting up real-time sync...');
    setupRealtimeSync();
    console.log('Real-time sync is now active');
};

module.exports = {
    initializeSync
}; 