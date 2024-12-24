const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { firstName, lastName, companyDomain } = JSON.parse(event.body);

    // Validate required parameters
    if (!firstName || !lastName || !companyDomain) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: 'error',
          message: 'Missing required parameters. Please provide firstName, lastName, and companyDomain.',
          error: 'Missing required parameters',
          email: '',
          first_name: firstName || '',
          last_name: lastName || '',
          company_domain: companyDomain || ''
        }),
      };
    }

    // Make request to LeadMagic API
    const response = await fetch('https://api.leadmagic.io/email-finder', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': process.env.LEADMAGIC_API_KEY
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
      statusCode: 200,
      body: JSON.stringify({
        ...data,
        status: data.status || 'success',
        message: data.message || 'Email found successfully',
        email: data.email || '',
        first_name: firstName,
        last_name: lastName,
        company_domain: companyDomain
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: error.message || 'Failed to find email address',
        error: error.message,
        email: '',
        first_name: '',
        last_name: '',
        company_domain: ''
      })
    };
  }
};
