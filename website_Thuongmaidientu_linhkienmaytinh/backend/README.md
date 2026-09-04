# TechHub PC - Backend Foundation & Authentication (Nhiệm vụ 3 & 4)

Hệ thống Backend Nền tảng cho sàn thương mại điện tử **TechHub PC** được xây dựng theo kiến trúc **Clean Architecture** sử dụng **ASP.NET Core Web API .NET 10**, **EF Core 10** và **PostgreSQL**. Dự án triển khai Backend Foundation, cơ chế xác thực JWT, bảo mật Refresh Token (HttpOnly Cookie, SHA-256 hash, token rotation, reuse detection), phân quyền RBAC động và kiểm tra quyền sở hữu đơn hàng (Order Ownership).

---

## 🛠️ 1. Công nghệ sử dụng
- **Framework**: .NET 10.0 (ASP.NET Core Web API)
- **Kiến trúc**: Clean Architecture (Domain, Application, Infrastructure, Api)
- **ORM**: Entity Framework Core 10.0.11 (Npgsql 10.0.3)
- **Database**: PostgreSQL 16+
- **Authentication**: JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`) + HMAC-SHA256
- **Token Security**: Raw Refresh Token trong HttpOnly Cookie, Database chỉ lưu SHA-256 Hash
- **Tài liệu API**: Swagger / OpenAPI (Swashbuckle 10.2.3)
- **Giám sát**: ASP.NET Core Health Checks tích hợp kiểm tra kết nối Database PostgreSQL

---

## 📁 2. Cấu trúc Solution
```text
backend/
├── TechHub.sln
├── global.json
├── .config/
│   └── dotnet-tools.json
└── src/
    ├── TechHub.Domain/         # Thực thể nghiệp vụ (User, Role, Permission, Order, Cart...), độc lập hoàn toàn
    ├── TechHub.Application/    # DTOs, Application Interfaces, Custom Exceptions (ForbiddenAccessException, ConflictException...)
    ├── TechHub.Infrastructure/ # AppDbContext, Entity Configurations, Security Handlers, Token & Password Services, Seeder
    └── TechHub.Api/            # Controllers, Middlewares, Global Exception Handler, Swagger, Health Check, DI Bootstrap
```

---

## 🚀 3. Hướng dẫn thiết lập & Khởi chạy

### Bước 1: Khôi phục .NET Local Tools và Packages
```powershell
cd backend
dotnet tool restore
dotnet restore
```

### Bước 2: Cấu hình User Secrets (Bắt buộc)
> ⚠️ **Quy tắc bảo mật**: Không lưu chuỗi kết nối thực tế, JWT Key hoặc mật khẩu vào `appsettings.json`, mã nguồn hoặc kho lưu trữ Git. Tất cả giá trị nhạy cảm được cấu hình thông qua **User Secrets**.

Danh sách các khóa cấu hình cần thiết:
1. `ConnectionStrings:DefaultConnection`: Chuỗi kết nối đến cơ sở dữ liệu PostgreSQL.
2. `Jwt:Key`: Khóa bí mật ký JWT dạng chuỗi Base64 hợp lệ, sau khi giải mã phải đạt tối thiểu **32 bytes (256 bits)**.
3. `SeedData:AdminPassword`: Mật khẩu tài khoản quản trị viên khởi tạo (`admin@techhub.vn`).
4. `SeedData:CustomerAPassword`: Mật khẩu tài khoản demo Customer A (`customer.a@techhub.vn`).
5. `SeedData:CustomerBPassword`: Mật khẩu tài khoản demo Customer B (`customer.b@techhub.vn`).

#### Tạo Base64 JWT Key an toàn và lưu trực tiếp vào User Secrets:
```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$jwtKey = [Convert]::ToBase64String($bytes)

dotnet user-secrets set "Jwt:Key" $jwtKey --project src/TechHub.Api/TechHub.Api.csproj

Remove-Variable bytes
Remove-Variable jwtKey
```

#### Thiết lập các khóa còn lại vào User Secrets:
```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=techhub_pc;Username=<YOUR_DB_USER>;Password=<YOUR_DB_PASSWORD>" --project src/TechHub.Api/TechHub.Api.csproj

dotnet user-secrets set "SeedData:AdminPassword" "<STRONG_ADMIN_PASSWORD>" --project src/TechHub.Api/TechHub.Api.csproj

