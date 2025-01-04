import React from 'react';
import { Link } from 'react-router-dom';
import './styles/main.css';

const Home = () => {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to Our Stock Management App</h1>
                <p>Your one-stop solution for managing stocks and user authentication.</p>
            </header>
            <main className="home-main">
                <section className="home-auth">
                    <h2>Authenticate</h2>
                    <Link to="/login" className="home-link">Login</Link>
                    <Link to="/register" className="home-link">Register</Link>
                </section>
                <section className="home-stock">
                    <h2>Manage Stocks</h2>
                    <Link to="/stocks" className="home-link">View Stocks</Link>
                </section>
            </main>
            <footer className="home-footer">
                <p>&copy; {new Date().getFullYear()} Stock Management App</p>
            </footer>
        </div>
    );
};

export default Home;