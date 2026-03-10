import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySelector: React.FC = () => {
  const { currency, setCurrencyOnServer, isLoading, error } = useCurrency();

  const handleCurrencyChange = async (newCurrency: 'INR' | 'USD') => {
    try {
      await setCurrencyOnServer(newCurrency);
    } catch (error) {
      console.error('Failed to change currency:', error);
      // Error is already set in context
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="currency-select" className="text-sm font-medium text-gray-700">
        Currency:
      </label>
      <select
        id="currency-select"
        value={currency}
        onChange={(e) => handleCurrencyChange(e.target.value as 'INR' | 'USD')}
        disabled={isLoading}
        className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="INR">₹ INR</option>
        <option value="USD">$ USD</option>
      </select>
      {isLoading && <span className="text-xs text-gray-500">Updating...</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default CurrencySelector;
