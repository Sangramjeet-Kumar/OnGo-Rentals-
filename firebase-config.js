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
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Set persistence based on "Remember me" checkbox
async function setPersistence(rememberMe) {
  const persistence = rememberMe 
    ? firebase.auth.Auth.Persistence.LOCAL 
    : firebase.auth.Auth.Persistence.SESSION;
  
  return auth.setPersistence(persistence);
}

// Create a new user
async function createUser(email, password, name) {
  try {
    // Create the user in Firebase Auth
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    
    // Add user data to Firestore
    await db.collection('users').doc(userCredential.user.uid).set({
      name: name,
      email: email,
      userType: 'customer',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return userCredential;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Sign in existing user
async function signInUser(email, password, rememberMe) {
  try {
    await setPersistence(rememberMe);
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
    if (!userDoc.exists) {
      throw new Error('User data not found');
    }
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Sign out user
async function signOutUser() {
  try {
    await auth.signOut();
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

// Check if user is logged in
function getCurrentUser() {
  return auth.currentUser;
}

// Listen for auth state changes
function onAuthStateChanged(callback) {
  return auth.onAuthStateChanged(callback);
} 