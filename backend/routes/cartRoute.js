import express from 'express'
import { addToCart, getUserCart, UpdateCart } from '../controllers/cartController.js'
import authUser from '../middleware/auth.js'

const cartRoute = express.Router()

cartRoute.post('/get', authUser, getUserCart)
cartRoute.post('/add', authUser, addToCart)
cartRoute.post('/update', authUser, UpdateCart)

export default cartRoute
