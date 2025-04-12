const { MongoClient } = require('mongodb');

/**
 * This script directly updates expired rentals in MongoDB,
 * with a special focus on the 'Bullet 499' vehicle.
 * 
 * It performs these tasks:
 * 1. Finds all rentals that have return dates in the past but are still marked as 'active'
 * 2. Updates those rentals to 'completed' status
 * 3. Updates the corresponding vehicles to 'active' (available) status
 * 4. Special handling for 'Bullet 499' to ensure it's updated regardless
 */
async function fixExpiredRentals() {
    let client;
    try {
        console.log('Connecting to MongoDB...');
        client = await MongoClient.connect('mongodb://localhost:27017');
        const db = client.db('ongo');
        
        const currentDate = new Date('2025-04-12T00:00:00Z'); // Use the current real date
        console.log('Current date for comparison:', currentDate.toISOString());
        
        // First check specifically for Bullet 499
        console.log('\n--- SPECIAL CHECK FOR BULLET 499 ---');
        const bullet499 = await db.collection('vehicles').findOne({ name: 'Bullet 499' });
        
        if (bullet499) {
            console.log('Found Bullet 499:', bullet499);
            
            // Find any rentals for Bullet 499
            const bullet499Rentals = await db.collection('rentals').find({
                vehicleId: bullet499._id.toString(),
                status: { $in: ['active', 'confirmed'] }
            }).toArray();
            
            console.log(`Found ${bullet499Rentals.length} active rentals for Bullet 499`);
            
            let shouldUpdateBullet499 = true;
            
            // Check if any rentals are still active (not expired)
            for (const rental of bullet499Rentals) {
                const returnDate = new Date(rental.returnDate);
                console.log(`Return date: ${returnDate.toISOString()}`);
                
                if (returnDate > currentDate) {
                    console.log(`Rental ${rental._id} is still active until ${returnDate.toISOString()}`);
                    shouldUpdateBullet499 = false;
                } else {
                    console.log(`Rental ${rental._id} has expired on ${returnDate.toISOString()}`);
                    
                    // Update this rental to completed
                    await db.collection('rentals').updateOne(
                        { _id: rental._id },
                        { $set: { status: 'completed', updatedAt: new Date() } }
                    );
                    console.log(`Updated rental ${rental._id} to completed status`);
                }
            }
            
            // Update Bullet 499 status if all rentals have expired
            if (shouldUpdateBullet499 || bullet499Rentals.length === 0) {
                await db.collection('vehicles').updateOne(
                    { _id: bullet499._id },
                    { $set: { status: 'active', updatedAt: new Date() } }
                );
                console.log('Updated Bullet 499 status to available');
            }
        } else {
            console.log('Bullet 499 not found in database');
        }
        
        // Now check all expired rentals
        console.log('\n--- CHECKING ALL EXPIRED RENTALS ---');
        const expiredRentals = await db.collection('rentals').find({
            returnDate: { $lt: currentDate },
            status: { $in: ['active', 'confirmed'] }
        }).toArray();
        
        console.log(`Found ${expiredRentals.length} expired rentals to update`);
        
        for (const rental of expiredRentals) {
            console.log(`Updating rental ${rental._id} for vehicle ${rental.vehicleName || rental.vehicleId} to completed status`);
            
            // Update rental status
            await db.collection('rentals').updateOne(
                { _id: rental._id },
                { $set: { status: 'completed', updatedAt: new Date() } }
            );
            
            // Update vehicle status if vehicle ID is available
            if (rental.vehicleId) {
                await db.collection('vehicles').updateOne(
                    { _id: rental.vehicleId },
                    { $set: { status: 'active', updatedAt: new Date() } }
                );
                console.log(`Updated vehicle ${rental.vehicleId} status to available`);
            } else {
                console.log(`No vehicle ID found for rental ${rental._id}, looking up by name: ${rental.vehicleName}`);
                
                if (rental.vehicleName) {
                    const vehicle = await db.collection('vehicles').findOne({ name: rental.vehicleName });
                    if (vehicle) {
                        await db.collection('vehicles').updateOne(
                            { _id: vehicle._id },
                            { $set: { status: 'active', updatedAt: new Date() } }
                        );
                        console.log(`Updated vehicle ${rental.vehicleName} (${vehicle._id}) status to available`);
                    } else {
                        console.log(`Vehicle ${rental.vehicleName} not found in database`);
                    }
                }
            }
        }
        
        console.log('\nExpired rental update completed successfully');
    } catch (error) {
        console.error('Error fixing expired rentals:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    }
}

// Run the script
fixExpiredRentals().catch(console.error); 