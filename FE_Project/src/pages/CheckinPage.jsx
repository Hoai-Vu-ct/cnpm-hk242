import React from 'react';
import { Link } from 'react-router-dom'; // Cho breadcrumb

function CheckinPage() {
  // Thêm state để lấy thông tin phòng và thời gian hiệu lực QR
  const roomName = "P.101 H1"; // Ví dụ
  const qrExpiryTime = "05:00"; // Ví dụ

  return (
    <> {/* Dùng Fragment */}
      {/* Phần content-top chứa tất cả nội dung chính của trang checkin */}
      <div className="content-top">
        <div className="breadcrumb" style={{ textAlign: 'center', marginBottom: '15px' }}> {/* Căn giữa breadcrumb nếu muốn */}
          <Link to="/">Trang chủ</Link> &gt; Check in
        </div>

        {/* Sử dụng class đã được căn giữa trong CSS (hoặc style trực tiếp nếu cần) */}
        <div className="instruction-text">
          <p>Phòng: {roomName}</p> {/* Hiển thị động */}
          <p>Vui lòng quét mã để check in</p>
        </div>

        {/* Sử dụng class đã được căn giữa trong CSS */}
        <div className="qr-code-container">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=S3MRS-CheckIn-${roomName}`} alt="QR Code Check-in" className="qr-code" />
        </div>

        {/* Sử dụng class đã được căn giữa trong CSS */}
        <p className="additional-info">
          Qr này có hiệu lực trong: {qrExpiryTime}
        </p>
      </div> {/* Kết thúc div.content-top */}

      {/* div spacer nằm sau content-top, đúng như cấu trúc HTML gốc */}
      <div className="spacer"></div>
    </>
  );
}

export default CheckinPage;