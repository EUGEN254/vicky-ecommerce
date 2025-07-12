import express from 'express'
import { adminAuth } from '../Middleware/adminAuth.js';
import { getAdminData } from '../Controllers/adminController.js';


const adminRouter = express.Router();

adminRouter.get('/data',adminAuth,getAdminData)

export default adminRouter;