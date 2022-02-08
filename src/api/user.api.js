import express from 'express'
import { loginRequiredMdl } from '../middlewars/login-require.mdl'
import { UserModel } from '../sequelize/models/user.model'
import { userService } from '../services/user.service'
import {
  msgEmailDuplicated,
  msgEmailOrPasswordInvalid, msgRequiredFieldsError,
  msgSigninSuccess,
  msgSignupSuccess,
} from '../constants.js';


const router = express.Router()


const signin = async (req, res) => {
  const {email, password} = req.body
  let user
  try {
    user = await userService.checkUserCredentials(email, password)
  } catch (e) {
    return res.status(401).send({message: msgEmailOrPasswordInvalid})
  }
  if (!user) return res.status(401).send({message: msgEmailOrPasswordInvalid})
  const accessToken = userService.createJWT(user.id)
  
  const response = {
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      isBankAccountLinked: user.isBankAccountLinked
    },
    accessToken,
    message: msgSigninSuccess,
  }
  
  res.setHeader('Token-Type', 'Bearer')
  res.setHeader('Cache-Control', 'max-age=0, private, must-revalidate')
  res.setHeader('Authorization', accessToken)
  res.send(response)
}

const signup = async (req, res) => {
  const {firstName, lastName, email, password} = req.body
  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).send({success: false, message: msgRequiredFieldsError})
    }
    const user = await UserModel.create({firstName, lastName, email, password})
    const accessToken = userService.createJWT(user.id)
    
    res.setHeader('Token-Type', 'Bearer')
    res.setHeader('Cache-Control', 'max-age=0, private, must-revalidate')
    res.setHeader('Authorization', accessToken)
    
    res.send({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        isBankAccountLinked: user.isBankAccountLinked
      },
      accessToken,
      message: msgSignupSuccess,
    })
  } catch (e) {
    if (e?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send({success: false, message: msgEmailDuplicated(email)})
    }
    res.status(500).send({success: false, message: e})
  }
}


export const getMyProfile = async (req, res) => {
  try {
    const user = await UserModel.findOne({where: {id: req.userId}})
    if (!user) {
      res.status(404).send({message: 'User not found'})
    }
    res.send({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        isBankAccountLinked: user.isBankAccountLinked
      },
    })
  } catch (e) {
    res.send({data: null, message: e})
  }
}


// auth:
router.post('/signup', signup)
router.post('/signin', signin)

// account:
router.get('/my-profile', loginRequiredMdl, getMyProfile)

export const userRouter = router
