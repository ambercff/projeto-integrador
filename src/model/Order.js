const mongoose = require("mongoose");

const addressSchema = mongoose.Schema({
    cidade: String,
    rua: String,
    bairro: String,
    numero: Number,
    cep: Number,
    complemento: String
});

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
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
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;