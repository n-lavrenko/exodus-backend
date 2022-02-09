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
      'method': 'createwallet',
      'params': [walletName],
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
      'method': 'getnewaddress',
      'params': [walletName],
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
      'method': 'generatetoaddress',
      'params': [101, walletAddress],
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
      console.error(e)
      return false
    }
  }
}


export const cryptoService = new CryptoService()
