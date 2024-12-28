# FINVESTOR
FINVESTOR is a real-time portfolio tracker that allows users to monitor their investments, fetch live stock prices, calculate profits, and manage portfolios efficiently.

## Features
- User authentication with JWT
- Add, remove, and track stocks
- Real-time price updates via Google Finance
- Profit and portfolio value calculation
- API-based stock search and details
- Secure password updates and user deletion

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **API Requests**: Axios
- **Environment Variables**: dotenv

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/username/repository.git
   ```
2. Navigate to the project directory:
   ```bash
   cd repository
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure environment variables in `.env`:
   ```env
   DB_URI=mongodb+srv://username:password@cluster.mongodb.net/User
   JWT_SECRET=your_secret_key
   PORT=3000
   ```
5. Start the server:
   ```bash
   npm start
   ```

## Endpoints
### Authentication
- **POST /signup** - Create a new user
- **POST /signin** - Log in and receive JWT

### Portfolio Management
- **GET /dashboard** - View portfolio and profits
- **POST /buy** - Add stock to portfolio
- **POST /sell** - Sell stock and update profit

### Stock Info
- **GET /search/:ticker?exchange=NSE** - Fetch live stock data

### User Management
- **PUT /forgetpassword** - Update password
- **DELETE /user** - Delete account

## License
This project is licensed under the [MIT License](LICENSE).

