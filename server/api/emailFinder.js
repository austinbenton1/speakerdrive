import express from 'express';

const router = express.Router();

async function findEmail(query, companyDomain) {
  try {
    // Encode parameters individually
    const encodedQuery = encodeURIComponent(query);
    const encodedDomain = encodeURIComponent(companyDomain);
    
    const url = `https://piloterr.com/api/v2/email/finder?query=${encodedQuery}&company_domain=${encodedDomain}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '64c79e28-4b4d-477a-ab93-0d034affaecc',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to find email');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error finding email:', error);
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
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Failed to find email. Please try again.' 
    });
  }
});

export default router;