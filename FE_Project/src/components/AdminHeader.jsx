import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

function AdminHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.message === 'Người dùng đã đăng nhập') {
            setIsLoggedIn(true);
            setUsername(data.username);
          } else {
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/auth/log_out', {
        method: 'POST',
        credentials: 'include',
      });
      setIsLoggedIn(false);
      setUsername('');
      setShowDropdown(false);
      // Chuyển hướng về trang đăng nhập và reload để làm sạch state
      navigate('/login', { replace: true });
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      setIsLoggedIn(false);
      setUsername('');
      setShowDropdown(false);
      navigate('/login', { replace: true });
      setTimeout(() => window.location.reload(), 100);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">S3-MRS Admin</Link>
        <nav className="nav-menu">
          <NavLink to="/admin" end>Tạo phòng</NavLink>
          <NavLink to="/admin/check">Kiểm tra</NavLink>
        </nav>
        <div className="user-profile">
          {isLoggedIn ? (
            <>
              <span className="username">{username}</span>
              <span
                className="user-icon"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                ☰
              </span>
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link to="/account" className="dropdown-item" onClick={() => setShowDropdown(false)}>Quản lý tài khoản</Link>
                  <button onClick={handleLogout} className="dropdown-item">Đăng xuất</button>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="user-icon">👤</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;