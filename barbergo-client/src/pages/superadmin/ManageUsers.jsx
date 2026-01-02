import { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Users, Edit, Trash2, Search, ChevronLeft, ChevronRight, Shield, User } from 'lucide-react';

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [barbershops, setBarbershops] = useState([]); // Need to fetch these for filter

    // Filters & Pagination
    const [userFilters, setUserFilters] = useState({
        search: '',
        role: 'all',
        barbershop_id: 'all',
        sort_by: 'name',
        sort_order: 'asc',
        per_page: 10,
        page: 1
    });

    const [userMeta, setUserMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
    });

    // Modal State
    const [showUserModal, setShowUserModal] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [userFormData, setUserFormData] = useState({
        name: '',
        email: '',
        phone_number: '',
        password: ''
    });

    useEffect(() => {
        fetchBarbershops();
        fetchUsers();
    }, []); // Initial load

    // Refresh users when filters change (except initial mount handled above, but standard pattern ok)
    useEffect(() => {
        fetchUsers();
    }, [userFilters]);

    const fetchBarbershops = async () => {
        try {
            const { data } = await api.get('/super-admin/barbershop');
            setBarbershops(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: userFilters.page,
                per_page: userFilters.per_page,
                search: userFilters.search,
                role: userFilters.role,
                barbershop_id: userFilters.barbershop_id,
                sort_by: userFilters.sort_by,
                sort_order: userFilters.sort_order
            });
            const { data } = await api.get(`/super-admin/users?${params.toString()}`);
            setUsers(data.data);
            setUserMeta({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
                from: data.from,
                to: data.to
            });
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (column) => {
        setUserFilters(prev => ({
            ...prev,
            sort_by: column,
            sort_order: prev.sort_by === column && prev.sort_order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const renderSortArrow = (column) => {
        if (userFilters.sort_by !== column) return <div className="ml-1 w-2" />;
        return userFilters.sort_order === 'asc' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
    };

    const openUserEdit = (user) => {
        setEditUserId(user.id);
        setUserFormData({
            name: user.name,
            email: user.email,
            phone_number: user.phone_number || '',
            password: ''
        });
        setShowUserModal(true);
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        const promise = api.put(`/super-admin/users/${editUserId}`, userFormData);

        toast.promise(
            promise.then(async () => {
                await fetchUsers();
                setShowUserModal(false);
                setEditUserId(null);
            }),
            {
                loading: 'Updating user...',
                success: 'User updated successfully',
                error: (err) => err.response?.data?.message || 'Update failed'
            }
        );
    };

    const deleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;

        toast.promise(
            api.delete(`/super-admin/users/${id}`).then(() => {
                fetchUsers();
            }),
            {
                loading: 'Deleting user...',
                success: 'User deleted successfully',
                error: (err) => err.response?.data?.message || 'Failed to delete'
            }
        );
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                {/* Left: Page Size */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Show</span>
                    <select
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-white text-sm"
                        value={userFilters.per_page}
                        onChange={(e) => setUserFilters({ ...userFilters, per_page: Number(e.target.value), page: 1 })}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-slate-400">entries</span>
                </div>

                {/* Right: Filters & Search */}
                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">
                    <select
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-white text-sm"
                        value={userFilters.role}
                        onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value, page: 1 })}
                    >
                        <option value="all">All Roles</option>
                        <option value="admin_barbershop">Admin Barbershop</option>
                        <option value="pelanggan">Pelanggan</option>
                    </select>

                    <select
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none text-white text-sm max-w-[200px]"
                        value={userFilters.barbershop_id}
                        onChange={(e) => setUserFilters({ ...userFilters, barbershop_id: e.target.value, page: 1 })}
                    >
                        <option value="all">All Barbershops</option>
                        {barbershops.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.nama.length > 20 ? s.nama.substring(0, 20) + '...' : s.nama}
                            </option>
                        ))}
                    </select>

                    <div className="relative md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            value={userFilters.search}
                            onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value, page: 1 })}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-700/50 text-slate-400">
                            <tr>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('created_at')}>
                                    <div className="flex items-center">Created At {renderSortArrow('created_at')}</div>
                                </th>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center">Name {renderSortArrow('name')}</div>
                                </th>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('role')}>
                                    <div className="flex items-center">Role {renderSortArrow('role')}</div>
                                </th>
                                <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('email')}>
                                    <div className="flex items-center">Email {renderSortArrow('email')}</div>
                                </th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Barbershop</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-700/30">
                                    <td className="p-4 text-slate-400">
                                        {u.created_at ? formatDate(u.created_at) : <span className="text-slate-600">-</span>}
                                    </td>
                                    <td className="p-4 font-medium max-w-[200px] truncate" title={u.name}>{u.name}</td>
                                    <td className="p-4">
                                        {u.role === 'admin_barbershop' ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-700/50 flex items-center gap-1 w-fit">
                                                <Shield className="h-3 w-3" /> Admin
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-700/50 flex items-center gap-1 w-fit">
                                                <User className="h-3 w-3" /> User
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-400 max-w-[200px] truncate" title={u.email}>{u.email}</td>
                                    <td className="p-4 text-slate-400">{u.phone_number || '-'}</td>
                                    <td className="p-4">
                                        {u.role === 'admin_barbershop' ? (
                                            <div className="text-white font-medium max-w-[200px] truncate" title={u.barbershop?.nama}>
                                                {u.barbershop?.nama || <span className="text-slate-600">-</span>}
                                            </div>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openUserEdit(u)} className="p-1.5 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 border border-slate-600" title="Edit">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            {u.role === 'pelanggan' && (
                                                <button onClick={() => deleteUser(u.id)} className="p-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 border border-red-800" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400">
                                        Loading...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        Showing {userMeta.from || 0} to {userMeta.to || 0} of {userMeta.total} entries
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setUserFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={userMeta.current_page === 1}
                            className="p-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium px-2">Page {userMeta.current_page} of {userMeta.last_page}</span>
                        <button
                            onClick={() => setUserFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={userMeta.current_page === userMeta.last_page}
                            className="p-2 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* User Edit Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 w-full max-w-md rounded-xl p-6 border border-slate-700">
                        <h2 className="text-xl font-bold mb-6">Edit User</h2>
                        <form onSubmit={handleUserSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-400">Name</label>
                                <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" required value={userFormData.name} onChange={e => setUserFormData({ ...userFormData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-400">Email</label>
                                <input type="email" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" required value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-400">Phone</label>
                                <input className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" value={userFormData.phone_number} onChange={e => setUserFormData({ ...userFormData, phone_number: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-400">Password <span className="text-xs text-slate-500">(Leave blank to keep current)</span></label>
                                <input type="password" className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2" value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} />
                            </div>

                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 hover:bg-slate-700 rounded text-slate-300">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-medium">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
