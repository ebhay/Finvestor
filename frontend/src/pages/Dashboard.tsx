import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, DollarSign, Activity, LogOut, Search } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface Stock {
  name: string;
  buyingPrice: string;
  currentPrice: string;
  gain: string;
}

interface StockDetails {
  symbol: string;
  lastRefreshed: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [holdings, setHoldings] = useState<Stock[]>([]);
  const [totalGains, setTotalGains] = useState<string>('0');
  const [searchTicker, setSearchTicker] = useState('');
  const [searchExchange, setSearchExchange] = useState('NSE');
  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchHoldings();
    }
  }, [token]);

  const fetchHoldings = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await api.getHoldings(token);
      setHoldings(data.holdings || []);
      setTotalGains(data.totalGains || '0');
    } finally {
      setIsLoading(false);
    }
  };

  const searchStock = async () => {
    if (!token || !searchTicker || !searchExchange) {
      toast.error('Please enter a ticker symbol and select an exchange');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await api.queryStock(token, searchTicker, searchExchange);
      setStockDetails(data);
    } finally {
      setIsLoading(false);
    }
  };

  const buyStock = async () => {
    if (!token || !stockDetails) {
      toast.error('Please search for a stock first');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.buyStock(token, searchTicker, searchExchange);
      toast.success('Stock purchased successfully!');
      await fetchHoldings();
      setStockDetails(null);
      setSearchTicker('');
    } finally {
      setIsLoading(false);
    }
  };

  const sellStock = async (id: number) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      await api.sellStock(token, id);
      toast.success('Stock sold successfully!');
      await fetchHoldings();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-blue-400 w-6 h-6" />
            <span className="text-white font-bold text-xl">StockPro</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-400" />
              Stock Search
            </h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Ticker Symbol"
                value={searchTicker}
                onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                disabled={isLoading}
              />
              <select
                value={searchExchange}
                onChange={(e) => setSearchExchange(e.target.value)}
                className="px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                disabled={isLoading}
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
              <button
                onClick={searchStock}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {stockDetails && (
              <div className="bg-gray-700 rounded-lg p-4 mt-4 border border-gray-600">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">{stockDetails.symbol}</h3>
                  <button
                    onClick={buyStock}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Buying...' : 'Buy'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-gray-300">
                    <p>Open: ₹{stockDetails.open}</p>
                    <p>High: ₹{stockDetails.high}</p>
                  </div>
                  <div className="text-gray-300">
                    <p>Low: ₹{stockDetails.low}</p>
                    <p>Close: ₹{stockDetails.close}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-400" />
                Portfolio
              </h2>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className={`text-lg font-bold ${
                  parseFloat(totalGains) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ₹{totalGains}
                </span>
              </div>
            </div>

            {isLoading && holdings.length === 0 ? (
              <div className="text-center text-gray-400 py-8">Loading holdings...</div>
            ) : holdings.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No stocks in portfolio</div>
            ) : (
              <div className="space-y-4">
                {holdings.map((stock, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white">{stock.name}</h3>
                      <button
                        onClick={() => sellStock(index + 1)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Selling...' : 'Sell'}
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4">
                      <div className="text-gray-300">
                        <p>Buy: ₹{stock.buyingPrice}</p>
                      </div>
                      <div className="text-gray-300">
                        <p>Current: ₹{stock.currentPrice}</p>
                      </div>
                      <div className={stock.gain.startsWith('-') ? 'text-red-400' : 'text-green-400'}>
                        <p>Gain: ₹{stock.gain}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}