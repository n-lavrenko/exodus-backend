import dotenv from 'dotenv'


const result = dotenv.config()

if (result.error) {
  throw result.error
}

export const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  SECRET_PASSWORD,
  SECRET_JWT,
  JWT_EXP_DAYS,
  PORT,
  PLAID_CLIENT_ID,
  PLAID_SECRET
} = result.parsed
