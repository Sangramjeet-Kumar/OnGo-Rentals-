const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        required: true
    },
    firebaseId: {
        type: String,
        index: true
    },
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        lowercase: true, // Convert to lowercase before saving
        validate: {
            validator: function(v) {
                const validTypes = ['sedan', 'suv', 'hatchback', 'luxury', 'van', 'electric', 'standard', 'cruiser', 'sports', 'scooter', 'other'];
                console.log(`Validating vehicle type: '${v}' (${typeof v}) against allowed types:`, validTypes);
                return validTypes.includes(v.toLowerCase());
            },
            message: props => `'${props.value}' is not a valid vehicle type`
        }
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    images: [{
        type: String
    }],
    features: [{
        type: String
    }],
    pricing: {
        baseRate: {
            type: Number,
            required: true
        },
        hourlyRate: Number,
        dailyRate: Number,
        weeklyRate: Number,
        monthlyRate: Number,
        deposit: Number
    },
    availability: {
        isAvailable: {
            type: Boolean,
            default: true
        },
        unavailableDates: [{
            startDate: Date,
            endDate: Date,
            reason: String
        }]
    },
    specifications: {
        seats: Number,
        fuelType: String,
        transmission: String,
        mileage: Number,
        fuelEfficiency: String,
        insurance: {
            provider: String,
            policyNumber: String,
            expiryDate: Date
        }
    },
    location: {
        address: String,
        city: String,
        state: String,
        zipCode: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'inactive', 'booked'],
        default: 'active'
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
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

module.exports = mongoose.model('Vehicle', vehicleSchema); 