import { CryptoWalletModel } from './crypto-wallet.model.js';
import { PlaidLinkModel } from './plaid-link.model.js';
import { UserModel } from './user.model'


export const createAssociations = () => {
  UserModel.hasOne(PlaidLinkModel)
  UserModel.hasOne(CryptoWalletModel)
  
  PlaidLinkModel.belongsTo(UserModel)
  CryptoWalletModel.belongsTo(UserModel)
}
