//conexao com o banco
const mongoose = require('mongoose');

//esquema do produto
const productSchema = mongoose.Schema ({
    name: String,
    price: Number,
    image: String,
    brand: String,
    categoria: String
})

//enviando ao banco o esquema
const Product = mongoose.model('Product', productSchema)

//exportando o objeto "Product"
module.exports = Product; 