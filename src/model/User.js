const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
    cidade: String,
    rua: String,
    bairro: String,
    numero: Number,
    cep: Number,
    complemento: String
});

const userSchema = mongoose.Schema({
    email: String, 
    nome: String,
    senha: String,
    cart: {
        compras: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product'
                },
                quantity: Number,
                boughtAt: {
                    type: Date,
                    default: Date.now
                },
                endereco: addressSchema
            }
        ]
    }
});

const User = mongoose.model('User', userSchema)

module.exports = User; 