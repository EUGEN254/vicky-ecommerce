import express from 'express'
import { initiateSTKPush, mpesaCallback } from '../Controllers/mpesaController.js';

const mpesaRoute = express.Router();

mpesaRoute.post('/stkpush', initiateSTKPush);
mpesaRoute.post('/callback', mpesaCallback);

export default  mpesaRoute;