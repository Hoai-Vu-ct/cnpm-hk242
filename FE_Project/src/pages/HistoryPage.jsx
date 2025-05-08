import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom"; // Thêm Link vào đây

const HistoryPage = () => {
  const navigate = useNavigate(); // Khởi tạo navigate
  const [activeTab, setActiveTab] = useState("upcoming");
  const [reservations, setReservations] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [reservationsResponse, spacesResponse] = await Promise.all([
          fetch("http://localhost:5000/api/reservations/get-all"),
          fetch("http://localhost:5000/api/spaces"),
        ]);

        if (!reservationsResponse.ok) {
          throw new Error(
            `Lỗi tải lịch sử đặt phòng: ${reservationsResponse.status}`
          );
        }
        if (!spacesResponse.ok) {
          throw new Error(`Lỗi tải dữ liệu phòng: ${spacesResponse.status}`);
        }

        const reservationsData = await reservationsResponse.json();
        const spacesData = await spacesResponse.json();

        setReservations(reservationsData);
        setSpaces(spacesData);
      } catch (err) {
        setError(err.message);
        console.error("Lỗi fetch dữ liệu:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const spacesMap = useMemo(() => {
    return spaces.reduce((acc, space) => {
      acc[space.spaceId] = space;
      return acc;
    }, {});
  }, [spaces]);

  const formatBookingTime = (isoString) => {
    if (!isoString) return "Không rõ thời gian";
    try {
      const dateObj = new Date(isoString);
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      
      const timeStr = `${hours}:${minutes}`;
      const dateStr = `ngày ${dateObj.getDate()} tháng ${dateObj.getMonth() + 1} năm ${dateObj.getFullYear()}`;
      return `${timeStr}, ${dateStr}`;
    } catch (e) {
      console.error("Lỗi định dạng thời gian:", e);
      return isoString;
    }
  };
  
  const processedBookings = useMemo(() => {
    return reservations.map((res) => {
      const spaceInfo = spacesMap[res.spaceId];
      const roomName = spaceInfo ? spaceInfo.location : `ID Phòng: ${res.spaceId}`;
      return {
        id: res.reservationId, // reservationId
        userId: res.userId,
        spaceId: res.spaceId,
        room: roomName,
        startTime: res.startTime, // Giữ lại để có thể truyền đi
        endTime: res.endTime,   // Giữ lại để có thể truyền đi
        formattedTime: formatBookingTime(res.startTime),
        originalStatus: res.status ? res.status.toLowerCase() : "",
      };
    });
  }, [reservations, spacesMap, formatBookingTime]);

  const upcomingBookings = useMemo(() => {
    return processedBookings.filter(
      (booking) => booking.originalStatus === "reserved" || booking.originalStatus === "checkedin" // Giữ checkedin ở upcoming nếu muốn
    );
  }, [processedBookings]);

  const completedBookings = useMemo(() => {
    return processedBookings.filter(
      (booking) => booking.originalStatus === "cancelled" || booking.originalStatus === "completed" // Thêm 'completed' nếu có
    );
  }, [processedBookings]);

  const handleNavigateToCheckIn = (booking) => {
    navigate('/checkin', { 
      state: { 
        reservationId: booking.id, 
        roomName: booking.room,
        startTime: booking.startTime,
        endTime: booking.endTime,
        userId: booking.userId // Thêm userId vào đây
        // Bạn có thể truyền thêm dữ liệu khác nếu CheckinPage cần
      } 
    });
  };

  const renderBookingItem = (booking) => {
    let statusContent;

    if (booking.originalStatus === "reserved") {
      statusContent = (
        <span 
          onClick={() => handleNavigateToCheckIn(booking)} 
          className="checkin-link" 
          style={{ 
            color: 'black', // Chuyển màu chữ thành đen
            cursor: 'pointer', 
            textDecoration: 'none', // Bỏ gạch chân
            fontWeight: 'bold', // Làm chữ đậm hơn (coi như to hơn)
            fontSize: '1.05em' // Có thể tăng kích thước chữ một chút
          }}
        >
          Check in
        </span>
      );
    } else if (booking.originalStatus === "checkedin") {
      statusContent = <span>Đã check-in</span>;
    } else if (booking.originalStatus === "cancelled") {
      statusContent = <span>Đã hủy phòng</span>;
    } else if (booking.originalStatus === "completed") {
      statusContent = <span>Đã hoàn thành</span>;
    } else {
      statusContent = <span>{booking.originalStatus}</span>;
    }

    return (
      <div key={booking.id} className="booking-item">
        <div className="booking-info">
          <strong>Sinh viên (ID: {booking.userId}) đã đặt phòng {booking.room}</strong>
          <p>Vào {booking.formattedTime}</p>
        </div>
        <div className="booking-status">{statusContent}</div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="history-container"><p>Đang tải dữ liệu lịch sử...</p></div>;
  }

  if (error) {
    return <div className="history-container"><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div className="history-container">
      <div className="breadcrumb">
        <span className="breadcrumb-bold">Trang chủ</span> &rarr; Lịch sử đặt phòng
      </div>
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`tab-button ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </div>

      <div className="bookings-list">
        {activeTab === "upcoming"
          ? (upcomingBookings.length > 0 
              ? upcomingBookings.map(renderBookingItem) 
              : <p>
                  Không có đặt phòng nào sắp tới. 
                  <Link to="/" style={{ marginLeft: '5px', color: '#007bff', textDecoration: 'underline' }}>
                    Đặt phòng ngay!
                  </Link>
                </p>
            )
          : (completedBookings.length > 0 
              ? completedBookings.map(renderBookingItem) 
              : <p>Không có đặt phòng nào đã hoàn thành hoặc đã hủy.</p>
            )
        }
      </div>
    </div>
  );
};

export default HistoryPage;
