import fetch from 'node-fetch';

export const handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle OPTIONS request (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'Invalid request body',
          error: 'Failed to parse JSON'
        })
      };
    }

    const { firstName, lastName, companyDomain } = body;

    // Log incoming request data
    console.log('Request data:', { firstName, lastName, companyDomain });

    // Validate required parameters
    if (!firstName || !lastName || !companyDomain) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'Missing required parameters. Please provide firstName, lastName, and companyDomain.',
          error: 'Missing required parameters',
          email: '',
          first_name: firstName || '',
          last_name: lastName || '',
          company_domain: companyDomain || ''
        })
      };
    }

    // Check if API key is present
    const apiKey = process.env.LEADMAGIC_API_KEY || '4f18d12a98720d1af9b86d90d568f405';
    if (!apiKey) {
      console.error('API Key is missing');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          status: 'error',
          message: 'API configuration error',
          error: 'Missing API key',
          email: '',
          first_name: firstName,
          last_name: lastName,
          company_domain: companyDomain
        })
      };
    }

    // Log API key presence (don't log the actual key)
    console.log('API Key present:', !!apiKey);

    // Make request to LeadMagic API
    const apiResponse = await fetch('https://api.leadmagic.io/email-finder', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        domain: companyDomain
      })
    });

    // Log API response status
    console.log('API Response status:', apiResponse.status);

    const data = await apiResponse.json();

    // Log API response data (without sensitive information)
    console.log('API Response status:', data.status);

    if (!apiResponse.ok) {
      throw new Error(data.message || `API Error: ${apiResponse.status}`);
    }

    return {
      statusCode: 200,
      headers,
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
    // Log any errors
    console.error('Function error:', error);

    return {
      statusCode: 500,
      headers,
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
