import express from 'express';
import { adminWalletName } from '../constants.js';
import { loginRequiredMdl } from '../middlewars/login-require.mdl';
import { CryptoWalletModel } from '../sequelize/models/crypto-wallet.model.js';
import { cryptoService } from '../services/crypto.service.js';


const router = express.Router()


async function createWallet(req, res) {
  try {
    const existsWallet = await CryptoWalletModel.findOne({
      where: {userId: req.userId}
    })
    if (existsWallet) {
      return res.send({
        message: 'A wallet was already created',
        walletName: existsWallet.name,
        walletAddress: existsWallet.address
      })
    }
    
    const {walletName} = await cryptoService.createWallet()
    const {walletAddress} = await cryptoService.createWalletAddress(walletName)
    
    await CryptoWalletModel.create({userId: req.userId, name: walletName, address: walletAddress})
    
    res.send({message: 'A wallet was created', walletName, walletAddress})
  } catch (e) {
    res.status(500).send({message: 'Something went wrong', error: e})
  }
}

async function getAdminBalance(req, res) {
  try {
    const adminWallet = await CryptoWalletModel.findOne({where: {name: adminWalletName}})
    if (!adminWallet) return res.send({message: 'Admin wallet not found'})
    
    const result = await cryptoService.getAdminWalletBalance()
    res.send({success: true, balance: result})
  } catch (e) {
    res.status(500).send({message: 'Something went wrong', error: e})
  }
}

async function getUserBalance(req, res) {
  try {
    const userWallet = await CryptoWalletModel.findOne({
      where: {userId: req.userId}
    })
    if (!userWallet) return res.send({success: false, message: 'User do not have a wallet'})
    const result = await cryptoService.getWalletBalance(userWallet)
    
    res.send({success: true, balance: result})
  } catch (e) {
    res.status(500).send({success: false, error: e})
  }
}

router.post('/create-wallet', loginRequiredMdl, createWallet)
router.post('/admin-balance', loginRequiredMdl, getAdminBalance)
router.post('/user-balance', loginRequiredMdl, getUserBalance)

export const cryptoRouter = router