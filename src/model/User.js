//conexao com o banco
const mongoose = require("mongoose");

//esquema do endereco
const addressSchema = mongoose.Schema({
    cidade: String,
    rua: String,
    bairro: String,
    numero: Number,
    cep: Number,
    complemento: String
});

//esquema do usuario
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

//enviando ao banco o esquema
const User = mongoose.model('User', userSchema)

//exportando o objeto "User"
module.exports = User; 