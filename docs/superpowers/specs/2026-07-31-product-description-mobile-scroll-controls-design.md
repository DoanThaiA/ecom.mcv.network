# Thiết kế nút điều hướng Vùng 3 trên mobile

## Mục tiêu

Giúp người dùng nhận biết Vùng 3 còn nội dung nằm ngang và có thể di chuyển ảnh bằng nút bấm, đồng thời giữ nguyên thao tác vuốt đang có.

## Phạm vi

- Chỉ áp dụng cho Vùng 3 khi `mobileHorizontalScroll` được bật.
- Chỉ hiển thị trên màn hình nhỏ hơn breakpoint `md`.
- Vùng 1 và cách hiển thị tablet/desktop không thay đổi.

## Giao diện và hành vi

- Hai nút tròn nền đen, icon mũi tên trắng, nổi ở góc dưới bên trái vùng ảnh.
- Mỗi lần bấm cuộn mượt theo 75% chiều rộng phần đang nhìn thấy của rail.
- Ở đầu rail chỉ hiện nút sang phải; ở giữa hiện cả hai nút; ở cuối chỉ hiện nút sang trái.
- Trạng thái nút được cập nhật sau khi ảnh tải, khi người dùng vuốt, khi bấm nút và khi kích thước viewport thay đổi.
- Nếu ảnh không rộng hơn rail thì không hiển thị nút.
- Rail tiếp tục chặn overflow trong chính nó, không tạo cuộn ngang cho document.

## Kỹ thuật

- Chuyển `ProductDescriptionMediaImage` thành client component để quản lý `ref` và trạng thái vị trí cuộn.
- Dùng `scrollBy({ left, behavior: 'smooth' })` trên chính scroll container.
- Dùng `Button` của Radix UI và `ArrowLeftIcon`/`ArrowRightIcon`.
- Các nút có `aria-label` để hỗ trợ trình đọc màn hình và test.
- Không thêm thư viện slider hoặc dependency mới.

## Kiểm thử

- Test nút phải xuất hiện khi rail còn nội dung phía sau.
- Test bấm nút phải gọi `scrollBy` với khoảng cuộn dương và `smooth`.
- Test trạng thái giữa/cuối rail hiển thị đúng nút trái/phải.
- Test Vùng 1 không có nút điều hướng.
- Chạy toàn bộ Vitest, ESLint và production build trước khi cập nhật hai PR.
