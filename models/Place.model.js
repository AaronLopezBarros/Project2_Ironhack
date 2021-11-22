const { Schema, model } = require('mongoose')

const placeSchema = new Schema(
    {
        name: { type: String },
        destinationType: { type: String },
        population: { type: Number },
        averageRating: { type: Number },
        alternateNames: [{ type: String }],
        photo: { type: String },
        users: { type: [Schema.Types.ObjectId], ref: 'User'},
        status: { type: String, enum: ['toVisit', 'alreadyVisited'] },
        cityId: { type: String, unique: true }
    },
    { timestamps: true }
)

const Place = model('Place', placeSchema)

module.exports = Place