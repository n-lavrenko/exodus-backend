import express from 'express';


export const router = express.Router()

router.get('/', (req, res) => {
  res.send('OK')
})

router.get('*', (req, res) => {
  res.status(404).send({ message: 'Resource not found.' });
});
