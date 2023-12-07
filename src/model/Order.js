//conexao com o banco

const mongoose = require("mongoose");

//esquema do endereco
const addressSchema = mongoose.Schema({
    cidade: String,
    rua: String,
    bairro: String,
    numero: Number,
    cep: Number,
    complemento: String,
    estado: String
});

//esquema de cada pedido
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

//enviando ao banco o esquema
const Order = mongoose.model('Order', orderSchema);

//exportando o objeto "Order"
module.exports = Order;