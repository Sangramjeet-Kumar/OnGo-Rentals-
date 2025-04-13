const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userName: {
        type: String,
        default: 'Anonymous User'
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    vehicleName: {
        type: String,
        required: false
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: false
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: false
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comments: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    response: {
        comment: String,
        date: Date
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
reviewSchema.index({ userId: 1 });
reviewSchema.index({ vehicleId: 1 });
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ agentId: 1 });

module.exports = mongoose.model('Review', reviewSchema); 