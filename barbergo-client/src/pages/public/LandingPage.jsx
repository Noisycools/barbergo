import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scissors, Clock, Star, MapPin, Calendar, Users, Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Easy Booking",
      description: "Book your haircut appointment in seconds with our intuitive system"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Real-time Availability",
      description: "See available time slots and choose what fits your schedule best"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Find Nearby",
      description: "Discover barbershops near you with ratings and reviews"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Top Rated Barbers",
      description: "Connect with the best barbers in your area"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Professional Service",
      description: "Experienced barbers ready to give you the perfect cut"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Reliable",
      description: "Your bookings and personal data are safe with us"
    }
  ];

  const benefits = [
    "No more waiting in line",
    "Choose your preferred barber",
    "Get notified about your appointment",
    "View your booking history",
    "Cancel or reschedule anytime",
    "Read reviews before booking"
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navigation */}
      <nav className="fixed w-full bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Scissors className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
                BarberGo
              </span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <Link 
                to="/login" 
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Your Perfect Haircut Awaits</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Book Your
                <span className="block bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
                  Barbershop
                </span>
                Appointment Online
              </h1>
              
              <p className="text-xl text-slate-400">
                Skip the wait, book your spot. Find the best barbershops near you and schedule your appointment in just a few clicks.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register"
                  className="group px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/login"
                  className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium transition-all flex items-center justify-center"
                >
                  Sign In
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-blue-400">500+</div>
                  <div className="text-sm text-slate-500">Barbershops</div>
                </div>
                <div className="h-12 w-px bg-slate-700"></div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">10k+</div>
                  <div className="text-sm text-slate-500">Happy Clients</div>
                </div>
                <div className="h-12 w-px bg-slate-700"></div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">4.9</div>
                  <div className="text-sm text-slate-500">Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-slate-700">
                <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
                <div className="relative space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="h-16 w-16 bg-linear-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Scissors className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Premium Barbershop</div>
                      <div className="text-sm text-slate-400 flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        4.9 • 234 reviews
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="text-sm text-slate-400 mb-2">Available Today</div>
                    <div className="grid grid-cols-3 gap-2">
                      {['10:00', '14:00', '16:30'].map((time) => (
                        <button key={time} className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors">
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Services</span>
                      <span className="font-semibold">Haircut, Beard Trim</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-slate-400">Duration</span>
                      <span className="font-semibold">45 min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-slate-400">Price</span>
                      <span className="font-semibold text-blue-400">Rp 75.000</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">BarberGo</span>
            </h2>
            <p className="text-slate-400 text-lg">Everything you need for a hassle-free barbershop experience</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all group hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="h-12 w-12 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold">
                Experience The
                <span className="block bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
                  Modern Way
                </span>
                To Book
              </h2>
              <p className="text-slate-400 text-lg">
                Join thousands of satisfied customers who have made the switch to convenient online booking.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-6 w-6 text-blue-400 shrink-0" />
                    <span className="text-slate-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
                  <div className="h-12 w-12 bg-linear-to-br from-blue-500 to-purple-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold">John Doe</div>
                    <div className="text-sm text-slate-400">Verified Customer</div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                
                <p className="text-slate-300 italic">
                  "BarberGo has completely changed how I book my haircuts. No more waiting around! 
                  I can see available slots, book instantly, and get reminders. Absolutely love it!"
                </p>
                
                <div className="pt-4 border-t border-slate-700 text-sm text-slate-400">
                  Booked 15 times in the last 6 months
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 h-24 w-24 bg-blue-500/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 h-24 w-24 bg-purple-500/20 rounded-full blur-2xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-size[20px_20px]"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Haircut Experience?</h2>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Join BarberGo today and never wait in line again. Book with the best barbers in your area instantly.
              </p>
              <Link 
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 hover:bg-slate-100 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
                  BarberGo
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Your trusted partner for hassle-free barbershop bookings.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Features</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="#" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-700 text-center text-sm text-slate-400">
            <p>&copy; 2026 BarberGo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}