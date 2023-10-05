const express = require('express');
const router = express.Router();
let User = require('./model/User.js');
let Product = require('./model/Product.js');
const axios = require('axios');

router.get('/', async(req, res) => {
    const user = await req.session.user
    const products = await Product.find();
    res.render("index", {user, products})
});

router.get('/login', (req, res) => {
    res.render("login")
})

router.get('/products', async(req,res) => {
    const user = await req.session.user
    const products = await Product.find();
    res.render("products", {user, products})
})

router.get('/cadastro', (req, res) => {
    res.render("cadastro")
})
router.get('/product/:productId', async (req, res) => {
    const user = req.session.user;
    const productId = req.params.productId;

    try {
        const product = await Product.findById(productId);
        const products = await Product.find();

        if (!product) {
            return res.status(404).render('produto_nao_encontrado', { user });
        }

        let freteData = null;
        if (req.query.cep) {
            const cepDestino = req.query.cep;
            const response = await axios.get(`https://www.cepcerto.com/ws/json-frete/13186642/${cepDestino}/200/50/30/20`);
            freteData = response.data;
        }

        res.render('product', { user, product, products, frete: freteData });
    } catch (error) {
        console.error('Erro ao buscar detalhes do produto:', error);
        res.status(500).render('erro', { user });
    }
});



router.get('/ferramentas_medicao', async(req, res) => {
    const user = await req.session.user
    const products = await Product.find();
    res.render("ferramentas_medicao", {user, products});
})
router.get('/ferramentas_eletricas', async(req, res) => {
    const user = await req.session.user
    const products = await Product.find();
    res.render("ferramentas_eletricas", {user, products});
})

router.get('/fale-conosco', (req, res) => {
    res.render("fale_conosco")
})

router.post('/cadastro', async(req, res) => {
    const {email, senha, nome, confSenha} = req.body;

    if (senha != confSenha) {
        res.render('cadastro.ejs');
    } else {
        const user = new User({email, senha, nome});
        try{
            await user.save();
            res.redirect("login")
        }  catch (erro) {
            console.log("Algo deu errado!")
        }
    }

});

router.post('/login', async(req, res) => {

    const {email, senha} = req.body; //as chaves procuram por atributos com os nomes email e senha

    const user = await User.findOne({email, senha});

    if(!user) {
        return;
    }

    req.session.user = user;
    res.redirect("/")

    console.log(req.session.user.id)

});

router.post('/logout', async(req,res) => {
    req.session.destroy((err) => {
        if (err) {
          console.error('Erro ao encerrar a sessão:', err);
        }
        res.redirect('/');
      });
      

})

router.get('/cart', async(req, res) => {

    if (!req.session.user) {
        res.redirect('/login');
        return;
    } else {

        const user_session = req.session.user._id;

        let user = await User.findById(user_session).populate('cart.compras.product');
    
        res.render("cart", {user});
    }

});

router.post('/cart/add', async(req, res) => {
    const user_session = req.session.user._id;
    if (!req.session.user) {
        res.redirect('/login');
        return;
    }

    
    const {product} = req.body;
    const user = await User.findById(user_session);
    user.cart.compras.push({product: product});

    try {
        await user.save();
        res.redirect('/');
    } catch (err) {
        console.log(err)
    }
});

router.post('/cart/remove', async (req, res) => {
    const user_session = req.session.user._id;

    if (!user_session) {
        res.redirect('/login');
        return;
    }

    const { productId } = req.body;
    console.log(productId)

    try {
        const user = await User.findByIdAndUpdate(
            user_session,
            {
                $pull: { 'cart.compras': { _id: productId } }
            },
            { new: true }
        );

        if (!user) {
            console.log('Usuário não encontrado');
            res.redirect('/login'); 
            return;
        }

        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Erro ao remover o produto do carrinho.' });
    }
});

router.get('/search', async (req, res) => {
    const user = await req.session.user;
    try {
        const searchTerm = req.query.q; 
        const regex = new RegExp(searchTerm, 'i');

        const results = await Product.find({ name: regex});

        res.render('search-results', { results, searchTerm, user });
    } catch (error) {
        console.error('Erro na pesquisa:', error);
        res.status(500).send('Erro na pesquisa');
    }
});

// Dentro do seu arquivo de rotas (router.js ou similar)

router.get('/search/suggestions', async (req, res) => {
    const searchTerm = req.query.q; // Obtém o termo de pesquisa da query string
    try {
        // Realize uma pesquisa no banco de dados usando Mongoose
        const results = await Product.find({ name: { $regex: new RegExp(searchTerm, 'i') }})
            .limit(5) // Limite o número de sugestões retornadas
            .select('name'); // Selecione apenas o campo 'nome' dos produtos

        const suggestions = results.map((result) => result.name);

        res.json(suggestions);
    } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        res.status(500).json({ error: 'Erro ao buscar sugestões' });
    }
});

module.exports = router;