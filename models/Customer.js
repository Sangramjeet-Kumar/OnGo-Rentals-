const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
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
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    drivingLicense: {
        number: String,
        expiryDate: Date
    },
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, {
    timestamps: true
});

// Pre-save middleware to ensure firebaseUID is not null
customerSchema.pre('save', function(next) {
    if (!this.firebaseUID) {
        next(new Error('Firebase UID is required'));
    }
    next();
});

module.exports = mongoose.model('Customer', customerSchema); 