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
  const params = new URLSearchParams({ query, company_domain });
  const response = await fetch(`/api/email-finder/find?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.error || 'Failed to find email');
      } catch (errorText) {
      throw new Error(`Server Error: ${response.status} - ${errorText}`);
    }
  }

  const data = await response.json();
  return data;
}