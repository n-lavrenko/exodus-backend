import axios from 'axios'
import { nanoid } from 'nanoid'
import { adminWalletName } from '../constants.js';
import { CryptoWalletModel } from '../sequelize/models/crypto-wallet.model.js';


class CryptoService {
  constructor() {
    this.defaultParams = {
      jsonrpc: '2.0',
      id: 1,
    }
  }
  
  generateWalletName() {
    return nanoid(32);
  }
  
  getUrl(restString) {
    // should be secured on env vars, sure:
    const USER = '1234'
    const PASS = '1234'
    return `http://${USER}:${PASS}@127.0.0.1:18443/` + (restString ? restString : '')
  }
  
  async createWallet(name) {
    const walletName = name || this.generateWalletName()
    const data = {
      ...this.defaultParams,
      method: 'createwallet',
      params: [walletName],
    }
    const url = this.getUrl()
    try {
      const res = await axios.post(url, data)
      if (res.data.result) {
        return {success: true, walletName}
      }
      return {success: false}
    } catch (e) {
      console.log(e)
      return {success: false}
    }
  }
  
  async createWalletAddress(walletName) {
    const data = {
      ...this.defaultParams,
      method: 'getnewaddress',
      params: [walletName],
    }
    const url = this.getUrl(`wallet/${walletName}`)
    try {
      const res = await axios.post(url, data)
      if (res.data.result) {
        return {success: true, walletAddress: res.data.result}
      }
      return {success: false}
    } catch (e) {
      return {success: false}
    }
  }
  
  async generateBTCToWalletAddress(walletAddress) {
    const data = {
      ...this.defaultParams,
      method: 'generatetoaddress',
      params: [1010, walletAddress],
    }
    const url = this.getUrl()
    try {
      await axios.post(url, data)
    } catch (e) {
      throw new Error(e)
    }
  }
  
  async initAdminWallet() {
    try {
      const isExist = await CryptoWalletModel.findOne({where: {name: adminWalletName}})
      if (isExist) return true;
      
      await this.createWallet(adminWalletName)
      const {walletAddress} = await this.createWalletAddress(adminWalletName)
      await this.generateBTCToWalletAddress(walletAddress)
      await CryptoWalletModel.create({
        name: adminWalletName,
        address: walletAddress,
      })
      return true
    } catch (e) {
      console.error('Error in init Admin Wallet')
      return false
    }
  }
  
  async rescan() {
    const data = {
      ...this.defaultParams,
      method: 'rescanblockchain',
      params: [],
    }
    const url = this.getUrl()
    try {
      const response = await axios.post(url, data)
      console.log(response.data.result)
    } catch (e) {
      console.log(e.response.data.error)
      throw e.response.data.error;
    }
  }
  
  async getWalletBalance(wallet) {
    const data = {
      ...this.defaultParams,
      method: 'getbalance',
      params: [],
    }
    const url = this.getUrl(`wallet/${wallet.name}`)
    try {
      await this.rescan()
      const res = await axios.post(url, data)
      return res.data.result
    } catch (e) {
      console.log(e.response.data.error)
      throw e.response.data.error;
    }
  }
  
  async getWalletInfo(wallet, amount) {
    const data = {
      ...this.defaultParams,
      method: 'listunspent',
      params: [1, 99999999, [wallet.address], true, {minimumAmount: amount}],
    }
    const url = this.getUrl(`wallet/${wallet.name}`)
    try {
      const res = await axios.post(url, data)
      return res.data.result
    } catch (e) {
      console.log(e.response.data.error)
      throw e.response.data.error;
    }
  }
  
  async transaction(userWallet, amount) {
    try {
      const adminWallet = await CryptoWalletModel.findOne({where: {name: adminWalletName}})
      const [walletInfo] = await this.getWalletInfo(adminWallet, amount)
      
      // create a transaction:
      const data = {
        ...this.defaultParams,
        method: 'createrawtransaction',
        params: [[
          {
            txid: walletInfo.txid,
            vout: walletInfo.vout,
          }],
          [{[userWallet.address]: amount}]],
      }
      const url = this.getUrl()
      const res = await axios.post(url, data)
      const transactionHex = res.data.result
      
      // sign a transaction:
      const signData = {
        ...this.defaultParams,
        method: 'signrawtransactionwithwallet',
        params: [transactionHex],
      }
      const adminWalletUrl = this.getUrl(`wallet/${adminWalletName}`)
      const signResponse = await axios.post(adminWalletUrl, signData)
      console.log(signResponse.data.result)
      
      const {hex, complete} = signResponse.data.result
      if (!complete) return {success: false, message: 'Signing a transaction with errors'}
      
      // send a transaction to bitcoin network:
      const sendTransactionData = {
        ...this.defaultParams,
        method: 'sendrawtransaction',
        params: [hex, 0],
      }
      const sendTransactionResponse = await axios.post(url, sendTransactionData)
      console.log(sendTransactionResponse.data.result)
      return sendTransactionResponse.data.result
    } catch (e) {
      console.log(e.response.data.error)
      throw e.response.data.error
    }
  }
}


export const cryptoService = new CryptoService()
