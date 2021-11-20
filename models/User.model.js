const { Schema, model } = require('mongoose')

const userSchema        = new Schema(
    {
        username: { type: String,},
        password: { type: String },
        email: {
            type: String,
            lowrcase: true,
            required: [true, "Can't be blank"],
            match: [/\S+@\S+\.\S+/, "Email not valid"]
        },
    },
    { timestamps: true }
)

const User = model('User', userSchema)

module.exports = User