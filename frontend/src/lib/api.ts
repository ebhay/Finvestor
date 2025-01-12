// API utility functions with proper error handling
import toast from 'react-hot-toast';

interface ApiError {
  message: string;
  error?: string;
}

const handleApiError = (error: any) => {
  const message = error?.message || 'An unexpected error occurred';
  toast.error(message);
  throw error;
};

export const api = {
  async login(email: string, password: string) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      return data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async register(name: string, email: string, password: string) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      return data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getHoldings(token: string) {
    try {
      const response = await fetch('/api/stock', {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch holdings');
      return data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async queryStock(token: string, ticker: string, exchange: string) {
    try {
      const response = await fetch('/api/stock/query', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker, exchange }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch stock details');
      return data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async buyStock(token: string, ticker: string, exchange: string) {
    try {
      const response = await fetch('/api/stock/buy', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker, exchange }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to buy stock');
      return data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async sellStock(token: string, id: number) {
    try {
      const response = await fetch('/api/stock/sell', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to sell stock');
      return data;
    } catch (error) {
      handleApiError(error);
    }
  },
};