import express from 'express';
import cors from 'cors'
import { userRouter } from './user.api.js';


export const router = express.Router()

// COMMON ROUTES:
router.get('/', (req, res) => {
  res.send('The server is running!')
})

router.use('/api/*', cors(), function (req, res, next) {
  next()
})

// ROUTES FOR MODELS:
router.use('/api/user', userRouter)

// Return 404 if API endpoint don't exists:
router.get('*', (req, res) => {
  res.status(404).send({ message: 'Resource not found.' });
});
