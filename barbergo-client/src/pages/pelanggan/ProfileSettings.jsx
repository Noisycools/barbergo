import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, Save, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProfileSettings() {
    const { user, setUser } = useAuth(); // Assuming setUser updates the context
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone_number: ''
    });

    // Separate state for password change
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                phone_number: user.phone_number || ''
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        setErrors({});

        try {
            const { data } = await api.put('/user/profile', profile);
            toast.success('Profile updated successfully');
            // Update local user context if needed, usually we re-fetch user or update context
            // Assuming the context exposes a way to refresh user or we just update the storage
            // This part depends on how AuthContext is implemented. 
            // Ideally we should call a method from context to refresh user data.
            // For now, I'll rely on the fact that if I refresh the page, it fetches 'user/profile'.

        } catch (error) {
            console.error('Update profile error', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error(error.response?.data?.message || 'Failed to update profile');
            }
        } finally {
            setLoadingProfile(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        setLoadingPassword(true);
        setErrors({});

        try {
            await api.put('/user/password', passwordData);
            toast.success('Password updated successfully');
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
        } catch (error) {
            console.error('Change password error', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error(error.response?.data?.message || 'Failed to update password');
            }
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-xl font-bold text-white">Profile Settings</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Profile Edit Section */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <User className="h-6 w-6 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                    </div>

                    <form onSubmit={updateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleProfileChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-slate-500"
                                    placeholder="Your full name"
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleProfileChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-slate-500"
                                    placeholder="your@email.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={profile.phone_number}
                                    onChange={handleProfileChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-slate-500"
                                    placeholder="0812..."
                                />
                            </div>
                            {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number[0]}</p>}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loadingProfile}
                                className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingProfile ? (
                                    'Saving...'
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <Lock className="h-6 w-6 text-purple-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Change Password</h2>
                    </div>

                    <form onSubmit={changePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Current Password</label>
                            <input
                                type="password"
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-slate-500"
                                placeholder="Enter current password"
                            />
                            {errors.current_password && <p className="text-red-500 text-sm mt-1">{errors.current_password[0]}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="new_password"
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-slate-500"
                                    placeholder="Enter new password"
                                />
                                {errors.new_password && <p className="text-red-500 text-sm mt-1">{errors.new_password[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="new_password_confirmation"
                                    value={passwordData.new_password_confirmation}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-slate-500"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loadingPassword}
                                className="w-full md:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingPassword ? (
                                    'Updating...'
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" /> Update Password
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
