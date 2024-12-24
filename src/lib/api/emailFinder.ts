interface EmailFinderParams {
  query: string;
  company_domain: string;
}

export interface EmailFinderResponse {
  email: string;
  status: 'success' | 'error' | 'warning' | 'catch_all' | 'valid' | 'not_found';
  message: string;
  first_name: string;
  last_name: string;
  company_domain: string;
}

export interface EmailFinderRequest {
  firstName: string;
  lastName: string;
  companyDomain: string;
}

export async function findEmail(data: EmailFinderRequest): Promise<EmailFinderResponse> {
  try {
    // Use relative URL that works in both dev and production
    const endpoint = import.meta.env.PROD 
      ? '/.netlify/functions/email-finder'
      : '/api/email-finder/find';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        companyDomain: data.companyDomain.trim().toLowerCase()
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        ...responseData,
        status: 'error',
        message: responseData.message || 'Failed to find email address',
        email: '',
        first_name: data.firstName,
        last_name: data.lastName,
        company_domain: data.companyDomain
      };
    }

    return {
      ...responseData,
      status: 'success',
      message: 'Email found successfully'
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to find email address',
      email: '',
      first_name: data.firstName,
      last_name: data.lastName,
      company_domain: data.companyDomain
    };
  }
}