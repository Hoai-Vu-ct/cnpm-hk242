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
    // Lấy hostname động từ URL mà frontend đang được truy cập
    const dynamicHostname = "192.168.1.16"; 

    if (reservationId === "N/A" || userId === "N/A") {
      return "Lỗi: Thiếu thông tin đặt phòng hoặc người dùng để tạo QR.";
    }

    const backendPort = 5000; // Port của backend server
    // Tạo URL cho QR code sử dụng HTTP, hostname động, và port backend
    const qrUrl = `http://${dynamicHostname}:${backendPort}/api/checkin/qr?reservationId=${reservationId}&userId=${userId}`;
    
    console.log(`URL được tạo cho QR (từ window.location.hostname): ${qrUrl}`); 
    return qrUrl;
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
    if (reservationId === "N/A" || !reservationId || currentQrData.startsWith("Lỗi:")) { // Kiểm tra thêm reservationId === "N/A"
        return;
    }

    const intervalId = setInterval(async () => {
      try {
        // SỬA Ở ĐÂY: Gọi API để lấy trạng thái của đặt phòng cụ thể này bằng reservationId
        const response = await fetch(`http://localhost:5000/api/reservations/student/${userId}`); 
        
        if (!response.ok) {
          console.error("Lỗi polling kiểm tra trạng thái, status:", response.status, await response.text()); // Bỏ comment và log thêm text
          return;
        }
        const reservationsArray = await response.json(); // Đổi tên biến để rõ ràng hơn là một mảng
        
        // Tìm đặt phòng cụ thể trong mảng dựa trên reservationId
        const specificReservation = reservationsArray.find(
          (reservation) => reservation.reservationId === parseInt(reservationId, 10) // Chuyển reservationId từ state (string) sang số để so sánh
        );

        // Quan trọng: Kiểm tra xem specificReservation có tồn tại và có thuộc tính status không
        if (specificReservation && specificReservation.status && specificReservation.status.toLowerCase() === 'checkedin') {
          clearInterval(intervalId); 
          console.log('Đã check-in thành công! Đang chuyển hướng đến trang phòng...');
          setTimeout(() => {
            navigate('/room', { 
              state: { 
                reservationDetails: specificReservation, // Sử dụng thông tin đặt phòng đã tìm thấy
                roomName: roomName 
              } 
            });
          }, 1500); 
        } else if (specificReservation) {
          // Log trạng thái hiện tại nếu chưa phải 'checkedin' để debug
          console.log('Polling: Trạng thái hiện tại của đặt phòng:', specificReservation.status);
        } else {
          console.log(`Polling: Không tìm thấy đặt phòng với ID ${reservationId} cho người dùng ${userId}.`);
        }
      } catch (error) {
        console.error("Lỗi trong quá trình polling:", error); // Bỏ comment
      }
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(intervalId); 
  }, [reservationId, userId, navigate, currentQrData, roomName]); 

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
          {currentQrData && !currentQrData.startsWith("Lỗi:") ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentQrData)}`}
              alt="QR Code Check-in"
              className="qr-code"
            />
          ) : (
            <p>{currentQrData || "Đang tạo mã QR..."}</p> 
          )}
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