const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
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
    businessName: {
        type: String,
        required: true
    },
    businessAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    businessLicense: {
        number: String,
        expiryDate: Date
    },
    documents: [{
        type: {
            type: String,
            enum: ['license', 'insurance', 'registration', 'other']
        },
        url: String,
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        }
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    vehicles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    }]
}, {
    timestamps: true
});

// Pre-save middleware to ensure firebaseUID is not null
agentSchema.pre('save', function(next) {
    if (!this.firebaseUID) {
        next(new Error('Firebase UID is required'));
    }
    next();
});

module.exports = mongoose.model('Agent', agentSchema); 