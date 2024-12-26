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

    // Handle 204 No Content specifically
    if (response.status === 204) {
      return {
        status: 'error',
        message: 'No company information found',
        companyName: data.company_name,
        industry: '',
        websiteUrl: data.company_domain,
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

    // Only try to parse JSON if we have content
    const responseData = response.status !== 204 ? await response.json() : null;

    if (!response.ok || !responseData) {
      return {
        status: 'error',
        message: (responseData && responseData.message) || 'Failed to find company information',
        companyName: data.company_name,
        industry: '',
        websiteUrl: data.company_domain,
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

    // Ensure all required properties exist with fallbacks
    return {
      status: 'success',
      message: responseData.message || '',
      companyName: responseData.companyName || data.company_name,
      industry: responseData.industry || '',
      websiteUrl: responseData.websiteUrl || data.company_domain,
      url: responseData.url || '',
      headquarter: {
        line1: responseData.headquarter?.line1 || '',
        city: responseData.headquarter?.city || '',
        geographicArea: responseData.headquarter?.geographicArea || '',
        country: responseData.headquarter?.country || ''
      },
      specialties: Array.isArray(responseData.specialties) ? responseData.specialties : [],
      employeeCount: responseData.employeeCount || 0,
      similarOrganizations: Array.isArray(responseData.similarOrganizations) 
        ? responseData.similarOrganizations.map((org: any) => ({
            logoResolutionResult: org.logoResolutionResult || '',
            name: org.name || '',
            url: org.url || '',
            industry: org.industry || '',
            headquarter: {
              line1: org.headquarter?.line1 || '',
              city: org.headquarter?.city || '',
              geographicArea: org.headquarter?.geographicArea || '',
              country: org.headquarter?.country || ''
            }
          }))
        : [],
      logoResolutionResult: responseData.logoResolutionResult || ''
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to find company information',
      companyName: data.company_name,
      industry: '',
      websiteUrl: data.company_domain,
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
