import express from 'express';
import 'dotenv/config';
import fetch from 'node-fetch';

const router = express.Router();

async function findEmail(query, companyDomain) {
  if (!process.env.PILOTERR_API_KEY) {
    throw new Error('PILOTERR_API_KEY environment variable is not set');
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const encodedDomain = encodeURIComponent(companyDomain);
    
    const url = `https://piloterr.com/api/v2/email/finder?query=${encodedQuery}&company_domain=${encodedDomain}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': process.env.PILOTERR_API_KEY,
      }
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Unexpected response type: ${contentType}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `API Error: ${response.status}`);
      } catch (e) {
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

router.get('/find', async (req, res) => {
  try {
    const { query, company_domain } = req.query;

    if (!query || !company_domain) {
      return res.status(400).json({ 
        error: 'Missing required parameters' 
      });
    }

    const result = await findEmail(query, company_domain);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Failed to find email. Please try again.' 
    });
  }
});

export default router;