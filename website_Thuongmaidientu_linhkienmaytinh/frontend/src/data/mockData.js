export const INITIAL_CATEGORIES = [
  { id: 'CPU', label: 'CPU - Bộ Vi Xử Lý', icon: 'memory', count: 12, description: 'Intel Gen 14, AMD Ryzen 7000 Series' },
  { id: 'VGA', label: 'VGA - Card Màn Hình', icon: 'videogame_asset', count: 15, description: 'NVIDIA RTX 40 Series, AMD RX 7000' },
  { id: 'RAM', label: 'RAM - Bộ Nhớ Trong', icon: 'memory_alt', count: 20, description: 'DDR4, DDR5 Bus cao từ Corsair, Kingston, G.Skill' },
  { id: 'Mainboard', label: 'Mainboard - Bo Mạch Chủ', icon: 'developer_board', count: 10, description: 'ASUS ROG, MSI Gaming, Gigabyte AORUS' },
  { id: 'SSD', label: 'SSD - Ổ Cứng Thể Rắn', icon: 'sd_storage', count: 18, description: 'NVMe Gen4x4, Gen5x4 tốc độ siêu cao' },
  { id: 'PSU', label: 'Nguồn Máy Tính', icon: 'power', count: 8, description: 'Nguồn chuẩn 80 Plus Gold, Platinum 750W-1300W' },
  { id: 'Cooling', label: 'Tản Nhiệt PC', icon: 'mode_fan', count: 14, description: 'Tản nhiệt nước AIO, Tản khí tháp đôi ARGB' },
];

