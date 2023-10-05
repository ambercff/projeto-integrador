const mongoose = require('mongoose');

const productSchema = mongoose.Schema ({
    name: String,
    price: Number,
    image: String,
    brand: String,
    categoria: String
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product; 