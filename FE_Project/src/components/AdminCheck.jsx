import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminCheck.css';
function AdminCheck() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/spaces');
        setSpaces(response.data);
        setLoading(false);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu phòng.');
        setLoading(false);
      }
    };

    fetchSpaces();
  }, []);

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-spaces-container">
      <h2 className="page-title">Danh sách phòng</h2>
      <table className="spaces-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Vị trí</th>
            <th>Giờ bắt đầu</th>
            <th>Giờ kết thúc</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {spaces.map((space) => (
            <tr key={space.spaceId}>
              <td>{space.spaceId}</td>
              <td>{space.location}</td>
              <td>{space.startTime}</td>
              <td>{space.endTime}</td>
              <td>{space.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminCheck;