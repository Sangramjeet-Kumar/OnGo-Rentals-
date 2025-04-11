const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function checkFirebaseData() {
    try {
        // Check customers collection
        const customersSnapshot = await admin.firestore()
            .collection('customers')
            .get();
        
        console.log('Customers in Firebase:');
        customersSnapshot.forEach(doc => {
            console.log(`ID: ${doc.id}, Data:`, doc.data());
        });

        // Check users collection (in case customers are stored there)
        const usersSnapshot = await admin.firestore()
            .collection('users')
            .get();
        
        console.log('\nUsers in Firebase:');
        usersSnapshot.forEach(doc => {
            console.log(`ID: ${doc.id}, Data:`, doc.data());
        });

        // Check auth users
        const authUsers = await admin.auth().listUsers();
        console.log('\nAuth Users:');
        authUsers.users.forEach(user => {
            console.log(`UID: ${user.uid}, Email: ${user.email}`);
        });

    } catch (error) {
        console.error('Error checking Firebase data:', error);
    }
}

checkFirebaseData(); 