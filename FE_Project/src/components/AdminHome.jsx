import React, { useState } from 'react';
import axios from 'axios';
import './AdminHome.css';
function AdminHome() {
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleUpdateRoom = async () => {
    try {
        // Validate startTime and endTime
        if (!/^\d{1,2}:\d{2}$/.test(startTime) || !/^\d{1,2}:\d{2}$/.test(endTime)) {
            alert('Giờ bắt đầu và kết thúc phải theo định dạng HH:mm (VD: 08:30).');
            return;
        }

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        if (
            startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59 ||
            endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59 ||
            startHour > endHour || (startHour === endHour && startMinute >= endMinute)
        ) {
            alert('Giờ bắt đầu phải nhỏ hơn giờ kết thúc và trong khoảng 00:00 - 23:59.');
            return;
        }

        const response = await axios.post('http://localhost:5000/api/spaces', {
            location,
            startTime,
            endTime,
        });

        console.log('Room created successfully:', response.data);
        alert('Phòng đã được thêm thành công!');
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Có lỗi xảy ra khi thêm phòng!');
    }
};

  return (
    <>
      <div className="content-top">
        <h2 className="page-title">Thêm Phòng</h2>

        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">Vị trí</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="filter-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Nhập vị trí phòng (VD: Tòa H1 - P101)"
              />
            </div>
          </div>

          <div className="filter-group">
    <label className="filter-label">Giờ bắt đầu (HH:mm)</label>
    <div className="input-wrapper">
        <input
            type="time"
            className="filter-input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
        />
    </div>
</div>

<div className="filter-group">
    <label className="filter-label">Giờ kết thúc (HH:mm)</label>
    <div className="input-wrapper">
        <input
            type="time"
            className="filter-input"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
        />
    </div>
</div>
        </div>
      </div>

      <div className="spacer"></div>

      <div className="booking-btn-container">
        <button className="booking-btn" onClick={handleUpdateRoom}>
          Thêm Phòng
        </button>
      </div>
    </>
  );
}

export default AdminHome;