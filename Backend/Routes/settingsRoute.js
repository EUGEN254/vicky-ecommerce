import express from 'express'
import { getSiteConfig, updateMaintenanceMode,updateEmailMode } from '../Controllers/settingsController.js';


const settingsRouter = express.Router();

settingsRouter.get('/config',getSiteConfig)
settingsRouter.post('/update',updateMaintenanceMode)
settingsRouter.post('/update-email',updateEmailMode)

export default settingsRouter;