import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ForgotPage.css'; // Import CSS cho trang AccountPage


function ForgotPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Gọi API quên mật khẩu
      const response = await fetch('http://localhost:5000/auth/forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include', // Đảm bảo cookie được gửi kèm
      });

      if (!response.ok) {
        throw new Error('Failed to send reset password email.');
      }

      setMessage('A reset password email has been sent to your email address.');
      setTimeout(() => {
        navigate('/login'); // Chuyển hướng về trang đăng nhập sau 3 giây
      }, 3000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-page-container">
      <div className="forgot-container">
        <h1>Forgot Password</h1>

        {message && <div className="message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="forgot-button" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPage;