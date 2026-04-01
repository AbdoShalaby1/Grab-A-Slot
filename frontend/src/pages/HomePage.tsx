import { Link } from "react-router-dom";
import { FaBolt, FaShieldAlt, FaCalendar, FaClipboardList, FaArrowRight, FaSignInAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="relative isolate min-h-[calc(60vh)] flex items-center justify-center px-6">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
        
        {/* Left Side: Hero Content */}
        <div className="flex-[1.2] text-center lg:text-left space-y-8">
          <header className="space-y-6">
            
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white leading-[0.9]">
              Grab A <br />
              <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Slot.
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Your time is valuable. Access real-time availability and confirm your next appointment in seconds. No calls, no waiting, just instant confirmation.
            </p>
          </header>

          <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4">
            {user ? (
              <>
                {user.role === "admin" ? (
                  <>
                    <Link to="/admin/slots" className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-sky-500/20 ">
                      <FaCalendar size={18} /> Manage Slots
                    </Link>
                    <Link to="/admin/bookings" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                      <FaClipboardList size={18} /> View Bookings
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/calendar" className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-sky-500/20 ">
                      <FaCalendar size={18} /> Open Calendar
                    </Link>
                    <Link to="/my" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                      <FaClipboardList size={18} /> My Appointments
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/register" className="group w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-sky-50 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ">
                  Get Started <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/5 text-gray-300 rounded-2xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2">
                  <FaSignInAlt /> Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Features Card Stack */}
        <div className="flex-1 w-full flex flex-col gap-4 relative">
            {/* Feature 1 */}
            <div className="group p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-sky-500/50 transition-all duration-500 hover:scale-[1.02]">
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                  <FaBolt size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Instant Booking</h3>
                  <p className="text-gray-500 text-sm mt-1">Claim a spot in two clicks with our streamlined, friction-free interface.</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/50 transition-all duration-500 hover:scale-[1.02] lg:ml-8">
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <FaShieldAlt size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Secure & Private</h3>
                  <p className="text-gray-500 text-sm mt-1">Enterprise-grade encryption. We focus on your schedule, not your data.</p>
                </div>
              </div>
            </div>
            
            {/* Subtle "Trusted" text */}
            <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em] font-bold text-center lg:text-left mt-4 lg:pl-12">
              Optimized for high-performance teams
            </p>
        </div>

      </div>
    </div>
  );
}