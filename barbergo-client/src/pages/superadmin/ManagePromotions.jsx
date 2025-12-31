import { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Tag, Edit, Trash2, Search, ChevronLeft, ChevronRight, Store, Globe, Calendar, CheckCircle, XCircle } from 'lucide-react';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Use 'en-GB' locale to get dd/mm/yyyy, then swap / with - if needed
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const formatInputDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    // datetime-local expects YYYY-MM-DDTHH:mm
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function ManagePromotions() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [barbershops, setBarbershops] = useState([]);

    // Filters & Pagination
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        barbershop_id: 'all',
        start_date: '',
        end_date: '',
        sort_by: 'nama',
        sort_order: 'asc',
        per_page: 10,
        page: 1
    });

    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
    });

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isUsed, setIsUsed] = useState(false); // To track if promo is used
    const [formData, setFormData] = useState({
        nama: '',
        kode_promo: '',
        diskon: '',
        tanggal_mulai: '',
        tanggal_berakhir: '',
        quota_limit: '',
        status: true,
        scope: 'global', // global or specific
        barbershop_id: ''
    });

    useEffect(() => {
        fetchBarbershops();
        fetchPromos();
    }, []);

    useEffect(() => {
        fetchPromos();
    }, [filters]);

    const fetchBarbershops = async () => {
        try {
            const { data } = await api.get('/super-admin/barbershop');
            setBarbershops(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPromos = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== '' && value !== 'all') {
                    params.append(key, value);
                }
            });
            // Handle pagination manually as API expects page and per_page
            params.append('page', filters.page);
            params.append('per_page', filters.per_page);
            // Default "all" handling
            if (filters.status === 'all') params.delete('status');
            if (filters.barbershop_id === 'all') params.delete('barbershop_id');

            const { data } = await api.get(`/super-admin/promos?${params.toString()}`);
            setPromos(data.data);
            setMeta({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
                from: data.from,
                to: data.to
            });
        } catch (error) {
            console.error("Failed to fetch promos", error);
            toast.error("Failed to load promotions");
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (column) => {
        setFilters(prev => ({
            ...prev,
            sort_by: column,
            sort_order: prev.sort_by === column && prev.sort_order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const renderSortArrow = (column) => {
        if (filters.sort_by !== column) return <div className="ml-1 w-2" />;
        return filters.sort_order === 'asc' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
    };

    const openEdit = (promo) => {
        setEditId(promo.id);
        const used = promo.reservasis_count > 0;
        setIsUsed(used);

        setFormData({
            nama: promo.nama,
            kode_promo: promo.kode_promo,
            diskon: promo.diskon,
            tanggal_mulai: formatInputDate(promo.tanggal_mulai),
            tanggal_berakhir: formatInputDate(promo.tanggal_berakhir),
            quota_limit: promo.quota_limit || 0,
            status: Boolean(promo.status),
            scope: promo.barbershop_id ? 'specific' : 'global',
            barbershop_id: promo.barbershop_id || ''
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditId(null);
        setIsUsed(false);
        setFormData({
            nama: '',
            kode_promo: '',
            diskon: '',
            tanggal_mulai: '',
            tanggal_berakhir: '',
            quota_limit: '',
            status: true,
            scope: 'global',
            barbershop_id: ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            tanggal_mulai: formData.tanggal_mulai ? formData.tanggal_mulai.replace('T', ' ') + ':00' : '',
            tanggal_berakhir: formData.tanggal_berakhir ? formData.tanggal_berakhir.replace('T', ' ') + ':00' : '',
            status: formData.status ? 1 : 0
        };

        try {
            let promise;
            if (editId) {
                // If used, backend only validates status, but let's send everything or just status based on logic
                // Backend controller will ignore others if used.
                promise = api.put(`/super-admin/promos/${editId}`, payload);
            } else {
                promise = api.post('/super-admin/promos', payload);
            }

            await toast.promise(
                promise.then(async () => {
                    await fetchPromos();
                    setShowModal(false);
                    setEditId(null);
                }),
                {
                    loading: editId ? 'Updating promotion...' : 'Creating promotion...',
                    success: 'Successfully saved!',
                    error: (err) => err.response?.data?.message || 'Operation failed'
                }
            );
        } catch (error) {
            // Error handled by toast promise mostly, but safeguard
            console.error(error);
        }
    };

    const handleDelete = async (promo) => {
        if (promo.reservasis_count > 0) {
            toast.error("Cannot delete usage promotion");
            return;
        }
        if (!confirm('Are you sure you want to delete this promotion?')) return;

        toast.promise(
            api.delete(`/super-admin/promos/${promo.id}`).then(() => {
                fetchPromos();
            }),
            {
                loading: 'Deleting...',
                success: 'Deleted successfully',
                error: (err) => err.response?.data?.message || 'Failed to delete'
            }
        );
    };

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Show</span>
                        <select
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-white text-sm"
                            value={filters.per_page}
                            onChange={(e) => setFilters({ ...filters, per_page: Number(e.target.value), page: 1 })}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-slate-400">entries</span>
                    </div>

                    <button onClick={openCreate} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors">
                        <Tag className="h-4 w-4" /> Add New Promo
                    </button>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    {/* Left Side: Filters */}
                    <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                        <select
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <select
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm max-w-[200px]"
                            value={filters.barbershop_id}
                            onChange={(e) => setFilters({ ...filters, barbershop_id: e.target.value, page: 1 })}
                        >
                            <option value="all">All Barbershops</option>
                            <option value="global">Global Only</option>
                            {barbershops.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.nama.length > 20 ? s.nama.substring(0, 20) + '...' : s.nama}
                                </option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                                value={filters.start_date}
                                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                placeholder="Start Date"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="date"
                                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                                value={filters.end_date}
                                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                placeholder="End Date"
                            />
                        </div>

                        <button
                            onClick={() => setFilters({
                                search: '',
                                status: 'all',
                                barbershop_id: 'all',
                                start_date: '',
                                end_date: '',
                                sort_by: 'nama',
                                sort_order: 'asc',
                                per_page: 10,
                                page: 1
                            })}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors border border-slate-600"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Right Side: Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search Name, Code, Discount..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-white text-sm"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-700/50 text-slate-400">
                            <tr>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('nama')}>
                                    <div className="flex items-center">Name {renderSortArrow('nama')}</div>
                                </th>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('kode_promo')}>
                                    <div className="flex items-center">Code {renderSortArrow('kode_promo')}</div>
                                </th>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('diskon')}>
                                    <div className="flex items-center">Discount {renderSortArrow('diskon')}</div>
                                </th>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('status')}>
                                    <div className="flex items-center">Status {renderSortArrow('status')}</div>
                                </th>
                                <th className="p-4">Validity</th>
                                <th className="p-4">Quota (Used/Limit)</th>
                                <th className="p-4">Barbershop</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {promos.map(p => (
                                <tr key={p.id} className="hover:bg-slate-700/30">
                                    <td className="p-4 font-medium text-white max-w-[200px] truncate" title={p.nama}>{p.nama}</td>
                                    <td className="p-4">
                                        <span className="font-mono bg-slate-900 px-2 py-1 rounded text-xs border border-slate-700 text-purple-300 inline-block max-w-[120px] truncate align-middle" title={p.kode_promo}>
                                            {p.kode_promo}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white font-bold">{p.diskon}%</td>
                                    <td className="p-4">
                                        {p.status ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/50 flex items-center gap-1 w-fit">
                                                <CheckCircle className="h-3 w-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400 border border-slate-600 flex items-center gap-1 w-fit">
                                                <XCircle className="h-3 w-3" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-xs text-slate-300">
                                        <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(p.tanggal_mulai)}</div>
                                        <div className="flex items-center gap-1 mt-1"><Calendar className="h-3 w-3" /> {formatDate(p.tanggal_berakhir)}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-white font-medium">{p.reservasis_count || 0} / {p.quota_limit}</div>
                                    </td>
                                    <td className="p-4">
                                        {p.barbershop ? (
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Store className="h-4 w-4 shrink-0" />
                                                <span className="truncate max-w-[150px]" title={p.barbershop.nama}>{p.barbershop.nama}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-blue-300">
                                                <Globe className="h-4 w-4 shrink-0" />
                                                <span>Global</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEdit(p)} className="p-1.5 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 border border-slate-600" title="Edit">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            {p.reservasis_count === 0 && (
                                                <button onClick={() => handleDelete(p)} className="p-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 border border-red-800" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {promos.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400">
                                        No promotions found.
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400">
                                        Loading...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        Showing {meta.from || 0} to {meta.to || 0} of {meta.total} entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={meta.current_page === 1}
                            className="p-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium px-2">Page {meta.current_page} of {meta.last_page}</span>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={meta.current_page === meta.last_page}
                            className="p-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 w-full max-w-2xl rounded-xl p-6 border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{editId ? 'Edit Promotion' : 'Create New Promotion'}</h2>

                        {isUsed && (
                            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-yellow-200 text-sm">
                                Current promotion is in use. Only "Status" can be modified.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-400">Promo Name</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 disabled:opacity-50"
                                        required
                                        value={formData.nama}
                                        onChange={e => setFormData({ ...formData, nama: e.target.value })}
                                        disabled={isUsed}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-400">Promo Code</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 disabled:opacity-50 font-mono uppercase"
                                        required
                                        value={formData.kode_promo}
                                        onChange={e => setFormData({ ...formData, kode_promo: e.target.value.toUpperCase() })}
                                        disabled={isUsed}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-400">Discount (%)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 disabled:opacity-50"
                                        required
                                        value={formData.diskon}
                                        onChange={e => setFormData({ ...formData, diskon: e.target.value })}
                                        disabled={isUsed}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-400">Quota Limit</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 disabled:opacity-50"
                                        required
                                        value={formData.quota_limit}
                                        onChange={e => setFormData({ ...formData, quota_limit: e.target.value })}
                                        disabled={isUsed}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-400">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 disabled:opacity-50 text-white" // text-white check for calendar icon visibility
                                        required
                                        value={formData.tanggal_mulai}
                                        onChange={e => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                                        disabled={isUsed}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-400">End Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 disabled:opacity-50 text-white"
                                        required
                                        value={formData.tanggal_berakhir}
                                        onChange={e => setFormData({ ...formData, tanggal_berakhir: e.target.value })}
                                        disabled={isUsed}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-400">Barbershop</label>
                                <div className="flex gap-4 mb-2">
                                    <label className={`flex items-center gap-2 cursor-pointer ${isUsed ? 'opacity-75 cursor-not-allowed' : ''}`}>
                                        <input
                                            type="radio"
                                            name="scope"
                                            value="global"
                                            checked={formData.scope === 'global'}
                                            onChange={() => !isUsed && setFormData({ ...formData, scope: 'global', barbershop_id: '' })}
                                            className={`text-purple-600 focus:ring-purple-500 ${isUsed ? 'cursor-not-allowed' : ''}`}
                                        />
                                        <span>Global (All Barbershops)</span>
                                    </label>
                                    <label className={`flex items-center gap-2 cursor-pointer ${isUsed ? 'opacity-75 cursor-not-allowed' : ''}`}>
                                        <input
                                            type="radio"
                                            name="scope"
                                            value="specific"
                                            checked={formData.scope === 'specific'}
                                            onChange={() => !isUsed && setFormData({ ...formData, scope: 'specific' })}
                                            className={`text-purple-600 focus:ring-purple-500 ${isUsed ? 'cursor-not-allowed' : ''}`}
                                        />
                                        <span>Specific Barbershop</span>
                                    </label>
                                </div>

                                {formData.scope === 'specific' && (
                                    <select
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 disabled:opacity-50 mt-1"
                                        required
                                        value={formData.barbershop_id}
                                        onChange={e => setFormData({ ...formData, barbershop_id: e.target.value })}
                                        disabled={isUsed}
                                    >
                                        <option value="">Select Barbershop...</option>
                                        {barbershops.map(s => (
                                            <option key={s.id} value={s.id}>{s.nama}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-700">
                                <span className="text-sm font-medium text-slate-300">Status Active</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-700">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 hover:bg-slate-700 rounded text-slate-300">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-medium">
                                    {editId ? 'Save Changes' : 'Create Promotion'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
