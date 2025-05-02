import React from 'react';
import { Outlet } from 'react-router-dom'; // Quan trọng: để render trang con
import Header from './Header'; 
import Footer from './Footer';

function Layout() {
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      {/* Thẻ <main> bao bọc Outlet để áp dụng class chung nếu cần */}
      <main className="main-content">
        <Outlet /> {/* Nội dung của trang con sẽ được render ở đây */}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;