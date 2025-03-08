import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/Login', {
        email,
        password,
      });

      // On success, save token and user info to localStorage or state
      localStorage.setItem('token', response.data.token); // Save JWT Token
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Save user data

      setSuccessMessage(response.data.message); // "Login successful"

      // Redirect to Home page after successful login
      setTimeout(() => {
        navigate('/home'); // Adjust the route based on your setup
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response ? error.response.data : 'An error occurred');
      setSuccessMessage('');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <div className="register-link">
        <p>Don't have an account? <a href="/register">Register here</a></p>
      </div>
    </div>
  );
};

export default Login;
