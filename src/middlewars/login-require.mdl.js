import jwt from 'jsonwebtoken'
import moment from 'moment'
import { SECRET_JWT } from '../envs.js';


export const loginRequiredMdl = (req, res, next) => {
  let token = req.header('Authorization')
  if (!token) {
    return res.status(401).send({message: 'The token is not present on request.'})
  }
  if (!token.includes('Bearer ')) {
    return res.status(401).send({message: 'The token is invalid'})
  }
  token = token.slice(7)
  const currentMoment = +moment().format('x')
  
  if (!token) {
    return res.status(401).json({message: 'Please make sure your request has an Authorization header'})
  }
  
  let parsed = null
  try {
    parsed = jwt.verify(token, SECRET_JWT)
  } catch (err) {
    return res.status(401).send({message: err.message})
  }
  
  if (parsed.exp <= currentMoment) {
    return res.status(401).send({message: 'Token has expired'})
  }
  
  req.userId = parsed.id
  req.userRole = parsed.role
  
  next()
  
}
