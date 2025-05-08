import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CheckinPage from './pages/CheckinPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RoomPage from './pages/RoomPage';
import HistoryPage from './pages/HistoryPage';
import AccountPage from './pages/AccountPage'; // Import trang AccountPage
import ForgotPage from './pages/ForgotPage';

// Import các trang khác nếu có

// import HistoryPage from './pages/HistoryPage';
// import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route cho trang Login (không dùng Layout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign_up" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPage />} />

        {/* Các routes dùng Layout chung (có Header/Footer) */}
        <Route path="/" element={<Layout />}>
        {/* Trang chủ sẽ được render khi path là "/" */}
        <Route index element={<HomePage />} />
        <Route path="checkin" element={<CheckinPage />} />
        {/* Thêm các route khác dùng Layout ở đây */}
        
        <Route path="room" element={<RoomPage />} />
        
        <Route path="history" element={<HistoryPage />} />
        <Route path="account" element={<AccountPage />} /> {/* Thêm route cho AccountPage */}

        </Route>

        {/* Route bắt các đường dẫn không khớp (404 Not Found) */}
        {/* { <Route path="*" element={<NotFoundPage />} /> } */}
      </Routes>
    </Router>
  );
}

export default App;