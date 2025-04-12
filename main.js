const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { initializeSync } = require('./services/firebaseMongoSync');
const Customer = require('./models/Customer');
const connectDB = require('./config/db');

// Import API routes
const apiRoutes = require('./routes/api');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Initialize Express server
const server = express();
server.use(express.json());

// Enable CORS for all routes
server.use(cors());

// Set appropriate headers for all responses
server.use((req, res, next) => {
    // Always set content type to JSON for all /api routes to prevent HTML responses
    if (req.url.startsWith('/api')) {
        res.setHeader('Content-Type', 'application/json');
    }
    
    // Also track the original URL for error handling
    req.originalRequestUrl = req.url;
    
    // Add request timestamp for logging
    req.requestTimestamp = new Date();
    console.log(`${req.requestTimestamp.toISOString()} - ${req.method} ${req.url} - Request started`);
    
    next();
});

// Add JSON body parser with error handler
server.use(express.json({
    limit: '10mb',
    verify: (req, res, buf, encoding) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ 
                error: 'Invalid JSON in request body',
                message: e.message
            });
            throw new Error('Invalid JSON');
        }
    }
}));

// Use API routes
server.use('/api', apiRoutes);

// Enhanced 404 handler - must be AFTER routes but BEFORE other error handlers
server.use((req, res, next) => {
    console.error(`Route not found: ${req.method} ${req.url}`);
    
    // Force content type to JSON for API routes
    res.setHeader('Content-Type', 'application/json');
    
    res.status(404).json({ 
        message: 'Route not found',
        path: req.url,
        timestamp: new Date().toISOString()
    });
});

// Global error handling middleware - enhanced version
server.use((err, req, res, next) => {
    const responseTime = req.requestTimestamp ? (new Date() - req.requestTimestamp) : 'unknown';
    console.error(`API Error (${responseTime}ms): ${req.method} ${req.originalRequestUrl || req.url}`);
    console.error('Error details:', err);
    
    // Force content type to JSON, never HTML
    res.setHeader('Content-Type', 'application/json');
    
    // Clear any existing response to avoid sending mixed content
    if (res.headersSent) {
        console.warn('Headers already sent, cannot send error response');
        return next(err);
    }
    
    res.status(err.status || 500).json({
        message: 'Internal Server Error',
        error: err.message,
        path: req.originalRequestUrl || req.url,
        timestamp: new Date().toISOString()
    });
});

// Connect to MongoDB
connectDB()
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    // Load the index.html file
    mainWindow.loadFile('index.html');

    // Only open DevTools if explicitly requested
    if (process.argv.includes('--dev') || process.argv.includes('-d')) {
        mainWindow.webContents.openDevTools();
    }

    // Initialize Firebase-MongoDB sync
    initializeSync()
        .then(() => console.log('Firebase-MongoDB sync initialized'))
        .catch(error => console.error('Error initializing sync:', error));
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();
    
    // Make Express server accessible to renderer processes via IPC
    ipcMain.handle('api-call', async (event, options) => {
        try {
            console.log(`IPC API call: ${options.method} ${options.url}`);
            if (options.body) {
                console.log('Request body:', options.body);
            }
            
            // Add cache control headers to prevent caching
            const headers = {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                ...options.headers
            };
            
            // Forward the request to the Express server
            const response = await fetch(`http://localhost:3000${options.url}`, {
                method: options.method,
                headers: headers,
                body: options.body ? JSON.stringify(JSON.parse(options.body)) : undefined
            });
            
            // Check content type to ensure we're getting JSON
            const contentType = response.headers.get('content-type');
            
            // Parse response based on content type
            if (contentType && contentType.includes('application/json')) {
                try {
                    const result = await response.json();
                    console.log(`Response (${response.status}):`, result);
                    return {
                        ok: response.ok,
                        status: response.status,
                        data: result
                    };
                } catch (jsonError) {
                    console.error('Error parsing JSON response:', jsonError);
                    const text = await response.text();
                    console.error('Response text (invalid JSON):', text.substring(0, 500));
                    
                    return {
                        ok: false,
                        status: response.status,
                        error: 'Invalid JSON response from server',
                        data: null
                    };
                }
            } else {
                // Handle non-JSON response
                const text = await response.text();
                console.error('Non-JSON response received:', {
                    status: response.status,
                    statusText: response.statusText,
                    contentType,
                    bodyPreview: text.substring(0, 200)
                });
                
                // Try to convert HTML error into a JSON response
                return {
                    ok: false,
                    status: response.status,
                    error: 'Received non-JSON response from server',
                    errorDetail: text.includes('<title>') ? 
                        text.match(/<title>(.*?)<\/title>/)?.[1] || 'Unknown error' : 
                        'Server returned HTML instead of JSON',
                    data: []
                };
            }
        } catch (error) {
            console.error('IPC API call error:', error);
            return {
                ok: false,
                status: 500,
                error: error.message,
                data: null
            };
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// API endpoint to sync new users to MongoDB
server.post('/api/sync/user', async (req, res) => {
    try {
        const { firebaseUID, name, email, userType, createdAt } = req.body;
        
        // Create or update user in MongoDB
        const customer = await Customer.findOneAndUpdate(
            { firebaseUID },
            {
                firebaseUID,
                name,
                email,
                userType,
                createdAt: new Date(createdAt),
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        
        console.log('User synced to MongoDB:', customer);
        res.json({ success: true, customer });
    } catch (error) {
        console.error('Error syncing user to MongoDB:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start Express server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`);
});

// Handle login requests from renderer process
ipcMain.handle('login', async (event, { email, password, rememberMe }) => {
    try {
        const userCredential = await admin.auth().getUserByEmail(email);
        // Here you would typically verify the password and create a session
        // For now, we'll just return the user data
        return { success: true, user: userCredential };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}); 