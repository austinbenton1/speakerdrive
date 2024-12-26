export interface RoleFinderRequest {
  company_name: string;
  company_domain: string;
  job_title: string;
}

export interface RoleFinderResponse {
  name: string;
  profile_url: string;
  message: string;
  credits_consumed: number;
  company_name: string;
  company_website: string;
  status: 'success' | 'error';
}

const LEADMAGIC_API_KEY = '4f18d12a98720d1af9b86d90d568f405';

export async function findRole(data: RoleFinderRequest): Promise<RoleFinderResponse> {
  try {
    const requestBody: RoleFinderRequest = {
      company_name: data.company_name.trim(),
      company_domain: data.company_domain.trim().toLowerCase(),
      job_title: data.job_title.trim()
    };

    const response = await fetch('https://api.leadmagic.io/role-finder', {
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
        name: '',
        profile_url: '',
        message: responseData.message || 'Failed to find role information',
        credits_consumed: 0,
        company_name: '',
        company_website: '',
        status: 'error'
      };
    }

    return {
      ...responseData,
      status: 'success'
    };
  } catch (error) {
    return {
      name: '',
      profile_url: '',
      message: error instanceof Error ? error.message : 'Failed to find role information',
      credits_consumed: 0,
      company_name: '',
      company_website: '',
      status: 'error'
    };
  }
}
