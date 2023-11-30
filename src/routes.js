//importando as informações necessárias.

const express = require('express');
const router = express.Router();
let User = require('./model/User.js');
let Product = require('./model/Product.js');
let Order = require('./model/Order.js');

//rota para página "index"
router.get('/', async(req, res) => {
    const user = await req.session.user
    const products = await Product.find();
    res.render("index", {user, products})
});

//rota para a página login
router.get('/login', (req, res) => {
    res.render("login")
})

//rota para a categoria "jaquetas"
router.get('/jaquetas', async(req, res) => {
    const user = await req.session.user
    const products = await Product.find();
    res.render("jaquetas", {user, products});
})

//rota para a página de "endereço"
router.post('/endereco', async(req, res) => {
    const user = await req.session.user
    const {quantity} = req.body
    const products = await Product.find();
    res.render("endereco", {user, products, quantity})
});

//rota para a página "admin"
router.get('/admin', async (req, res) => {
    const user = await req.session.user;

    if (!user || user.email !== 'admin@gmail.com') {
        res.redirect('/login');
        return;
    }

    const cart = req.session.cart || { compras: [] };

    res.render('admin', { user, cart });
});


//rota que fornece os dados dos pedidos em formato json para a página "admin"
router.get('/admin/orders', async (req, res) => {
    try {
        const allOrders = await Order.find().populate({
            path: 'compras.product',
            model: 'Product'
        }).populate('user', 'nome');

        res.json({ orders: allOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao carregar dados do admin.' });
    }
});


//rota para carregar todos os produtos
router.get('/products', async(req,res) => {
    const user = await req.session.user
    const products = await Product.find();
    res.render("products", {user, products})
})


//rota para a página de cadastro
router.get('/cadastro', (req, res) => {
    res.render("cadastro")
})

//rota para a página individual do produto, localizando-o através do id
router.get('/product/:productId', async (req, res) => {
    const user = req.session.user;
    const productId = req.params.productId;


    try {
        const product = await Product.findById(productId);
        const products = await Product.find();

        if (!product) {
            return res.status(404).render('produto_nao_encontrado', { user });
        }


        res.render('product', { user, product, products });
    } catch (error) {
        console.error('Erro ao buscar detalhes do produto:', error);
        res.status(500).render('erro', { user });
    }
});

//rota para a página fale conosco

router.get('/fale-conosco', (req, res) => {
    res.render("fale_conosco")
})

//rota para realizar o cadastro do usuário
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

//rota para realizar o login do usuário
router.post('/login', async(req, res) => {

    const {email, senha} = req.body; //as chaves procuram por atributos com os nomes email e senha

    console.log(email, senha)

    try {
        const user = await User.findOne({email, senha});

        if (email === 'admin@gmail.com' && senha === 'admin123') {
            req.session.user = user;
            res.redirect('/admin')
            return; 
        }

        if(!user) {
            return;
        }
    
        req.session.user = user;
        res.redirect("/")
    } catch (erro) {
        console.log("Algo deu errado")
    }

});

//rota para deslogar o usuário da sessão
router.post('/logout', async(req,res) => {
    req.session.destroy((err) => {
        if (err) {
          console.error('Erro ao encerrar a sessão:', err);
        }
        res.redirect('/');
      });
      

})

//rota para carregar o carrinho e os respectivos produtos do usuário
router.get('/cart', async(req, res) => {

    if (!req.session.user) {
        res.redirect('/login');
        return;
    } else {

        const user_session = req.session.user._id;

        let user = await User.findById(user_session).populate('cart.compras.product');

        res.render("cart", { user});
    }

});

//rota que adiciona cada produto ao carrinho do usuário
router.post('/cart/add', async (req, res) => {
    const user_session = req.session.user._id;

    if (!req.session.user) {
        res.redirect('/login');
        return;
    }

    const { product, quantity } = req.body;

    const user = await User.findById(user_session);

    // Verificar se o produto já está no carrinho
    const existingProduct = user.cart.compras.find(c => c.product.equals(product));

    if (existingProduct) {
        // Se o produto já estiver no carrinho, atualize a quantidade
        existingProduct.quantity += parseInt(quantity, 10);
    } else {
        // Se o produto não estiver no carrinho, adicione-o
        user.cart.compras.push({ product, quantity: parseInt(quantity, 10) });
    }

    try {
        await user.save();
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});


//rota para remover o produto do carrinho
router.post('/cart/remove', async (req, res) => {
    const user_session = req.session.user._id;

    if (!user_session) {
        res.redirect('/login');
        return;
    }

    const { productId } = req.body;
    console.log(productId);

    try {
        const user = await User.findById(user_session);

        if (!user) {
            console.log('Usuário não encontrado');
            res.redirect('/login');
            return;
        }

        const compra = user.cart.compras.find((c) => c._id.equals(productId));

        if (!compra) {
            console.log('Produto não encontrado no carrinho');
            res.redirect('/cart');
            return;
        }

        // If the quantity is greater than 1, decrease the quantity by 1
        // If the quantity is 1, remove the entire item from the cart
        if (compra.quantity > 1) {
            compra.quantity -= 1;
        } else {
            user.cart.compras.pull({ _id: productId });
        }

        await user.save();

        res.redirect('/cart');
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Erro ao remover o produto do carrinho.' });
    }
});


//rota para finalizar a compra do usuário
router.post('/cart/finish', async (req, res) => {
    const user_session = req.session.user._id;

    try {
        const user = await User.findOne({ _id: user_session, "cart.compras": { $exists: true, $not: { $size: 0 } } });

        if (!user) {
            return res.status(404).send("Usuário não encontrado ou carrinho vazio.");
        }
        
        const {cidade, rua, bairro, num, cep, complemento} = req.body; 

        const endereco = {
            cidade: cidade,
            rua: rua,
            bairro: bairro,
            numero: num,
            cep: cep,
            complemento: complemento
        };

        for (const compra of user.cart.compras) {
            console.log("Antes de atualizar:", compra.quantity)
            compra.quantity = parseInt(compra.quantity, 10) || 1;
            console.log("Depois de atualizar:", compra.quantity)
            compra.endereco = endereco; // Adicione o endereço à compra
        }

        console.log(endereco)
        console.log('Quantidade antes de salvar:', user.cart.compras[0].quantity);
        const order = new Order({
            user: user._id,
            compras: user.cart.compras
        });
        
        await order.save();

        user.cart.compras = [];
        await user.save();

        res.status(200).send("Compras finalizadas e movidas para pedidos com sucesso!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao finalizar as compras e mover para pedidos.");
    }
});

//rota para alterar a quantidade do produto no carrinho
router.post('/cart/update-quantity/:productId', async (req, res) => {
    const user_session = req.session.user._id;

    if (!req.session.user) {
        res.redirect('/login');
        return;
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        res.redirect('/cart');
        return;
    }

    const user = await User.findById(user_session);

    const compra = user.cart.compras.find(c => c._id.equals(productId));

    if (!compra) {
        res.redirect('/cart');
        return;
    }

    compra.quantity = parseInt(quantity, 10);

    try {
        await user.save();

        // Armazenar informações do carrinho na sessão
        req.session.cart = user.cart;

        res.redirect('/cart');
    } catch (error) {
        console.error('Erro ao atualizar a quantidade:', error);
        res.redirect('/cart');
    }
});


//rota para realizar a pesquisa na barra
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

//rota que fornece sugestões para o usuário da pesquisa que ele está fazendo
router.get('/search/suggestions', async (req, res) => {
    const searchTerm = req.query.q; 
    try {
        const results = await Product.find({ name: { $regex: new RegExp(searchTerm, 'i') }})
            .limit(5) 
            .select('name');

        const suggestions = results.map((result) => result.name);

        res.json(suggestions);
    } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        res.status(500).json({ error: 'Erro ao buscar sugestões' });
    }
});

module.exports = router;