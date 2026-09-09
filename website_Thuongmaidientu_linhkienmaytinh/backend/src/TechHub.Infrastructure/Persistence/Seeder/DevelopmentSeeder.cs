using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TechHub.Application.Common.Interfaces;
using TechHub.Domain.Entities;
using TechHub.Domain.Enums;
using TechHub.Infrastructure.Persistence.Configurations;

namespace TechHub.Infrastructure.Persistence.Seeder;

public static class DevelopmentSeeder
{
    public static async Task SeedAsync(
        AppDbContext context,
        IConfiguration configuration,
        IPasswordService passwordService,
        ILogger logger)
    {
        var adminEmail = configuration["SeedData:AdminEmail"] ?? "admin@techhub.vn";
        var customerAEmail = configuration["SeedData:CustomerAEmail"] ?? "customer.a@techhub.vn";
        var customerBEmail = configuration["SeedData:CustomerBEmail"] ?? "customer.b@techhub.vn";

        // Read seed passwords without fallback values
        var adminPass = configuration["SeedData:AdminPassword"];
        var customerAPass = configuration["SeedData:CustomerAPassword"];
        var customerBPass = configuration["SeedData:CustomerBPassword"];

        var seedDate = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);

        // 1. Seed Admin User
        var adminNormalized = adminEmail.Trim().ToUpperInvariant();
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == adminNormalized);

        if (adminUser == null)
        {
            if (string.IsNullOrWhiteSpace(adminPass))
            {
                logger.LogInformation("Seed configuration key '{Key}' is not configured. Skipping seeding of Admin user.", "SeedData:AdminPassword");
            }
            else
            {
                adminUser = new User
                {
                    Id = Guid.NewGuid(),
                    Email = adminEmail,
                    NormalizedEmail = adminNormalized,
                    FullName = "Quản trị viên TechHub",
                    PhoneNumber = "0900000000",
                    IsActive = true,
                    CreatedAtUtc = seedDate
                };
                adminUser.PasswordHash = passwordService.HashPassword(adminUser, adminPass);
                context.Users.Add(adminUser);

                context.UserRoles.Add(new UserRole
                {
                    UserId = adminUser.Id,
                    RoleId = RoleConfiguration.AdminRoleId,
                    AssignedAtUtc = seedDate
                });
            }
        }
        else if (!string.IsNullOrWhiteSpace(adminPass))
        {
            adminUser.PasswordHash = passwordService.HashPassword(adminUser, adminPass);
            var hasAdminRole = await context.UserRoles.AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == RoleConfiguration.AdminRoleId);
            if (!hasAdminRole)
            {
                context.UserRoles.Add(new UserRole
                {
                    UserId = adminUser.Id,
                    RoleId = RoleConfiguration.AdminRoleId,
                    AssignedAtUtc = seedDate
                });
            }
        }

        // 2. Seed Customer A
        var custANormalized = customerAEmail.Trim().ToUpperInvariant();
        var customerA = await context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == custANormalized);

        if (customerA == null)
        {
            if (string.IsNullOrWhiteSpace(customerAPass))
            {
                logger.LogInformation("Seed configuration key '{Key}' is not configured. Skipping seeding of Customer A.", "SeedData:CustomerAPassword");
            }
            else
            {
                customerA = new User
                {
                    Id = Guid.Parse("30000000-0000-0000-0000-000000000001"),
                    Email = customerAEmail,
                    NormalizedEmail = custANormalized,
                    FullName = "Nguyễn Văn A (Customer A)",
                    PhoneNumber = "0901111111",
                    IsActive = true,
                    CreatedAtUtc = seedDate
                };
                customerA.PasswordHash = passwordService.HashPassword(customerA, customerAPass);
                context.Users.Add(customerA);

                context.UserRoles.Add(new UserRole
                {
                    UserId = customerA.Id,
                    RoleId = RoleConfiguration.CustomerRoleId,
                    AssignedAtUtc = seedDate
                });

                context.Carts.Add(new Cart
                {
                    Id = Guid.NewGuid(),
                    UserId = customerA.Id,
                    CreatedAtUtc = seedDate
                });
            }
        }
        else if (!string.IsNullOrWhiteSpace(customerAPass))
        {
            customerA.PasswordHash = passwordService.HashPassword(customerA, customerAPass);
        }

        // 3. Seed Customer B
        var custBNormalized = customerBEmail.Trim().ToUpperInvariant();
        var customerB = await context.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == custBNormalized);

        if (customerB == null)
        {
            if (string.IsNullOrWhiteSpace(customerBPass))
            {
                logger.LogInformation("Seed configuration key '{Key}' is not configured. Skipping seeding of Customer B.", "SeedData:CustomerBPassword");
            }
            else
            {
                customerB = new User
                {
                    Id = Guid.Parse("30000000-0000-0000-0000-000000000002"),
                    Email = customerBEmail,
                    NormalizedEmail = custBNormalized,
                    FullName = "Trần Thị B (Customer B)",
                    PhoneNumber = "0902222222",
                    IsActive = true,
                    CreatedAtUtc = seedDate
                };
                customerB.PasswordHash = passwordService.HashPassword(customerB, customerBPass);
                context.Users.Add(customerB);

                context.UserRoles.Add(new UserRole
                {
                    UserId = customerB.Id,
                    RoleId = RoleConfiguration.CustomerRoleId,
                    AssignedAtUtc = seedDate
                });

                context.Carts.Add(new Cart
                {
                    Id = Guid.NewGuid(),
                    UserId = customerB.Id,
                    CreatedAtUtc = seedDate
                });
            }
        }
        else if (!string.IsNullOrWhiteSpace(customerBPass))
        {
            customerB.PasswordHash = passwordService.HashPassword(customerB, customerBPass);
        }

        await context.SaveChangesAsync();

        // 3.5. Seed Demo Products individually if missing
        var cpuCategory = await context.Categories.FirstOrDefaultAsync(c => c.Code == "CPU");
        var vgaCategory = await context.Categories.FirstOrDefaultAsync(c => c.Code == "VGA");
        var ramCategory = await context.Categories.FirstOrDefaultAsync(c => c.Code == "RAM");

        if (cpuCategory != null)
        {
            if (!await context.Products.AnyAsync(p => p.Code == "CPU-I7-13700K"))
            {
                context.Products.Add(new Product
                {
                    Id = Guid.Parse("50000000-0000-0000-0000-000000000001"),
                    CategoryId = cpuCategory.Id,
                    Code = "CPU-I7-13700K",
                    Name = "Intel Core i7-13700K",
                    Description = "Bộ vi xử lý Intel Core i7 13700K 16 nhân 24 luồng, xung nhịp lên đến 5.4GHz.",
                    Price = 10490000m,
                    OldPrice = 11990000m,
                    StockQuantity = 15,
                    ImageUrl = "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop",
                    IsActive = true,
                    CreatedAtUtc = seedDate
                });
            }

            if (!await context.Products.AnyAsync(p => p.Code == "CPU-RYZEN-7-7800X3D"))
            {
                context.Products.Add(new Product
                {
                    Id = Guid.Parse("50000000-0000-0000-0000-000000000002"),
                    CategoryId = cpuCategory.Id,
                    Code = "CPU-RYZEN-7-7800X3D",
                    Name = "AMD Ryzen 7 7800X3D",
                    Description = "CPU AMD Ryzen 7 7800X3D vớii 3D V-Cache tối ưu cho chơi game chuyên nghiệp.",
                    Price = 11290000m,
                    OldPrice = 12500000m,
                    StockQuantity = 8,
                    ImageUrl = "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop",
                    IsActive = true,
                    CreatedAtUtc = seedDate
                });
            }
        }

        if (vgaCategory != null && !await context.Products.AnyAsync(p => p.Code == "VGA-RTX-4070-SUPER"))
        {
            context.Products.Add(new Product
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000003"),
                CategoryId = vgaCategory.Id,
                Code = "VGA-RTX-4070-SUPER",
                Name = "ASUS TUF Gaming GeForce RTX 4070 SUPER 12GB",
                Description = "VGA ASUS TUF RTX 4070 SUPER tản nhiệt cực mát, hỗ trợ DLSS 3 và Ray Tracing.",
                Price = 18990000m,
                OldPrice = 20500000m,
                StockQuantity = 5,
                ImageUrl = "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop",
                IsActive = true,
                CreatedAtUtc = seedDate
            });
        }

        if (ramCategory != null && !await context.Products.AnyAsync(p => p.Code == "RAM-CORSAIR-32GB-DDR5"))
        {
            context.Products.Add(new Product
            {
                Id = Guid.Parse("50000000-0000-0000-0000-000000000004"),
                CategoryId = ramCategory.Id,
                Code = "RAM-CORSAIR-32GB-DDR5",
                Name = "RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz",
                Description = "Bộ nhớ RAM Corsair Vengeance DDR5 hiệu năng cao với dải đèn RGB rực rỡ.",
                Price = 3490000m,
                OldPrice = 3890000m,
                StockQuantity = 20,
                ImageUrl = "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop",
                IsActive = true,
                CreatedAtUtc = seedDate
            });
        }

        await context.SaveChangesAsync();

        // 4. Seed Demo Orders for Ownership Testing
        var orderAId = Guid.Parse("40000000-0000-0000-0000-000000000001");
        if (customerA != null && !await context.Orders.AnyAsync(o => o.Id == orderAId))
        {
            var dummyProduct = await context.Products.FirstOrDefaultAsync();

            var orderA = new Order
            {
                Id = orderAId,
                UserId = customerA.Id,
                OrderNumber = "ORD-DEMO-001",
                Status = OrderStatus.Confirmed,
                RecipientName = customerA.FullName,
                PhoneNumber = "0901111111",
                ShippingAddress = "123 Nguyễn Trãi, Quận 1, TP.HCM",
                PaymentMethod = PaymentMethod.Cod,
                Subtotal = 25000000m,
                ShippingFee = 0m,
                Total = 25000000m,
                CreatedAtUtc = seedDate
            };

            if (dummyProduct != null)
            {
                orderA.OrderItems.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = orderA.Id,
                    ProductId = dummyProduct.Id,
                    ProductCode = dummyProduct.Code,
                    ProductName = dummyProduct.Name,
                    UnitPrice = 25000000m,
                    Quantity = 1,
                    LineTotal = 25000000m
                });
            }

            context.Orders.Add(orderA);
        }

        var orderBId = Guid.Parse("40000000-0000-0000-0000-000000000002");
        if (customerB != null && !await context.Orders.AnyAsync(o => o.Id == orderBId))
        {
            var dummyProduct = await context.Products.FirstOrDefaultAsync();

            var orderB = new Order
            {
                Id = orderBId,
                UserId = customerB.Id,
                OrderNumber = "ORD-DEMO-002",
                Status = OrderStatus.Preparing,
                RecipientName = customerB.FullName,
                PhoneNumber = "0902222222",
                ShippingAddress = "456 Lê Lợi, Quận 3, TP.HCM",
                PaymentMethod = PaymentMethod.BankTransfer,
                Subtotal = 18000000m,
                ShippingFee = 50000m,
                Total = 18050000m,
                CreatedAtUtc = seedDate
            };

            if (dummyProduct != null)
            {
                orderB.OrderItems.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = orderB.Id,
                    ProductId = dummyProduct.Id,
                    ProductCode = dummyProduct.Code,
                    ProductName = dummyProduct.Name,
                    UnitPrice = 18000000m,
                    Quantity = 1,
                    LineTotal = 18000000m
                });
            }

            context.Orders.Add(orderB);
        }

        await context.SaveChangesAsync();
        logger.LogInformation("Development seeder check completed successfully.");
    }
}
