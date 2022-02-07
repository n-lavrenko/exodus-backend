import { sequelize } from './connect'


export const sequelizeSync = async (isForce = false) => {
  try {
    await sequelize.sync({force: isForce})
    console.log('Sync DB: OK', isForce ? 'in force mode!' : '')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    throw new Error(error)
  }
}
