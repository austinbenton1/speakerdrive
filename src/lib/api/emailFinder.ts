interface EmailFinderParams {
  query: string;
  company_domain: string;
}

interface EmailFinderResponse {
  email: string;
  status: 'valid' | 'invalid' | 'unknown';
  last_name: string;
  first_name: string;
  company_domain: string;
}

export async function findEmail({ query, company_domain }: EmailFinderParams): Promise<EmailFinderResponse> {
  try {
    const params = new URLSearchParams({ query, company_domain });
    const response = await fetch(`/api/email-finder/find?${params}`, {
      method: 'GET',
      credentials: 'include',
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