export const INITIAL_PRODUCTS = [
  {
    id: '1',
    code: 'VGA-4090-STRIX',
    name: 'Card Màn Hình ASUS ROG Strix GeForce RTX 4090 24GB GDDR6X OC Edition',
    category: 'VGA',
    price: 45990000,
    oldPrice: 49990000,
    stock: 8,
    rating: 4.9,
    reviewCount: 28,
    img: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
    description: 'Chiến hạm VGA khủng nhất thế giới với kiến trúc NVIDIA Ada Lovelace, 24GB GDDR6X, tản nhiệt buồng hơi Vapor Chamber siêu mát.',
    specs: {
      'Nhân CUDA': '16384',
      'Xung nhịp Boost': '2640 MHz (OC Mode)',
      'Bộ nhớ': '24GB GDDR6X 384-bit',
      'Cổng kết nối': '2x HDMI 2.1a, 3x DisplayPort 1.4a',
      'Nguồn khuyến nghị': '1000W'
    }
  },
  {
    id: '2',
    code: 'CPU-14900K',
    name: 'Bộ Vi Xử Lý Intel Core i9-14900K (Up to 6.0GHz, 24 Nhân 32 Luồng)',
    category: 'CPU',
    price: 14890000,
    oldPrice: 16500000,
    stock: 15,
    rating: 4.8,
    reviewCount: 42,
    img: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80',
    description: 'Vi xử lý flagship từ Intel hỗ trợ xung nhịp tối đa 6.0GHz công nghệ Intel Thermal Velocity Boost, chuyên dụng cho Render 3D và Gaming đỉnh cao.',
    specs: {
      'Số nhân/luồng': '24 Nhân (8 P-core + 16 E-core), 32 Luồng',
      'Xung nhịp tối đa': 'Up to 6.0 GHz',
      'Bộ nhớ đệm Cache': '36MB Intel Smart Cache',
      'Socket': 'LGA 1700',
      'TDP': '125W (Basic) / 253W (Turbo)'
    }
  },
  {
    id: '3',
    code: 'SSD-990PRO-2TB',
    name: 'Ổ Cứng SSD Samsung 990 Pro 2TB PCIe Gen 4.0 NVMe M.2 2280',
    category: 'SSD',
    price: 4990000,
    oldPrice: 5690000,
    stock: 25,
    rating: 5.0,
    reviewCount: 64,
    img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80',
    description: 'Vua SSD Gen4x4 với tốc độ đọc ghi tuần tự lên đến 7450 MB/s - 6900 MB/s, độ bền TBW ấn tượng và kiểm soát nhiệt độ tối ưu.',
    specs: {
      'Dung lượng': '2TB',
      'Tốc độ Đọc/Ghi': '7450 MB/s / 6900 MB/s',
      'Chuẩn giao tiếp': 'PCIe Gen 4.0 x4, NVMe 2.0',
      'Kích thước': 'M.2 2280',
      'Độ bền TBW': '1200 TBW'
    }
  },
  {
    id: '4',
    code: 'RAM-DOM-64G',
    name: 'Kit RAM Corsair Dominator Titanium RGB 64GB (2x32GB) DDR5 6000MHz White',
    category: 'RAM',
    price: 8290000,
    oldPrice: 8990000,
    stock: 12,
    rating: 4.9,
    reviewCount: 19,
    img: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80',
    description: 'Dòng RAM phân khúc ultra-premium của Corsair sở hữu dải LED RGB tùy biến đỉnh cao, chip nhớ tuyển chọn ép xung cực đỉnh.',
    specs: {
      'Dung lượng': '64GB (2 x 32GB)',
      'Tốc độ Bus': 'DDR5 6000MHz',
      'Độ trễ Timing': 'CL30-36-36-76',
      'Điện áp': '1.4V',
      'Hỗ trợ': 'Intel XMP 3.0 / AMD EXPO'
    }
  },
  {
    id: '5',
    code: 'MB-Z790-HERO',
    name: 'Bo Mạch Chủ ASUS ROG Maximus Z790 Hero WiFi DDR5',
    category: 'Mainboard',
    price: 16890000,
    oldPrice: 18500000,
    stock: 6,
    rating: 4.7,
    reviewCount: 15,
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    description: 'Bo mạch chủ cao cấp socket LGA 1700 với dàn VRM 20+1 pha 90A, 5 khe M.2 NVMe, Wi-Fi 6E và Thunderbolt 4 tích hợp sẵn.',
    specs: {
      'Socket': 'LGA 1700 (Intel Gen 12, 13, 14)',
      'Kích thước': 'ATX',
      'Khe RAM': '4x DDR5 Up to 7800+ MHz (OC)',
      'Kết nối mạng': '2.5Gb Ethernet + Wi-Fi 6E + Bluetooth 5.3',
      'Âm thanh': 'ROG SupremeFX 7.1 ALC4082 + ESS ES9218 QUAD DAC'
    }
  },
  {
    id: '6',
    code: 'COOL-RYUJIN3-360',
    name: 'Tản Nhiệt Nước AIO ASUS ROG Ryujin III 360 ARGB Màn Hình LCD 3.5 Inch',
    category: 'Cooling',
    price: 8990000,
    oldPrice: 9800000,
    stock: 10,
    rating: 4.9,
    reviewCount: 31,
    img: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80',
    description: 'Tản nhiệt nước đỉnh cao sở hữu màn hình màu LCD 3.5 inch hiển thị thông số hoặc GIF cá nhân hoá, quạt Asetek Gen 8 mát mẻ siêu êm.',
    specs: {
      'Kích thước Rad': '360mm (399 x 120 x 30 mm)',
      'Màn hình': '3.5 inch Full Color LCD',
      'Bơm': 'Asetek Gen8 Pump',
      'Quạt': '3x ROG Magnetic Daisy-Chain ARGB Fan',
      'Socket tương thích': 'Intel LGA1700/1200, AMD AM5/AM4'
    }
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-88491',
    customerName: 'Nguyễn Văn Hùng',
    email: 'hung.nguyen@gmail.com',
    phone: '0988123456',
    address: 'Số 123 Đường Xuân Thủy, Cầu Giấy, Hà Nội',
    date: '2026-08-23 14:30',
    totalAmount: 50980000,
    status: 'Delivered',
    paymentMethod: 'Chuyển khoản Banking',
    items: [
      { id: '1', name: 'Card Màn Hình ASUS ROG Strix GeForce RTX 4090 24GB', price: 45990000, qty: 1 },
      { id: '3', name: 'Ổ Cứng SSD Samsung 990 Pro 2TB NVMe M.2', price: 4990000, qty: 1 }
    ]
  },
  {
    id: 'ORD-88492',
    customerName: 'Trần Thị Mai',
    email: 'mai.tran@gmail.com',
    phone: '0912345678',
    address: 'Số 45 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    date: '2026-08-24 09:15',
    totalAmount: 14890000,
    status: 'Processing',
    paymentMethod: 'Thanh toán COD',
    items: [
      { id: '2', name: 'Bộ Vi Xử Lý Intel Core i9-14900K', price: 14890000, qty: 1 }
    ]
  }
];

export const INITIAL_USERS = [
  { id: 'USR-1', name: 'Admin TechHub', email: 'admin@techhub.vn', role: 'Admin', status: 'Active', joinedDate: '2026-01-10' },
  { id: 'USR-2', name: 'Nguyễn Văn Hùng', email: 'user@gmail.com', role: 'Customer', status: 'Active', joinedDate: '2026-02-14' },
  { id: 'USR-3', name: 'Trần Thị Mai', email: 'mai.tran@gmail.com', role: 'Customer', status: 'Active', joinedDate: '2026-03-01' }
];

export const INITIAL_REVIEWS = [
  { id: 'REV-1', productId: '1', userName: 'Lê Hoàng Long', rating: 5, comment: 'Hàng chuẩn chính hãng, đập hộp mới tinh. RTX 4090 ASUS Strix đúng là quái vật!', date: '2026-08-20' },
  { id: 'REV-2', productId: '2', userName: 'Phạm Minh Trí', rating: 5, comment: 'i9 14900K Render 3D cực nhanh, đóng tản Ryujin III nhiệt độ dao động 75 độ rất mát.', date: '2026-08-22' }
];
