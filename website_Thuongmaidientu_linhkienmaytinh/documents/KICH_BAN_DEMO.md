# KỊCH BẢN DEMO BÁO CÁO ĐỒ ÁN - TECHHUB PC
**Môn học**: Lập trình Web Nâng cao  
**Đề tài**: Website Thương Mại Điện Tử Kinh Doanh Linh Kiện Máy Tính - TechHub PC  
**Thời lượng dự kiến**: 7 - 10 phút  

---

## 🎬 Tổng quan kịch bản

Kịch bản trình bày luồng hoạt động thực tế của hệ thống qua các vai trò: **Khách hàng chưa đăng nhập**, **Khách hàng đã đăng nhập (Customer A, Customer B)** và **Quản trị viên (Admin)**.

---

## ⏱️ Chi tiết các bước Demo (Thời lượng: 7 - 10 phút)

### Phần 1: Giới thiệu Tổng quan & Khách hàng Duyệt Sản phẩm (2 phút)
1. **Trang chủ & Danh sách sản phẩm**:
   - Truy cập giao diện `http://localhost:5173`.
   - Giới thiệu giao diện hiện đại, responsive, danh sách linh kiện nổi bật (CPU, VGA, RAM...).
2. **Tìm kiếm, Lọc & Phân trang**:
   - Nhập từ khóa tìm kiếm `"i7"` hoặc `"RTX"`.
   - Chọn bộ lọc theo danh mục `"VGA"` và chọn sắp xếp giá giảm dần.
   - Thử thao tác phân trang (Next/Previous page) mượt mà.
3. **Xem Chi tiết sản phẩm & Đánh giá**:
   - Nhấn vào sản phẩm `"ASUS TUF Gaming GeForce RTX 4070 SUPER 12GB"`.
   - Giới thiệu thông số kỹ thuật, hình ảnh, tình trạng tồn kho thực tế và danh sách đánh giá từ các khách hàng trước.

---

### Phần 2: Đăng nhập Customer A & Thực hiện Đặt hàng (2 phút)
1. **Đăng nhập Khách hàng A**:
   - Nhấn **Đăng nhập**, nhập email `customer.a@techhub.vn` và mật khẩu demo.
   - Nhận diện trạng thái đăng nhập công khai qua Cookie HttpOnly an toàn.
2. **Giỏ hàng Realtime**:
   - Chọn sản phẩm `"Intel Core i7-13700K"`, tăng số lượng thành 2, nhấn **Thêm vào giỏ hàng**.
   - Mở giỏ hàng, cập nhật số lượng, kiểm tra tổng tiền tự động tính toán.
3. **Thực hiện Checkout (Đặt hàng)**:
   - Nhấn **Thực hiện đặt hàng**.
   - Điền thông tin người nhận: `Nguyễn Văn A`, số điện thoại và địa chỉ giao hàng.
   - Chọn phương thức thanh toán **COD (Thanh toán khi nhận hàng)** và chốt đơn thành công.
   - Hệ thống tự động kiểm tra lượng tồn kho realtime trước khi xác nhận đơn.

---

### Phần 3: Quản lý Đơn hàng & Tính năng Hủy đơn (1.5 phút)
1. **Xem Đơn hàng của tôi**:
   - Chuyển sang trang **Đơn hàng của tôi**.
   - Xem chi tiết đơn hàng vừa tạo với trạng thái `Pending` (Chờ xử lý).
2. **Hủy đơn hàng Pending**:
   - Thực hiện nhấn nút **Hủy đơn hàng**.
   - Hệ thống chuyển trạng thái đơn sang `Cancelled` và hoàn lại tồn kho sản phẩm tự động.

---

### Phần 4: Đăng nhập Admin & Quản trị Hệ thống (2.5 phút)
1. **Đăng nhập Admin**:
   - Đăng xuất tài khoản Customer A, đăng nhập tài khoản Admin `admin@techhub.vn`.
2. **Dashboard Thống kê Doanh thu**:
   - Truy cập `/admin`. Xem biểu đồ doanh thu, tổng số đơn hàng, đơn hàng thành công, và tổng số sản phẩm trong kho.
3. **Quản lý Đơn hàng & Chuyển trạng thái**:
   - Mở trang **Quản lý Đơn hàng**. Xem đơn hàng của Customer B (`ORD-DEMO-002`).
   - Thực hiện cập nhật trạng thái đơn hàng theo luồng chuẩn: `Preparing` -> `Shipping` -> `Completed`.
4. **Quản lý Tồn kho & Nhật ký Giao dịch Kho**:
   - Mở trang **Quản lý Kho hàng**.
   - Thực hiện **Nhập kho thủ công** thêm 10 sản phẩm CPU i7.
   - Cho hội đồng xem danh sách lịch sử giao dịch kho (`InventoryTransaction`) ghi rõ loại giao dịch (`Import`), số lượng và thời gian.
5. **Quản lý Đánh giá Sản phẩm**:
   - Mở trang **Quản lý Đánh giá**.
   - Thực hiện kiểm duyệt ẩn/hiện một đánh giá vi phạm hoặc chưa phù hợp.

---

### Phần 5: Demo Bảo mật & Kiểm thử Phân quyền (1.5 phút)
Sử dụng Swagger UI (`http://localhost:5103/swagger`) hoặc Postman để minh họa chính xác HTTP Status Code trả về:

1. **Minh họa 401 Unauthorized**:
   - Không gắn Header `Authorization` (chưa nhập JWT), gọi API cá nhân `GET /api/auth/me`.
   - Kết quả phản hồi chính xác: `401 Unauthorized` kèm ProblemDetails JSON.
2. **Minh họa 403 Forbidden**:
   - Đăng nhập tài khoản Customer A hoặc B (`customer.a@techhub.vn`), lấy Access Token gắn vào Header `Authorization: Bearer {token}`.
   - Thử gọi API kiểm tra quyền Admin: `GET /api/admin/security-check`.
   - Kết quả phản hồi chính xác: `403 Forbidden` do tài khoản không có quyền Admin.
3. **Minh họa Kiểm tra Quyền sở hữu (Ownership Authorization)**:
   - Đăng nhập tài khoản Customer B (`customer.b@techhub.vn`).
   - Thử dùng GUID thật đơn hàng của Customer A (`40000000-0000-0000-0000-000000000001`) để gọi `GET /api/orders/40000000-0000-0000-0000-000000000001`.
   - Kết quả phản hồi chính xác: `403 Forbidden` do Customer B không phải là người sở hữu đơn hàng này.

---

### Phần 6: Kiểm tra Hạ tầng Backend, Swagger & Health Check (0.5 phút)
1. **Swagger UI**: Mở `http://localhost:5103/swagger`, minh họa tài liệu REST API chuẩn OpenAPI 3.0.
2. **Endpoint Health Check**: Mở `http://localhost:5103/health`, xem kết quả kiểm tra trạng thái kết nối Database PostgreSQL định dạng JSON.
3. **Database PostgreSQL**: Mở pgAdmin xem dữ liệu các bảng `orders`, `inventory_transactions`, `users`, `audit_logs` được lưu trữ chính xác.
