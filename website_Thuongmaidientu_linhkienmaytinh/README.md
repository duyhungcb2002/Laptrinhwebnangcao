# TechHub PC - Website Thương Mại Điện Tử Kinh Doanh Linh Kiện Máy Tính

Dự án môn học **Lập trình Web Nâng cao** - Nhóm 2.

Website thương mại điện tử kinh doanh linh kiện máy tính **TechHub PC** cung cấp giải pháp toàn diện cho người dùng mua sắm phần cứng máy tính và quản trị viên quản lý hệ thống bán hàng, kho hàng, đánh giá và thống kê kinh doanh.

---

## 📌 Tính năng hệ thống

### 1. Dành cho Khách hàng (Customer)
- **Xem danh mục & sản phẩm**: Duyệt danh sách linh kiện máy tính (CPU, VGA, RAM, SSD, Mainboard...), xem chi tiết thông tin, thông số kỹ thuật và hình ảnh.
- **Tìm kiếm, Lọc & Phân trang**: Tìm kiếm theo tên/mã sản phẩm, lọc theo danh mục, khoảng giá, sắp xếp theo giá tăng/giảm hoặc mới nhất.
- **Tài khoản & Xác thực**: Đăng ký, đăng nhập hệ thống bảo mật bằng JWT và Cookie HttpOnly, quản lý thông tin cá nhân.
- **Giỏ hàng & Đặt hàng (Checkout)**: Thêm/sửa/xóa sản phẩm trong giỏ hàng, thực hiện thanh toán COD hoặc chuyển khoản ngân hàng. Kiểm tra tồn kho realtime trước khi chốt đơn.
- **Quản lý Đơn hàng**: Xem lịch sử đơn hàng, chi tiết từng đơn hàng, tự hủy đơn hàng ở trạng thái chờ xử lý (`Pending`).
- **Đánh giá Sản phẩm**: Viết đánh giá và chấm điểm sao cho các sản phẩm trong đơn hàng đã hoàn thành (`Completed`).

### 2. Dành cho Quản trị viên (Admin)
- **Quản lý Danh mục**: Thêm, sửa, ẩn/hiện danh mục sản phẩm.
- **Quản lý Sản phẩm**: Thêm mới, cập nhật thông tin sản phẩm, đăng tải hình ảnh linh kiện, điều chỉnh trạng thái kinh doanh.
- **Quản lý Tồn kho & Kho hàng**: Nhập kho, xuất kho, điều chỉnh tồn kho thủ công kèm theo lịch sử nhật ký giao dịch kho (`InventoryTransaction`).
- **Quản lý Đơn hàng**: Duyệt đơn, cập nhật trạng thái đơn hàng theo đúng luồng (`Pending` -> `Confirmed` -> `Preparing` -> `Shipping` -> `Completed` / `Cancelled`).
- **Quản lý Đánh giá**: Kiểm duyệt, ẩn/hiện các đánh giá sản phẩm của người dùng.
- **Dashboard & Báo cáo Thống kê**: Xem biểu đồ tổng quan doanh thu, thống kê số lượng đơn hàng theo trạng thái, sản phẩm bán chạy và cảnh báo tồn kho thấp.

---

## 🛠️ Công nghệ sử dụng

- **Backend**: .NET 10 Web API, Entity Framework Core 10, Npgsql (PostgreSQL Provider), JWT Authentication, RBAC (Role-Based Access Control) Policy-Based Authorization.
- **Frontend**: React 19, Vite, Vanilla CSS + Tailwind CSS, Axios, Lucide React Icons.
- **Database**: PostgreSQL 16+.
- **Testing**: xUnit, Microsoft.NET.Test.Sdk, Microsoft.AspNetCore.Mvc.Testing, Coverlet Collector.

---

## 📁 Cấu trúc thư mục dự án

