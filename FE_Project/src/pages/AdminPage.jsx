import React from 'react'
import AdminHeader from '../components/AdminHeader'
import Footer from '../components/Footer'
import AdminHome from '../components/AdminHome'
import AdminCheck from '../components/AdminCheck'
import { useLocation } from 'react-router-dom'

const AdminPage = () => {
  const location = useLocation();
  // Hiển thị component theo đường dẫn
  return (
    <>
      <AdminHeader />
      <div className="admin-page-container">
        <div className="admin-page-content">
          {location.pathname === '/admin' && <AdminHome />}
          {location.pathname === '/admin/check' && <AdminCheck />}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default AdminPage