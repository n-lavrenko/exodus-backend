import express from 'express';
import { adminWalletName } from '../constants.js';
import { loginRequiredMdl } from '../middlewars/login-require.mdl';
import { CryptoWalletModel } from '../sequelize/models/crypto-wallet.model.js';
import { cryptoService } from '../services/crypto.service.js';
import { getPlaidAccounts } from '../services/plaid.service.js';


const router = express.Router()


async function createWallet(req, res) {
  try {
    const existsWallet = await CryptoWalletModel.findOne({
      where: {userId: req.userId},
    })
    if (existsWallet) {
      const balance = await cryptoService.getWalletBalance(existsWallet.name)
      return res.send({
        message: 'A wallet was already created',
        success: true,
        balance,
        isWalletCreated: true,
        walletName: existsWallet.name,
        walletAddress: existsWallet.address,
      })
    }
    
    const {walletName} = await cryptoService.createWallet()
    const {walletAddress} = await cryptoService.createWalletAddress(walletName)
    
    await CryptoWalletModel.create({userId: req.userId, name: walletName, address: walletAddress})
    
    res.send({
      message: 'A wallet was created',
      success: true,
      balance: 0,
      isWalletCreated: true,
      walletName,
      walletAddress,
    })
  } catch (e) {
    res.status(500).send({message: 'Something went wrong', error: e})
  }
}

async function getAdminBalance(req, res) {
  try {
    const balance = await cryptoService.getWalletBalance(adminWalletName)
    res.send({success: true, balance})
  } catch (e) {
    res.status(500).send({message: 'Something went wrong', error: e})
  }
}


async function getAdminTransactions(req, res) {
  try {
    const adminWallet = await CryptoWalletModel.findOne({where: {name: adminWalletName}})
    if (!adminWallet) return res.send({message: 'Admin wallet not found'})
    
    const result = await cryptoService.getTransactions(adminWallet.name)
    res.send({success: true, transactions: result.data.result})
  } catch (e) {
    res.status(500).send({message: 'Something went wrong', error: e})
  }
}

async function getUserBalance(req, res) {
  try {
    const userWallet = await CryptoWalletModel.findOne({
      where: {userId: req.userId},
    })
    if (!userWallet) return res.send({success: false, message: 'User don\'t have a wallet'})
    const balance = await cryptoService.getWalletBalance(userWallet.name)
    
    res.send({
      success: true,
      balance,
      isWalletCreated: true,
      walletName: userWallet.name,
      walletAddress: userWallet.address,
    })
  } catch (e) {
    res.status(500).send({success: false, error: e})
  }
}


async function depositBTCWallet(req, res) {
  const {amountBTC, accountId} = req.body
  try {
    const userWallet = await CryptoWalletModel.findOne({
      where: {userId: req.userId},
    })
    if (!userWallet) return res.send({success: false, message: 'User don\'t have a wallet'})
    const {accounts} = await getPlaidAccounts(req.userId)
    const selectedAccount = accounts.find(a => a.account_id === accountId)
    
    const BTCprice = await cryptoService.getBTCPrice()
    const availableUSD = selectedAccount.balances.available
    const payingAmount = +(BTCprice * amountBTC).toFixed(2)
    
    if (availableUSD < payingAmount) {
      return res.send({success: false, message: 'You don\'t have enough money'})
    }
    const {success, balance} = await cryptoService.transaction(amountBTC, userWallet)
    
    res.send({success, balance})
  } catch (e) {
    res.status(500).send({success: false, error: e})
  }
}

async function getBTCPrice(req, res) {
    const price = await cryptoService.getBTCPrice()
    res.send({success: true, price})
}

router.post('/create-wallet', loginRequiredMdl, createWallet)
router.get('/admin-balance', loginRequiredMdl, getAdminBalance)
router.get('/wallet-info', loginRequiredMdl, getUserBalance)
router.get('/admin-transactions', loginRequiredMdl, getAdminTransactions)
router.post('/deposit-btc-wallet', loginRequiredMdl, depositBTCWallet)
router.get('/get-btc-price', loginRequiredMdl, getBTCPrice)

export const cryptoRouter = router
