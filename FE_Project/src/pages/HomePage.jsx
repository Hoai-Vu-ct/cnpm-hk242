import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const [roomType, setRoomType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  
  const [allUniqueLocations, setAllUniqueLocations] = useState([]); 
  const [spacesData, setSpacesData] = useState([]);

  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [errorLocations, setErrorLocations] = useState(null);

  const [reservationsForSelectedDate, setReservationsForSelectedDate] = useState([]);
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

  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayString = String(date.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${dayString}`);
    }
    return dates;
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(getTodayLocalString());
    }
  }, []);

  useEffect(() => {
    const fetchSpacesAndLocations = async () => {
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
    };
    fetchSpacesAndLocations();
  }, []);

  useEffect(() => {
    const fetchReservationsForDate = async (dateToFetch) => {
      if (!dateToFetch) return;
      setIsLoadingReservations(true);
      setErrorReservations(null);
      setReservationsForSelectedDate([]);
      try {
        const reservationsResponse = await fetch('http://localhost:5000/api/reservations/get-all');
        if (!reservationsResponse.ok) {
          throw new Error(`Lỗi tải dữ liệu đặt phòng: ${reservationsResponse.status}`);
        }
        const allReservations = await reservationsResponse.json();
        
        const dateStartLocal = new Date(dateToFetch + "T00:00:00");
        const dateEndLocal = new Date(dateToFetch + "T23:59:59.999");

        const filteredReservations = allReservations.filter(res => {
          if (!res || !res.status || !res.startTime || !res.endTime) return false;
          const resStart = new Date(res.startTime);
          const resEnd = new Date(res.endTime);
          const isActiveReservation = res.status.toLowerCase() === 'reserved';
          return isActiveReservation && (dateStartLocal < resEnd && dateEndLocal > resStart);
        });
        setReservationsForSelectedDate(filteredReservations);
      } catch (error) {
        console.error("Không thể tải dữ liệu đặt phòng:", error);
        setErrorReservations(error.message);
      } finally {
        setIsLoadingReservations(false);
      }
    };

    if (selectedDate) {
      fetchReservationsForDate(selectedDate);
    }
  }, [selectedDate]);

  const availableTimeSlotsForSelectedRoom = useMemo(() => {
    if (!roomType || !spacesData.length || !selectedDate) return [];
    return spacesData
      .filter(space => space.location === roomType)
      .map(space => ({
        value: `${space.spaceId}`,
        label: `${space.startTime.substring(0,5)} - ${space.endTime.substring(0,5)}`,
        spaceId: space.spaceId,
        apiStartTime: space.startTime,
        apiEndTime: space.endTime
      }));
  }, [roomType, spacesData, selectedDate]);

  const handleBooking = async () => {
    if (!roomType || !selectedDate || !selectedSpaceId) {
      setBookingMessage("Vui lòng chọn loại phòng, ngày và khung giờ.");
      return;
    }

    setIsBooking(true);
    setBookingMessage('');

    const userId = "1";

    const chosenSlotDetails = spacesData.find(s => s.spaceId === parseInt(selectedSpaceId));

    if (!chosenSlotDetails) {
        setBookingMessage("Khung giờ đã chọn không hợp lệ hoặc không tìm thấy thông tin.");
        setIsBooking(false);
        return;
    }

    console.log("HomePage: Debugging date values before new Date():");
    console.log("HomePage: selectedDate:", selectedDate);
    // Thay đổi ở đây: sử dụng chosenSlotDetails.startTime và chosenSlotDetails.endTime
    console.log("HomePage: chosenSlotDetails.startTime:", chosenSlotDetails.startTime);
    console.log("HomePage: chosenSlotDetails.endTime:", chosenSlotDetails.endTime);

    // Kiểm tra xem startTime và endTime có tồn tại không
    if (!chosenSlotDetails.startTime || !chosenSlotDetails.endTime) {
        console.error("HomePage: chosenSlotDetails is missing startTime or endTime.");
        setBookingMessage("Lỗi: Dữ liệu khung giờ không đầy đủ.");
        setIsBooking(false);
        return;
    }

    const bookingStartTimeString = `${selectedDate} ${chosenSlotDetails.startTime}`;
    const bookingEndTimeString = `${selectedDate} ${chosenSlotDetails.endTime}`;
    console.log("HomePage: bookingStartTimeString to be parsed:", bookingStartTimeString);
    console.log("HomePage: bookingEndTimeString to be parsed:", bookingEndTimeString);

    const bookingStartTime = new Date(bookingStartTimeString);
    const bookingEndTime = new Date(bookingEndTimeString);

    // Kiểm tra xem Date có hợp lệ không trước khi gọi toISOString()
    if (isNaN(bookingStartTime.getTime()) || isNaN(bookingEndTime.getTime())) {
        console.error("HomePage: Invalid Date object created.");
        console.error("HomePage: bookingStartTime after new Date():", bookingStartTime);
        console.error("HomePage: bookingEndTime after new Date():", bookingEndTime);
        setBookingMessage("Lỗi xử lý ngày giờ. Vui lòng thử lại.");
        setIsBooking(false);
        return;
    }

    const formatDateForAPI = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const reservationData = {
      userId: parseInt(userId),
      spaceId: parseInt(selectedSpaceId),
      startTime: formatDateForAPI(bookingStartTime), 
      endTime: formatDateForAPI(bookingEndTime),
    };
    console.log("HomePage: reservationData to be sent:", reservationData); // In ra đối tượng reservationData

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
        setSelectedDate(getTodayLocalString());
        setSelectedSpaceId('');
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
        <h2 className="page-title" style={{ textAlign: 'left' }}>Trang chủ - Đặt phòng</h2>
        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">Địa điểm</label>
            <div className="select-wrapper">
              <select 
                className="filter-select" 
                value={roomType} 
                onChange={(e) => {
                  setRoomType(e.target.value);
                  setSelectedSpaceId('');
                  setBookingMessage('');
                }}
                disabled={isLoadingLocations || errorLocations || isBooking}
              >
                <option value="" disabled>
                  {isLoadingLocations ? "Đang tải..." : errorLocations ? "Lỗi tải vị trí" : "Chọn Địa điểm"}
                </option>
                {!isLoadingLocations && !errorLocations && allUniqueLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              {errorLocations && <p style={{ color: 'red', fontSize: '0.8em' }}>{errorLocations}</p>}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Ngày</label>
            <div className="select-wrapper">
              <select
                className="filter-select"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSpaceId('');
                  setBookingMessage('');
                }}
                disabled={!roomType || isBooking}
              >
                <option value="" disabled>
                  {!roomType ? "Chọn địa điểm trước" : "Chọn Ngày"}
                </option>
                {availableDates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Khung giờ</label>
            <div className="select-wrapper">
              <select 
                className="filter-select" 
                value={selectedSpaceId}
                onChange={(e) => {
                  setSelectedSpaceId(e.target.value);
                  setBookingMessage('');
                }}
                disabled={isLoadingReservations || !roomType || !selectedDate || isBooking || availableTimeSlotsForSelectedRoom.length === 0}
              >
                <option value="" disabled>
                  {isLoadingReservations ? "Đang tải khung giờ..." : 
                   !roomType ? "Chọn địa điểm trước" : 
                   !selectedDate ? "Chọn ngày trước" :
                   availableTimeSlotsForSelectedRoom.length === 0 ? "Không có khung giờ" : 
                   "Chọn Khung Giờ"}
                </option>
                {availableTimeSlotsForSelectedRoom.map(slot => {
                  let isBooked = false;
                  if (reservationsForSelectedDate.length > 0 && !isLoadingReservations && selectedDate) {
                    const slotStartDateTime = new Date(`${selectedDate}T${slot.apiStartTime}`);
                    const slotEndDateTime = new Date(`${selectedDate}T${slot.apiEndTime}`);

                    isBooked = reservationsForSelectedDate.some(res => {
                      if (res.spaceId !== slot.spaceId) return false; 
                      const resStart = new Date(res.startTime);
                      const resEnd = new Date(res.endTime);
                      return slotStartDateTime < resEnd && slotEndDateTime > resStart;
                    });
                  }
                  
                  const isDisabled = isBooked;
                  let disabledText = "";

                  if (isBooked) disabledText = " (Đã đặt)";

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
          disabled={!roomType || !selectedDate || !selectedSpaceId || isLoadingLocations || isLoadingReservations || isBooking} 
        >
          {isBooking ? 'Đang xử lý...' : 'Đặt Phòng'}
        </button>
      </div>
    </>
  );
}

export default HomePage;