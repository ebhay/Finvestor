import React from 'react';

const StockDetail = ({ stock }) => {
    if (!stock) {
        return <div>No stock selected</div>;
    }

    return (
        <div className="stock-detail">
            <h2>{stock.name}</h2>
            <p><strong>Symbol:</strong> {stock.symbol}</p>
            <p><strong>Price:</strong> ${stock.price}</p>
            <p><strong>Market Cap:</strong> ${stock.marketCap}</p>
            <p><strong>Volume:</strong> {stock.volume}</p>
            <p><strong>Description:</strong> {stock.description}</p>
        </div>
    );
};

export default StockDetail;