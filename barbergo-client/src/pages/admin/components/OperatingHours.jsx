import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../api';

export default function OperatingHours() {
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSchedule();
    }, []);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/barbershop/schedule');
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const fetchedSchedule = res.data.schedule || [];
            const completeSchedule = days.map(day => {
                const existing = fetchedSchedule.find(s => s.day === day);
                return existing || { day, is_open: true, start_time: '09:00', end_time: '18:00' };
            });
            setSchedule(completeSchedule);
        } catch (error) {
            // Fallback defaults
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            setSchedule(days.map(day => ({ day, is_open: true, start_time: '09:00', end_time: '18:00' })));
        } finally {
            setLoading(false);
        }
    };

    const saveSchedule = async () => {
        toast.promise(
            api.put('/admin/barbershop/schedule', { schedule }),
            {
                loading: 'Saving schedule...',
                success: 'Schedule saved successfully!',
                error: (err) => `Failed to save schedule: ${err.message || 'Unknown error'}`
            }
        );
    };

    if (loading) return <div className="text-white">Loading schedule...</div>;

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Operating Hours</h2>
                <button onClick={saveSchedule} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                    <Save className="h-4 w-4" /> Save Changes
                </button>
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h3 className="text-lg font-semibold">Weekly Schedule</h3>
                    <p className="text-sm text-slate-400">Set your barbershop's operating hours for each day</p>
                </div>
                <div className="p-6 space-y-6">
                    {schedule.map((daySchedule, index) => (
                        <div key={daySchedule.day} className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-32 font-medium">{daySchedule.day}</div>
                            <div className="flex-1 flex items-center gap-6">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!daySchedule.is_open}
                                        onChange={e => {
                                            const newSchedule = [...schedule];
                                            newSchedule[index] = { ...newSchedule[index], is_open: e.target.checked };
                                            setSchedule(newSchedule);
                                        }}
                                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2">Open</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        value={daySchedule.start_time ? String(daySchedule.start_time).substring(0, 5) : ''}
                                        disabled={!daySchedule.is_open}
                                        onChange={e => {
                                            const newSchedule = [...schedule];
                                            newSchedule[index] = { ...newSchedule[index], start_time: e.target.value };
                                            setSchedule(newSchedule);
                                        }}
                                        className="bg-slate-900 border border-slate-600 rounded px-3 py-2 disabled:opacity-50 text-white"
                                    />
                                    <span className="text-slate-400">to</span>
                                    <input
                                        type="time"
                                        value={daySchedule.end_time ? String(daySchedule.end_time).substring(0, 5) : ''}
                                        disabled={!daySchedule.is_open}
                                        onChange={e => {
                                            const newSchedule = [...schedule];
                                            newSchedule[index] = { ...newSchedule[index], end_time: e.target.value };
                                            setSchedule(newSchedule);
                                        }}
                                        className="bg-slate-900 border border-slate-600 rounded px-3 py-2 disabled:opacity-50 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
