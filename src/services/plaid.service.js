import { Configuration, PlaidApi } from 'plaid';
import { PLAID_CLIENT_ID, PLAID_SECRET } from '../envs.js';


const configuration = new Configuration({
  basePath: 'sandbox',
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

export const plaidClient = new PlaidApi(configuration);
