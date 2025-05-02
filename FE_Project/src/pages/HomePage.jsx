import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  // State for form filters - could be expanded later for functionality
  const [roomType, setRoomType] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [useDate, setUseDate] = useState('');
  const [location, setLocation] = useState('');

  const handleBooking = () => {
    console.log('Booking requested with filters:', {
      roomType,
      timeSlot,
      useDate,
      location
    });
    // Add booking logic here
  };

  return (
    <> {/* Fragment bao ngoài cùng */}
      {/* Phần content-top chứa tiêu đề và các bộ lọc */}
      <div className="content-top">
        <h2 className="page-title">Trang chủ</h2>

        {/* Booking filters */}
        <div className="filters-container">
          {/* Filter Loại Phòng */}
          <div className="filter-group">
            <label className="filter-label">Loại Phòng</label>
            <div className="select-wrapper">
              <select 
                className="filter-select" 
                value={roomType} 
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="" disabled>Select Option</option>
                <option value="2">Phòng 2 người</option>
                <option value="4">Phòng 4 người</option>
                <option value="6">Phòng 6 người</option>
              </select>
            </div>
          </div>

          {/* Filter Khung giờ */}
          <div className="filter-group">
            <label className="filter-label">Khung giờ</label>
            <div className="select-wrapper">
              <select 
                className="filter-select" 
                value={timeSlot} 
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                <option value="" disabled>Select Option</option>
                <option value="7-9">7:00 - 9:00</option>
                <option value="9-11">9:00 - 11:00</option>
                <option value="13-15">13:00 - 15:00</option>
                <option value="15-17">15:00 - 17:00</option>
              </select>
            </div>
          </div>

          {/* Filter Ngày Sử Dụng */}
          <div className="filter-group">
            <label className="filter-label">Ngày Sử Dụng</label>
            <div className="select-wrapper">
              <select 
                className="filter-select" 
                value={useDate} 
                onChange={(e) => setUseDate(e.target.value)}
              >
                <option value="" disabled>Select Option</option>
                <option value="today">Hôm nay</option>
                <option value="tomorrow">Ngày mai</option>
                <option value="day_after">Ngày kia</option>
              </select>
            </div>
          </div>

          {/* Filter Vị trí */}
          <div className="filter-group">
            <label className="filter-label">Vị trí</label>
            <div className="select-wrapper">
              <select 
                className="filter-select" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="" disabled>Select Option</option>
                <option value="H1">Tòa H1</option>
                <option value="H2">Tòa H2</option>
                <option value="H3">Tòa H3</option>
                <option value="H6">Tòa H6</option>
              </select>
            </div>
          </div>
        </div> {/* Kết thúc div.filters-container */}
      </div> {/* Kết thúc div.content-top */}

      {/* Spacer để đẩy nút xuống dưới */}
      <div className="spacer"></div>

      {/* Booking button container */}
      <div className="booking-btn-container">
        <button className="booking-btn" onClick={handleBooking}>Đặt Phòng</button>
      </div>
    </>
  );
}

export default HomePage;