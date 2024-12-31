// Stock price fetching utility
async function getStockPrice(ticker, exchange) {
    try {
        const url = `https://www.google.com/finance/quote/${ticker}:${exchange}`;
        const response = await axios.get(url);
        const html = response.data;

        const priceMatch = html.match(/<div[^>]*class="YMlKec fxKbKc"[^>]*>(.*?)<\/div>/);
        if (priceMatch && priceMatch[1]) {
            return priceMatch[1];
        } else {
            throw new Error(`Price not found for ${ticker}`);
        }
    } catch (error) {
        throw new Error(`Error fetching data for ${ticker}: ${error.message}`);
    }
}

// Dashboard Route
app.get("/dashboard", async (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: "Authorization token is required" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Calculate total portfolio value and profits
        let totalValue = 0;
        let totalProfit = 0;
        const holdings = [];

        for (const stock of user.stocks) {
            const currentPrice = await getStockPrice(stock.ticker, stock.exchange);
            const priceValue = parseFloat(currentPrice.match(/\d+(\.\d+)?/)[0]);
            
            const stockValue = priceValue;
            const profit = stockValue - stock.buyingPrice;
            
            holdings.push({
                name: stock.name,
                ticker: stock.ticker,
                buyingPrice: stock.buyingPrice,
                currentPrice: stockValue,
                profit: profit
            });

            totalValue += stockValue;
            totalProfit += profit;
        }

        res.json({
            holdings,
            totalValue,
            totalProfit,
            stockCount: user.stocks.length
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

// Search Stock Route
app.get("/search/:ticker", async (req, res) => {
    const { ticker } = req.params;
    const exchange = req.query.exchange || 'NSE';

    try {
        const url = `https://www.google.com/finance/quote/${ticker}:${exchange}`;
        const response = await axios.get(url);
        const html = response.data;

        const priceMatch = html.match(/<div[^>]*class="YMlKec fxKbKc"[^>]*>(.*?)<\/div>/);
        const nameMatch = html.match(/<div[^>]*class="zzDege"[^>]*>(.*?)<\/div>/);
        const highMatch = html.match(/52 week high<\/div><div[^>]*>(.*?)<\/div>/);
        const lowMatch = html.match(/52 week low<\/div><div[^>]*>(.*?)<\/div>/);

        const stockDetails = {
            ticker,
            exchange,
            name: nameMatch ? nameMatch[1] : 'N/A',
            currentPrice: priceMatch ? priceMatch[1] : 'N/A',
            yearHigh: highMatch ? highMatch[1] : 'N/A',
            yearLow: lowMatch ? lowMatch[1] : 'N/A'
        };

        res.json(stockDetails);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Error fetching stock details" });
    }
});

// Buy Stock Route
app.post("/buy", async (req, res) => {
    const token = req.headers.authorization;
    const { ticker, exchange } = req.body;

    if (!token) {
        return res.status(401).json({ error: "Authorization token is required" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.stocks.length >= 5) {
            return res.status(400).json({ error: "Portfolio limit reached (max 5 stocks)" });
        }

        // Get current stock price
        const priceData = await getStockPrice(ticker, exchange);
        const currentPrice = parseFloat(priceData.match(/\d+(\.\d+)?/)[0]);

        // Create new stock entry
        const newStock = {
            name: ticker,
            ticker,
            exchange,
            buyingPrice: currentPrice
        };

        user.stocks.push(newStock);
        await user.save();

        res.json({
            message: "Stock purchased successfully",
            stock: newStock
        });

    } catch (error) {
        console.error("Buy stock error:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

// Sell Stock Route
app.post("/sell", async (req, res) => {
    const token = req.headers.authorization;
    const { ticker } = req.body;

    if (!token) {
        return res.status(401).json({ error: "Authorization token is required" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const stockIndex = user.stocks.findIndex(s => s.ticker === ticker);
        if (stockIndex === -1) {
            return res.status(404).json({ error: "Stock not found in portfolio" });
        }

        // Calculate profit/loss
        const stock = user.stocks[stockIndex];
        const currentPriceData = await getStockPrice(ticker, stock.exchange);
        const currentPrice = parseFloat(currentPriceData.match(/\d+(\.\d+)?/)[0]);
        const profit = currentPrice - stock.buyingPrice;

        // Update user's total profit
        user.profit += profit;

        // Remove the stock from portfolio
        user.stocks.splice(stockIndex, 1);
        await user.save();

        res.json({
            message: "Stock sold successfully",
            profit,
            currentProfit: user.profit
        });

    } catch (error) {
        console.error("Sell stock error:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

// Portfolio value update interval (every 5 minutes)
setInterval(async () => {
    try {
        const users = await User.find({});
        for (const user of users) {
            let totalProfit = 0;
            for (const stock of user.stocks) {
                const currentPrice = await getStockPrice(stock.ticker, stock.exchange);
                const priceValue = parseFloat(currentPrice.match(/\d+(\.\d+)?/)[0]);
                totalProfit += (priceValue - stock.buyingPrice);
            }
            user.profit = totalProfit;
            await user.save();
        }
        console.log('Portfolio values updated');
    } catch (error) {
        console.error('Error updating portfolio values:', error);
    }
}, 300000); // 5 minutes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});