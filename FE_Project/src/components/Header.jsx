import React from 'react';
// Import Link/NavLink từ react-router-dom sau khi cài đặt
import { Link, NavLink } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">S3-MRS</Link> {/* Dùng Link cho logo */}
        <nav className="nav-menu">
          {/* Dùng NavLink để có class 'active' tự động */}
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/spaces">Không gian phòng học</NavLink> {/* Cập nhật path nếu cần */}
          <NavLink to="/checkin">Check in</NavLink>
          <NavLink to="/history">Lịch sử đặt phòng</NavLink> {/* Cập nhật path nếu cần */}
        </nav>
        <div className="user-profile">
          <span className="user-icon">☰</span>
          {/* Chuyển biểu tượng người dùng thành Link đến trang đăng nhập */}
          <Link to="/login" className="user-icon">👤</Link>
        </div>
      </div>
    </header>
  );
}

export default Header;