## Readme
1. Import khach hang

2. Nhập thông tin khách hàng

3. Hiển thị thông tin khách hàng

4. Cho tạo hạng thành viên

5. Discount được cho khách hàng theo hạng thành viên

6. (Cái này là 1) Thêm nhà hàng vào chuỗi

## How TO RUN CLIENT 
1. npm install
2. cd src/proto/generated => npm install
3. npm run dev

## How to debug grpc local
1. ipconfig getifaddr en0
2. Bỏ vào address ở envoy
3. docker compose -d
4. address call api: http://localhost:9900


## How TO SYNC LOCALE
npm run sync-locale

## Công nghệ sử dụng

Dự án này sử dụng các công nghệ sau:

### State Manager
- **Redux**: Thư viện quản lý trạng thái cho các ứng dụng JavaScript.
- **Redux-Saga**: Thư viện middleware cho Redux để quản lý các side effects.

### UI Manager
- **React**: Thư viện JavaScript để xây dựng giao diện người dùng.
- **Material-UI (MUI)**: Thư viện React component để tạo kiểu và thiết kế giao diện.

### Network
- **gRPC-web**: Giao thức RPC để giao tiếp giữa client và server.

### Build Tool
- **Vite**: Công cụ build nhanh cho các dự án web hiện đại.

### Additional Libraries
Các thư viện bổ sung được sử dụng trong dự án bao gồm:

### Emotion
- **@emotion/cache**: "^11.13.1"
- **@emotion/react**: "^11.13.5"
- **@emotion/styled**: "^11.13.5"

### Font
- **@fontsource-variable/public-sans**: "^5.1.1"
- **@fontsource/barlow**: "^5.0.14"

### Icons
- **@iconify/react**: "^5.0.2"
- **@mui/icons-material**: "^5.16.8"

### MUI Components
- **@mui/lab**: "^5.0.0-alpha.173"
- **@mui/material**: "5.16.8"
- **@mui/x-charts**: "^7.23.2"
- **@mui/x-date-pickers**: "^7.23.0"

### Redux
- **@reduxjs/toolkit**: "^2.3.0"
- **redux-saga**: "^1.3.0"
- **react-redux**: "^9.1.2"

### Type Definitions
- **@types/file-saver**: "^2.0.7"

### Charts
- **apexcharts**: "^3.52.0"
- **react-apexcharts**: "^1.4.1"

### Utilities
- **browser-image-compression**: "^2.0.2"
- **dayjs**: "^1.11.13"
- **file-saver**: "^2.0.5"
- **lodash**: "^4.17.21"
- **simplebar-react**: "^3.2.6"

### gRPC
- **grpc-tools**: "^1.12.4"
- **grpc-web**: "^1.5.0"
- **grpc-web-client-gen**: "file:src/proto/generated"
- **protoc-gen-grpc-web**: "^1.5.0"

### Routing
- **history**: "^5.3.0"
- **react-router-dom**: "6.4.0"

### Internationalization
- **i18next**: "^24.0.2"
- **i18next-browser-languagedetector**: "^8.0.0"
- **react-i18next**: "^15.1.2"

### React Components
- **react**: "^18.3.1"
- **react-dom**: "^18.3.1"
- **react-helmet-async**: "^2.0.5"
- **react-number-format**: "^5.4.2"
- **react-qr-code**: "^2.0.15"
- **react-toastify**: "^10.0.6"
- **react-colorful**: "^5.6.1"

### MUI Extensions
- **material-ui-popup-state**: "^5.3.1"
- **mui-tel-input**: "6.0.1"
