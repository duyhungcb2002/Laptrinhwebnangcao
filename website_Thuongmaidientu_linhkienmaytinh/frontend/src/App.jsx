import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';

const INITIAL_PRODUCTS = [
    { id: '1', code: 'VGA-4090', name: 'Card Màn Hình ASUS ROG Strix RTX 4090 24GB', category: 'VGA', price: 45990000, stock: 12, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8o61RhxufdZdapXrfqw501_Se1oEwqecQ7FNJQcGvLOUzpP6RI3e1xoRttnACqofALMjjYvzuh1ipjPTb8yhKOgb3ov526d_CJAWth4lmuT4aJy5xr6S0QDTC12URVYukR9N6WwJPLqrmjBbWtDzpZ-_KhMpPuLXKQW0CXSpyM2r9XQ-E9ScZPTQ3IFKokl_kEQQIYXAs9LH498ZM-_cNLx6UtZTrGv-h6Te002B73NF3ZI45oTuhBA' },
    { id: '2', code: 'CPU-14900K', name: 'Bộ Vi Xử Lý Intel Core i9-14900K', category: 'CPU', price: 14890000, stock: 25, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBICgC6Jya5xy126D1s-C0cjBC2V7KBiDSBi6i5U9l4TEtOnCd-FGQ2gEw30lLHa7bTEklZl72IcQrpbwXHF25Fykcy89P1idpusDfjsT7cN4HOoeB4rbJgqK25yJGWn6vDgeM6Q9chEnhLFxMZlqygAJNe9mR9U6_IAm0ghKnHpgEdK8AccsamrxVK1VYWv3k1f-6j659sYTYJ_1K5bgEB3i1rVsXfE-hphhSfnpsxpS2U9mjtpo70ew' },
    { id: '3', code: 'SSD-990PRO', name: 'Ổ Cứng SSD Samsung 990 Pro 2TB NVMe M.2', category: 'SSD', price: 4990000, stock: 40, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8eLQdK2qXXfzhE2kvKPZMbBtK3w-UgteZGGzazZu8MrwZY3EB3jGe739uD3ZCtdJqC3SoT9cnPXGtmpKCdzA2SfE05UzqCqGHg7Il6OFqgoyjxom-bRgPj8A6ZoevKrhb5w5fH8W5L9X-cyK3NLroZcnUCml7x8nq8sEddMWq_Z0ZeY7JHkMc7LpB2eg25nnU1X_ToT-smlU3cJGxTApQWZvFLw--HL_ypQXNgI5xdtpUC4MQYiYSwA' },
    { id: '4', code: 'RAM-DOM64', name: 'RAM Corsair Dominator Titanium 64GB DDR5', category: 'RAM', price: 8290000, stock: 18, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8o61RhxufdZdapXrfqw501_Se1oEwqecQ7FNJQcGvLOUzpP6RI3e1xoRttnACqofALMjjYvzuh1ipjPTb8yhKOgb3ov526d_CJAWth4lmuT4aJy5xr6S0QDTC12URVYukR9N6WwJPLqrmjBbWtDzpZ-_KhMpPuLXKQW0CXSpyM2r9XQ-E9ScZPTQ3IFKokl_kEQQIYXAs9LH498ZM-_cNLx6UtZTrGv-h6Te002B73NF3ZI45oTuhBA' }
];

export default function App() {
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [editingProduct, setEditingProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const filteredProducts = products.filter(p => {
        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateCartQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.qty + delta;
                return newQty > 0 ? { ...item, qty: newQty } : item;
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalCartItems = cart.reduce((sum, item) => sum + item.qty, 0);

    const handleSaveProduct = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            code: formData.get('code'),
            name: formData.get('name'),
            category: formData.get('category'),
            price: Number(formData.get('price')),
            stock: Number(formData.get('stock')),
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8o61RhxufdZdapXrfqw501_Se1oEwqecQ7FNJQcGvLOUzpP6RI3e1xoRttnACqofALMjjYvzuh1ipjPTb8yhKOgb3ov526d_CJAWth4lmuT4aJy5xr6S0QDTC12URVYukR9N6WwJPLqrmjBbWtDzpZ-_KhMpPuLXKQW0CXSpyM2r9XQ-E9ScZPTQ3IFKokl_kEQQIYXAs9LH498ZM-_cNLx6UtZTrGv-h6Te002B73NF3ZI45oTuhBA'
        };

        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...data } : p));
        } else {
            setProducts([...products, { id: Date.now().toString(), ...data }]);
        }
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleDeleteProduct = (id) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi hệ thống?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-['Be_Vietnam_Pro']">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">
                    <Link to="/" className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-3xl">computer</span>
                        <span>TechHub PC</span>
                    </Link>
                    
                    <div className="flex-1 max-w-xl relative hidden md:block">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm CPU, VGA, Laptop, Linh kiện..." 
                            className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-full text-sm bg-slate-100 focus:border-blue-700 focus:ring-1 focus:ring-blue-700 outline-none"
                        />
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400">search</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/cart" className="relative p-2 text-slate-600 hover:text-blue-700 transition-colors">
                            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                            {totalCartItems > 0 && (
                                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {totalCartItems}
                                </span>
                            )}
                        </Link>
                        <Link to="/admin" className="flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                            <span>Admin Panel</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Router */}
            <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
                <Routes>
                    <Route path="/" element={
                        <div className="space-y-8">
                            {/* Categories */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex justify-between overflow-x-auto gap-4">
                                {[
                                    { id: 'All', label: 'Tất cả', icon: 'apps' },
                                    { id: 'CPU', label: 'CPU', icon: 'memory' },
                                    { id: 'VGA', label: 'VGA', icon: 'videogame_asset' },
                                    { id: 'RAM', label: 'RAM', icon: 'memory_alt' },
                                    { id: 'Mainboard', label: 'Mainboard', icon: 'developer_board' },
                                    { id: 'SSD', label: 'SSD', icon: 'sd_storage' }
                                ].map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`flex flex-col items-center gap-2 min-w-[70px] transition-colors ${selectedCategory === cat.id ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-blue-700'}`}
                                    >
                                        <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                        <span className="text-xs">{cat.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Banner */}
                            <div className="rounded-2xl overflow-hidden relative shadow-md h-72 md:h-96 bg-gradient-to-r from-slate-900 to-blue-900 flex items-center p-8 text-white">
                                <div className="max-w-lg space-y-4 z-10">
                                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Standardized Vite + React Router</span>
                                    <h2 className="text-3xl md:text-5xl font-bold">RTX 4090 SUPER</h2>
                                    <p className="text-sm text-slate-300">Hệ thống Frontend chuẩn hóa với React Router 6, Axios & Tailwind CSS.</p>
                                    <button onClick={() => setSelectedCategory('VGA')} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">Khám Phá Ngay</button>
                                </div>
                                <img className="absolute right-0 top-0 h-full object-cover opacity-60 md:opacity-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAn0mN73KRAsGpUlS9EV0MGCzGHaRZ7U4aLrOrnEX9l5H8RnRzhiPbVGbOVyZXivWQDWkjxRy1UZVWVt-RMsnvU7em-caWfHtmxh2eaymVynsW6oGdM8lJEQMzdZpP4t26u5H28jj1qWqeznhWwE3V-lLe3hXTHrAZspvidOIXHPUiayu84oNCoo8UH_bA8GUHmeuX6tmY2JEdsVt5GW3yZSz_2cn4Gn8MZCnfYWn_RkJd-SA3w7odU_A" alt="Hero Banner"/>
                            </div>

                            {/* Product List Grid */}
                            <div>
                                <h3 className="text-xl font-bold mb-6">Sản phẩm linh kiện ({filteredProducts.length})</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {filteredProducts.map(p => (
                                        <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                                            <div className="h-44 w-full mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                                                <img src={p.img} alt={p.name} className="h-full object-contain p-2"/>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit mb-1">{p.category}</span>
                                            <h4 className="font-bold text-sm line-clamp-2 mb-2 flex-1">{p.name}</h4>
                                            <div className="text-red-600 font-bold text-lg mb-3">{p.price.toLocaleString('vi-VN')}₫</div>
                                            <button onClick={() => addToCart(p)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                                                <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                                                <span>Thêm vào giỏ</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    } />

                    <Route path="/cart" element={
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Giỏ hàng của bạn</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500">Giỏ hàng chưa có sản phẩm nào!</div>
                                    ) : (
                                        <div className="divide-y divide-slate-200 space-y-4">
                                            {cart.map(item => (
                                                <div key={item.id} className="flex items-center justify-between py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img src={item.img} className="w-16 h-16 object-contain bg-slate-100 rounded-lg p-1"/>
                                                        <div>
                                                            <h4 className="font-bold text-sm">{item.name}</h4>
                                                            <p className="text-xs text-slate-500">{item.price.toLocaleString('vi-VN')}₫</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center border border-slate-300 rounded-lg">
                                                            <button onClick={() => updateCartQty(item.id, -1)} className="px-2 py-1 hover:bg-slate-100">-</button>
                                                            <span className="px-3 text-sm font-semibold">{item.qty}</span>
                                                            <button onClick={() => updateCartQty(item.id, 1)} className="px-2 py-1 hover:bg-slate-100">+</button>
                                                        </div>
                                                        <span className="font-bold text-blue-700 w-28 text-right">{(item.price * item.qty).toLocaleString('vi-VN')}₫</span>
                                                        <button onClick={() => removeFromCart(item.id)} className="text-red-600 p-1"><span className="material-symbols-outlined">delete</span></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-fit space-y-4">
                                    <h3 className="text-lg font-bold">Thanh toán</h3>
                                    <div className="flex justify-between text-sm">
                                        <span>Tổng giá trị</span>
                                        <span className="font-bold text-blue-700 text-xl">{cartTotal.toLocaleString('vi-VN')}₫</span>
                                    </div>
                                    <button onClick={() => { alert('Đặt hàng thành công!'); setCart([]); navigate('/'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                                        Xác nhận thanh toán
                                    </button>
                                </div>
                            </div>
                        </div>
                    } />

                    <Route path="/admin" element={
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">Admin Management Dashboard</h2>
                                    <p className="text-xs text-slate-500">Quản lý sản phẩm linh kiện đồng bộ từ Design System Stitch</p>
                                </div>
                                <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                                    <span className="material-symbols-outlined">add</span>
                                    <span>Thêm sản phẩm</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-100 border-b border-slate-200 text-xs uppercase text-slate-600 font-semibold">
                                        <tr>
                                            <th className="p-4">Hình ảnh</th>
                                            <th className="p-4">Mã SP</th>
                                            <th className="p-4">Tên Sản Phẩm</th>
                                            <th className="p-4">Danh Mục</th>
                                            <th className="p-4">Giá Bán</th>
                                            <th className="p-4">Tồn Kho</th>
                                            <th className="p-4 text-right">Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 text-sm">
                                        {products.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="p-4"><img src={p.img} className="w-10 h-10 object-contain bg-slate-100 rounded-lg"/></td>
                                                <td className="p-4 font-mono font-bold text-blue-700">{p.code}</td>
                                                <td className="p-4 font-medium">{p.name}</td>
                                                <td className="p-4"><span className="px-2 py-1 bg-slate-200 rounded text-xs font-semibold">{p.category}</span></td>
                                                <td className="p-4 font-bold text-red-600">{p.price.toLocaleString('vi-VN')}₫</td>
                                                <td className="p-4">{p.stock} cái</td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-1 hover:text-blue-700"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                    <button onClick={() => handleDeleteProduct(p.id)} className="p-1 hover:text-red-600"><span className="material-symbols-outlined text-lg">delete</span></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    } />
                </Routes>
            </main>

            {/* Admin Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                            <h3 className="text-lg font-bold">{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Mã Sản Phẩm</label>
                                <input name="code" defaultValue={editingProduct ? editingProduct.code : ''} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Tên Sản Phẩm</label>
                                <input name="name" defaultValue={editingProduct ? editingProduct.name : ''} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Danh Mục</label>
                                <select name="category" defaultValue={editingProduct ? editingProduct.category : 'CPU'} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                                    <option value="CPU">CPU</option>
                                    <option value="VGA">VGA</option>
                                    <option value="RAM">RAM</option>
                                    <option value="Mainboard">Mainboard</option>
                                    <option value="SSD">SSD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Giá Bán (VNĐ)</label>
                                <input name="price" type="number" defaultValue={editingProduct ? editingProduct.price : ''} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Tồn Kho</label>
                                <input name="stock" type="number" defaultValue={editingProduct ? editingProduct.stock : ''} className="w-full p-2 border border-slate-300 rounded-lg text-sm" required/>
                            </div>
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm">Lưu thông tin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
