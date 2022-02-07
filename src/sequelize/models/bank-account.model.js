import Sequelize from 'sequelize'
import { defaultModelOptions } from './default-options.js';


const {Model, DataTypes} = Sequelize


export class BankAccount extends Model {
}


BankAccount.init(
  {
    address: DataTypes.STRING,
  },
  {
    ...defaultModelOptions,
    modelName: 'bank_account',
    tableName: 'bank_account',
  })
