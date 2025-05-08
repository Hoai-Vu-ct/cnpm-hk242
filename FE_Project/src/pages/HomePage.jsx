import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const [roomType, setRoomType] = useState(''); // Vẫn là location, ví dụ "H1 - Room 101"
  const [selectedSpaceId, setSelectedSpaceId] = useState(''); // Sẽ lưu spaceId của khung giờ cụ thể được chọn
  
  const [allUniqueLocations, setAllUniqueLocations] = useState([]); 
  const [spacesData, setSpacesData] = useState([]); // Sẽ chứa toàn bộ dữ liệu spaces từ API

  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [errorLocations, setErrorLocations] = useState(null);

  const [reservationsForToday, setReservationsForToday] = useState([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [errorReservations, setErrorReservations] = useState(null);

  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  const getTodayLocalString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayLocalString = getTodayLocalString();

  const fetchReservations = async () => {
    setIsLoadingReservations(true);
    setErrorReservations(null);
    try {
      const reservationsResponse = await fetch('http://localhost:5000/api/reservations/get-all');
      if (!reservationsResponse.ok) {
        throw new Error(`Lỗi tải dữ liệu đặt phòng: ${reservationsResponse.status}`);
      }
      const allReservations = await reservationsResponse.json();
      
      const todayStartLocal = new Date(todayLocalString + "T00:00:00");
      const todayEndLocal = new Date(todayLocalString + "T23:59:59.999");

      const filteredReservations = allReservations.filter(res => {
        if (!res || !res.status || !res.startTime || !res.endTime) return false;
        const resStartUTC = new Date(res.startTime);
        const resEndUTC = new Date(res.endTime);
        const isActiveReservation = res.status.toLowerCase() === 'reserved';
        return isActiveReservation &&
               (todayStartLocal < resEndUTC && todayEndLocal > resStartUTC);
      });
      setReservationsForToday(filteredReservations);
    } catch (error) {
      console.error("Không thể tải dữ liệu đặt phòng:", error);
      setErrorReservations(error.message);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingLocations(true);
      setErrorLocations(null);
      try {
        const spacesResponse = await fetch('http://localhost:5000/api/spaces');
        if (!spacesResponse.ok) {
          throw new Error(`Lỗi tải dữ liệu phòng: ${spacesResponse.status}`);
        }
        const fetchedSpaces = await spacesResponse.json();
        setSpacesData(fetchedSpaces);
        
        const uniqueLocs = [...new Set(fetchedSpaces.map(space => space.location))].sort();
        setAllUniqueLocations(uniqueLocs);

      } catch (error) {
        console.error("Không thể tải dữ liệu phòng:", error);
        setErrorLocations(error.message);
      } finally {
        setIsLoadingLocations(false);
      }
      await fetchReservations();
    };
    fetchInitialData();
  }, [todayLocalString]);

  // Lấy các khung giờ khả dụng cho một location (roomType) đã chọn
  const availableTimeSlotsForSelectedRoom = useMemo(() => {
    if (!roomType || !spacesData.length) return [];
    return spacesData
      .filter(space => space.location === roomType)
      .map(space => ({
        value: `${space.spaceId}`, // Sử dụng spaceId làm value để định danh slot cụ thể
        label: `${space.startTime.substring(0,5)} - ${space.endTime.substring(0,5)}`, // Ví dụ: "08:30 - 10:00"
        spaceId: space.spaceId, // Lưu lại spaceId để dùng khi đặt phòng
        apiStartTime: space.startTime, // Giờ bắt đầu từ API
        apiEndTime: space.endTime,     // Giờ kết thúc từ API
        status: space.status          // Trạng thái của slot này
      }));
  }, [roomType, spacesData]);


  const handleBooking = async () => {
    if (!roomType || !selectedSpaceId) {
      setBookingMessage("Vui lòng chọn loại phòng và khung giờ.");
      return;
    }

    setIsBooking(true);
    setBookingMessage('');

    const studentId = "1"; // Cần thay bằng logic lấy studentId thực tế

    const chosenSlotDetails = spacesData.find(s => s.spaceId === parseInt(selectedSpaceId));

    if (!chosenSlotDetails) {
        setBookingMessage("Khung giờ đã chọn không hợp lệ hoặc không tìm thấy thông tin.");
        setIsBooking(false);
        return;
    }

    const startTimeString = `${todayLocalString} ${chosenSlotDetails.startTime}`;
    const endTimeString = `${todayLocalString} ${chosenSlotDetails.endTime}`;

    const reservationData = {
      studentId: parseInt(studentId),
      spaceId: parseInt(selectedSpaceId), // spaceId của khung giờ cụ thể
      startTime: startTimeString, 
      endTime: endTimeString,
    };

    console.log("Đang gửi dữ liệu đặt phòng:", reservationData);

    try {
      const response = await fetch('http://localhost:5000/api/reservations/', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });
      const result = await response.json();
      if (response.ok) {
        setBookingMessage(`Đặt phòng thành công! ID Đặt phòng: ${result.reservationId}`);
        setRoomType('');
        setSelectedSpaceId(''); // Reset lựa chọn khung giờ
        await fetchReservations(); 
        navigate('/history'); 
      } else {
        setBookingMessage(`Lỗi đặt phòng: ${result.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API đặt phòng:", error);
      setBookingMessage("Lỗi kết nối khi đặt phòng. Vui lòng thử lại.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <>
      <div className="content-top">
        <h2 className="page-title">Trang chủ - Đặt phòng trong ngày</h2>
        <div className="filters-container">
          {/* Filter Loại Phòng (Location) */}
          <div className="filter-group">
            <label className="filter-label">Địa điểm</label>
            <div className="select-wrapper">
              <select 
                className="filter-select" 
                value={roomType} 
                onChange={(e) => {
                  setRoomType(e.target.value);
                  setSelectedSpaceId(''); // Reset lựa chọn khung giờ khi đổi địa điểm
                  setBookingMessage('');
                }}
                disabled={isLoadingLocations || errorLocations || isBooking}
              >
                <option value="" disabled>
                  {isLoadingLocations ? "Đang tải..." : errorLocations ? "Lỗi tải vị trí" : "Chọn Địa điểm"}
                </option>
                {!isLoadingLocations && !errorLocations && allUniqueLocations.map((location) => {
                  const isLocationGenerallyAvailable = spacesData.some(s => s.location === location && s.status === "Available");
                  return (
                    <option 
                      key={location} 
                      value={location} 
                    >
                      {location}
                    </option>
                  );
                })}
              </select>
              {errorLocations && <p style={{ color: 'red', fontSize: '0.8em' }}>{errorLocations}</p>}
            </div>
          </div>

          {/* Filter Khung giờ (dựa trên startTime, endTime từ API) */}
          <div className="filter-group">
            <label className="filter-label">Khung giờ</label>
            <div className="select-wrapper">
              <select 
                className="filter-select" 
                value={selectedSpaceId} // Value giờ là spaceId của slot
                onChange={(e) => {
                  setSelectedSpaceId(e.target.value);
                  setBookingMessage('');
                }}
                disabled={isLoadingReservations || !roomType || isBooking || availableTimeSlotsForSelectedRoom.length === 0} 
              >
                <option value="" disabled>
                  {isLoadingReservations ? "Đang tải..." : 
                   !roomType ? "Chọn địa điểm trước" : 
                   availableTimeSlotsForSelectedRoom.length === 0 ? "Không có khung giờ" : 
                   "Chọn Khung Giờ"}
                </option>
                {availableTimeSlotsForSelectedRoom.map(slot => {
                  let isBooked = false;
                  if (reservationsForToday.length > 0 && !isLoadingReservations) {
                    const slotStartDateTime = new Date(`${todayLocalString}T${slot.apiStartTime}`);
                    const slotEndDateTime = new Date(`${todayLocalString}T${slot.apiEndTime}`);

                    isBooked = reservationsForToday.some(res => {
                      if (res.spaceId !== slot.spaceId) return false; 
                      const resStartUTC = new Date(res.startTime);
                      const resEndUTC = new Date(res.endTime);
                      return slotStartDateTime < resEndUTC && slotEndDateTime > resStartUTC;
                    });
                  }
                  
                  const isDisabledByStatus = slot.status !== "Available"; 
                  const isDisabled = isBooked || isDisabledByStatus || !roomType; 
                  let disabledText = "";

                  if (isBooked) disabledText = " (Đã đặt)";
                  else if (isDisabledByStatus) disabledText = ` (${slot.status})`;

                  return (
                    <option 
                      key={slot.value} 
                      value={slot.value} 
                      disabled={isDisabled}
                      style={isDisabled ? { color: 'grey', textDecoration: 'line-through' } : {}}
                    >
                      {slot.label}{disabledText}
                    </option>
                  );
                })}
              </select>
              {errorReservations && <p style={{ color: 'red', fontSize: '0.8em' }}>{errorReservations}</p>}
            </div>
          </div>
        </div>
        {bookingMessage && <p style={{ color: bookingMessage.startsWith('Lỗi') ? 'red' : 'green', textAlign: 'center', marginTop: '10px' }}>{bookingMessage}</p>}
      </div>
      <div className="spacer"></div>
      <div className="booking-btn-container">
        <button 
          className="booking-btn" 
          onClick={handleBooking}
          disabled={!roomType || !selectedSpaceId || isLoadingLocations || isLoadingReservations || isBooking} 
        >
          {isBooking ? 'Đang xử lý...' : 'Đặt Phòng'}
        </button>
      </div>
    </>
  );
}

export default HomePage;