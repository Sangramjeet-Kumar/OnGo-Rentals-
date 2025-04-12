const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

/**
 * This script addresses Firebase/Firestore synchronization issues 
 * for expired rentals, especially for 'Bullet 499'.
 * 
 * It performs these tasks:
 * 1. Finds all rentals in Firestore that have return dates in the past but are still marked as 'active'
 * 2. Updates those rentals to 'completed' status
 * 3. Updates the corresponding vehicles to 'active' (available) status
 * 4. Special handling for 'Bullet 499' to ensure it's updated correctly
 */
async function fixFirestoreRentals() {
    try {
        // Initialize Firebase Admin SDK
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        const db = admin.firestore();
        const currentDate = new Date('2025-04-12T00:00:00Z'); // Use the current real date
        console.log('Current date for comparison:', currentDate.toISOString());
        
        // First check specifically for Bullet 499
        console.log('\n--- SPECIAL CHECK FOR BULLET 499 IN FIRESTORE ---');
        const bullet499Snap = await db.collection('vehicles')
            .where('name', '==', 'Bullet 499')
            .limit(1)
            .get();
        
        if (!bullet499Snap.empty) {
            const bullet499Doc = bullet499Snap.docs[0];
            const bullet499 = bullet499Doc.data();
            const bullet499Id = bullet499Doc.id;
            
            console.log('Found Bullet 499 in Firestore:', bullet499);
            
            // Find any active rentals for Bullet 499
            const bullet499Rentals = await db.collection('rentals')
                .where('vehicleId', '==', bullet499Id)
                .where('status', 'in', ['active', 'confirmed'])
                .get();
            
            console.log(`Found ${bullet499Rentals.size} active rentals for Bullet 499`);
            
            let shouldUpdateBullet499 = true;
            
            // Check if any rentals are still active (not expired)
            for (const rentalDoc of bullet499Rentals.docs) {
                const rental = rentalDoc.data();
                const returnDate = rental.returnDate.toDate();
                console.log(`Return date: ${returnDate.toISOString()}`);
                
                if (returnDate > currentDate) {
                    console.log(`Rental ${rentalDoc.id} is still active until ${returnDate.toISOString()}`);
                    shouldUpdateBullet499 = false;
                } else {
                    console.log(`Rental ${rentalDoc.id} has expired on ${returnDate.toISOString()}`);
                    
                    // Update this rental to completed
                    await rentalDoc.ref.update({
                        status: 'completed',
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    console.log(`Updated rental ${rentalDoc.id} to completed status`);
                }
            }
            
            // If vehicle still shows as rented/booked but all rentals are complete
            if ((bullet499.status === 'rented' || bullet499.status === 'booked') &&
                (shouldUpdateBullet499 || bullet499Rentals.size === 0)) {
                
                // Update vehicle status directly
                await bullet499Doc.ref.update({
                    status: 'active',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log('Updated Bullet 499 status to available in Firestore');
            } else {
                console.log('Bullet 499 already available or has active rentals');
            }
        } else {
            console.log('Bullet 499 not found in Firestore');
            
            // Try with different query patterns as fallback
            console.log('Trying alternative searches...');
            
            // Try with type field
            const bullet499ByTypeSnap = await db.collection('vehicles')
                .where('type', '==', 'Bullet 499')
                .limit(1)
                .get();
            
            if (!bullet499ByTypeSnap.empty) {
                const bullet499Doc = bullet499ByTypeSnap.docs[0];
                console.log('Found Bullet 499 by type:', bullet499Doc.data());
                
                if (bullet499Doc.data().status === 'rented' || bullet499Doc.data().status === 'booked') {
                    await bullet499Doc.ref.update({
                        status: 'active',
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('Updated Bullet 499 status to available');
                }
            }
        }
        
        // Now check all expired rentals in Firestore
        console.log('\n--- CHECKING ALL EXPIRED RENTALS IN FIRESTORE ---');
        
        // Get all active/confirmed rentals
        const rentalsSnap = await db.collection('rentals')
            .where('status', 'in', ['active', 'confirmed'])
            .get();
        
        console.log(`Found ${rentalsSnap.size} active/confirmed rentals in Firestore`);
        
        let expiredCount = 0;
        
        // Check each rental's return date
        for (const rentalDoc of rentalsSnap.docs) {
            const rental = rentalDoc.data();
            
            // Skip if no return date
            if (!rental.returnDate) {
                console.log(`Rental ${rentalDoc.id} has no return date, skipping`);
                continue;
            }
            
            // Convert to date
            const returnDate = rental.returnDate.toDate();
            
            // If return date is in the past, update status
            if (returnDate < currentDate) {
                console.log(`Rental ${rentalDoc.id} for vehicle ${rental.vehicleName || rental.vehicleId} has expired on ${returnDate.toISOString()}`);
                expiredCount++;
                
                // Update rental status
                await rentalDoc.ref.update({
                    status: 'completed',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                
                // Update vehicle status if vehicle ID is available
                if (rental.vehicleId) {
                    try {
                        // Get vehicle by ID
                        const vehicleDoc = await db.collection('vehicles').doc(rental.vehicleId).get();
                        
                        if (vehicleDoc.exists) {
                            await vehicleDoc.ref.update({
                                status: 'active',
                                updatedAt: admin.firestore.FieldValue.serverTimestamp()
                            });
                            console.log(`Updated vehicle ${rental.vehicleId} status to available`);
                        } else {
                            console.log(`Vehicle with ID ${rental.vehicleId} not found in Firestore`);
                        }
                    } catch (error) {
                        console.error(`Error updating vehicle ${rental.vehicleId}:`, error);
                    }
                } else if (rental.vehicleName) {
                    // Try to find by name if ID is not available
                    try {
                        const vehicleQuery = await db.collection('vehicles')
                            .where('name', '==', rental.vehicleName)
                            .limit(1)
                            .get();
                        
                        if (!vehicleQuery.empty) {
                            await vehicleQuery.docs[0].ref.update({
                                status: 'active',
                                updatedAt: admin.firestore.FieldValue.serverTimestamp()
                            });
                            console.log(`Updated vehicle ${rental.vehicleName} status to available`);
                        } else {
                            console.log(`Vehicle with name ${rental.vehicleName} not found in Firestore`);
                        }
                    } catch (error) {
                        console.error(`Error updating vehicle ${rental.vehicleName}:`, error);
                    }
                }
            }
        }
        
        console.log(`\nUpdated ${expiredCount} expired rentals in Firestore`);
        console.log('Firestore update completed successfully');
    } catch (error) {
        console.error('Error fixing Firestore rentals:', error);
    }
}

// Run the script
fixFirestoreRentals().catch(console.error); 