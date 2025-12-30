import { Calendar, Star, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardStats({ stats }) {
  const cards = [
    {
      id: 'active-bookings',
      icon: Calendar,
      title: 'Active Bookings',
      value: stats?.active_bookings || 0,
      label: 'upcoming appointments',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-500',
    },
    {
      id: 'reviews-given',
      icon: Star,
      title: 'Reviews Given',
      value: stats?.reviews_given || 0,
      label: 'reviews',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-500',
    },
    {
      id: 'total-visits',
      icon: Scissors,
      title: 'Total Visits',
      value: stats?.total_visits || 0,
      label: 'haircuts',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-sm"
        >
          <div className="flex flex-col h-full">
            <div className={`w-12 h-12 rounded-lg ${card.iconBg} flex items-center justify-center mb-4`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            <h3 className="text-slate-100 font-semibold text-lg mb-1">
              {card.title}
            </h3>
            <div className="mt-auto">
              <span className="text-sm text-slate-400">
                {card.value} {card.label}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
