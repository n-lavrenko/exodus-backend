import { BankAccount } from './bank-account.model.js';
import { User } from './user.model'


export const createAssociations = () => {
  User.hasMany(BankAccount)
  BankAccount.belongsTo(User)
}