dotnet user-secrets set "SeedData:CustomerAPassword" "<STRONG_CUSTOMER_A_PASSWORD>" --project src/TechHub.Api/TechHub.Api.csproj

dotnet user-secrets set "SeedData:CustomerBPassword" "<STRONG_CUSTOMER_B_PASSWORD>" --project src/TechHub.Api/TechHub.Api.csproj
```

### Bước 3: Quản lý Migration & Cập nhật Cơ sở dữ liệu
Hệ thống sử dụng EF Core Migrations có sẵn:
- `20260825235643_InitialCatalog`
- `20260826062450_AddIdentityAndCommerceSchema`

Kiểm tra danh sách migration:
```powershell
dotnet tool run dotnet-ef migrations list --project .\src\TechHub.Infrastructure\TechHub.Infrastructure.csproj --startup-project .\src\TechHub.Api\TechHub.Api.csproj
```

Áp dụng migration vào cơ sở dữ liệu:
```powershell
dotnet tool run dotnet-ef database update --project .\src\TechHub.Infrastructure\TechHub.Infrastructure.csproj --startup-project .\src\TechHub.Api\TechHub.Api.csproj
```

Kiểm tra tính nhất quán của mô hình dữ liệu:
```powershell
dotnet tool run dotnet-ef migrations has-pending-model-changes --project .\src\TechHub.Infrastructure\TechHub.Infrastructure.csproj --startup-project .\src\TechHub.Api\TechHub.Api.csproj
```

### Bước 4: Khởi chạy API
```powershell
dotnet run --project src/TechHub.Api/TechHub.Api.csproj
```
API khởi chạy mặc định tại: `http://localhost:5103` (hoặc cấu hình trong `launchSettings.json`).

---

