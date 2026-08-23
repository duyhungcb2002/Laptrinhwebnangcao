# Thực hành tuần 2 - School API
## Công nghệ sử dụng
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core 8.0.20
- Pomelo.EntityFrameworkCore.MySql 8.0.3
- MySQL 8
- Swagger (Swashbuckle 6.6.2)
- Postman

## Chức năng chính

- CRUD chương trình đào tạo (`Programme`).
- CRUD học phần (`Course`).
- CRUD sinh viên (`Student`).
- Mỗi sinh viên thuộc một chương trình đào tạo.
- Không cho xóa chương trình khi vẫn còn sinh viên.
- Kiểm tra trùng mã chương trình, mã học phần, mã sinh viên và email.
- Lọc sinh viên theo trạng thái và phân trang với `page`, `pageSize`.
- Lấy danh sách sinh viên theo chương trình đào tạo.
- Trả lỗi theo Problem Details với các mã `400`, `404`, `409` và `500`.

## Chuẩn bị

Máy cần có:
- .NET SDK 8.x
- MySQL Server 8.x
- MySQL Workbench (không bắt buộc nhưng thuận tiện để kiểm tra dữ liệu)
- Postman (dùng để chạy collection đi kèm project)

Kiểm tra phiên bản đã cài:

```powershell
dotnet --list-sdks
mysql --version
```

## Tạo cơ sở dữ liệu

Mở MySQL Workbench và chạy bằng tài khoản có quyền tạo database/user. Thay `YOUR_PASSWORD` bằng mật khẩu riêng trên máy:

```sql
CREATE DATABASE student_api_lab
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER 'student_api'@'localhost'
  IDENTIFIED BY 'YOUR_PASSWORD';

GRANT ALL PRIVILEGES ON student_api_lab.*
  TO 'student_api'@'localhost';
```

Không lưu mật khẩu thật trong `appsettings.json` hoặc đưa lên GitHub.

## Cấu hình và chạy project

Mở PowerShell tại thư mục `thuchanhtuan2`:

```powershell
dotnet restore
dotnet tool restore
```

Project sử dụng User Secrets với key `ConnectionStrings:SchoolDb`. Thiết lập connection string bằng lệnh sau và thay `YOUR_PASSWORD` bằng mật khẩu của user `student_api`:

```powershell
dotnet user-secrets set "ConnectionStrings:SchoolDb" 'Server=localhost;Port=3306;Database=student_api_lab;User=student_api;Password=YOUR_PASSWORD;'
```

Áp dụng Migration và chạy API:

```powershell
dotnet ef database update
dotnet run
```

Swagger được mở tại:

```text
http://localhost:5051/swagger
```

Nếu cổng chạy trên máy khác với `5051`, sử dụng địa chỉ được in ra trong Terminal.

## Các endpoint

### Programmes

| Phương thức | Đường dẫn | Chức năng |
| --- | --- | --- |
| GET | `/api/programmes` | Lấy danh sách chương trình |
| GET | `/api/programmes/{id}` | Lấy chương trình theo ID |
| POST | `/api/programmes` | Tạo chương trình |
| PUT | `/api/programmes/{id}` | Cập nhật chương trình |
| DELETE | `/api/programmes/{id}` | Xóa chương trình |
| GET | `/api/programmes/{id}/students` | Lấy sinh viên thuộc chương trình |

### Courses

| Phương thức | Đường dẫn | Chức năng |
| --- | --- | --- |
| GET | `/api/courses` | Lấy danh sách học phần |
| GET | `/api/courses/{id}` | Lấy học phần theo ID |
| POST | `/api/courses` | Tạo học phần |
| PUT | `/api/courses/{id}` | Cập nhật học phần |
| DELETE | `/api/courses/{id}` | Xóa học phần |

### Students

| Phương thức | Đường dẫn | Chức năng |
| --- | --- | --- |
| GET | `/api/students` | Lấy danh sách, lọc và phân trang |
| GET | `/api/students/{id}` | Lấy sinh viên theo ID |
| POST | `/api/students` | Tạo sinh viên |
| PUT | `/api/students/{id}` | Cập nhật sinh viên |
| DELETE | `/api/students/{id}` | Xóa sinh viên |

Ví dụ lọc sinh viên đang học, trang đầu tiên và lấy tối đa 10 bản ghi:

```text
GET /api/students?status=ACTIVE&page=1&pageSize=10
```

`page` phải lớn hơn hoặc bằng 1; `pageSize` nằm trong khoảng 1 đến 100.

## Mã phản hồi chính

| Mã | Ý nghĩa |
| --- | --- |
| 200 | Đọc hoặc cập nhật thành công |
| 201 | Tạo dữ liệu thành công |
| 204 | Xóa dữ liệu thành công |
| 400 | Dữ liệu đầu vào không hợp lệ |
| 404 | Không tìm thấy dữ liệu |
| 409 | Trùng dữ liệu hoặc vi phạm quy tắc nghiệp vụ |

## Kiểm tra bằng Postman

Collection đã export nằm tại:

```text
postman/Week_2_School_API.postman_collection.json
```

Import file này vào Postman, giữ API đang chạy và gửi các request để kiểm tra các mã `201`, `400`, `404`, `409` và `204`.

## Migration

Migration ban đầu của project là `InitialSchoolSchema`, tạo các bảng:

- `programme`
- `course`
- `student`
- `__EFMigrationsHistory`

Quan hệ `student.programme_id` tham chiếu đến `programme.programme_id` và sử dụng `ON DELETE RESTRICT`.
