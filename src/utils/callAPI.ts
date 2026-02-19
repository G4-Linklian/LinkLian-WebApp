// utils/apiClient.ts

import { getRegistrationToken } from "./authToken";

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRequestOptions {
  method: RequestMethod;
  body?: any[];
  from: string;
}

// Helper function to build query string from object
function buildQueryString(params: Record<string, any>): string {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return query ? `?${query}` : '';
}

export async function fetchDataApi(
  method: string,
  endpoint: string,
  body: any = {}
): Promise<any> {

  const urls = process.env.NEXT_PUBLIC_BASE_URL;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
  const token = getRegistrationToken();

  if (!urls) {
    throw new Error('BACKEND_PATH environment variable is not set');
  }

  try {
    let url = `${urls}${basePath}/${endpoint}`;

    if (method === 'GET' && Object.keys(body).length > 0) {
      url += buildQueryString(body);
    }

    const isFormData = body instanceof FormData;

    const response = await fetch(url, {
      method,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body:
        method !== 'GET'
          ? isFormData
            ? body
            : JSON.stringify(body)
          : undefined,
    });

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("Server response is not JSON:", text);
      throw new Error(`Invalid JSON: ${text}`);
    }

  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

