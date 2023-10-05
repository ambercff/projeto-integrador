
let session = require('express-session')

let users = [];
const path = require('path');
const mongoose = require("mongoose");
const bodyParser = require('body-parser'); //ler o body

const express = require('express');
const app = express();



app.set("view engine", "ejs")

app.use(express.static(path.resolve('public')));
app.use(bodyParser.urlencoded({extended: true})) //usando o decodificador para entender o que vem do body
app.use(session({
    secret: "di3j29idmnadp2-dça2dlkf",
    resave: false,
    saveUninitialized: false
}));


const router = require('./routes');
app.use(router);

mongoose.connect("mongodb+srv://ambercf13:eimGHh3CZ05UsiYF@teste.yzewypv.mongodb.net/projeto_integrador?retryWrites=true&w=majority").then(() => {
    app.listen(3131, () => {
        console.log("corinthians")
    })
})


