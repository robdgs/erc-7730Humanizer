import axios, { AxiosInstance } from 'axios';

interface MultiBaaSConfig {
  apiUrl: string;
  apiKey: string;
}

class MultiBaaSClient {
  private client: AxiosInstance;

  constructor(config: MultiBaaSConfig) {
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async get<T>(endpoint: string, params?: any): Promise<T> {
    try {
      const response = await this.client.get<T>(endpoint, { params });
      return response.data;
    } catch (error: any) {
      console.error('MultiBaAS API Error:', error.message);
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.client.post<T>(endpoint, data);
      return response.data;
    } catch (error: any) {
      console.error('MultiBaAS API Error:', error.message);
      throw error;
    }
  }
}

export function createMultiBaaSClient(): MultiBaaSClient {
  const apiUrl = process.env.NEXT_PUBLIC_MULTIBAAS_API || 'https://api.multibaas.com';
  const apiKey = process.env.MULTIBAAS_API_KEY || '';

  if (!apiKey) {
    console.warn('MultiBaAS API key not configured');
  }

  return new MultiBaaSClient({
    apiUrl,
    apiKey,
  });
}

export default MultiBaaSClient;
