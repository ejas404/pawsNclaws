const express = require('express')
const userRouter = express.Router()


const userController = require('../Controller/user_controller')
const userProductController = require('../Controller/user_product_controller')
const userMiddleware = require('../Middlewares/user_middle')


//user signup----------------------------------------

//userRouter.post('/otp-configure',userController.otpConfig)



userRouter.get('/login',userController.loginPage)
userRouter.post('/login',userMiddleware.isBlocked,userController.userLogin)

userRouter.get('/logout',userController.logout)

userRouter.get('/signup',userController.signUpPage)
userRouter.post('/signup',userController.userSignUp)

userRouter.post('/resetpass',userController.resetPassword)

userRouter.get('/enter-otp',userController.otpPage)
userRouter.post('/otp-configure',userMiddleware.otpConfig )
userRouter.post('/get-otp',userMiddleware.isNumber)
userRouter.get('/email',userController.email)
userRouter.post('/emailotp',userController.emailotp)


userRouter.delete('/delete-address/:id',userController.deleteAddress)
userRouter.get('/cartquantity',userProductController.updateCartItemQty)
userRouter.get('/add-to-cart/:id',userMiddleware.isLoggedinMid,userMiddleware.isBlockedMid,userProductController.addToCart)
userRouter.delete('/delete-cart-item/:id',userMiddleware.isLoggedinMid,userMiddleware.isBlockedMid,userProductController.deleteCartItem)
userRouter.post('/add-to-wishlist/:id',userProductController.addToWishList)


userRouter.use(userMiddleware.isLoggedin,userMiddleware.isBlocked)

userRouter.get('/user-profile',userController.profilePage)
userRouter.get('/user-profile/add-address',userController.addAddressPage)
userRouter.post('/add-address',userController.addAddress)
userRouter.get('/singleproduct/:id',userController.singleProduct)
userRouter.get('/cart',userProductController.cartPage)




//userRouter.get('/:productName',userMiddleware.isLoggedin,userMiddleware.isBlockedMid,userController.singleProductPage)

module.exports = userRouter