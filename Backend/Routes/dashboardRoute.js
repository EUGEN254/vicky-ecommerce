import express from 'express'
import { dashboardData } from '../Controllers/productController.js';

const dashboardRoute = express.Router();


dashboardRoute.get('/',dashboardData)

export default dashboardRoute;