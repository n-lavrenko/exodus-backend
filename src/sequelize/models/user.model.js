import Sequelize from 'sequelize'
import { userService } from '../../services/user.service'
import { defaultModelOptions } from './default-options.js';


const {Model, DataTypes} = Sequelize


export class User extends Model {
}


User.init(
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
    password: DataTypes.STRING,
    isBankAccountLinked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  },
  {
    ...defaultModelOptions,
    modelName: 'user',
    tableName: 'user',
  })

User.beforeCreate(user => {
  user.password = userService.encryptPassword(user.password)
})
