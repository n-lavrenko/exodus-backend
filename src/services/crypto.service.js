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
    return nanoid(44);
  }
  
  getUrl(restString) {
    // should be secured on env vars, sure:
    const USER = '1234'
    const PASS = '1234'
    return `http://${USER}:${PASS}@127.0.0.1:8332/` + (restString ? restString : '')
    // return `http://${USER}:${PASS}@159.223.30.179:18443/` + (restString ? restString : '')
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
      console.log(url, data)
      const res = await axios.post(url, data)
      if (res.data.result) {
        return {success: true, walletName}
      }
      return {success: false}
    } catch (e) {
      console.log(e.response.data.error)
      throw e.response.data.error
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
  
  async mineBTCToWalletAddress(walletAddress, amount = 202) {
    const data = {
      ...this.defaultParams,
      method: 'generatetoaddress',
      params: [amount, walletAddress],
    }
    const url = this.getUrl()
    try {
      await axios.post(url, data)
    } catch (e) {
      throw new Error(e)
    }
  }
  
  async getTransactions(walletName) {
    const data = {
      ...this.defaultParams,
      method: 'listtransactions',
    }
    const url = this.getUrl(`wallet/${walletName}`)
    try {
      return await axios.post(url, data)
    } catch (e) {
      throw new Error(e)
    }
  }
  
  async initAdminWallet() {
    try {
      const isAdminWalletExist = await CryptoWalletModel.findOne({where: {name: adminWalletName}})
      if (isAdminWalletExist) return true;
  
      await this.createWallet(adminWalletName)
      const {walletAddress: walletAdminAddress} = await this.createWalletAddress(adminWalletName)
      
      const adminWallet = {
        name: adminWalletName,
        address: walletAdminAddress,
      }
      await CryptoWalletModel.create(adminWallet)
      
      await this.mineBTCToWalletAddress(walletAdminAddress, 101)
    } catch (e) {
      console.error('Error in init Admin Wallet')
      return {success: false, balance: 'Unknown'}
    }
  }
  
  async getWalletBalance(walletName) {
    const data = {
      ...this.defaultParams,
      method: 'getbalance',
    }
    const url = this.getUrl(`wallet/${walletName}`)
    try {
      await this.rescan(walletName)
      const res = await axios.post(url, data)
      return res.data.result
    } catch (e) {
      console.log(e.response.data.error)
      throw e.response.data.error;
    }
  }
  
  async rescan(walletName) {
    const data = {
      ...this.defaultParams,
      method: 'rescanblockchain',
      params: [],
    }
    const url = this.getUrl(`wallet/${walletName}`)
    try {
      await axios.post(url, data)
    } catch (e) {
      console.log(e.response.data.error)
      throw e.response.data.error;
    }
  }
  
  async getWalletInfo(wallet, amount) {
    const data = {
      ...this.defaultParams,
      method: 'listunspent',
      params: [null, null, [wallet.address], true, {minimumAmount: amount}],
    }
    const url = this.getUrl(`wallet/${wallet.name}`)
    try {
      await this.rescan(wallet.name)
      const res = await axios.post(url, data)
      return res.data.result
    } catch (e) {
      console.log(e.response.data.error)
      throw e.response.data.error;
    }
  }
  
  async transaction(amount, toWallet, fromWalletName = adminWalletName) {
    try {
      const fromWallet = await CryptoWalletModel.findOne({where: {name: fromWalletName}})
      const [walletInfo] = await this.getWalletInfo(fromWallet, amount)
      if (!walletInfo) return {success: false, message: 'dont found a listunspent'}
      
      // create a transaction:
      const data = {
        ...this.defaultParams,
        method: 'createrawtransaction',
        params: [[
          {
            txid: walletInfo.txid,
            vout: walletInfo.vout,
            address: walletInfo.address
          }],
          [{[toWallet.address]: amount}]],
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
      const signWalletUrl = this.getUrl(`wallet/${fromWalletName}`)
      const signResponse = await axios.post(signWalletUrl, signData)
      
      const {hex, complete} = signResponse.data.result
      if (!complete) return {success: false, message: 'Signing a transaction with errors'}
      
      // send a transaction to bitcoin network:
      const sendTransactionData = {
        ...this.defaultParams,
        method: 'sendrawtransaction',
        params: [hex, 0],
      }
      await axios.post(url, sendTransactionData)
      
      const adminWallet = await CryptoWalletModel.findOne({where: {name: adminWalletName}})
      await this.mineBTCToWalletAddress(adminWallet.address, 1)
      
      const balance = await cryptoService.getWalletBalance(toWallet.name)
      return {success: true, balance}
    } catch (e) {
      console.log(e.response.data.error)
      throw e.response.data.error
    }
  }
  
  async getBTCPrice() {
    const coin_market_cap_api_key = 'e0d2cb59-0d40-4f44-8390-26bdd66232bc'
    try {
      const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=1', {
        headers: {
          'X-CMC_PRO_API_KEY': coin_market_cap_api_key,
        },
      })
  
      return response.data.data[0].quote.USD.price.toFixed(2)
    } catch (e) {
      return 0
    }
  }
}


export const cryptoService = new CryptoService()
