import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import moment from 'moment'
import { SECRET_PASSWORD, SECRET_JWT, JWT_EXP_DAYS } from '../../envs.js';
import { User } from '../models/user.model'


class UserService {
  createJWT(userId) {
    const payload = {
      id: userId,
      exp: +moment().add(+JWT_EXP_DAYS || 14, 'days').format('x'),
    }
    return jwt.sign(payload, SECRET_JWT)
  }
  
  encryptPassword(password) {
    return crypto.createHmac('sha256', SECRET_PASSWORD)
      .update(password)
      .digest('hex')
  }
  
  checkPassword(password, hashedPassword) {
    return this.encryptPassword(password) === hashedPassword
  }
  
  async checkUserCredentials(email, password) {
    try {
      const user = await User.findOne({where: {email}})
      const isPasswordMatched = this.checkPassword(password, user.password)
      if (isPasswordMatched) return user
      else {
        return null
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }
}


export const userService = new UserService()