```text
website_Thuongmaidientu_linhkienmaytinh/
├── backend/                              # Mã nguồn Backend API & Tests (.NET 10)
│   ├── src/
│   │   ├── TechHub.Api/                  # Web API Project (Controllers, Program.cs)
│   │   ├── TechHub.Application/          # Interfaces, DTOs, Business Logic
│   │   ├── TechHub.Domain/               # Entities, Enums
│   │   └── TechHub.Infrastructure/       # DbContext, Security, EF Configurations, Services
│   └── tests/
│       ├── TechHub.UnitTests/            # Unit Tests cho Business Logic & Services
│       └── TechHub.IntegrationTests/     # Integration Tests với PostgreSQL thật
├── frontend/                             # Mã nguồn Frontend (React 19 + Vite)
│   ├── src/                              # Components, Pages, Context, API Services
│   ├── index.html
│   └── package.json
├── documents/                            # Tài liệu đồ án & Kịch bản demo
│   ├── KICH_BAN_DEMO.md                  # Kịch bản báo cáo demo chi tiết (7 - 10 phút)
│   ├── CHECKLIST_NOP_BAI.md              # Danh sách kiểm tra hoàn thiện trước khi nộp
│   └── README_ANH_MINH_CHUNG.md          # Hướng dẫn ảnh chụp màn hình minh chứng
└── README.md                             # Tài liệu hướng dẫn cài đặt & chạy dự án
```

---

## ⚙️ Yêu cầu phần mềm cài đặt

- **.NET 10 SDK** (Chính xác .NET 10 SDK).
- **Node.js**: Phiên bản `20.19` trở lên hoặc `22.12` trở lên & **npm**.
- **PostgreSQL Database Server** (v14 trở lên, lắng nghe tại cổng `5432`).

---

## 🗄️ Hướng dẫn Khởi tạo Database PostgreSQL

Chạy lệnh SQL dưới đây trong psql hoặc pgAdmin Query Tool để khởi tạo User và các Database:

```sql
CREATE USER techhub_app WITH PASSWORD '<MAT_KHAU_POSTGRES_CUA_BAN>';
CREATE DATABASE techhub_pc OWNER techhub_app;
CREATE DATABASE techhub_pc_test OWNER techhub_app;
```

> **Lưu ý**: Nếu User `techhub_app` hoặc Database `techhub_pc` / `techhub_pc_test` đã tồn tại trước đó từ các bước thực hành trước, bỏ qua câu lệnh tạo tương ứng và chỉ cấp lại quyền nếu cần.

---

## 🔑 Cấu hình User Secrets (Tuyệt đối không lưu secret trong mã nguồn)

Để ứng dụng tuân thủ nguyên tắc bảo mật **Fail-Closed**, connection string và JWT Key bắt buộc phải được cấu hình qua User Secrets hoặc biến môi trường.

### 1. Cấu hình secrets cho Backend API (`TechHub.Api`):
```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=techhub_pc;Username=techhub_app;Password=<MAT_KHAU_POSTGRES_CUA_BAN>" --project backend/src/TechHub.Api/TechHub.Api.csproj

dotnet user-secrets set "Jwt:Key" "<CHUOI_JWT_SECRET_TOI_THIEU_256_BIT_CUA_BAN>" --project backend/src/TechHub.Api/TechHub.Api.csproj

# Mật khẩu khởi tạo dữ liệu demo (Seed Data):
dotnet user-secrets set "SeedData:AdminPassword" "<MAT_KHAU_DEMO_DO_NGUOI_DUNG_TU_DAT>" --project backend/src/TechHub.Api/TechHub.Api.csproj
dotnet user-secrets set "SeedData:CustomerAPassword" "<MAT_KHAU_DEMO_DO_NGUOI_DUNG_TU_DAT>" --project backend/src/TechHub.Api/TechHub.Api.csproj
dotnet user-secrets set "SeedData:CustomerBPassword" "<MAT_KHAU_DEMO_DO_NGUOI_DUNG_TU_DAT>" --project backend/src/TechHub.Api/TechHub.Api.csproj
```

### 2. Cấu hình secrets cho Integration Tests (`TechHub.IntegrationTests`):
```bash
dotnet user-secrets set "ConnectionStrings:TestConnection" "Host=localhost;Port=5432;Database=techhub_pc_test;Username=techhub_app;Password=<MAT_KHAU_POSTGRES_CUA_BAN>" --project backend/tests/TechHub.IntegrationTests/TechHub.IntegrationTests.csproj

dotnet user-secrets set "Jwt:Key" "<CHUOI_JWT_SECRET_TOI_THIEU_256_BIT_CUA_BAN>" --project backend/tests/TechHub.IntegrationTests/TechHub.IntegrationTests.csproj
```

---

## 🚀 Chạy Database Migration & Khởi động Dự án

