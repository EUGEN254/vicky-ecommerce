import express from 'express'
import { getOrders, getOrderById } from '../Controllers/productController.js';
import { saveUserOrders } from '../Controllers/saveUserOrders.js';

const userOrders = express.Router();

userOrders.get('/', getOrders);
userOrders.get('/:id', getOrderById); 
userOrders.post('/', saveUserOrders);

export default userOrders;