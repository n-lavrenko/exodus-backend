import { app } from './app'
// import { isLocalDB, sequelize } from './sequelize/connect'
// import { createAssociations } from './sequelize/models/associations'
// import { sequelizeSync } from './sequelize/sync'
import { env } from './tools/parse-env'


const PORT = +env.PORT || 3000


// async function assertDatabaseConnectionOk() {
//   const dbType = isLocalDB ? 'local' : 'remote'
//   console.log(`Checking ${dbType} DB connection...`)
//   try {
//     await sequelize.authenticate()
//     console.log('Database connection OK!')
//   } catch (error) {
//     console.log('Unable to connect to the database:')
//     console.log(error.message)
//     process.exit(1)
//   }
// }

async function init() {
  // await assertDatabaseConnectionOk()
  // createAssociations()
  // await sequelizeSync()
  
  app.listen(PORT, () => {
    console.log('Mozaiq Node.js server listening on http://localhost:' + PORT)
  })
}

await init()