### 1. Áp dụng Database Migration cho Backend
Tại thư mục gốc dự án:
```bash
dotnet ef database update --project backend/src/TechHub.Infrastructure/TechHub.Infrastructure.csproj --startup-project backend/src/TechHub.Api/TechHub.Api.csproj
```

### 2. Khởi động Backend API (.NET 10)
```bash
dotnet run --project backend/src/TechHub.Api/TechHub.Api.csproj
```
- Server Backend HTTP: http://localhost:5103
- Server Backend HTTPS: https://localhost:7283
- **Trang tài liệu Swagger API**: http://localhost:5103/swagger
- **Endpoint Health Check**: http://localhost:5103/health

### 3. Khởi động Frontend (React 19 + Vite)
Mở một cửa sổ Terminal mới:
```bash
cd frontend
npm install
npm run dev
```
- Giao diện ứng dụng chạy tại: http://localhost:5173

---

## 🧪 Hướng dẫn Chạy Kiểm thử (Unit Tests & Integration Tests)

### 1. Chạy Unit Tests
```bash
dotnet test backend/tests/TechHub.UnitTests/TechHub.UnitTests.csproj
```

### 2. Chạy Integration Tests (Yêu cầu `ConnectionStrings:TestConnection` đã cấu hình)
```bash
dotnet test backend/tests/TechHub.IntegrationTests/TechHub.IntegrationTests.csproj
```

---

## 👤 Hướng dẫn Tài khoản Demo & Dữ liệu Mẫu

Khi ứng dụng chạy ở môi trường Development, `DevelopmentSeeder` sẽ tự động khởi tạo dữ liệu mẫu một cách **Idempotent** (chạy lại không trùng lặp):

| Vai trò | Email đăng nhập | Mật khẩu |
| :--- | :--- | :--- |
| **Admin (Quản trị viên)** | `admin@techhub.vn` | `<MAT_KHAU_DEMO_DO_NGUOI_DUNG_TU_DAT>` |
| **Customer A (Khách hàng A)** | `customer.a@techhub.vn` | `<MAT_KHAU_DEMO_DO_NGUOI_DUNG_TU_DAT>` |
| **Customer B (Khách hàng B)** | `customer.b@techhub.vn` | `<MAT_KHAU_DEMO_DO_NGUOI_DUNG_TU_DAT>` |

> **Lưu ý**: Mật khẩu được mã hóa an toàn bằng Argon2id. Giá trị mật khẩu ban đầu được đọc trực tiếp từ User Secrets (`SeedData:AdminPassword`, `SeedData:CustomerAPassword`, `SeedData:CustomerBPassword`).

---

## 🖼️ Danh sách Ảnh minh chứng Đồ án

Chi tiết danh sách các ảnh chụp màn hình cần thực hiện được liệt kê tại [documents/README_ANH_MINH_CHUNG.md](documents/README_ANH_MINH_CHUNG.md). Xem thêm kịch bản demo tại [documents/KICH_BAN_DEMO.md](documents/KICH_BAN_DEMO.md) và danh sách kiểm tra tại [documents/CHECKLIST_NOP_BAI.md](documents/CHECKLIST_NOP_BAI.md).

---

## 🛠️ Xử lý lỗi thường gặp (Troubleshooting)

1. **Lỗi `System.InvalidOperationException: FAIL-CLOSED: ConnectionStrings:DefaultConnection is required`**:
   - **Nguyên nhân**: Bạn chưa đặt connection string trong User Secrets.
   - **Khắc phục**: Chạy lại lệnh `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "..."` cho dự án `TechHub.Api`.

2. **Lỗi `Jwt:Key is required and must be at least 256 bits`**:
   - **Nguyên nhân**: Đã xóa JWT key hard-code để bảo mật, ứng dụng fail-closed khi thiếu key.
   - **Khắc phục**: Đặt chuỗi bí mật đủ độ dài (tối thiểu 32 ký tự / 256 bits) trong User Secrets dưới khóa `Jwt:Key`.

3. **Integration Test thất bại lỗi 28P01 Password authentication failed**:
   - **Nguyên nhân**: Mật khẩu PostgreSQL trong User Secrets của project test không đúng với tài khoản local.
   - **Khắc phục**: Đặt lại `ConnectionStrings:TestConnection` trong User Secrets của `TechHub.IntegrationTests` đúng với thông tin đăng nhập PostgreSQL local của bạn.
