import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Scissors, Users, Plus, Edit, Trash2, Save, X, Clock, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight, Search, Filter, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OperatingHours from './components/OperatingHours';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('shop'); // shop, services, barbers, hours
    const [shop, setShop] = useState(null);
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Reservation Filters & Pagination
    const [reservationFilters, setReservationFilters] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'all',
        search: '',
        page: 1
    });
    const [reservationMeta, setReservationMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    // Forms
    const [shopForm, setShopForm] = useState({});
    const [isEditingShop, setIsEditingShop] = useState(false);
    const [serviceForm, setServiceForm] = useState({ nama_layanan: '', harga: '', durasi_menit: '' });
    const [barberForm, setBarberForm] = useState({ nama: '', spesialisasi: '' });
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showBarberModal, setShowBarberModal] = useState(false);
    const [editId, setEditId] = useState(null); // ID of item being edited (service/barber)

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentReservation, setPaymentReservation] = useState(null);

    // Revenue State
    const [revenueData, setRevenueData] = useState({
        total_revenue: 0,
        total_completed: 0,
        by_service: [],
        by_barber: [],
        recent_transactions: []
    });
    const [revenueFilters, setRevenueFilters] = useState({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

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

    const fetchReservations = async () => {
        try {
            const params = new URLSearchParams({
                page: reservationFilters.page,
                date: reservationFilters.date,
                search: reservationFilters.search
            });
            
            if (reservationFilters.status !== 'all') {
                params.append('status', reservationFilters.status);
            }

            const { data } = await api.get(`/admin/reservasi?${params.toString()}`);
            setReservations(data.data || []);
            setReservationMeta({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
                from: data.from,
                to: data.to
            });
        } catch (error) {
            console.error('Error fetching reservations', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'reservations') {
            fetchReservations();
        }
        if (activeTab === 'revenue') {
            fetchRevenue();
        }
    }, [reservationFilters, activeTab, revenueFilters]);

    const fetchRevenue = async () => {
        try {
            const params = new URLSearchParams({
                start_date: revenueFilters.start_date,
                end_date: revenueFilters.end_date
            });
            const { data } = await api.get(`/admin/revenue?${params.toString()}`);
            setRevenueData(data);
        } catch (error) {
            console.error('Error fetching revenue', error);
            toast.error('Failed to load revenue data');
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

    const updateReservationStatus = (id, status) => {
        toast.promise(
            api.put(`/admin/reservasi/${id}`, { status }).then(() => {
                fetchReservations();
            }),
            {
                loading: 'Updating status...',
                success: `Reservation ${status}`,
                error: 'Failed to update status'
            }
        );
    };

    const deleteReservation = (id) => {
        if (!window.confirm('Delete this reservation?')) return;
        toast.promise(
            api.delete(`/admin/reservasi/${id}`).then(() => {
                fetchReservations();
            }),
            {
                loading: 'Deleting...',
                success: 'Reservation deleted',
                error: 'Failed to delete'
            }
        );
    };

    const handlePayment = (reservation) => {
        setPaymentReservation(reservation);
        setShowPaymentModal(true);
    };

    const confirmPayment = () => {
        if (!paymentReservation) return;
        
        toast.promise(
            api.put(`/admin/reservasi/${paymentReservation.id}`, { status: 'selesai' }).then(() => {
                fetchReservations();
                setShowPaymentModal(false);
                setPaymentReservation(null);
            }),
            {
                loading: 'Processing payment...',
                success: 'Payment confirmed & Reservation completed!',
                error: 'Failed to process payment'
            }
        );
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
                        onClick={() => setActiveTab('reservations')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'reservations' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Calendar className="h-5 w-5" /> Reservations
                    </button>
                    <button
                        onClick={() => setActiveTab('hours')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'hours' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Clock className="h-5 w-5" /> Operating Hours
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
                        onClick={() => setActiveTab('revenue')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'revenue' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <Banknote className="h-5 w-5" /> Revenue
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
                
                {activeTab === 'reservations' && (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold">Manage Reservations</h2>
                            
                            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <input 
                                        type="text" 
                                        placeholder="Search customer..." 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={reservationFilters.search}
                                        onChange={(e) => setReservationFilters({...reservationFilters, search: e.target.value, page: 1})} 
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <input 
                                        type="date" 
                                        className="bg-transparent border-none focus:outline-none text-sm text-white"
                                        value={reservationFilters.date}
                                        onChange={(e) => setReservationFilters({...reservationFilters, date: e.target.value, page: 1})}
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                                    <Filter className="h-4 w-4 text-slate-400" />
                                    <select 
                                        className="bg-transparent border-none focus:outline-none text-sm text-white"
                                        value={reservationFilters.status}
                                        onChange={(e) => setReservationFilters({...reservationFilters, status: e.target.value, page: 1})}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="menunggu">Menunggu</option>
                                        <option value="dikonfirmasi">Dikonfirmasi</option>
                                        <option value="selesai">Selesai</option>
                                        <option value="ditolak">Ditolak</option>
                                        <option value="dibatalkan">Dibatalkan</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-700/50 text-slate-400">
                                        <tr>
                                            <th className="p-4">Date & Time</th>
                                            <th className="p-4">Customer</th>
                                            <th className="p-4">Service</th>
                                            <th className="p-4">Barber</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {reservations.map(res => (
                                            <tr key={res.id} className="hover:bg-slate-700/30">
                                                <td className="p-4">
                                                    <div className="font-medium">{res.tanggal}</div>
                                                    <div className="text-xs text-slate-400">{res.waktu_mulai}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium">{res.user?.name}</div>
                                                    <div className="text-xs text-slate-400">{res.user?.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium">{res.layanan?.nama_layanan}</div>
                                                    <div className="text-xs text-slate-400">{res.layanan?.durasi_menit} mins</div>
                                                </td>
                                                <td className="p-4 font-medium">{res.tukang_cukur?.nama}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                                        res.status === 'menunggu' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50' :
                                                        res.status === 'dikonfirmasi' ? 'bg-green-900/30 text-green-400 border-green-700/50' :
                                                        res.status === 'selesai' ? 'bg-blue-900/30 text-blue-400 border-blue-700/50' :
                                                        'bg-red-900/30 text-red-400 border-red-700/50'
                                                    }`}>
                                                        {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {res.status === 'menunggu' && (
                                                            <>
                                                                <button onClick={() => updateReservationStatus(res.id, 'dikonfirmasi')} className="p-1.5 bg-green-900/30 text-green-400 rounded hover:bg-green-900/50 border border-green-800" title="Approve">
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </button>
                                                                <button onClick={() => updateReservationStatus(res.id, 'ditolak')} className="p-1.5 bg-amber-900/30 text-amber-400 rounded hover:bg-amber-900/50 border border-amber-800" title="Reject">
                                                                    <XCircle className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        {res.status === 'dikonfirmasi' && (
                                                            <button onClick={() => handlePayment(res)} className="p-1.5 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50 border border-blue-800" title="Confirm Payment">
                                                                <Banknote className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button onClick={() => deleteReservation(res.id)} className="p-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 border border-red-800" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {reservations.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="p-8 text-center text-slate-400">
                                                    No reservations found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                                <div className="text-sm text-slate-400">
                                    Showing {reservationMeta.from || 0} to {reservationMeta.to || 0} of {reservationMeta.total} entries
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setReservationFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={reservationMeta.current_page === 1}
                                        className="p-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm font-medium px-2">Page {reservationMeta.current_page} of {reservationMeta.last_page}</span>
                                    <button 
                                        onClick={() => setReservationFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={reservationMeta.current_page === reservationMeta.last_page}
                                        className="p-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'revenue' && (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold">Revenue Report</h2>
                            <div className="flex gap-3 items-center">
                                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <input 
                                        type="date" 
                                        className="bg-transparent border-none focus:outline-none text-sm text-white"
                                        value={revenueFilters.start_date}
                                        onChange={(e) => setRevenueFilters({...revenueFilters, start_date: e.target.value})}
                                    />
                                </div>
                                <span className="text-slate-400">to</span>
                                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <input 
                                        type="date" 
                                        className="bg-transparent border-none focus:outline-none text-sm text-white"
                                        value={revenueFilters.end_date}
                                        onChange={(e) => setRevenueFilters({...revenueFilters, end_date: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl p-6"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <Banknote className="h-6 w-6 text-green-400" />
                                    </div>
                                    <h3 className="text-sm font-medium text-slate-400">Total Revenue</h3>
                                </div>
                                <div className="text-3xl font-bold text-green-400">
                                    Rp {Number(revenueData.total_revenue || 0).toLocaleString()}
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-xl p-6"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <CheckCircle className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-sm font-medium text-slate-400">Completed</h3>
                                </div>
                                <div className="text-3xl font-bold text-blue-400">
                                    {revenueData.total_completed || 0}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Reservations</div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/50 rounded-xl p-6"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <Banknote className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <h3 className="text-sm font-medium text-slate-400">Average/Booking</h3>
                                </div>
                                <div className="text-3xl font-bold text-purple-400">
                                    Rp {Number(revenueData.total_completed > 0 ? revenueData.total_revenue / revenueData.total_completed : 0).toLocaleString('id-ID', {maximumFractionDigits: 0})}
                                </div>
                            </motion.div>
                        </div>

                        {/* Revenue by Service */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Scissors className="h-5 w-5 text-purple-400" />
                                    Revenue by Service
                                </h3>
                                <div className="space-y-3">
                                    {revenueData.by_service?.length > 0 ? revenueData.by_service.map((item, index) => (
                                        <motion.div 
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                                        >
                                            <div>
                                                <div className="font-medium">{item.service_name}</div>
                                                <div className="text-xs text-slate-400">{item.bookings_count} bookings</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-400">
                                                    Rp {Number(item.total_revenue).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {item.bookings_count > 0 && revenueData.total_completed > 0
                                                        ? `${((item.bookings_count / revenueData.total_completed) * 100).toFixed(1)}%`
                                                        : '0%'
                                                    }
                                                </div>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="text-center text-slate-400 py-8">No data available</div>
                                    )}
                                </div>
                            </div>

                            {/* Revenue by Barber */}
                            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-400" />
                                    Revenue by Barber
                                </h3>
                                <div className="space-y-3">
                                    {revenueData.by_barber?.length > 0 ? revenueData.by_barber.map((item, index) => (
                                        <motion.div 
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold">
                                                    {item.barber_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{item.barber_name}</div>
                                                    <div className="text-xs text-slate-400">{item.bookings_count} bookings</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-400">
                                                    Rp {Number(item.total_revenue).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {item.bookings_count > 0 && revenueData.total_completed > 0
                                                        ? `${((item.bookings_count / revenueData.total_completed) * 100).toFixed(1)}%`
                                                        : '0%'
                                                    }
                                                </div>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="text-center text-slate-400 py-8">No data available</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-slate-700">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-green-400" />
                                    Recent Completed Bookings
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-700/50 text-slate-400">
                                        <tr>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Customer</th>
                                            <th className="p-4">Service</th>
                                            <th className="p-4">Barber</th>
                                            <th className="p-4 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {revenueData.recent_transactions?.length > 0 ? revenueData.recent_transactions.map((trans, index) => (
                                            <motion.tr 
                                                key={index}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="hover:bg-slate-700/30"
                                            >
                                                <td className="p-4">
                                                    <div className="font-medium">{trans.tanggal}</div>
                                                    <div className="text-xs text-slate-400">{trans.waktu_mulai}</div>
                                                </td>
                                                <td className="p-4 font-medium">{trans.customer_name}</td>
                                                <td className="p-4">{trans.service_name}</td>
                                                <td className="p-4">{trans.barber_name}</td>
                                                <td className="p-4 text-right font-bold text-green-400">
                                                    Rp {Number(trans.revenue).toLocaleString()}
                                                </td>
                                            </motion.tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-slate-400">
                                                    No completed bookings in this period
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
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

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && paymentReservation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-800 w-full max-w-sm rounded-xl p-6 border border-slate-700">
                            <div className="flex items-center gap-3 mb-4 text-green-400">
                                <div className="p-2 bg-green-900/30 rounded-full border border-green-700/50">
                                    <Banknote className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Confirm Payment</h2>
                            </div>
                            
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3 mb-6">
                                <div>
                                    <div className="text-sm text-slate-400">Service</div>
                                    <div className="font-medium text-lg">{paymentReservation.layanan?.nama_layanan}</div>
                                </div>
                                <div className="flex justify-between items-end border-t border-slate-700 pt-3">
                                    <div className="text-sm text-slate-400">Total Price</div>
                                    <div className="text-xl font-bold text-green-400">
                                        Rp {Number(paymentReservation.layanan?.harga).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button onClick={() => { setShowPaymentModal(false); setPaymentReservation(null); }} className="px-4 py-2 hover:bg-slate-700 rounded-lg font-medium transition-colors">
                                    Cancel
                                </button>
                                <button onClick={confirmPayment} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex items-center gap-2 transition-colors">
                                    <CheckCircle className="h-4 w-4" /> Confirm & Complete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
