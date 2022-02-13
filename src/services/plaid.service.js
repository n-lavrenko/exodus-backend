import { Configuration, PlaidApi } from 'plaid';
import { PLAID_CLIENT_ID, PLAID_SECRET } from '../envs.js';
import { PlaidLinkModel } from '../sequelize/models/plaid-link.model.js';


const configuration = new Configuration({
  basePath: 'https://sandbox.plaid.com',
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});

export const getPlaidAccounts = async (userId) => {
  try {
    const link = await PlaidLinkModel.findOne({
      where: {
        userId: userId,
      },
    })
    if (!link) {
      return {success: false}
    }
    
    const accountsResponse = await plaidClient.accountsBalanceGet({
      access_token: link.accessToken,
    });
    accountsResponse.data.accounts = accountsResponse.data.accounts.filter(a => a.balances.available > 0)
    return {success: true, accounts: accountsResponse.data.accounts}
  } catch (e) {
    return {success: false, message: 'Error on accountsBalanceGet', error: e}
  }
}


export const plaidClient = new PlaidApi(configuration);
