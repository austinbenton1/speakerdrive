const PILOTERR_BASE_URL = 'https://piloterr.com/api/v2';

interface PiloterrConfig {
  apiKey: string;
  timeout?: number;
}

class PiloterrAPI {
  private apiKey: string;
  private timeout: number;

  constructor(config: PiloterrConfig) {
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000; // Default timeout 30s
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${PILOTERR_BASE_URL}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`Piloterr API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch from Piloterr: ${error.message}`);
      }
      throw error;
    }
  }

  // Email finder endpoint
  async findEmail(params: {
    firstName?: string;
    lastName?: string;
    domain: string;
  }) {
    return this.makeRequest('/email/finder', params as Record<string, string>);
  }

  // Company domain finder endpoint
  async findCompanyDomain(params: {
    name: string;
    location?: string;
  }) {
    return this.makeRequest('/company/domain/finder', params as Record<string, string>);
  }

  // Add more endpoint methods as needed...
}

// Export a function to create the API instance
export const createPiloterrAPI = (config: PiloterrConfig) => new PiloterrAPI(config);

// Example usage:
/*
const piloterr = createPiloterrAPI({ 
  apiKey: 'your-api-key',
  timeout: 5000 // optional, in milliseconds
});

// Find email
const emailResult = await piloterr.findEmail({
  firstName: 'John',
  lastName: 'Doe',
  domain: 'company.com'
});

// Find company domain
const domainResult = await piloterr.findCompanyDomain({
  name: 'Company Name',
  location: 'San Francisco' // optional
});
*/
