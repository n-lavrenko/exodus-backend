import { PlaidLinkModel } from './plaid-link.model.js';
import { UserModel } from './user.model'


export const createAssociations = () => {
  UserModel.hasOne(PlaidLinkModel)
  PlaidLinkModel.belongsTo(UserModel)
}
