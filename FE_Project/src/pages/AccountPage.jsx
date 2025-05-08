import React, { useState, useEffect } from 'react';
import '../styles/AccountPage.css'; // Import CSS cho trang AccountPage

function AccountPage() {
  const [userInfo, setUserInfo] = useState({ CCCD: '', username: '', email: '' });
  const [CCCD, setCCCD] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Gọi API để lấy thông tin người dùng
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://localhost:5000/user/info', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data); // Giả sử API trả về { CCCD, username, email }
          setCCCD(data.CCCD); // Đảm bảo CCCD luôn viết hoa
          setName(data.username);
          setEmail(data.email);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/user/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CCCD: CCCD, username: name, email }), // Đảm bảo CCCD gửi lên luôn viết hoa
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update account information.');
      }

      setMessage('Account information updated successfully.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('New password and confirm password do not match.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/change_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to change password.');
      }

      setMessage('Password changed successfully.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="account-page">
      <h1>Account Management</h1>

      {message && <div className="message">{message}</div>}

      {/* Phần hiển thị thông tin người dùng */}
      <div className="user-info">
        <h2>User Information</h2>
        <p><strong>CCCD:</strong> {userInfo.CCCD}</p> {/* Hiển thị CCCD viết hoa */}
        <p><strong>Username:</strong> {userInfo.username}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
      </div>

      {/* Phần đổi thông tin và đổi mật khẩu */}
      <div className="form-container">
        <form onSubmit={handleUpdateInfo} className="form-box">
          <h2>Update Account Information</h2>
          <div className="input-group">
            <label htmlFor="CCCD">CCCD</label>
            <input
              type="text"
              id="CCCD"
              onChange={(e) => setCCCD(e.target.value)} // Đảm bảo CCCD luôn viết hoa khi nhập
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">Update Info</button>
        </form>

        <form onSubmit={handleChangePassword} className="form-box">
          <h2>Change Password</h2>
          <div className="input-group">
            <label htmlFor="current-password">Current Password</label>
            <input
              type="password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
}

export default AccountPage;