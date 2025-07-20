import express from 'express'
import { initiateSTKPush, mpesaCallback,cancelSTKPush } from '../Controllers/mpesaController.js';

const mpesaRoute = express.Router();

mpesaRoute.post('/stkpush', initiateSTKPush);
mpesaRoute.post('/callback', mpesaCallback);
mpesaRoute.post('/cancel-payment', cancelSTKPush);

export default  mpesaRoute;