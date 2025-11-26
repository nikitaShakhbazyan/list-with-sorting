import { PaginatedResponse, State, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClient {
  static async getElements(page: number = 1, limit: number = 20, filter?: string): Promise<PaginatedResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filter) {
      params.append('filter', filter);
    }

    const response = await fetch(`${API_URL}/api/elements?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch elements');
    }
    return response.json();
  }

  static async getSelected(page: number = 1, limit: number = 20, filter?: string): Promise<PaginatedResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filter) {
      params.append('filter', filter);
    }

    const response = await fetch(`${API_URL}/api/selected?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch selected elements');
    }
    return response.json();
  }

  static async selectElement(id: number): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to select element');
    }

    return response.json();
  }

  static async deselectElement(id: number): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/deselect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to deselect element');
    }

    return response.json();
  }

  static async updateSortOrder(order: number[]): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/sort`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update sort order');
    }

    return response.json();
  }

  static async addElement(id: number): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/api/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add element');
    }

    return response.json();
  }

  static async getState(): Promise<State> {
    const response = await fetch(`${API_URL}/api/state`);
    if (!response.ok) {
      throw new Error('Failed to fetch state');
    }
    return response.json();
  }
}
