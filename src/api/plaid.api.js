import express from 'express';
import { loginRequiredMdl } from '../middlewars/login-require.mdl';
import { PlaidLinkModel } from '../sequelize/models/plaid-link.model.js';
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
    res.send({accessToken, itemId, success: true})
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}

async function getAccounts(req, res) {
  try {
    const link = await PlaidLinkModel.findOne({
      where: {
        userId: req.userId,
      },
    })
    if (!link) {
      return res.status(404).send('You are not linked your banking account')
    }
    
    const accountsResponse = await plaidClient.accountsBalanceGet({
      access_token: link.accessToken,
    });
    accountsResponse.data.accounts = accountsResponse.data.accounts.filter(a => a.balances.available > 0)
    res.send(accountsResponse.data.accounts)
  } catch (error) {
    return res.json(error.response)
  }
}

async function unlinkPlaid(req, res) {
  try {
    await PlaidLinkModel.destroy({
      where: {
        userId: req.userId,
      },
    })
    res.send({message: 'Unlinking was successfully done'})
  } catch (e) {
    res.status(500).send({message: 'Something went wrong', error: e})
  }
}

async function checkIsUserLinked(req, res) {
  try {
    const link = await PlaidLinkModel.findOne({
      where: {
        userId: req.userId,
      },
    })
    if (!link) {
      return res.send({isLinked: false, message: 'Link was not found'})
    }
    res.send({isLinked: true, message: 'Link was found', link})
  } catch (e) {
    res.status(500).send({message: 'Something went wrong', error: e})
  }
}


router.post('/create-link-token', loginRequiredMdl, createLinkToken)
router.post('/exchange-public-token', loginRequiredMdl, exchangePublicToken)
router.get('/accounts', loginRequiredMdl, getAccounts)

router.post('/unlink-plaid', loginRequiredMdl, unlinkPlaid)
router.get('/is-linked', loginRequiredMdl, checkIsUserLinked)

export const plaidRouter = router
