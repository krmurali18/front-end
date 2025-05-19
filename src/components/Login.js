import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    fetch('http://localhost:8080/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: email,
        password: password,
      }),
      credentials: 'include',
    })
      .then(response => {
        if (!response.ok) throw new Error('Invalid login credentials');
        return response.json();
      })
      .then(data => {
        localStorage.setItem('authToken', data.token);
        navigate('/dashboard');
      })
      .catch(() => setError('Login failed, please try again.'));
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <img src="/eylogo.png" alt="EY Logo" className="logo" />
        <h1 className="title">Resource Allocation Dashboard</h1>
      </header>

      {/* Login Form */}
      <div className="login-container">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Resource Allocation Dashboard. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
