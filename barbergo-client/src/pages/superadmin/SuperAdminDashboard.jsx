import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Store, Users, Plus, Trash2, Edit, Ticket } from 'lucide-react';
import ManageUsers from './ManageUsers';
import ManagePromotions from './ManagePromotions';

export default function SuperAdminDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('barbershops'); // barbershops, users

    // Barbershop State
    const [barbershops, setBarbershops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showShopModal, setShowShopModal] = useState(false);
    const [editShopId, setEditShopId] = useState(null);
    const [shopFormData, setShopFormData] = useState({
        nama: '',
        alamat: '',
        jam_buka: '09:00',
        jam_tutup: '21:00',
        user_name: '',
        email: '',
        password: '',
        foto: null,
        nama_gambar: ''
    });

    useEffect(() => {
        if (activeTab === 'barbershops') {
            fetchBarbershops();
        }
    }, [activeTab]);

    const fetchBarbershops = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/super-admin/barbershop');
            setBarbershops(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Barbershop Handlers ---

    const handleShopSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editShopId) {
                await api.put(`/super-admin/barbershop/${editShopId}`, shopFormData, {
                    isMultipart: true
                });
            } else {
                await api.post('/super-admin/barbershop', shopFormData, {
                    isMultipart: true
                });
            }
            await fetchBarbershops();
            setShowShopModal(false);
            resetShopForm();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
    };

    const deleteShop = async (id) => {
        if (!confirm('Are you sure? This will delete the shop and all its data.')) return;
        try {
            await api.delete(`/super-admin/barbershop/${id}`);
            setBarbershops(barbershops.filter(s => s.id !== id));
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const resetShopForm = () => {
        setEditShopId(null);
        setShopFormData({
            nama: '',
            alamat: '',
            jam_buka: '09:00',
            jam_tutup: '21:00',
            user_name: '',
            email: '',
            password: ''
        });
    };

    const openShopEdit = (shop) => {
        setEditShopId(shop.id);
        setShopFormData({
            nama: shop.nama,
            alamat: shop.alamat,
            jam_buka: shop.jam_buka,
            jam_tutup: shop.jam_tutup,
            user_name: shop.user?.name,
            email: shop.user?.email,
            password: ''
        });
        setShowShopModal(true);
    };

    // --- Render ---

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                        Super Admin
                    </h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('barbershops')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'barbershops' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Store className="h-5 w-5" /> All Barbershops
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Users className="h-5 w-5" /> Manage Users
                    </button>
                    <button
                        onClick={() => setActiveTab('promotions')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'promotions' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Ticket className="h-5 w-5" /> Manage Promotions
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                            SA
                        </div>
                        <div>
                            <div className="font-medium">Super Admin</div>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full py-2 border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold mb-8">
                    {activeTab === 'barbershops' ? 'All Barbershops' : activeTab === 'users' ? 'Manage Users' : 'Manage Promotions'}
                </h2>

                {activeTab === 'barbershops' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div
                            onClick={() => { resetShopForm(); setShowShopModal(true); }}
                            className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-purple-500 hover:bg-slate-800 transition-colors h-48 text-slate-400 hover:text-purple-400"
                        >
                            <Plus className="h-12 w-12 mb-2" />
                            <span className="font-medium">Add New Barbershop</span>
                        </div>

                        {barbershops.map(shop => (
                            <div key={shop.id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 p-6 relative group">
                                <h3 className="text-xl font-bold text-white mb-2">{shop.nama}</h3>
                                <p className="text-slate-400 text-sm mb-4">{shop.alamat}</p>
                                <div className="flex justify-between items-center text-sm border-t border-slate-700 pt-4 mt-4">
                                    <span className="text-purple-400 font-medium">Owner: {shop.user?.name}</span>
                                </div>

                                {/* Actions */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); openShopEdit(shop); }} className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white"><Edit className="h-4 w-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteShop(shop.id); }} className="p-2 bg-red-900/80 hover:bg-red-900 rounded text-red-100"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'users' && (
                    <ManageUsers />
                )}

                {activeTab === 'promotions' && (
                    <ManagePromotions />
                )}
            </main>

            {/* Barbershop Modal */}
            {showShopModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 w-full max-w-lg rounded-xl p-6 border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{editShopId ? 'Edit Barbershop' : 'Create New Barbershop'}</h2>
                        <form onSubmit={handleShopSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-400">Shop Name</label>
                                <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" required value={shopFormData.nama} onChange={e => setShopFormData({ ...shopFormData, nama: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-400">Address</label>
                                <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" required value={shopFormData.alamat} onChange={e => setShopFormData({ ...shopFormData, alamat: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-400">Open</label>
                                    <input type="time" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" required value={shopFormData.jam_buka} onChange={e => setShopFormData({ ...shopFormData, jam_buka: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-400">Close</label>
                                    <input type="time" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" required value={shopFormData.jam_tutup} onChange={e => setShopFormData({ ...shopFormData, jam_tutup: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-400">Image</label>
                                <input type="file" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" onChange={e => setShopFormData({ ...shopFormData, foto: e.target.files[0], nama_gambar: e.target.value })} accept='image/*' />
                            </div>

                            {!editShopId && (
                                <>
                                    <div className="border-t border-slate-700 my-4 pt-4">
                                        <h3 className="tex-sm font-bold text-purple-400 mb-4">Owner Credentials</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-400">Owner Name</label>
                                                <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" required value={shopFormData.user_name} onChange={e => setShopFormData({ ...shopFormData, user_name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-400">Owner Email</label>
                                                <input type="email" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" required value={shopFormData.email} onChange={e => setShopFormData({ ...shopFormData, email: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 text-slate-400">Password</label>
                                                <input type="password" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" required value={shopFormData.password} onChange={e => setShopFormData({ ...shopFormData, password: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setShowShopModal(false)} className="px-4 py-2 hover:bg-slate-700 rounded text-slate-300">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-medium">
                                    {editShopId ? 'Save Changes' : 'Create Barbershop'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
