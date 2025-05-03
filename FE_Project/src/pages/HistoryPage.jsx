import React, { useState } from "react";

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("completed");

  const completedBookings = [
    {
      room: "H6-601",
      time: "2 giờ chiều, ngày 15 tháng 3 năm 2025",
      status: "Đã hoàn thành"
    },
    {
      room: "H6-603",
      time: "7 giờ sáng, ngày 15 tháng 3 năm 2025",
      status: "Đã hủy phòng"
    }
  ];

  const upcomingBookings = [
    {
      room: "H6-602",
      time: "9 giờ sáng, ngày 20 tháng 5 năm 2025",
      status: "Sắp tới"
    }
  ];

  const renderBookingItem = (booking, index) => (
    <div key={index} className="booking-item">
      <div className="booking-info">
        <strong>Sinh viên đã đặt phòng {booking.room}</strong>
        <p>Vào {booking.time}</p>
      </div>
      <div className="booking-status">{booking.status}</div>
    </div>
  );

  return (
    <div className="history-container">
      <div className="breadcrumb">
        <span className="breadcrumb-bold">Trang chủ</span> &rarr; Lịch sử đặt phòng
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
        <button
          className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
      </div>

      <div className="bookings-list">
        {activeTab === "completed"
          ? completedBookings.map(renderBookingItem)
          : upcomingBookings.map(renderBookingItem)}
      </div>
    </div>
  );
};

export default HistoryPage;
