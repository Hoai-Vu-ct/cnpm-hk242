import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const NGROK_BASE_URL = 'http://localhost:5000';
const HARDCODED_STUDENT_ID = 1; // Fix tạm studentId là 1

const RoomPage = () => {
  const location = useLocation(); // Vẫn giữ để có thể lấy passedRoomName nếu cần
  const navigate = useNavigate();

  // Lấy passedRoomName từ state nếu có, dùng làm fallback hoặc ưu tiên hiển thị tên
  const { roomName: passedRoomName } = location.state || {};

  const [currentReservation, setCurrentReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  
  const [remainingTime, setRemainingTime] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  useEffect(() => {
    const studentId = HARDCODED_STUDENT_ID; // Sử dụng studentId đã fix cứng

    const fetchCheckedInReservation = async () => {
      setIsLoading(true);
      setFetchError(null);
      setCurrentReservation(null); 
      try {
        const response = await fetch(`${NGROK_BASE_URL}/api/reservations/student/${studentId}`);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Lỗi ${response.status} khi tải danh sách đặt phòng: ${errorData}`);
        }
        const reservationsArray = await response.json();
        
        // Tìm đặt phòng đầu tiên có trạng thái là 'checkedin'
        const checkedInReservation = reservationsArray.find(
          (res) => res.status && res.status.toLowerCase() === 'checkedin'
        );

        if (checkedInReservation) {
          setCurrentReservation(checkedInReservation);
        } else {
          setFetchError(`Không tìm thấy phòng nào đang "checkedin" cho sinh viên ID ${studentId}.`);
        }
      } catch (error) {
        console.error("Lỗi khi fetch đặt phòng đang checked-in:", error);
        setFetchError(error.message || "Có lỗi xảy ra khi tải thông tin phòng.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckedInReservation();

  }, []); // Chạy một lần khi component mount

  // Sử dụng useMemo để chỉ tính toán lại khi currentReservation hoặc passedRoomName thay đổi
  const roomDisplayName = useMemo(() => passedRoomName || currentReservation?.space?.location || "Không rõ phòng", [passedRoomName, currentReservation]);
  const studentName = useMemo(() => currentReservation?.user?.name || `Sinh viên ID ${HARDCODED_STUDENT_ID}`, [currentReservation]);

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Lỗi định dạng thời gian:", e, "Input:", dateString);
      return "Lỗi giờ";
    }
  };

  const startTime = useMemo(() => formatTime(currentReservation?.startTime), [currentReservation]);
  const endTime = useMemo(() => formatTime(currentReservation?.endTime), [currentReservation]);

  useEffect(() => {
    if (!currentReservation || !currentReservation.endTime) {
      setRemainingTime("Không xác định");
      return;
    }

    const calculateRemainingTime = () => {
      const now = new Date();
      const end = new Date(currentReservation.endTime);
      const diffMs = end - now;

      if (diffMs <= 0) {
        setRemainingTime("Đã hết giờ");
        return 0; 
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      let timeString = "";
      if (hours > 0) timeString += `${hours} giờ `;
      if (minutes > 0 || hours > 0) timeString += `${minutes} phút `;
      timeString += `${seconds} giây`;
      
      setRemainingTime(timeString.trim());
      return diffMs;
    };

    const initialDiff = calculateRemainingTime();
    if (initialDiff <= 0) return; 

    const timerId = setInterval(() => {
      if (calculateRemainingTime() <= 0) {
        clearInterval(timerId);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [currentReservation]);

  const handleCheckout = async () => {
    if (!currentReservation || !currentReservation.reservationId) {
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
        body: JSON.stringify({ reservationId: currentReservation.reservationId }),
      });

      const result = await response.json();

      if (response.ok) {
        setCheckoutMessage("Trả phòng thành công! Đang chuyển hướng...");
        setTimeout(() => {
          navigate('/history'); 
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

  if (isLoading) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Đang tải thông tin phòng cho sinh viên ID {HARDCODED_STUDENT_ID}...</h2>
      </div>
    );
  }

  if (fetchError || !currentReservation) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>{fetchError ? "Lỗi tải thông tin phòng" : "Không tìm thấy phòng"}</h2>
        <p>{fetchError || `Không có phòng nào đang "checkedin" cho sinh viên ID ${HARDCODED_STUDENT_ID}.`}</p>
        <Link to="/">Quay lại trang chủ</Link><br/>
        <Link to="/checkin">Thử check-in một phòng</Link>
      </div>
    );
  }

  // Phần JSX hiển thị thông tin phòng giữ nguyên như trước,
  // chỉ cần đảm bảo nó sử dụng currentReservation, roomDisplayName, studentName, startTime, endTime
  return (
    <div className="main-content">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> → <span>Thông tin phòng đang sử dụng</span>
      </div>

      <h2 className="page-title">
        Chào mừng đến với phòng {roomDisplayName}, {studentName}!
      </h2>

      <div className="roompage-content">
        <div className="room-images">
          {/* Các ảnh này có thể được lấy động nếu có URL trong currentReservation.space */}
          <div className="main-image">{/* <img src={currentReservation?.space?.mainImageUrl} alt="Main room view"/> */}</div>
          <div className="small-image">{/* <img src={currentReservation?.space?.thumb1Url} alt="Room thumbnail 1"/> */}</div>
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
            disabled={isCheckingOut || remainingTime === "Đã hết giờ" || !currentReservation}
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