## 📌 4. Endpoint Giám sát & Tài liệu
- **Swagger UI**: [http://localhost:5103/swagger](http://localhost:5103/swagger) — Hỗ trợ nhập JWT Bearer token để kiểm thử API.
- **Health Check**: [http://localhost:5103/health](http://localhost:5103/health) — Trả về trạng thái kết nối thực tế tới PostgreSQL Database.
- **System Status**: [http://localhost:5103/api/system/status](http://localhost:5103/api/system/status) — Kiểm tra trạng thái hoạt động cơ bản của hệ thống.
- **CORS**: Chấp nhận origin `http://localhost:5173` với `AllowCredentials` để truyền nhận Cookie an toàn.

---

## 🔐 5. Cơ chế Xác thực & Phân quyền

### 5.1. Authentication Endpoints (`/api/auth`)
| Phương thức | Endpoint | Mô tả | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới (gán role `Customer`, sinh cart, trả Access Token & set Refresh Token Cookie) | Public |
| `POST` | `/api/auth/login` | Đăng nhập bằng Email/Password (trả Access Token & set Refresh Token Cookie) | Public |
| `POST` | `/api/auth/refresh` | Đọc refresh cookie, kiểm tra revoke/reuse, rotate token mới | Public (Cookie) |
| `POST` | `/api/auth/logout` | Thu hồi refresh token hiện tại, xóa cookie | Public (Idempotent) |
| `GET` | `/api/auth/me` | Lấy thông tin tài khoản đang đăng nhập | Yêu cầu JWT |

### 5.2. Nguyên lý Hoạt động Access Token & Refresh Token
- **Access Token**:
  - Lưu trữ **chỉ trong bộ nhớ RAM** (in-memory) của frontend, không lưu `localStorage` hay `sessionStorage` để phòng tránh rủi ro XSS.
  - Hết hạn sau **15 phút**. Chứa thông tin claims: `sub`, `email`, `role`, `permission`.
- **Refresh Token**:
  - Thời hạn **7 ngày**.
  - Client nhận raw token qua cookie an toàn: `HttpOnly = true`, `SameSite = Lax`, `Path = /api/auth`, `Secure = true` (khi chạy ngoài Development).
  - Database **chỉ lưu mã băm SHA-256** của Refresh Token (`TokenHash`).
  - **Token Rotation**: Mỗi lần gọi `/api/auth/refresh` thành công, token cũ được đánh dấu `RevokedAtUtc` và thay thế bằng token mới cùng `FamilyId`.
  - **Token Reuse Detection**: Nếu một Refresh Token đã bị thu hồi bị sử dụng lại, hệ thống lập tức phát hiện, đánh dấu `ReuseDetectedAtUtc`, vô hiệu hóa **toàn bộ phiên đăng nhập còn lại trong cùng family**, và ném `UnauthorizedAccessException` trả về `401 Unauthorized`.

### 5.3. Chuẩn hóa Định dạng Lỗi (RFC 7807 ProblemDetails)
Toàn bộ phản hồi lỗi từ API đều đi qua `GlobalExceptionHandler` và tuân thủ chuẩn `application/problem+json` gồm: `type`, `title`, `status`, `detail`, `instance`, `traceId`.
- `ArgumentException` → `400 Bad Request`
- `UnauthorizedAccessException` → `401 Unauthorized`
- `ForbiddenAccessException` → `403 Forbidden`
- `NotFoundException` (hoặc `KeyNotFoundException`) → `404 Not Found`
- `ConflictException` → `409 Conflict`
- Lỗi không xác định khác → `500 Internal Server Error` (không để lộ stack trace hay câu lệnh SQL nội bộ)

### 5.4. RBAC & Phân quyền theo Quyền hạn (Permissions)
- Hệ thống hỗ trợ 2 vai trò mặc định: `Customer` và `Admin`.
- Phân quyền động thông qua `[HasPermission("...")]` và `PermissionAuthorizationHandler`:
  - `Customer` sở hữu các quyền: `profile.read`, `profile.update`, `cart.manage`, `orders.read.own`, `reviews.create`.
  - `Admin` sở hữu quyền: `admin.access` và toàn bộ 13 quyền quản trị khác.
- Endpoint Admin kiểm tra quyền:
  - `GET /api/admin/security-check` yêu cầu quyền `admin.access`.

### 5.5. Kiểm tra Quyền sở hữu Đơn hàng (Order Ownership)
- Endpoint: `GET /api/orders/{id}`
- Xử lý thông qua `OrderAuthorizationHandler`:
  - Khách hàng (Customer) chỉ được phép xem đơn hàng nếu `order.UserId` trùng khớp với `sub` trong JWT của chính họ.
  - Quản trị viên có quyền `orders.read.all` được phép xem mọi đơn hàng trong hệ thống.

---

## 🧪 6. Danh sách Kịch bản Kiểm thử Bảo mật (401, 403 & Ownership)

| STT | Kịch bản kiểm thử | Yêu cầu kiểm tra | Kết quả mong đợi | Trạng thái kiểm tra |
| :---: | :--- | :--- | :---: | :--- |
| 1 | Gọi `GET /api/admin/security-check` khi **không có JWT** | Không gắn header `Authorization` | `401 Unauthorized` (ProblemDetails) | Đã kiểm tra thực tế trên API đang chạy |
| 2 | Gọi `POST /api/auth/refresh` khi **thiếu cookie** | Không gửi cookie `techhub_refresh` | `401 Unauthorized` (ProblemDetails) | Đã kiểm tra thực tế trên API đang chạy |
| 3 | Gọi `GET /api/admin/security-check` bằng JWT của **Customer** | Gắn Bearer JWT của tài khoản Customer A | `403 Forbidden` (ProblemDetails) | Cần kiểm tra thực tế với tài khoản |
| 4 | Gọi `GET /api/admin/security-check` bằng JWT của **Admin** | Gắn Bearer JWT của tài khoản Admin có `admin.access` | `200 OK` | Cần kiểm tra thực tế với tài khoản |
| 5 | Customer A truy cập đơn hàng của chính mình | Gọi `GET /api/orders/40000000-0000-0000-0000-000000000001` bằng JWT của Customer A | `200 OK` | Cần kiểm tra thực tế với tài khoản |
| 6 | Customer A truy cập đơn hàng của Customer B | Gọi `GET /api/orders/40000000-0000-0000-0000-000000000002` bằng JWT của Customer A | `403 Forbidden` (ProblemDetails) | Cần kiểm tra thực tế với tài khoản |
| 7 | Admin truy cập đơn hàng của Customer A hoặc B | Gọi `GET /api/orders/{id}` bằng JWT của Admin | `200 OK` | Cần kiểm tra thực tế với tài khoản |
| 8 | Đăng nhập tài khoản bị khóa (`IsActive = false`) | Gọi `POST /api/auth/login` với tài khoản bị khóa | `403 Forbidden` (ProblemDetails) | Cần kiểm tra thực tế với tài khoản |
| 9 | Đăng ký với Email đã tồn tại | Gọi `POST /api/auth/register` với email đã đăng ký | `409 Conflict` (ProblemDetails) | Cần kiểm tra thực tế với tài khoản |
