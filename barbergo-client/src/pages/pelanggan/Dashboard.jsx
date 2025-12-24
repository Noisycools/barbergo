import { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Search, Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [barbershops, setBarbershops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetchBarbershops();
  }, [search, minRating]);

  const fetchBarbershops = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (minRating > 0) params.min_rating = minRating;

      const { data } = await api.get('/barbershop', { params });
      setBarbershops(data.data);
    } catch (error) {
      console.error('Failed to fetch barbershops', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            BarberGo
          </h1>
          <div className="flex items-center gap-4">
            <Link to="/reservasi/riwayat" className="text-slate-300 hover:text-white transition-colors">
                My Reservations
            </Link>
            <div className="h-4 w-px bg-slate-700"></div>
            <span className="text-slate-300">Hi, {user?.name}</span>
            <button 
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search barbershops or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-200 placeholder-slate-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-200"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
            >
              <option value="0">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbershops.map((shop, index) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-colors group cursor-pointer"
              >
                <div className="h-40 bg-slate-700 relative overflow-hidden">
                  {shop.foto ? (
                    <img src={shop.foto} alt={shop.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-700">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-white">{Number(shop.rating_rata_rata).toFixed(1)}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2">{shop.nama}</h3>
                  <div className="flex items-start gap-2 text-slate-400 mb-4 h-10">
                    <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                    <p className="text-sm line-clamp-2">{shop.alamat}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-500">
                      {shop.jam_buka} - {shop.jam_tutup}
                    </div>
                    <Link 
                      to={`/barbershop/${shop.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
            {barbershops.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                    No barbershops found matching your criteria.
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
