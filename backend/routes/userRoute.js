import express from 'express';
import { loginUser, registerUser, adminLogin, getWishlist, toggleWishlist } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/wishlist', authUser, getWishlist)
userRouter.post('/wishlist/toggle', authUser, toggleWishlist)

export default userRouter;
