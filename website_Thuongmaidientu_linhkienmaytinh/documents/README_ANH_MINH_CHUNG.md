# DỰ ÁN TECHHUB PC - HƯỚNG DẪN CHỤP VÀ CHÈN ẢNH MINH CHỨNG

Tài liệu này liệt kê danh sách tên file ảnh chụp màn hình minh chứng giao diện và chức năng của hệ thống TechHub PC cần chụp bổ sung vào báo cáo.

---

## 📷 Danh sách Ảnh chụp màn hình Cần thực hiện

| STT | Tên file ảnh | Mô tả nội dung cần thể hiện trong ảnh |
| :---: | :--- | :--- |
| 1 | `01_trang_chu.png` | Giao diện Trang chủ (Customer View) hiển thị Banner giới thiệu, thanh điều hướng Header, và danh sách các sản phẩm linh kiện máy tính (CPU, VGA, RAM). |
| 2 | `02_tim_kiem_loc.png` | Kết quả sau khi sử dụng thanh tìm kiếm từ khóa `"i7"`, lọc theo danh mục CPU và chọn sắp xếp giá giảm dần kèm phân trang. |
| 3 | `03_chi_tiet_san_pham.png` | Trang chi tiết một sản phẩm linh kiện (VD: ASUS RTX 4070 SUPER), hiển thị giá bán, giá cũ, số lượng tồn kho, mô tả và phần đánh giá sao của khách hàng. |
| 4 | `04_gio_hang_checkout.png` | Màn hình Giỏ hàng với danh sách sản phẩm được chọn và Màn hình Checkout nhập thông tin người nhận, địa chỉ giao hàng và phương thức thanh toán. |
| 5 | `05_don_hang_khach_hang.png` | Giao diện "Đơn hàng của tôi" của tài khoản Customer A, hiển thị danh sách đơn hàng kèm trạng thái (`Pending`, `Confirmed`) và nút **Hủy đơn**. |
| 6 | `06_admin_dashboard.png` | Trang Dashboard Admin (`/admin`), hiển thị các thẻ thống kê tổng doanh thu, tổng số đơn hàng thành công, biểu đồ và danh sách tồn kho cảnh báo. |
| 7 | `07_admin_quan_ly_don_hang.png` | Trang Quản lý Đơn hàng dành cho Admin, hiển thị danh sách đơn hàng toàn hệ thống và dropdown thao tác đổi trạng thái đơn hàng (`Preparing` -> `Shipping` -> `Completed`). |
| 8 | `08_admin_quan_ly_kho.png` | Trang Quản lý Kho hàng (`/admin/inventory`), hiển thị danh sách linh kiện trong kho, nút Nhập/Xuất kho và bảng nhật ký giao dịch kho (`InventoryTransaction`). |
| 9 | `09_minh_hoa_401_unauthorized.png` | Chụp phản hồi HTTP `401 Unauthorized` trên Swagger / Postman khi chưa gửi JWT Token mà truy cập API cá nhân `GET /api/auth/me`. |
| 10 | `10_minh_hoa_403_forbidden.png` | Chụp phản hồi HTTP `403 Forbidden` trên Swagger / Postman khi dùng Token của Customer A/B gọi API `GET /api/admin/security-check` hoặc xem đơn hàng của người khác (`GET /api/orders/40000000-0000-0000-0000-000000000001`). |
| 11 | `11_postgresql_database.png` | Màn hình pgAdmin hiển thị cấu trúc cơ sở dữ liệu `techhub_pc` và danh sách các bảng chính (`users`, `products`, `orders`, `inventory_transactions`, `audit_logs`...). |
| 12 | `12_ket_qua_kiem_thu.png` | Cửa sổ Terminal/Command Prompt hiển thị kết quả chạy Unit Test thành công 22/22 Passed và Integration Test thành công 13/13 Passed. |

---

## 📌 Lưu ý khi chụp ảnh
- **Độ phân giải**: Nên chụp toàn màn hình trình duyệt / ứng dụng ở độ phân giải Full HD (1920x1080) để hình ảnh rõ nét.
- **Thư mục lưu trữ**: Các ảnh minh chứng khi chụp xong nên được lưu vào thư mục `documents/images/` để chèn vào file báo cáo Word/Markdown.
