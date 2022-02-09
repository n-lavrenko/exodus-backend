import express from 'express';
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


router.post('/create-wallet', loginRequiredMdl, createWallet)

export const cryptoRouter = router
