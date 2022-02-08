import Sequelize from 'sequelize'
import { defaultModelOptions } from './default-options.js';


const {Model, DataTypes} = Sequelize


export class PlaidLinkModel extends Model {
}


PlaidLinkModel.init(
  {
    itemId: DataTypes.STRING,
    accessToken: DataTypes.STRING
  },
  {
    ...defaultModelOptions,
    modelName: 'plaid_link',
    tableName: 'plaid_link',
  })
