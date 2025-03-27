import 'dotenv/config'
import knex from 'knex'

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

export default db