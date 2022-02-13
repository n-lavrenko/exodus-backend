import { app } from './app'
import { adminWalletName } from './constants.js';
import { PORT } from './envs.js';
import { sequelize } from './sequelize/connect.js';
import { createAssociations } from './sequelize/models/associations'
import { sequelizeSync } from './sequelize/sync'
import { cryptoService } from './services/crypto.service';


const port = +PORT || 3000;


async function assertDatabaseConnectionOk() {
  console.log(`Checking DB connection...`)
  try {
    await sequelize.authenticate()
    console.log('Database connection: OK')
  } catch (error) {
    console.log('Unable to connect to the database:')
    console.log(error.message)
    process.exit(1)
  }
}

async function init() {
  try {
    await assertDatabaseConnectionOk()
    createAssociations()
    await sequelizeSync()
    // await sequelizeSync(true)
    await cryptoService.initRootWallets()
    const balance = await cryptoService.getWalletBalance(adminWalletName)
    console.log(`Admin wallet has ${balance} BTC`)
  } catch (e) {
    console.log(e)
    throw e
  }
  
  app.listen(port, () => {
    console.log('Exodus Node.js server listening on http://localhost:' + port)
  })
}

await init()
