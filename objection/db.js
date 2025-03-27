import 'dotenv/config'
import knex from 'knex'
import { Model } from 'objection'
// import { Model } from 'objection'

const db = knex({
  client: 'mysql2',
  useNullAsDefault: true,
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dateStrings: true
  }
})

Model.knex(db)
// console.log(await db.raw('show tables'))
export default db