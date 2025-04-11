const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userName: {
        type: String
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    vehicleName: {
        type: String
    },
    vehicleType: {
        type: String
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: true
    },
    pickupDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    days: {
        type: Number
    },
    dailyRate: {
        type: Number
    },
    totalAmount: {
        type: Number
    },
    pickupLocation: {
        type: String
    },
    returnLocation: {
        type: String
    },
    pickupLocationDetails: {
        address: String,
        city: String,
        state: String,
        zipCode: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    dropoffLocationDetails: {
        address: String,
        city: String,
        state: String,
        zipCode: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    pricing: {
        baseRate: Number,
        additionalCharges: [{
            description: String,
            amount: Number
        }],
        totalAmount: Number
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDetails: {
        transactionId: String,
        paymentMethod: String,
        paymentDate: Date
    },
    hasReview: {
        type: Boolean,
        default: false
    },
    firebaseId: {
        type: String,
        index: true
    },
    synced: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
bookingSchema.index({ vehicleId: 1 });
bookingSchema.index({ agentId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema); 