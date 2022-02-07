import { sequelize } from '../connect'


export const defaultModelOptions = {
  sequelize,
  timestamps: true,
  paranoid: true,
  freezeTableName: true,
}
