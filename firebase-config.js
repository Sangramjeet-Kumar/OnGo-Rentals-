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

// Check user role and redirect if needed
async function checkUserRole() {
  console.log('Checking user role...');
  
  // Prevent redirect loops with a timestamp-based check
  const lastRedirectTime = parseInt(sessionStorage.getItem('lastRedirectTime') || '0');
  const currentTime = Date.now();
  
  // If we've redirected within the last 3 seconds, don't redirect again
  if (currentTime - lastRedirectTime < 3000) {
    console.log('Recently redirected, skipping checkUserRole');
    return null;
  }
  
  const user = auth.currentUser;
  
  if (!user) {
    console.log('No user logged in during checkUserRole');
    
    // Only redirect if not already on the index page to prevent loops
    const onIndexPage = window.location.pathname.includes('index.html') || 
                      window.location.pathname.endsWith('/') ||
                      window.location.pathname === '';
    
    if (!onIndexPage) {
      console.log('No user logged in, redirecting to login page...');
      sessionStorage.setItem('lastRedirectTime', currentTime.toString());
      sessionStorage.setItem('redirectReason', 'not_logged_in');
      window.location.replace('index.html');
    }
    return null;
  }
  
  try {
    console.log('User is logged in, checking role in Firestore...');
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      console.error('User document does not exist');
      // If user document doesn't exist, log out and redirect
      await signOutUser();
      sessionStorage.setItem('lastRedirectTime', currentTime.toString());
      sessionStorage.setItem('redirectReason', 'no_user_doc');
      window.location.replace('index.html');
      return null;
    }
    
    const userData = userDoc.data();
    console.log('User role found:', userData.userType);
    
    // Get current page
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    console.log('Current page:', currentPage);
    
    // Agent check - if agent is on customer dashboard, redirect
    if (userData.userType === 'agent' && currentPage === 'dashboard.html') {
      console.log('Agent on customer dashboard, redirecting to agent dashboard');
      sessionStorage.setItem('lastRedirectTime', currentTime.toString());
      sessionStorage.setItem('redirectReason', 'agent_to_agent_dashboard');
      window.location.replace('agent-dashboard.html');
      return null;
    }
    
    // Customer check - if customer is on agent dashboard, redirect
    if (userData.userType !== 'agent' && currentPage === 'agent-dashboard.html') {
      console.log('Customer on agent dashboard, redirecting to customer dashboard');
      sessionStorage.setItem('lastRedirectTime', currentTime.toString());
      sessionStorage.setItem('redirectReason', 'customer_to_dashboard');
      window.location.replace('dashboard.html');
      return null;
    }
    
    return userData;
  } catch (error) {
    console.error('Error checking user role:', error);
    return null;
  }
} 