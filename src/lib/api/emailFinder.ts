interface EmailFinderParams {
  query: string;
  company_domain: string;
}

export interface EmailFinderRequest {
  firstName: string;
  lastName: string;
  companyDomain: string;
}

export interface EmailFinderResponse {
  email: string;
  first_name: string;
  last_name: string;
  company_domain: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

const LEADMAGIC_API_KEY = '4f18d12a98720d1af9b86d90d568f405';

export async function findEmail(data: EmailFinderRequest): Promise<EmailFinderResponse> {
  try {
    const requestBody = {
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      domain: data.companyDomain.trim().toLowerCase()
    };

    const response = await fetch('https://api.leadmagic.io/email-finder', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': LEADMAGIC_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        status: 'error',
        message: responseData.message || 'Failed to find email address',
        email: '',
        first_name: data.firstName,
        last_name: data.lastName,
        company_domain: data.companyDomain
      };
    }

    if (!responseData || !responseData.email) {
      return {
        status: 'error',
        message: 'No email address found',
        email: '',
        first_name: data.firstName,
        last_name: data.lastName,
        company_domain: data.companyDomain
      };
    }

    return {
      ...responseData,
      status: 'success',
      message: 'Email found successfully',
      first_name: data.firstName,
      last_name: data.lastName,
      company_domain: data.companyDomain
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