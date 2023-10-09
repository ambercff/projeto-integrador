const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: String, 
    nome: String,
    senha: String,
    cart: {
        compras: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref:'Product'
                },
                quantity: Number,
                boughtAt: {
                    type: Date,
                    default: Date.now
                },
                isCompleted: {
                    type: Boolean,
                    default: false
                }
            }
        ]
    }
});

const User = mongoose.model('User', userSchema)

module.exports = User; 