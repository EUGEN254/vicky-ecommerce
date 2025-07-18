import express from 'express'
import { getUserData,getUserInformation, testimonials  } from '../Controllers/userControllers.js';
import userAuth from '../Middleware/userAuth.js';


const userRouter = express.Router();

userRouter.get('/data',userAuth,getUserData)
userRouter.get('/user-info',getUserInformation)
userRouter.get('/testimonials',testimonials)

export default userRouter;
