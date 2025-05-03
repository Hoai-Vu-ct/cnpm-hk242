import React from "react";

const RoomPage = () => {
  return (
    <div className="main-content">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Trang chủ</span> → <span>Không gian phòng học</span>
      </div>

      {/* Welcome Message */}
      <h2 className="page-title">
        Chào mừng đến với phòng H6-601, Username
      </h2>

      {/* Main Content */}
      <div className="roompage-content">
        {/* Images Section */}
        <div className="room-images">
          <div className="main-image"></div>
          <div className="small-image"></div>
          <div className="small-image more-photos">
            <strong>+2</strong>
            <span>More Photos</span>
          </div>
        </div>

        {/* Room Info Box */}
        <div className="info-box">
          <h3>Thời gian sử dụng</h3>
          <p className="time-range">15:00 - 17:00</p>
          <p className="remaining-time">Thời gian còn lại: 30 phút</p>
          <button className="booking-btn">Trả phòng</button>
          <div className="info-links">
            <span>📋 Chính sách sử dụng</span>
            <span>📞 Hỗ trợ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;