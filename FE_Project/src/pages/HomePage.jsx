import React, { useState, useEffect } from 'react';
// Thêm useNavigate từ react-router-dom
import { Link, useNavigate } from 'react-router-dom';

// Định nghĩa các khung giờ với giờ bắt đầu và kết thúc
const timeSlotOptionsDefinition = [
  { value: "7-9", label: "7:00 - 9:00", startHour: 7, endHour: 9 },
  { value: "9-11", label: "9:00 - 11:00", startHour: 9, endHour: 11 },
  { value: "13-15", label: "13:00 - 15:00", startHour: 13, endHour: 15 },
  { value: "15-17", label: "15:00 - 17:00", startHour: 15, endHour: 17 },
  { value: "17-19", label: "17:00 - 19:00", startHour: 17, endHour: 19 }, // 5 PM - 7 PM
  { value: "19-21", label: "19:00 - 21:00", startHour: 19, endHour: 21 }, // 7 PM - 9 PM
  { value: "21-23", label: "21:00 - 23:00", startHour: 21, endHour: 23 }, // 9 PM - 11 PM
];

function HomePage() {
  // Khởi tạo navigate
  const navigate = useNavigate(); 
  const [roomType, setRoomType] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  
  const [allUniqueLocations, setAllUniqueLocations] = useState([]); 
  const [locationsWithAvailableSpaces, setLocationsWithAvailableSpaces] = useState(new Set());
  const [spacesData, setSpacesData] = useState([]);

  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [errorLocations, setErrorLocations] = useState(null);

  const [reservationsForToday, setReservationsForToday] = useState([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [errorReservations, setErrorReservations] = useState(null);

  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  // Sử dụng hàm để lấy ngày địa phương hiện tại
  const getTodayLocalString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const todayLocalString = getTodayLocalString(); // Sử dụng biến này

  const fetchReservations = async () => {
    setIsLoadingReservations(true);
    setErrorReservations(null);
    try {
      const reservationsResponse = await fetch('http://localhost:5000/api/reservations/get-all');
      if (!reservationsResponse.ok) {
        throw new Error(`Lỗi tải dữ liệu đặt phòng: ${reservationsResponse.status}`);
      }
      const allReservations = await reservationsResponse.json();
      
      // Sử dụng todayLocalString ở đây
      const todayStartLocal = new Date(todayLocalString + "T00:00:00");
      const todayEndLocal = new Date(todayLocalString + "T23:59:59.999");

      const filteredReservations = allReservations.filter(res => {
        if (!res || !res.status || !res.startTime || !res.endTime) return false; // Kiểm tra null/undefined
        const resStartUTC = new Date(res.startTime);
        const resEndUTC = new Date(res.endTime);
        // Kiểm tra status không phân biệt chữ hoa/thường và chỉ lấy các trạng thái active
        const isActiveReservation = res.status.toLowerCase() === 'reserved';
        // Kiểm tra xem thời gian đặt phòng có nằm trong khoảng thời gian hôm nay không
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
    // Hàm này được gọi khi component được mount lần đầu và mỗi khi todayLocalString thay đổi.
    // Mục đích: Tải dữ liệu ban đầu cần thiết cho trang (danh sách phòng, địa điểm, và các đặt phòng cho ngày hôm nay).
    const fetchInitialData = async () => {
      // Bắt đầu quá trình tải dữ liệu địa điểm/phòng
      setIsLoadingLocations(true);
      setErrorLocations(null);
      try {
        // Gọi API để lấy danh sách tất cả các phòng (spaces)
        const spacesResponse = await fetch('http://localhost:5000/api/spaces');
        if (!spacesResponse.ok) {
          // Nếu API trả về lỗi, ném ra một Error
          throw new Error(`Lỗi tải dữ liệu phòng: ${spacesResponse.status}`);
        }
        // Chuyển đổi phản hồi từ API sang JSON
        const fetchedSpaces = await spacesResponse.json();
        // Cập nhật state spacesData với dữ liệu phòng vừa lấy được
        setSpacesData(fetchedSpaces);
        // Tạo danh sách các địa điểm (location) duy nhất từ dữ liệu phòng và sắp xếp
        const uniqueLocs = [...new Set(fetchedSpaces.map(space => space.location))].sort();
        setAllUniqueLocations(uniqueLocs); // Cập nhật state cho dropdown chọn địa điểm

        // Tạo một Set chứa các địa điểm có phòng còn trống ("Available")
        const availableLocsSet = new Set();
        fetchedSpaces.forEach(space => {
          if (space.status === "Available") { // Kiểm tra trạng thái phòng
            availableLocsSet.add(space.location);
          }
        });
        // Cập nhật state để biết địa điểm nào có phòng trống
        setLocationsWithAvailableSpaces(availableLocsSet);
      } catch (error) {
        // Nếu có lỗi trong quá trình fetch hoặc xử lý dữ liệu phòng
        console.error("Không thể tải dữ liệu phòng:", error);
        setErrorLocations(error.message); // Cập nhật state lỗi
      } finally {
        // Dù thành công hay thất bại, kết thúc trạng thái loading
        setIsLoadingLocations(false);
      }
      // Sau khi tải xong dữ liệu phòng, gọi hàm để tải dữ liệu các đặt phòng
      await fetchReservations();
    };

    fetchInitialData(); // Gọi hàm fetchInitialData
  }, [todayLocalString]); // Dependency array: Chạy lại useEffect nếu todayLocalString thay đổi

  // Hàm tiện ích để lấy spaceId dựa vào tên địa điểm (locationName)
  const getSpaceIdByLocationName = (locationName) => {
    if (!locationName || !spacesData.length) return null; // Nếu không có tên hoặc không có dữ liệu phòng
    // Tìm phòng trong spacesData có location trùng với locationName
    const space = spacesData.find(s => s.location === locationName);
    return space ? space.spaceId : null; // Trả về spaceId nếu tìm thấy, ngược lại null
  };
  
  // Hàm xử lý sự kiện khi người dùng nhấn nút "Đặt Phòng"
  const handleBooking = async () => {
    // Kiểm tra xem người dùng đã chọn loại phòng và khung giờ chưa
    if (!roomType || !timeSlot) {
      setBookingMessage("Vui lòng chọn loại phòng và khung giờ.");
      return; // Dừng thực thi nếu chưa chọn đủ
    }

    // Bắt đầu quá trình đặt phòng
    setIsBooking(true);
    setBookingMessage(''); // Xóa thông báo cũ

    // Lấy studentId (hiện tại đang hardcode, cần thay bằng logic lấy studentId thực tế)
    const studentId = "1"; 
    // Lấy spaceId dựa trên roomType (tên địa điểm) đã chọn
    const spaceId = getSpaceIdByLocationName(roomType);

    // Nếu không tìm thấy spaceId (ví dụ: roomType không hợp lệ)
    if (!spaceId) {
      setBookingMessage("Không tìm thấy ID phòng. Vui lòng thử lại.");
      setIsBooking(false); // Kết thúc trạng thái đặt phòng
      return;
    }

    // Tìm thông tin chi tiết của khung giờ đã chọn (startHour, endHour)
    const selectedSlot = timeSlotOptionsDefinition.find(slot => slot.value === timeSlot);
    if (!selectedSlot) {
      setBookingMessage("Khung giờ không hợp lệ.");
      setIsBooking(false);
      return;
    }

    // Tạo đối tượng Date cho thời gian bắt đầu đặt phòng
    // Dựa trên ngày địa phương hiện tại (todayLocalString) và giờ bắt đầu của khung giờ đã chọn
    const startDate = new Date(todayLocalString);
    startDate.setHours(selectedSlot.startHour, 0, 0, 0); // Đặt giờ, phút, giây, ms theo giờ địa phương

    // Tạo đối tượng Date cho thời gian kết thúc đặt phòng
    const endDate = new Date(todayLocalString);
    endDate.setHours(selectedSlot.endHour, 0, 0, 0); // Đặt giờ, phút, giây, ms theo giờ địa phương

    // Hàm định dạng đối tượng Date thành chuỗi "YYYY-MM-DD HH:MM:SS" theo giờ địa phương
    const formatToLocalDateTimeString = (dateObj) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Tháng từ 0-11 nên +1
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0'); // Lấy giờ địa phương
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Chuyển đổi startDate và endDate thành chuỗi để gửi đi
    // Ví dụ: Nếu chọn 19:00-21:00 ngày 2025-05-08, startTimeString sẽ là "2025-05-08 19:00:00"
    const startTimeString = formatToLocalDateTimeString(startDate);
    const endTimeString = formatToLocalDateTimeString(endDate);

    // Chuẩn bị dữ liệu để gửi lên API
    const reservationData = {
      studentId: parseInt(studentId), // Chuyển studentId sang kiểu số nếu API yêu cầu
      spaceId: parseInt(spaceId),     // Chuyển spaceId sang kiểu số nếu API yêu cầu
      startTime: startTimeString,     // Thời gian bắt đầu (chuỗi giờ địa phương)
      endTime: endTimeString,       // Thời gian kết thúc (chuỗi giờ địa phương)
    };

    // Log dữ liệu sẽ gửi đi để debug (bạn có thể xem trong Console của trình duyệt)
    console.log("Đang gửi dữ liệu đặt phòng:", reservationData);

    try {
      // Gọi API để tạo đặt phòng mới
      const response = await fetch('http://localhost:5000/api/reservations/', { 
        method: 'POST', // Phương thức POST để tạo mới
        headers: {
          'Content-Type': 'application/json', // Thông báo cho server biết body là JSON
        },
        body: JSON.stringify(reservationData), // Chuyển đối tượng reservationData thành chuỗi JSON
      });

      // Chuyển đổi phản hồi từ API sang JSON
      const result = await response.json();

      // Kiểm tra xem API có trả về thành công không (status code 2xx)
      if (response.ok) {
        setBookingMessage(`Đặt phòng thành công! ID Đặt phòng: ${result.reservationId}`);
        // Reset các lựa chọn sau khi đặt thành công
        setRoomType('');
        setTimeSlot('');
        // Tải lại danh sách đặt phòng để cập nhật UI (hiển thị khung giờ vừa đặt là đã được đặt)
        await fetchReservations(); 
        // Chuyển hướng đến trang lịch sử đặt phòng
        navigate('/history'); 
      } else {
        // Nếu API trả về lỗi, hiển thị thông báo lỗi từ API hoặc statusText
        setBookingMessage(`Lỗi đặt phòng: ${result.message || response.statusText}`);
      }
    } catch (error) {
      // Nếu có lỗi trong quá trình gọi API (ví dụ: lỗi mạng)
      console.error("Lỗi khi gọi API đặt phòng:", error);
      setBookingMessage("Lỗi kết nối khi đặt phòng. Vui lòng thử lại.");
    } finally {
      // Dù thành công hay thất bại, kết thúc trạng thái đặt phòng
      setIsBooking(false);
    }
  };

  const currentHour = new Date().getHours();
  const selectedSpaceId = getSpaceIdByLocationName(roomType);

  return (
    <>
      <div className="content-top">
        <h2 className="page-title">Trang chủ - Đặt phòng trong ngày</h2>
        <div className="filters-container">
          {/* Filter Loại Phòng */}
          <div className="filter-group">
            <label className="filter-label">Loại Phòng</label>
            <div className="select-wrapper">
              <select 
                className="filter-select" 
                value={roomType} 
                onChange={(e) => {
                  setRoomType(e.target.value);
                  setTimeSlot(''); 
                  setBookingMessage(''); // Xóa thông báo khi thay đổi lựa chọn
                }}
                disabled={isLoadingLocations || errorLocations || isBooking}
              >
                <option value="" disabled>
                  {isLoadingLocations ? "Đang tải..." : errorLocations ? "Lỗi tải vị trí" : "Chọn Loại Phòng"}
                </option>
                {!isLoadingLocations && !errorLocations && allUniqueLocations.map((location) => {
                  const isLocationAvailable = locationsWithAvailableSpaces.has(location);
                  return (
                    <option 
                      key={location} 
                      value={location} 
                      disabled={!isLocationAvailable}
                      style={!isLocationAvailable ? { color: 'grey' } : {}}
                    >
                      {location}{!isLocationAvailable ? " (Hết phòng)" : ""}
                    </option>
                  );
                })}
              </select>
              {errorLocations && <p style={{ color: 'red', fontSize: '0.8em' }}>{errorLocations}</p>}
            </div>
          </div>

          {/* Filter Khung giờ */}
          <div className="filter-group">
            <label className="filter-label">Khung giờ</label>
            <div className="select-wrapper">
              <select 
                className="filter-select" 
                value={timeSlot} 
                onChange={(e) => {
                  const newTimeSlotValue = e.target.value;
                  setBookingMessage(''); // Xóa thông báo khi thay đổi lựa chọn
                  if (newTimeSlotValue === "") { 
                    setTimeSlot("");
                    return;
                  }
                  const selectedOptionDef = timeSlotOptionsDefinition.find(opt => opt.value === newTimeSlotValue);
                  if (!selectedOptionDef) return;

                  const isPast = currentHour >= selectedOptionDef.endHour;
                  let isBooked = false;
                  if (selectedSpaceId && reservationsForToday.length > 0) {
                    const slotStartLocal = new Date(todayLocalString);
                    slotStartLocal.setHours(selectedOptionDef.startHour, 0, 0, 0);
                    const slotEndLocal = new Date(todayLocalString);
                    slotEndLocal.setHours(selectedOptionDef.endHour, 0, 0, 0);

                    isBooked = reservationsForToday.some(res => {
                      if (res.spaceId !== selectedSpaceId) return false;
                      const resStartUTC = new Date(res.startTime);
                      const resEndUTC = new Date(res.endTime);
                      return slotStartLocal < resEndUTC && slotEndLocal > resStartUTC;
                    });
                  }
                  if (!isPast && !isBooked) {
                    setTimeSlot(newTimeSlotValue);
                  } else {
                    // Không setTimeSlot nếu không hợp lệ, select sẽ không thay đổi
                    setBookingMessage("Khung giờ đã chọn không khả dụng.");
                  }
                }}
                disabled={isLoadingReservations || !roomType || isBooking} 
              >
                <option value="" disabled>
                  {isLoadingReservations ? "Đang tải..." : !roomType ? "Chọn loại phòng trước" : "Chọn Khung Giờ"}
                </option>
                {timeSlotOptionsDefinition.map(option => {
                  const isPast = currentHour >= option.endHour;
                  let isBooked = false;
                  let disabledText = "";

                  if (selectedSpaceId && reservationsForToday.length > 0 && !isLoadingReservations) {
                    const slotStartLocal = new Date(todayLocalString);
                    slotStartLocal.setHours(option.startHour, 0, 0, 0);
                    const slotEndLocal = new Date(todayLocalString);
                    slotEndLocal.setHours(option.endHour, 0, 0, 0);

                    isBooked = reservationsForToday.some(res => {
                      if (res.spaceId !== selectedSpaceId) return false;
                      const resStartUTC = new Date(res.startTime);
                      const resEndUTC = new Date(res.endTime);
                      return slotStartLocal < resEndUTC && slotEndLocal > resStartUTC;
                    });
                  }
                  
                  const isDisabled = isPast || isBooked || !roomType; 
                  if (isPast) disabledText = " (Đã qua)";
                  else if (isBooked) disabledText = " (Đã đặt)";

                  return (
                    <option 
                      key={option.value} 
                      value={option.value} 
                      disabled={isDisabled}
                      style={isDisabled ? { color: 'grey', textDecoration: 'line-through' } : {}}
                    >
                      {option.label}{disabledText}
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
          disabled={!roomType || !timeSlot || isLoadingLocations || isLoadingReservations || isBooking} 
        >
          {isBooking ? 'Đang xử lý...' : 'Đặt Phòng'}
        </button>
      </div>
    </>
  );
}

export default HomePage;