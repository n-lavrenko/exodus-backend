import Sequelize from 'sequelize'
import { defaultModelOptions } from './default-options.js';


const {Model, DataTypes} = Sequelize


export class CryptoWalletModel extends Model {
}


CryptoWalletModel.init(
  {
    name: {
      type: DataTypes.STRING,
      required: true
    },
    address: {
      type: DataTypes.STRING,
      required: true
    }
  },
  {
    ...defaultModelOptions,
    modelName: 'crypto_wallet',
    tableName: 'crypto_wallet',
  })
