import express from 'express';
import cors from 'cors'
import { cryptoRouter } from './crypto.api.js';
import { plaidRouter } from './plaid.api.js';
import { userRouter } from './user.api.js';


export const router = express.Router()

// COMMON ROUTES:
router.get('/', (req, res) => {
  res.send('The server is running!')
})

router.use('/api/*', cors(), function (req, res, next) {
  console.log(req.method + ': ', req.baseUrl)
  if (req.method.includes('POST', 'PUT')) {
    console.log(req.body)
  }
  next()
})

// ROUTES FOR MODELS:
router.use('/api/user', userRouter)
router.use('/api/plaid', plaidRouter)
router.use('/api/crypto', cryptoRouter)

// Return 404 if API endpoint don't exists:
router.use('/api/*', (req, res) => {
  res.status(404).send({ message: 'Method not implemented' });
});
