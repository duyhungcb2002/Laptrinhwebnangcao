namespace TechHub.Infrastructure.Security;

public static class ProductionValidators
{
    public static void ValidateReviewRating(int rating)
    {
        if (rating < 1 || rating > 5)
        {
            throw new ArgumentException("Điểm đánh giá (Rating) phải từ 1 đến 5 sao.");
        }
    }

    public static void ValidateInventoryQuantity(int quantity, string actionName)
    {
        if (quantity <= 0)
        {
            throw new ArgumentException($"Số lượng {actionName} kho phải lớn hơn 0.");
        }
    }

    public static void ValidateInventoryAdjustChange(int currentStock, int newStock)
    {
        if (newStock < 0)
        {
            throw new ArgumentException("Số lượng tồn kho mới không được âm.");
        }
        if (currentStock == newStock)
        {
            throw new ArgumentException($"Số lượng tồn kho mới ({newStock}) trùng với số lượng tồn hiện tại. Không có thay đổi để tạo điều chỉnh.");
        }
    }

    public static async Task ValidateImageFileAsync(Stream stream, string fileName, string? contentType, long length, CancellationToken ct = default)
    {
        if (stream == null || length == 0)
        {
            throw new ArgumentException("File tải lên không hợp lệ.");
        }

        const long maxFileSize = 5 * 1024 * 1024; // 5 MB
        if (length > maxFileSize)
        {
            throw new ArgumentException("Kích thước file vượt quá giới hạn cho phép (tối đa 5 MB).");
        }

        var safeFileName = Path.GetFileName(fileName);
        var extension = Path.GetExtension(safeFileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowedExtensions.Contains(extension))
        {
            throw new ArgumentException("Chỉ chấp nhận các file ảnh có định dạng JPG, JPEG, PNG hoặc WEBP.");
        }

        var mimeType = contentType?.Trim().ToLowerInvariant() ?? string.Empty;
        var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedContentTypes.Contains(mimeType))
        {
            throw new ArgumentException($"Content-Type '{contentType}' không được hỗ trợ. Chỉ chấp nhận image/jpeg, image/png, image/webp.");
        }

        bool typeMatchesExtension = (mimeType == "image/jpeg" && (extension == ".jpg" || extension == ".jpeg")) ||
                                     (mimeType == "image/png" && extension == ".png") ||
                                     (mimeType == "image/webp" && extension == ".webp");
        if (!typeMatchesExtension)
        {
            throw new ArgumentException("Content-Type không khớp với phần mở rộng của file.");
        }

        if (stream.CanSeek)
        {
            stream.Position = 0;
        }

        var header = new byte[12];
        var readBytes = await stream.ReadAsync(header, 0, header.Length, ct);
        if (readBytes < 4)
        {
            throw new ArgumentException("File ảnh không hợp lệ hoặc bị lỗi.");
        }

        bool isValidSignature = extension switch
        {
            ".jpg" or ".jpeg" => header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF,
            ".png" => header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47,
            ".webp" => header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46 &&
                       header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50,
            _ => false
        };

        if (!isValidSignature)
        {
            throw new ArgumentException("Chữ ký file (Magic Bytes) không hợp lệ với loại ảnh khai báo.");
        }

        if (stream.CanSeek)
        {
            stream.Position = 0;
        }
    }
}
