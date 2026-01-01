import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, User, Scissors, CheckCircle, Loader2, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [barbershop, setBarbershop] = useState(null);
  
  const [formData, setFormData] = useState({
    layanan_id: '',
    tukang_cukur_id: '',
    tanggal: '',
    waktu_mulai: '',
    promosi_id: '',
  });

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Derived state for available promos
  const availablePromos = promos.filter(promo => {
    if (!promo.status) return false;
    const now = new Date();
    const startDate = new Date(promo.tanggal_mulai);
    const endDate = new Date(promo.tanggal_berakhir);
    return now >= startDate && now <= endDate;
  });

  useEffect(() => {
    fetchBarbershop();
    fetchPromos();
  }, [id]);

  const fetchBarbershop = async () => {
    try {
      const { data } = await api.get(`/barbershop/${id}`);
      setBarbershop(data);
    } catch (error) {
      setError('Failed to load barbershop details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPromos = async () => {
    try {
      const { data } = await api.get(`/promosi?barbershop_id=${id}`);
      setPromos(data);
    } catch (error) {
      console.error("Failed to load promos", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/reservasi', {
        barbershop_id: id,
        ...formData
      });
      // Redirect to history or success page
      navigate('/reservasi/riwayat');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  if (!barbershop) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Barbershop not found</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Book Appointment</h1>
            <p className="text-blue-100 mt-2">{barbershop.nama}</p>
        </div>

        <div className="p-8">
            {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-800 text-red-200 rounded-xl flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-400 flex items-center gap-2">
                        <Scissors className="h-4 w-4" /> Select Service
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {barbershop.layanans?.map((layanan) => (
                            <div 
                                key={layanan.id}
                                onClick={() => setFormData({...formData, layanan_id: layanan.id})}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    formData.layanan_id === layanan.id 
                                    ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' 
                                    : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                                }`}
                            >
                                <div className="font-bold text-white">{layanan.nama_layanan}</div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-slate-400">{layanan.durasi_menit} mins</span>
                                    <span className="text-blue-400">Rp {Number(layanan.harga).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Barber Selection */}
                <div className="space-y-4">
                     <label className="block text-sm font-medium text-slate-400 flex items-center gap-2">
                        <User className="h-4 w-4" /> Select Barber
                    </label>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {barbershop.tukang_cukurs?.map((barber) => (
                             <div 
                                key={barber.id}
                                onClick={() => setFormData({...formData, tukang_cukur_id: barber.id})}
                                className={`flex-shrink-0 w-32 p-4 rounded-xl border cursor-pointer text-center transition-all ${
                                    formData.tukang_cukur_id === barber.id 
                                    ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' 
                                    : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                                }`}
                            >
                                <div className="w-16 h-16 mx-auto bg-slate-600 rounded-full mb-3 overflow-hidden">
                                     {barber.foto ? <img src={barber.foto} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-slate-400"/>}
                                </div>
                                <div className="font-medium text-white truncate">{barber.nama}</div>
                                <div className="text-xs text-slate-400 truncate">{barber.spesialisasi || 'Barber'}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Date
                        </label>
                        <input 
                            type="date" 
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.tanggal}
                            onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400 flex items-center gap-2">
                             <Clock className="h-4 w-4" /> Time
                        </label>
                        <input 
                            type="time" 
                            required
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.waktu_mulai}
                            onChange={(e) => setFormData({...formData, waktu_mulai: e.target.value})}
                        />
                    </div>
                </div>

                {/* Promo Selection */}
                {availablePromos.length > 0 && (
                  <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-400 flex items-center gap-2">
                          <Tag className="h-4 w-4" /> Select Promo
                      </label>
                      <div className="grid grid-cols-1 gap-4">
                          {availablePromos.map((promo) => (
                              <div 
                                  key={promo.id}
                                  onClick={() => setFormData({...formData, promosi_id: formData.promosi_id === promo.id ? '' : promo.id})}
                                  className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                                      formData.promosi_id === promo.id 
                                      ? 'bg-purple-600/20 border-purple-500 ring-1 ring-purple-500' 
                                      : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                                  }`}
                              >
                                  <div>
                                      <div className="font-bold text-white">{promo.nama}</div>
                                      <div className="text-sm text-slate-400">{promo.kode_promo}</div>
                                  </div>
                                  <div className="text-purple-400 font-bold">
                                      {promo.diskon}% OFF
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={submitting || !formData.layanan_id || !formData.tukang_cukur_id || !formData.tanggal || !formData.waktu_mulai}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : <><CheckCircle className="h-5 w-5" /> Confirm Booking</>}
                    </button>
                </div>
            </form>
        </div>
      </motion.div>
    </div>
  );
}
