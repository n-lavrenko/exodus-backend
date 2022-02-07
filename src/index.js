import { app } from './app'
import { PORT } from './envs.js';
import { sequelize } from './sequelize/connect.js';
import { createAssociations } from './sequelize/models/associations'
import { sequelizeSync } from './sequelize/sync'


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
  await assertDatabaseConnectionOk()
  createAssociations()
  await sequelizeSync(true)
  
  app.listen(port, () => {
    console.log('Exodus Node.js server listening on http://localhost:' + port)
  })
}

await init()
