import express from 'express'
import userAuth from '../Middleware/userAuth.js'
import { getUserData,getUserInformation  } from '../Controllers/userControllers.js';


const userRouter = express.Router();

userRouter.get('/data',userAuth,getUserData)
userRouter.get('/user-info',getUserInformation)

export default userRouter;
