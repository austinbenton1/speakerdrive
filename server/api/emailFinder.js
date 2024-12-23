import express from 'express';
import 'dotenv/config';
import fetch from 'node-fetch';

const router = express.Router();
const LEADMAGIC_API_KEY = '4f18d12a98720d1af9b86d90d568f405';

async function findEmail(firstName, lastName, companyDomain) {
  try {
    const url = 'https://api.leadmagic.io/email-finder';
    
    if (!firstName || !lastName || !companyDomain) {
      throw new Error('Missing required parameters');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': LEADMAGIC_API_KEY
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        domain: companyDomain
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return {
      ...data,
      status: data.status || 'success',
      message: data.message || 'Email found successfully',
      email: data.email || '',
      first_name: firstName,
      last_name: lastName,
      company_domain: companyDomain
    };
  } catch (error) {
    throw error;
  }
}

router.post('/find', express.json(), async (req, res) => {
  try {
    const { firstName, lastName, companyDomain } = req.body;

    if (!firstName || !lastName || !companyDomain) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters. Please provide firstName, lastName, and companyDomain.',
        error: 'Missing required parameters',
        email: '',
        first_name: firstName || '',
        last_name: lastName || '',
        company_domain: companyDomain || ''
      });
    }

    const result = await findEmail(firstName, lastName, companyDomain);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to find email address',
      error: error.message,
      email: '',
      first_name: req.body.firstName || '',
      last_name: req.body.lastName || '',
      company_domain: req.body.companyDomain || ''
    });
  }
});

export default router;