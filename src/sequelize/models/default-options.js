import { sequelize } from '../connect'


export const defaultModelOptions = {
  sequelize,
  timestamps: true,
  paranoid: false,
  freezeTableName: true,
}
