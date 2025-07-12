import express from 'express'
import upload from '../middleware/uploadMiddleware.js';
import { createProducts, exclusiveOffers, getProducts, toggleAvailability,getInventory,addInventory, updateProduct,deleteProduct   } from '../Controllers/productController.js';
import { adminAuth } from '../Middleware/adminAuth.js';
import { getCategories,deleteCategory,updateCategory,addCategory } from '../Models/Category.js';
import { applyDiscountToProduct } from '../Controllers/discountController.js';

const productRouter = express.Router();


productRouter.post('/', upload.array("images", 4),adminAuth,createProducts)
productRouter.put('/:id', updateProduct);
productRouter.delete('/:id', deleteProduct);
productRouter.put('/:productId/discount', applyDiscountToProduct);
productRouter.put('/categories/:id/status', updateCategory );
productRouter.get('/inventory',getInventory);
productRouter.post('/inventory',addInventory);
productRouter.post('/toggle-availabilty', toggleAvailability);
productRouter.get('/',getProducts)
productRouter.get('/categories', getCategories);
productRouter.delete('/categories/:id', deleteCategory);
productRouter.post('/categories', addCategory);
productRouter.get('/exclusive_offers',exclusiveOffers)





export default productRouter;