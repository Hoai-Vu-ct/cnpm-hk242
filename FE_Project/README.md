# CNPM-HK242 Frontend Project

Đây là dự án frontend được xây dựng với Vite và React cho ứng dụng quản lý và đặt phòng học S3-MRS.

## Cài đặt

1. Clone repository:
```
git clone https://github.com/Hoai-Vu-ct/cnpm-hk242.git
cd cnpm-hk242/FE_Project
```

2. Cài đặt các thư viện:
```
npm install
```

3. Chạy dự án:
```
npm run dev
```

## Cấu trúc dự án

- `/src`: Chứa mã nguồn chính của ứng dụng
  - `/components`: Các component tái sử dụng (Header, Footer, Layout)
  - `/pages`: Các trang của ứng dụng (HomePage, LoginPage, CheckinPage, HistoryPage, RoomPage)
  - `/assets`: Hình ảnh, icons và tài nguyên khác
  - `App.jsx`: Component gốc với cấu hình routing
  - `main.jsx`: Điểm khởi đầu của ứng dụng
  - `index.css`: Styles chính của ứng dụng

## Tính năng

- **Trang chủ**: Hiển thị bộ lọc tìm kiếm phòng học với các tuỳ chọn loại phòng, khung giờ, ngày sử dụng và vị trí
- **Đăng nhập**: Giao diện xác thực người dùng với username và password
- **Check-in**: Hiển thị mã QR để check-in vào phòng đã đặt
- **Phòng học**: Hiển thị thông tin chi tiết về phòng đang sử dụng
- **Lịch sử đặt phòng**: Xem lịch sử đặt phòng đã hoàn thành và sắp tới

## Các lệnh

- `npm run dev`: Chạy môi trường phát triển
- `npm run build`: Build dự án cho production
- `npm run preview`: Xem trước bản build
- `npm run lint`: Kiểm tra lỗi với ESLint

## Công nghệ sử dụng

- React 19
- Vite 6
- React Router 7
- ESLint 9
- CSS thuần với Responsive Design

## Layout

Dự án sử dụng layout chung với:
- Header: Logo, menu điều hướng và thông tin người dùng
- Content: Nội dung thay đổi theo route
- Footer: Thông tin liên hệ và điều hướng bổ sung

## Responsive

Dự án được thiết kế responsive với các breakpoints:
- Desktop: > 992px
- Tablet: 768px - 992px 
- Mobile: < 576px