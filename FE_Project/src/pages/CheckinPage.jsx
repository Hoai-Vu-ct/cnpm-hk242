import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const QR_EXPIRY_SECONDS = 5 * 60; // 5 phút
const POLLING_INTERVAL_MS = 3000; // Cho polling (nếu bạn đang dùng)

function CheckinPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingDetails = location.state || {};
  const roomName = bookingDetails.roomName || "Không rõ phòng";
  const reservationId = bookingDetails.reservationId || "N/A";
  const userId = bookingDetails.userId || "N/A";

  const generateQrData = useCallback(() => {
    const timestamp = Date.now();
    const currentHostname = 'https://live-newt-neatly.ngrok-free.app';

    if (reservationId === "N/A" || userId === "N/A") {
      return "Lỗi: Thiếu thông tin đặt phòng hoặc người dùng để tạo QR.";
    }

    console.log(`Hostname được sử dụng cho QR URL: ${currentHostname}`);

    return `${currentHostname}/api/checkin/qr?reservationId=${reservationId}&userId=${userId}`;
  }, [reservationId, userId]);

  const [timeLeft, setTimeLeft] = useState(QR_EXPIRY_SECONDS);
  const [currentQrData, setCurrentQrData] = useState("");

  useEffect(() => {
    if (reservationId !== "N/A" && userId !== "N/A") {
      setCurrentQrData(generateQrData());
    } else {
      setCurrentQrData("Lỗi: Không thể tạo QR do thiếu thông tin.");
    }
    setTimeLeft(QR_EXPIRY_SECONDS);
  }, [reservationId, userId, generateQrData]);

  useEffect(() => {
    if (reservationId === "N/A" || userId === "N/A" || currentQrData.startsWith("Lỗi:")) {
      return;
    }

    if (timeLeft <= 0) {
      setCurrentQrData(generateQrData());
      setTimeLeft(QR_EXPIRY_SECONDS);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, reservationId, userId, generateQrData, currentQrData]);

  useEffect(() => {
    if (reservationId === "N/A" || !reservationId || currentQrData.startsWith("Lỗi:")) {
      return;
    }

    /*
    const currentHostnameForPolling = window.location.hostname;
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`http://${currentHostnameForPolling}:5000/api/reservations/${reservationId}`);
        if (!response.ok) {
          console.error("Lỗi polling, status:", response.status);
          return;
        }
        const data = await response.json();
        if (data && data.status && data.status.toLowerCase() === 'checkedin') {
          clearInterval(intervalId);
          console.log('Đã check-in thành công, đang chuyển hướng...');
          navigate('/');
        }
      } catch (error) {
        console.error("Lỗi trong quá trình polling:", error);
      }
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId);
    */
  }, [reservationId, navigate, currentQrData]);

  const formatTime = (totalSeconds) => {
    if (totalSeconds < 0) return "00:00";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (reservationId === "N/A" || userId === "N/A") {
    return (
      <div
        className="content-top"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '20px',
          fontSize: '1.15em',
          minHeight: '50vh'
        }}
      >
        <p style={{ marginBottom: '15px' }}>Không có đủ thông tin đặt phòng hoặc người dùng để check-in.</p>
        <Link to="/history">Quay lại lịch sử đặt phòng</Link>
      </div>
    );
  }

  return (
    <>
      <div className="content-top">
        <div className="breadcrumb" style={{ textAlign: 'center', marginBottom: '15px' }}>
          <Link to="/">Trang chủ</Link> &gt; Check in
        </div>
        <div className="instruction-text">
          <p>Phòng: {roomName}</p>
          <p>ID Đặt phòng: {reservationId}</p>
          <p>ID Người dùng: {userId}</p>
          <p>Vui lòng quét mã để check in</p>
        </div>
        <div className="qr-code-container">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentQrData)}`}
            alt="QR Code Check-in"
            className="qr-code"
          />
        </div>
        <p className="additional-info">
          QR này có hiệu lực trong: {formatTime(timeLeft)}
        </p>
      </div>
      <div className="spacer"></div>
    </>
  );
}

export default CheckinPage;