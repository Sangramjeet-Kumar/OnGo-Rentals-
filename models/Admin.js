const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    firebaseUID: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin', 'moderator'],
        default: 'admin'
    },
    permissions: [{
        type: String,
        enum: ['manage_users', 'manage_agents', 'manage_vehicles', 'manage_bookings', 'manage_reviews']
    }]
}, {
    timestamps: true
});

// Pre-save middleware to ensure firebaseUID is not null
adminSchema.pre('save', function(next) {
    if (!this.firebaseUID) {
        next(new Error('Firebase UID is required'));
    }
    next();
});

module.exports = mongoose.model('Admin', adminSchema); 