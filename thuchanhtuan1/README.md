# Bài thực hành RBAC - Tuần 1

## Môi trường cần có

- .NET SDK 10
- PostgreSQL đang chạy ở cổng 5432
- pgAdmin hoặc psql để xem database

## Tạo database

Mở pgAdmin bằng tài khoản quản trị rồi chạy:

```sql
CREATE USER week1_app WITH PASSWORD 'week1_secret';
CREATE DATABASE week1_rbac OWNER week1_app;
```

Connection string của bài đang để trong `appsettings.Development.json`:

```text
Host=localhost;Port=5432;Database=week1_rbac;Username=week1_app;Password=week1_secret
```

## Chạy project

Mở terminal tại thư mục project rồi chạy lần lượt:

```bash
dotnet tool restore
dotnet restore
dotnet ef migrations add InitialRbac
dotnet ef database update
dotnet run
```

Swagger mở ở địa chỉ: `http://localhost:5080/swagger`

Sau khi chạy migration, trong database sẽ có các bảng:

- `users`
- `roles`
- `permissions`
- `user_roles`
- `role_permissions`
- `__EFMigrationsHistory`

## Test nhanh trên Swagger


1. Tạo hai permission:

```json
{ "code": "user.read", "description": "Xem người dùng" }
```

```json
{ "code": "user.create", "description": "Tạo người dùng" }
```

2. Tạo role `admin`:

```json
{ "name": "admin", "description": "Quản trị hệ thống" }
```

3. Gán hai permission vào role bằng:

```text
PUT /api/roles/{roleId}/permissions/{permissionId}
```

4. Tạo user:

```json
{
  "email": "admin@example.edu.vn",
  "displayName": "Campus Admin",
  "password": "P@ssword123"
}
```

5. Gán role `admin` cho user:

```text
PUT /api/users/{userId}/roles/{roleId}
```

6. Kiểm tra lại:

```text
GET /api/roles/{roleId}
GET /api/users/{userId}
```

Response của role sẽ có danh sách permission, còn response của user sẽ có danh sách role. Password chỉ được hash để lưu database, không trả về trong JSON.

