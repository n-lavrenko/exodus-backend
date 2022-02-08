import Sequelize from 'sequelize'
import { userService } from '../../services/user.service'
import { defaultModelOptions } from './default-options.js';


const {Model, DataTypes} = Sequelize


export class UserModel extends Model {
}


UserModel.init(
  {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.firstName} ${this.lastName}`
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: DataTypes.STRING
  },
  {
    ...defaultModelOptions,
    modelName: 'user',
    tableName: 'user',
  })

UserModel.beforeCreate(user => {
  user.password = userService.encryptPassword(user.password)
})
