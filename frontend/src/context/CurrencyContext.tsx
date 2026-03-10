import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CurrencyType = 'INR' | 'USD';

interface CurrencyContextType {
  currency: CurrencyType;
  setCurrencyLocally: (currency: CurrencyType) => void;
  setCurrencyOnServer: (currency: CurrencyType) => Promise<void>;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
  error: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyType>('INR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage or fetch from server
  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          // Fetch currency from backend
          const response = await fetch('http://localhost:5000/api/auth/currency', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Currency fetch response:', data);
            const userCurrency: CurrencyType = data?.data?.currency || 'INR';
            console.log('Setting currency to:', userCurrency);
            setCurrency(userCurrency);
            localStorage.setItem('currency', userCurrency);
          } else {
            console.warn('Failed to fetch currency, status:', response.status);
            // Fallback to localStorage
            const savedCurrency = localStorage.getItem('currency') as CurrencyType | null;
            setCurrency(savedCurrency || 'INR');
          }
        } else {
          // No token, use localStorage or default
          const savedCurrency = localStorage.getItem('currency') as CurrencyType | null;
          setCurrency(savedCurrency || 'INR');
        }
      } catch (err) {
        console.error('Failed to initialize currency:', err);
        const savedCurrency = localStorage.getItem('currency') as CurrencyType | null;
        setCurrency(savedCurrency || 'INR');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCurrency();
  }, []);

  const setCurrencyLocally = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const setCurrencyOnServer = async (newCurrency: CurrencyType) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Updating currency to:', newCurrency);
      
      const response = await fetch('http://localhost:5000/api/auth/currency', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currency: newCurrency }),
      });

      console.log('Currency update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Currency update error:', errorData);
        throw new Error(errorData?.message || 'Failed to update currency on server');
      }

      const responseData = await response.json();
      console.log('Currency update success:', responseData);
      
      // Update local state and localStorage
      setCurrencyLocally(newCurrency);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to set currency on server:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    const currencyConfig = {
      INR: {
        symbol: '₹',
        locale: 'en-IN',
        decimals: 0,
      },
      USD: {
        symbol: '$',
        locale: 'en-US',
        decimals: 2,
      },
    };

    const config = currencyConfig[currency];
    const formatted = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);

    return `${config.symbol}${formatted}`;
  };

  const value: CurrencyContextType = {
    currency,
    setCurrencyLocally,
    setCurrencyOnServer,
    formatCurrency,
    isLoading,
    error,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
