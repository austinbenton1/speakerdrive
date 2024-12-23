export interface CompanyFinderRequest {
  profile_url?: string;
  company_domain: string;
  company_name: string;
}

interface CompanyHeadquarter {
  line1: string;
  city: string;
  geographicArea: string;
  country: string;
}

interface SimilarOrganization {
  logoResolutionResult: string;
  name: string;
  url: string;
  industry: string;
  headquarter: CompanyHeadquarter;
}

export interface CompanyFinderResponse {
  companyName: string;
  industry: string;
  websiteUrl: string;
  url: string;
  headquarter: CompanyHeadquarter;
  specialties: string[];
  employeeCount: number;
  similarOrganizations: SimilarOrganization[];
  logoResolutionResult: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

const LEADMAGIC_API_KEY = '4f18d12a98720d1af9b86d90d568f405';

export async function findCompany(data: CompanyFinderRequest): Promise<CompanyFinderResponse> {
  try {
    const requestBody: CompanyFinderRequest = {
      company_domain: data.company_domain.trim().toLowerCase(),
      company_name: data.company_name.trim()
    };

    if (data.profile_url?.trim()) {
      requestBody.profile_url = data.profile_url.trim();
    }

    const response = await fetch('https://api.leadmagic.io/company-search', {
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
        message: responseData.message || 'Failed to find company information',
        companyName: data.company_name,
        industry: '',
        websiteUrl: data.profile_url || '',
        url: '',
        headquarter: {
          line1: '',
          city: '',
          geographicArea: '',
          country: ''
        },
        specialties: [],
        employeeCount: 0,
        similarOrganizations: [],
        logoResolutionResult: ''
      };
    }

    if (!responseData || !responseData.companyName) {
      return {
        status: 'error',
        message: 'No company information found',
        companyName: data.company_name,
        industry: '',
        websiteUrl: data.profile_url || '',
        url: '',
        headquarter: {
          line1: '',
          city: '',
          geographicArea: '',
          country: ''
        },
        specialties: [],
        employeeCount: 0,
        similarOrganizations: [],
        logoResolutionResult: ''
      };
    }

    return {
      ...responseData,
      status: 'success',
      message: 'Company information found successfully'
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to find company information',
      companyName: data.company_name,
      industry: '',
      websiteUrl: data.profile_url || '',
      url: '',
      headquarter: {
        line1: '',
        city: '',
        geographicArea: '',
        country: ''
      },
      specialties: [],
      employeeCount: 0,
      similarOrganizations: [],
      logoResolutionResult: ''
    };
  }
}
