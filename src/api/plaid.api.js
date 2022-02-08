import express from 'express';
import { loginRequiredMdl } from '../middlewars/login-require.mdl';
import { PlaidLinkModel } from '../sequelize/models/plaid-link.model.js';
import { UserModel } from '../sequelize/models/user.model.js';
import { plaidClient } from '../services/plaid.service.js';


const router = express.Router()


async function createLinkToken(req, res) {
  const request = {
    user: {
      client_user_id: String(req.userId),
    },
    client_name: 'Exodus Code Challenge',
    products: ['auth', 'transactions'],
    language: 'en',
    country_codes: ['US'],
    // account_filters: {
    //   credit: {
    //     account_subtypes: ['credit card', 'paypal']
    //   }
    // }
  };
  try {
    const createTokenResponse = await plaidClient.linkTokenCreate(request);
    res.send(createTokenResponse.data);
  } catch (e) {
    console.error(e)
    res.status(500).send('Something went wrong on the server side')
  }
}

async function exchangePublicToken(req, res) {
  const {publicToken} = req.body;
  
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;
    await PlaidLinkModel.create({userId: req.userId, accessToken, itemId})
    await UserModel.update({isBankAccountLinked: true}, {
      where: {
        id: req.userId,
      },
    })
    res.send({accessToken, itemId})
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

async function getAccounts(req, res) {
  try {
    const link = await PlaidLinkModel.find({
      where: {
        userId: req.userId,
      },
    })
    if (!link) {
      return res.status(404).send('You are not linked your banking account')
    }
    
    const accountsResponse = await plaidClient.accountsGet({
      access_token: link.accessToken,
    });
    
    res.send(accountsResponse.data)
  } catch (error) {
    return res.json(error.response)
  }
}


router.post('/create-link-token', loginRequiredMdl, createLinkToken)
router.post('/exchange-public-token', loginRequiredMdl, exchangePublicToken)
router.get('/accounts', loginRequiredMdl, getAccounts)

export const plaidRouter = router
