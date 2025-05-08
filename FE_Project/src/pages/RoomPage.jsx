import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

// URL ngrok của bạn, đảm bảo nó đang chạy và trỏ đúng đến backend
const NGROK_BASE_URL = 'https://live-newt-neatly.ngrok-free.app'; // Hoặc lấy từ một file config chung

const RoomPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy thông tin từ state được truyền qua navigate
  const { reservationDetails, roomName: passedRoomName } = location.state || {};

  const [remainingTime, setRemainingTime] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  // Sử dụng useMemo để chỉ tính toán lại khi reservationDetails thay đổi
  const roomDisplayName = useMemo(() => passedRoomName || reservationDetails?.space?.location || "Không rõ phòng", [passedRoomName, reservationDetails]);
  const studentName = useMemo(() => reservationDetails?.user?.name || "Người dùng", [reservationDetails]); // Giả sử có thông tin user trong reservationDetails

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "N/A";
    }
  };

  const startTime = useMemo(() => formatTime(reservationDetails?.startTime), [reservationDetails]);
  const endTime = useMemo(() => formatTime(reservationDetails?.endTime), [reservationDetails]);

  useEffect(() => {
    if (!reservationDetails || !reservationDetails.endTime) {
      setRemainingTime("Không xác định");
      return;
    }

    const calculateRemainingTime = () => {
      const now = new Date();
      const end = new Date(reservationDetails.endTime);
      const diffMs = end - now;

      if (diffMs <= 0) {
        setRemainingTime("Đã hết giờ");
        // Có thể tự động checkout ở đây nếu muốn
        return 0; // Trả về 0 để dừng interval
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      let timeString = "";
      if (hours > 0) timeString += `${hours} giờ `;
      if (minutes > 0 || hours > 0) timeString += `${minutes} phút `; // Hiển thị phút nếu có giờ hoặc phút > 0
      timeString += `${seconds} giây`;
      
      setRemainingTime(timeString.trim());
      return diffMs;
    };

    const initialDiff = calculateRemainingTime();
    if (initialDiff <= 0) return; // Không đặt interval nếu đã hết giờ

    const timerId = setInterval(() => {
      if (calculateRemainingTime() <= 0) {
        clearInterval(timerId);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [reservationDetails]);

  const handleCheckout = async () => {
    if (!reservationDetails || !reservationDetails.reservationId) {
      setCheckoutMessage("Lỗi: Không tìm thấy thông tin đặt phòng để trả phòng.");
      return;
    }

    setIsCheckingOut(true);
    setCheckoutMessage('');

    try {
      const response = await fetch(`${NGROK_BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId: reservationDetails.reservationId }),
      });

      const result = await response.json();

      if (response.ok) {
        setCheckoutMessage("Trả phòng thành công! Đang chuyển hướng...");
        setTimeout(() => {
          navigate('/history'); // Hoặc trang chủ
        }, 2000);
      } else {
        setCheckoutMessage(`Lỗi trả phòng: ${result.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API trả phòng:", error);
      setCheckoutMessage("Lỗi kết nối khi trả phòng. Vui lòng thử lại.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Nếu không có thông tin đặt phòng (ví dụ: truy cập trực tiếp URL)
  if (!reservationDetails) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Không có thông tin phòng</h2>
        <p>Vui lòng check-in một phòng để xem thông tin chi tiết.</p>
        <Link to="/">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> → <span>Không gian phòng học</span>
      </div>

      <h2 className="page-title">
        Chào mừng đến với phòng {roomDisplayName}, {studentName}!
      </h2>

      <div className="roompage-content">
        <div className="room-images">
          {/* Các ảnh này có thể được lấy động nếu có URL trong reservationDetails.space */}
          <div className="main-image">{/* <img src={reservationDetails?.space?.mainImageUrl} alt="Main room view"/> */}</div>
          <div className="small-image">{/* <img src={reservationDetails?.space?.thumb1Url} alt="Room thumbnail 1"/> */}</div>
          <div className="small-image more-photos">
            <strong>+2</strong>
            <span>More Photos</span>
          </div>
        </div>

        <div className="info-box">
          <h3>Thời gian sử dụng</h3>
          <p className="time-range">{startTime} - {endTime}</p>
          <p className="remaining-time">
            Thời gian còn lại: {remainingTime !== null ? remainingTime : "Đang tính..."}
          </p>
          <button 
            className="booking-btn" 
            onClick={handleCheckout}
            disabled={isCheckingOut || remainingTime === "Đã hết giờ"}
          >
            {isCheckingOut ? "Đang xử lý..." : "Trả phòng"}
          </button>
          {checkoutMessage && 
            <p style={{ 
              color: checkoutMessage.startsWith('Lỗi') ? 'red' : 'green', 
              textAlign: 'center', 
              marginTop: '10px' 
            }}>
              {checkoutMessage}
            </p>
          }
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