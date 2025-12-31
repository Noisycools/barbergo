import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import { Star, MapPin, Clock, Calendar, Scissors, ChevronLeft, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import ScheduleModal from '../../components/ScheduleModal';

export default function BarbershopDetail() {
  const { id } = useParams();
  const [barbershop, setBarbershop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    fetchBarbershop();
  }, [id]);

  const fetchBarbershop = async () => {
    try {
      const { data } = await api.get(`/barbershop/${id}`);
      setBarbershop(data);
    } catch (error) {
      console.error('Failed to fetch barbershop', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  if (!barbershop) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Barbershop not found</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 w-full">
        {barbershop.foto ? (
          <img src={'http://localhost:8000/storage/'+barbershop.foto} alt={barbershop.nama} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-xl">
            No Image Available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <Link to="/" className="absolute top-4 left-4 p-2 bg-slate-800/50 backdrop-blur rounded-full text-white hover:bg-slate-700 transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="absolute bottom-6 left-4 md:left-8 right-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{barbershop.nama}</h1>
          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{Number(barbershop.rating_rata_rata).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-5 w-5" />
              <span className="truncate">{barbershop.alamat}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">
        {/* About */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-500" /> Opening Hours
          </h2>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-sm flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Today</span>
              {(() => {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                const schedule = barbershop.operating_hours?.find(h => h.day === today);
                return (
                  <span className={`font-medium ${!schedule?.is_open ? 'text-red-400' : 'text-white'}`}>
                    {schedule?.is_open
                      ? `${String(schedule.start_time).substring(0, 5)} - ${String(schedule.end_time).substring(0, 5)}`
                      : 'Closed'
                    }
                  </span>
                );
              })()}
            </div>
            <button onClick={() => setShowScheduleModal(true)} className="text-blue-400 hover:text-blue-300 transform hover:scale-110 transition-all">
              <Info className="h-5 w-5" />
            </button>
          </div>
        </section>

        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          schedule={barbershop.operating_hours}
        />

        {/* Services */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Scissors className="h-6 w-6 text-purple-500" /> Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbershop.layanans?.map((layanan) => (
              <div key={layanan.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-white">{layanan.nama_layanan}</h3>
                  <p className="text-slate-400 text-sm">{layanan.durasi_menit} mins</p>
                </div>
                <div className="text-xl font-bold text-blue-400">
                  Rp {Number(layanan.harga).toLocaleString()}
                </div>
              </div>
            ))}
            {(!barbershop.layanans || barbershop.layanans.length === 0) && (
              <div className="text-slate-500">No services listed.</div>
            )}
          </div>
        </section>

        {/* Barbers Availability */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Scissors className="h-6 w-6 text-yellow-500" /> Barbers Availability Today
          </h2>
          {barbershop.is_open_today ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbershop.barbers_availability?.map((barber) => (
                <motion.div 
                  key={barber.barber_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-lg text-white">{barber.barber_name}</h3>
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">
                      {barber.total_bookings_today} bookings
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>Hours: {barber.operating_hours.start} - {barber.operating_hours.end}</span>
                    </div>
                    {barber.next_available_time ? (
                      <div className="flex items-center gap-2 text-green-400 font-medium mt-3">
                        <Calendar className="h-4 w-4" />
                        <span>Next available: {barber.next_available_time}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-400 font-medium mt-3">
                        <Calendar className="h-4 w-4" />
                        <span>Fully booked today</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center text-slate-400">
              <p>The barbershop is closed today</p>
            </div>
          )}
        </section>

        {/* Book Appointment */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-green-500" /> Book an Appointment
          </h2>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-400 mb-6">Ready to look sharp? Select a service and barber to proceed.</p>
            <Link
              to={`/barbershop/${id}/book`}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-900/20"
            >
              Book Reservation
            </Link>
          </div>
        </section>
      </main >
    </div >
  );
}
