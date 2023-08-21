const ProductCollection = require('../Model/product')
const CategoryCollection = require('../Model/category')
const BannerCollection = require('../Model/banner_details')
const UserCollection = require('../Model/user_details')
const titleUpperCase = require('../public/scripts/title_uppercase')

module.exports = {
    homepage: async (req, res) => {
        const num = req.session?.num ? Number(req.session.num) : 0;
        try {
            const products = await ProductCollection.find({ isAvailable: true }).skip(num * 3).limit(3)
            const count = await ProductCollection.countDocuments({ isAvailable: true })
            const topBanners = await BannerCollection.find({name : 'homepage_top_banner'})

            if (req.session.user) {
                const cartAndWish = await UserCollection.aggregate([
                    {
                        $match : {
                            email : req.session.user
                        }
                       
                    },
                    {
                        $project : {
                            cartIds : '$cart.product_id',
                            wishListIds : '$wishlist.product_id'
                        }
                    }
                ])
                console.log('hai')
                console.log(cartAndWish)
                res.render('index', { isUser: true, products, count,topBanners,cartAndWish})
            } else {
                res.render('index', { products, count,topBanners })
            }

        } catch (e) {
            console.log(e)
        }
    },
    singleProductPage: async (req, res) => {
        const product_id = req.params.id
        const product = await ProductCollection.aggregate([
            {
                $match: {
                    product_id
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productCategory',
                    foreignField: 'category_id',
                    as: 'category'
                }
            }


        ])
        console.log(product)
        const productName = (titleUpperCase(product[0].productName))
        if (req.session.user) {
            return res.render('user-single-product', { product, productName, isUser: true, })
        }
        res.render('user-single-product', { product, productName })
    },
    pagination: (req, res) => {
        req.session.num = req.params.num
        res.redirect('/')
    },
    productsPage: async (req, res) => {
        const num = req.session?.num ? Number(req.session.num) : 0;
        try {
            const products = await ProductCollection.find({ isAvailable: true })
            const count = await ProductCollection.countDocuments({ isAvailable: true })
            const categories = await CategoryCollection.find()
            if (req.session.user) {
                const cart = await UserCollection.aggregate([
                    {
                        $match : {
                            email : req.session.user
                        }
                       
                    },
                    {
                        $project : {
                            productIds : '$cart.product_id'
                        }
                    }
                ])
                res.render('products', { isUser: true, products, count, categories ,cart})
            } else {
                res.render('products', { products, count, categories })
            }

        } catch (e) {
            console.log(e)
        }
    },
    filter: async (req, res) => {
        console.log(req.query)
        try {
            if (Object.keys(req.query).length === 0) {
                console.log("No filters selected");
                return res.redirect('/products');
            }

            //setting query for category
            let category = Array.isArray(req.query.categoryName) ? req.query.categoryName : [req.query.categoryName];
            if (category[0]) {
                category = { productCategory: { $in: category } }
            } else {
                category = { productCategory: { $exists: true } }
            }

            let priceRange = req.query.priceRange;
            let priceQuery;

            switch (priceRange) {
                case '5000-10000':
                    priceQuery = { $gt: 5000, $lte: 10000 };
                    break;
                case '4000-5000':
                    priceQuery = { $gte: 4000, $lte: 5000 };
                    break;
                case '3000-4000':
                    priceQuery = { $gte: 3000, $lte: 4000 };
                    break;
                case '2000-3000':
                    priceQuery = { $gte: 2000, $lte: 3000 };
                    break;
                case '1000-2000':
                    priceQuery = { $gte: 1000, $lte: 2000 };
                    break;
                case 'above-500':
                    priceQuery = { $gt: 500 };
                    break;
                default:

                    break;
            }

             let price;
            if(priceRange){
               price  = {productPrice : priceQuery}
            }else{
                price = {productPrice: { $exists: true }}
            }

            const products = await ProductCollection.find({ ...price,...category,...{ isAvailable: true } })
            console.log(products)
            const categories = await CategoryCollection.find()
            res.render('products', { products, categories })
        } catch (e) {
            console.log(e)
        }
    }
}