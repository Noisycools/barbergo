import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';

export default function ScheduleModal({ isOpen, onClose, schedule }) {
    if (!schedule) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-800 w-full max-w-sm rounded-xl border border-slate-700 shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" /> Weekly Schedule
                            </h3>
                            <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="space-y-2 text-sm">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                                    const daySchedule = schedule.find(h => h.day === day);
                                    const isOpen = daySchedule?.is_open;
                                    const timeStr = isOpen
                                        ? `${String(daySchedule.start_time).substring(0, 5)} - ${String(daySchedule.end_time).substring(0, 5)}`
                                        : 'Closed';

                                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

                                    return (
                                        <div key={day} className={`flex justify-between items-center border-b border-slate-700/50 last:border-0 pb-2 last:pb-0 ${isToday ? 'bg-slate-700/30 -mx-2 px-2 rounded' : ''}`}>
                                            <span className={`${isToday ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                                                {day}
                                            </span>
                                            <span className={`font-medium ${!isOpen ? 'text-red-400' : 'text-white'}`}>
                                                {timeStr}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
