// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfVlB7Xsl29Ll75fCG8RLdZSH7F_9oMnE",
  authDomain: "ongo-98144.firebaseapp.com",
  projectId: "ongo-98144",
  storageBucket: "ongo-98144.firebasestorage.app",
  messagingSenderId: "180485044749",
  appId: "1:180485044749:web:64bda47e98f28e4cd8f344",
  measurementId: "G-NVRCCKPER9"
};

// Initialize Firebase
if (!firebase.apps.length) {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
}

// Initialize Firebase Authentication and Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Sign in existing user
async function signInUser(email, password, rememberMe) {
    try {
        // Sign in with email and password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('User signed in successfully:', userCredential.user.email);
        
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
        if (!userDoc.exists) {
            throw new Error('User data not found in Firestore');
        }
        
        const userData = userDoc.data();
        console.log('Retrieved user data:', userData); // Debug log
        
        let userInfo = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            userType: userData.userType
        };
        
        // If user is an agent, get agent data
        if (userData.userType === 'agent') {
            try {
                const agentDoc = await db.collection('agents').doc(userCredential.user.uid).get();
                if (agentDoc.exists) {
                    const agentData = agentDoc.data();
                    userInfo.name = agentData.name;
                    console.log('Retrieved agent data:', agentData);
                } else {
                    console.warn('Agent document not found');
                    userInfo.name = userData.name || email.split('@')[0];
                }
            } catch (error) {
                console.error('Error fetching agent data:', error);
                userInfo.name = userData.name || email.split('@')[0];
            }
        } else {
            // For non-agent users
            userInfo.name = userData.name || email.split('@')[0];
        }
        
        console.log('Final user info:', userInfo); // Debug log
        
        // Store in localStorage if rememberMe is true
        if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(userInfo));
        }
        
        // Always store in sessionStorage
        sessionStorage.setItem('user', JSON.stringify(userInfo));
        
        return { userCredential, userData: userInfo };
    } catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
}

// Create a new user
async function createUser(email, password, name) {
    try {
        // Create the user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Add user data to Firestore
        const userData = {
            name: name,
            email: email,
            userType: 'customer',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(userCredential.user.uid).set(userData);
        
        // Trigger MongoDB sync by calling the sync service
        try {
            const response = await fetch('/api/sync/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firebaseUID: userCredential.user.uid,
                    ...userData
                })
            });
            
            if (!response.ok) {
                console.error('Failed to sync user to MongoDB:', await response.text());
            }
        } catch (syncError) {
            console.error('Error syncing to MongoDB:', syncError);
            // Don't throw here as the user is already created in Firebase
        }
        
        return userCredential;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// Sign out user
async function signOutUser() {
    try {
        await auth.signOut();
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}

// Send password reset email
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
    } catch (error) {
        console.error('Error sending reset email:', error);
        throw error;
    }
}

// Get stored user data
function getStoredUserData() {
    const sessionUser = sessionStorage.getItem('user');
    const localUser = localStorage.getItem('user');
    return sessionUser ? JSON.parse(sessionUser) : localUser ? JSON.parse(localUser) : null;
}

// Check if user is logged in
function getCurrentUser() {
    return auth.currentUser;
}

// Listen for auth state changes
function onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
} 