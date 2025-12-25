import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Scissors, Users, Plus, Edit, Trash2, Save, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OperatingHours from './components/OperatingHours';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('shop'); // shop, services, barbers, hours
    const [shop, setShop] = useState(null);
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Forms
    const [shopForm, setShopForm] = useState({});
    const [isEditingShop, setIsEditingShop] = useState(false);
    const [serviceForm, setServiceForm] = useState({ nama_layanan: '', harga: '', durasi_menit: '' });
    const [barberForm, setBarberForm] = useState({ nama: '', spesialisasi: '' });
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showBarberModal, setShowBarberModal] = useState(false);
    const [editId, setEditId] = useState(null); // ID of item being edited (service/barber)

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [shopRes, servicesRes, barbersRes] = await Promise.all([
                api.get('/admin/barbershop').catch(() => ({ data: null })), // Keeps the original catch for 404
                api.get('/admin/layanan'),
                api.get('/admin/tukang-cukur')
            ]);
            setShop(shopRes.data);
            setShopForm(shopRes.data || {});
            setServices(servicesRes.data);
            setBarbers(barbersRes.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const updateShop = async (e) => {
        e.preventDefault();
        toast.promise(
            api.put('/admin/barbershop', shopForm).then(({ data }) => {
                setShop(data);
                setIsEditingShop(false);
            }),
            {
                loading: 'Updating shop details...',
                success: 'Shop details updated!',
                error: 'Failed to update shop'
            }
        );
    };

    const saveService = async (e) => {
        e.preventDefault();
        const promise = editId
            ? api.put(`/admin/layanan/${editId}`, serviceForm)
            : api.post('/admin/layanan', serviceForm);

        toast.promise(
            promise.then(async () => {
                const { data } = await api.get('/admin/layanan');
                setServices(data);
                setShowServiceModal(false);
                setServiceForm({ nama_layanan: '', harga: '', durasi_menit: '' });
                setEditId(null);
            }),
            {
                loading: 'Saving service...',
                success: 'Service saved successfully!',
                error: 'Failed to save service'
            }
        );
    };

    const deleteService = (id) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-slate-800 border border-slate-700 shadow-xl rounded-xl p-4 flex flex-col gap-2 max-w-sm w-full`}>
                <div className="font-medium">Delete this service?</div>
                <div className="text-sm text-slate-400">This action cannot be undone.</div>
                <div className="flex gap-2 mt-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-sm rounded bg-slate-700 hover:bg-slate-600">Cancel</button>
                    <button onClick={() => {
                        toast.dismiss(t.id);
                        toast.promise(
                            api.delete(`/admin/layanan/${id}`).then(() => {
                                setServices(services.filter(s => s.id !== id));
                            }),
                            { loading: 'Deleting...', success: 'Service deleted', error: 'Failed to delete' }
                        );
                    }} className="px-3 py-1.5 text-sm rounded bg-red-600 hover:bg-red-700">Delete</button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const saveBarber = async (e) => {
        e.preventDefault();
        const promise = editId
            ? api.put(`/admin/tukang-cukur/${editId}`, barberForm)
            : api.post('/admin/tukang-cukur', barberForm);

        toast.promise(
            promise.then(async () => {
                const { data } = await api.get('/admin/tukang-cukur');
                setBarbers(data);
                setShowBarberModal(false);
                setBarberForm({ nama: '', spesialisasi: '' });
                setEditId(null);
            }),
            {
                loading: 'Saving barber...',
                success: 'Barber saved successfully!',
                error: 'Failed to save barber'
            }
        );
    };

    const deleteBarber = (id) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-slate-800 border border-slate-700 shadow-xl rounded-xl p-4 flex flex-col gap-2 max-w-sm w-full`}>
                <div className="font-medium">Delete this barber?</div>
                <div className="text-sm text-slate-400">This action cannot be undone.</div>
                <div className="flex gap-2 mt-2 justify-end">
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 text-sm rounded bg-slate-700 hover:bg-slate-600">Cancel</button>
                    <button onClick={() => {
                        toast.dismiss(t.id);
                        toast.promise(
                            api.delete(`/admin/tukang-cukur/${id}`).then(() => {
                                setBarbers(barbers.filter(b => b.id !== id));
                            }),
                            { loading: 'Deleting...', success: 'Barber deleted', error: 'Failed to delete' }
                        );
                    }} className="px-3 py-1.5 text-sm rounded bg-red-600 hover:bg-red-700">Delete</button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Admin Panel
                    </h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'shop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <LayoutDashboard className="h-5 w-5" /> Shop Details
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'services' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Scissors className="h-5 w-5" /> Services
                    </button>
                    <button
                        onClick={() => setActiveTab('barbers')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'barbers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Users className="h-5 w-5" /> Barbers
                    </button>
                    <button
                        onClick={() => setActiveTab('hours')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'hours' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Clock className="h-5 w-5" /> Operating Hours
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold">
                            {user?.name.charAt(0)}
                        </div>
                        <div>
                            <div className="font-medium">{user?.name}</div>
                            <div className="text-xs text-slate-400">Admin</div>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full py-2 border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Mobile Header (TODO: Toggle Sidebar) */}

                {activeTab === 'shop' && (
                    <div className="max-w-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Shop Information</h2>
                            {!isEditingShop ? (
                                <button onClick={() => setIsEditingShop(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                                    <Edit className="h-4 w-4" /> Edit
                                </button>
                            ) : (
                                <button onClick={() => setIsEditingShop(false)} className="flex items-center gap-2 px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-700">
                                    <X className="h-4 w-4" /> Cancel
                                </button>
                            )}
                        </div>

                        {isEditingShop ? (
                            <form onSubmit={updateShop} className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" value={shopForm.nama || ''} onChange={e => setShopForm({ ...shopForm, nama: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Address</label>
                                    <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" value={shopForm.alamat || ''} onChange={e => setShopForm({ ...shopForm, alamat: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Open Time</label>
                                        <input type="time" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white" value={shopForm.jam_buka || ''} onChange={e => setShopForm({ ...shopForm, jam_buka: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Close Time</label>
                                        <input type="time" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white" value={shopForm.jam_tutup || ''} onChange={e => setShopForm({ ...shopForm, jam_tutup: e.target.value })} />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2">
                                    <Save className="h-4 w-4" /> Save Changes
                                </button>
                            </form>
                        ) : (
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                                <div>
                                    <div className="text-sm text-slate-400">Name</div>
                                    <div className="font-medium text-lg">{shop?.nama || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400">Address</div>
                                    <div className="font-medium">{shop?.alamat || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-slate-400">Hours</div>
                                    <div className="font-medium">{shop?.jam_buka} - {shop?.jam_tutup}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'services' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Manage Services</h2>
                            <button onClick={() => { setEditId(null); setServiceForm({ nama_layanan: '', harga: '', durasi_menit: '' }); setShowServiceModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                                <Plus className="h-4 w-4" /> Add Service
                            </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {services.map(service => (
                                <div key={service.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold">{service.nama_layanan}</h3>
                                        <div className="text-sm text-slate-400">{service.durasi_menit} mins • Rp {Number(service.harga).toLocaleString()}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditId(service.id); setServiceForm(service); setShowServiceModal(true); }} className="p-2 bg-slate-700 rounded hover:bg-slate-600"><Edit className="h-4 w-4" /></button>
                                        <button onClick={() => deleteService(service.id)} className="p-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'barbers' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Manage Barbers</h2>
                            <button onClick={() => { setEditId(null); setBarberForm({ nama: '', spesialisasi: '' }); setShowBarberModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                                <Plus className="h-4 w-4" /> Add Barber
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {barbers.map(barber => (
                                <div key={barber.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden">
                                            {barber.foto ? <img src={barber.foto} className="w-full h-full object-cover" /> : <Users className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <div className="font-bold">{barber.nama}</div>
                                            <div className="text-xs text-slate-400">{barber.spesialisasi}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditId(barber.id); setBarberForm(barber); setShowBarberModal(true); }} className="p-2 bg-slate-700 rounded hover:bg-slate-600"><Edit className="h-4 w-4" /></button>
                                        <button onClick={() => deleteBarber(barber.id)} className="p-2 bg-red-900/50 text-red-400 rounded hover:bg-red-900"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'hours' && <OperatingHours />}
            </main>

            {/* Service Modal */}
            <AnimatePresence>
                {showServiceModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-800 w-full max-w-md rounded-xl p-6 border border-slate-700">
                            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Service' : 'Add Service'}</h2>
                            <form onSubmit={saveService} className="space-y-4">
                                <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" placeholder="Service Name" required value={serviceForm.nama_layanan} onChange={e => setServiceForm({ ...serviceForm, nama_layanan: e.target.value })} />
                                <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" placeholder="Duration (mins)" type="number" required value={serviceForm.durasi_menit} onChange={e => setServiceForm({ ...serviceForm, durasi_menit: e.target.value })} />
                                <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" placeholder="Price (Rp)" type="number" required value={serviceForm.harga} onChange={e => setServiceForm({ ...serviceForm, harga: e.target.value })} />
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowServiceModal(false)} className="px-4 py-2 hover:bg-slate-700 rounded">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">{editId ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Barber Modal */}
            <AnimatePresence>
                {showBarberModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-800 w-full max-w-md rounded-xl p-6 border border-slate-700">
                            <h2 className="text-xl font-bold mb-4">{editId ? 'Edit Barber' : 'Add Barber'}</h2>
                            <form onSubmit={saveBarber} className="space-y-4">
                                <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" placeholder="Barber Name" required value={barberForm.nama} onChange={e => setBarberForm({ ...barberForm, nama: e.target.value })} />
                                <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" placeholder="Specialization" value={barberForm.spesialisasi} onChange={e => setBarberForm({ ...barberForm, spesialisasi: e.target.value })} />
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowBarberModal(false)} className="px-4 py-2 hover:bg-slate-700 rounded">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">{editId ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
