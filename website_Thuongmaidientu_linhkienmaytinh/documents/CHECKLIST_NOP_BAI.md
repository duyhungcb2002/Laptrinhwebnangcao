# CHECKLIST KIỂM TRA TRƯỚC KHI NỘP BÀI - TECHHUB PC

Danh sách kiểm tra giúp thành viên nhóm rà soát toàn bộ sản phẩm trước khi đóng gói nộp bài đồ án môn học.

---

## 📋 1. Mã nguồn & Cấu trúc dự án
- [x] Thư mục backend và frontend độc lập, sạch sẽ.
- [ ] Đã chạy `dotnet clean backend\TechHub.sln` để dọn dẹp thư mục tạm `bin/` và `obj/` trước khi nộp bài thủ công.
- [x] Thư mục build `dist/` của Frontend và các file tạm không bị đẩy vào Git tracking.
- [x] Thư mục runtime upload ảnh và `demo_template/` đã được ghi vào `.gitignore`.

---

## 🔒 2. Bảo mật & Bí mật (Secrets Check)
- [x] Không hard-code chuỗi JWT Key bí mật trong mã nguồn `Program.cs` hay `appsettings.json`.
- [x] Connection String mặc định không lưu username/password thật trong repository.
- [x] Không ghi nhận bất kỳ mật khẩu hoặc secret nào trong các file tài liệu `.md`.
- [x] File `.gitignore` đã loại trừ `.env`, `secrets.json`, `.vs`, `.idea`, `*.user`.

---

## 🗄️ 3. Cơ sở dữ liệu & Migration
- [x] Tất cả các bảng dữ liệu (`users`, `roles`, `permissions`, `products`, `orders`, `inventory_transactions`, `reviews`, `audit_logs`) có đầy đủ Migration EF Core.
- [x] `DevelopmentSeeder` hoạt động idempotent: khi khởi chạy lại ứng dụng không bị tạo dữ liệu trùng lặp hoặc lỗi Duplicate Key.
- [x] Dữ liệu mẫu khởi tạo sẵn Admin, Customer A, Customer B, danh mục CPU/VGA/RAM, sản phẩm linh kiện và đơn hàng mẫu.

---

## 🧪 4. Kiểm thử Backend & Frontend
- [x] Lệnh `dotnet build backend\TechHub.sln` biên dịch thành công 0 Warning, 0 Error.
- [x] Lệnh `dotnet test backend\tests\TechHub.UnitTests\TechHub.UnitTests.csproj` đạt 22/22 Passed.
- [x] Lệnh `dotnet test backend\tests\TechHub.IntegrationTests\TechHub.IntegrationTests.csproj` đạt 13/13 Passed (Khi database `techhub_pc_test` được cấu hình kết nối thành công).
- [x] Lệnh `npm run build --prefix frontend` đóng gói thành công bundle client.
- [x] Lệnh `git diff --check` không phát hiện lỗi xuống dòng hay whitespace thừa.

---

## 📄 5. Tài liệu bàn giao & Báo cáo
- [x] `README.md`: Hướng dẫn cài đặt, cấu hình User Secrets mẫu, cách chạy migration, khởi động và tài khoản demo chuẩn tiếng Việt.
- [x] `documents/KICH_BAN_DEMO.md`: Kịch bản chi tiết 7-10 phút cho buổi báo cáo đồ án.
- [x] `documents/CHECKLIST_NOP_BAI.md`: Tài liệu checklist kiểm tra này.
- [x] `documents/README_ANH_MINH_CHUNG.md`: Danh sách hướng dẫn ảnh chụp màn hình minh chứng giao diện và kiểm thử.

---

## ✋ 6. Công việc thủ công người dùng cần tự thực hiện
- [ ] Chụp đầy đủ 12 ảnh minh chứng theo hướng dẫn trong `README_ANH_MINH_CHUNG.md`.
- [ ] Chèn ảnh minh chứng vào báo cáo đồ án chính thức (file Word `.docx`).
- [ ] Kiểm tra tên file báo cáo và tên thư mục nộp bài theo đúng quy định của giảng viên / nhà trường.
- [ ] Kiểm tra lại trạng thái Git local (`git status`).
- [ ] Kiểm tra kho chứa GitHub sau khi push bài.
- [ ] Tạo và push Git tag `v1.0.0` lên kho chứa GitHub.
