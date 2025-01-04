import React, { useEffect, useState } from 'react';

const StockList = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                const response = await fetch('https://api.example.com/stocks'); // Replace with your API endpoint
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setStocks(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStocks();
    }, []);

    if (loading) return <div>Loading stocks...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Stock List</h2>
            <ul>
                {stocks.map(stock => (
                    <li key={stock.id}>
                        {stock.name} - ${stock.price}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StockList;