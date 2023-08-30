const UserCollection = require('../Model/user_details')
const CouponCollection = require('../Model/coupon')

module.exports = {
    userMoreDetails: async (req, res) => {
        let user_id = req.params.id
        const moreDetails = await UserCollection.aggregate([
            {
                $match: {
                    user_id
                }
            },
            {
                $lookup: {
                    from: 'addres',
                    localField: 'user_id',
                    foreignField: 'user_id',
                    as: 'address'
                }
            }


        ])

        const userCoupons = await CouponCollection.find({user_id})
        console.log(moreDetails)
        res.render('single-user', { user: moreDetails,coupons : userCoupons,isAdmin: true })
    },
    //to get user datas from the database
    userLists: async (req, res) => {

        try {
            const userDatas = await UserCollection.find({})

            res.render('userlists', { datas: userDatas, isAdmin: true })


        } catch (e) {
            console.log(e.message)
        }

    },
    unBlockUser: async (req, res) => {
        const user_id = req.params.id
        const toUpdate = {
            isBlocked: false
        }
        const unblock = await UserCollection.findOneAndUpdate({ user_id }, { $set: toUpdate })
        res.redirect('/admin/userlists')

    },
    blockUser: async (req, res) => {
        const user_id = req.params.id
        const toUpdate = {
            isBlocked: true
        }
        const block = await UserCollection.findOneAndUpdate({ user_id }, { $set: toUpdate })
        res.redirect('/admin/userlists')

    },
    createCouponPage: async (req, res) => {
        try {
            const users = await UserCollection.find({ isBlocked: false }, { email: 1, _id: 0 })
            res.render('create-coupon', { users,isAdmin : true})
        } catch (e) {
            console.log(e)
        }

    },
    createCoupon: async (req, res) => {
        try {
            console.log(req.body)
            const {couponName,couponValue,users,couponType,expiryDays} = req.body
            let userEmails = Array.isArray(users) ? users : [users];
            const userIds = await UserCollection.find({email : {$in : userEmails}},{user_id : 1, _id : 0})
            let couponCode;
            if(couponType === 'percent'){
                couponCode = `${couponName}${couponValue}%`
            }else {
                couponCode = `${couponName}${couponValue}`
            }
            let expiryDate;
            if(expiryDays > 0){
                const days = (1000*60*60*24)*Number(expiryDays)
                expiryDate = Date.now()+days
            }

            let userCoupon = []
            for(let each of userIds){
                userCoupon.push(await CouponCollection.create({
                    user_id : each.user_id,
                    couponType,
                    couponCode,
                    couponValue,
                    expiryDate,
                }))
            }

            console.log(userCoupon)
            res.redirect('/admin/create-coupon')
        } catch (e) {
            console.log(e)
        }
    }
}