import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Gọi API để kiểm tra trạng thái đăng nhập
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/me', {
          method: 'GET',
          credentials: 'include', // Đảm bảo cookie được gửi kèm
        });

        if (response.ok) {
          const data = await response.json();
          if(data.message === 'Người dùng đã đăng nhập') {
            setIsLoggedIn(true);
            setUsername(data.username); // Giả sử API trả về tên người dùng
          }
        

        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    // Xử lý đăng xuất
    try {
      await fetch('http://localhost:5000/auth/log_out', {
        method: 'POST',
        credentials: 'include', // Đảm bảo cookie được gửi kèm

      });
      setIsLoggedIn(false);
      setUsername('');
      setShowDropdown(false);
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">S3-MRS</Link>
        <nav className="nav-menu">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/room">Không gian phòng học</NavLink>
          <NavLink to="/history">Lịch sử đặt phòng</NavLink>
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
                  <Link to="/account" className="dropdown-item">Quản lý tài khoản</Link>
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

export default Header;