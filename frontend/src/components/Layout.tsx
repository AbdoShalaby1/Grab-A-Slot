import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaCalendar, FaClipboardList, FaCog, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-gray-400 selection:bg-sky-500/30">
      {/* Header - Height: 80px (h-20) */}
      <header className="bg-[#030712]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Section */}
            <Link
              to="/"
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-125 group-hover:shadow-sky-500/40 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)">
                <FaCalendar className="text-white w-5 h-5 group-hover:rotate-12 transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter group-hover:text-sky-400 transition-colors duration-300 ease-out">
                Grab A <span className="text-sky-500 group-hover:text-blue-400 transition-colors duration-300 ease-out">Slot.</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {user ? (
                <>
                  {user.role === "admin" ? (
                    // Admin Navigation
                    <>
                      <NavLink to="/admin/slots" icon={<FaCog size={14} />} label="Manage Slots" color="text-emerald-400" />
                      <NavLink to="/admin/bookings" icon={<FaClipboardList size={14} />} label="View Bookings" color="text-emerald-400" />
                    </>
                  ) : (
                    // User Navigation
                    <>
                      <NavLink to="/calendar" icon={<FaCalendar size={14} />} label="Book" />
                      <NavLink to="/my" icon={<FaClipboardList size={14} />} label="Appointments" />
                    </>
                  )}

                  <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10 transition-all duration-300">
                    <div className="flex items-center gap-2 text-xs font-bold text-white bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 ease-out cursor-default">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${user.role === "admin" ? "bg-emerald-500" : "bg-sky-500"}`} />
                      <span>{user.role === "admin" ? "ADMIN" : user.name.toUpperCase()}</span>
                    </div>
                    <button
                      onClick={() => { logout(); navigate("/"); }}
                      className="group p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 ease-out cursor-pointer active:scale-95"
                      title="Exit"
                    >
                      <FaSignOutAlt size={18} className="group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-6">
                  <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-white hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer">
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white text-black px-6 py-2.5 rounded-xl text-sm font-black hover:bg-sky-400 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-sky-400/50 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-lg shadow-white/5 cursor-pointer active:scale-95 active:duration-150"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
              title="Menu"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#030712]/95 backdrop-blur-xl border-b border-white/5 animate-fadeIn">
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-xs font-bold text-white bg-white/5 px-4 py-2 rounded-lg border border-white/10 mb-4">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${user.role === "admin" ? "bg-emerald-500" : "bg-sky-500"}`} />
                  <span>{user.role === "admin" ? "ADMIN" : user.name.toUpperCase()}</span>
                </div>
                
                {user.role === "admin" ? (
                  // Admin Mobile Navigation
                  <>
                    <MobileNavLink 
                      to="/admin/slots" 
                      icon={<FaCog size={14} />} 
                      label="Manage Slots" 
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <MobileNavLink 
                      to="/admin/bookings" 
                      icon={<FaClipboardList size={14} />} 
                      label="View Bookings" 
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  </>
                ) : (
                  // User Mobile Navigation
                  <>
                    <MobileNavLink 
                      to="/calendar" 
                      icon={<FaCalendar size={14} />} 
                      label="Book" 
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <MobileNavLink 
                      to="/my" 
                      icon={<FaClipboardList size={14} />} 
                      label="Appointments" 
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  </>
                )}
                
                <button
                  onClick={() => { logout(); navigate("/"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all duration-300 ease-out active:scale-95 cursor-pointer"
                >
                  <FaSignOutAlt size={14} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all duration-300 ease-out text-center cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-black hover:bg-sky-400 hover:text-white transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-lg shadow-white/5 text-center active:scale-95 cursor-pointer"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}

      <main className="flex-1">

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">

          <Outlet />

        </div>

      </main>

      <footer className="bg-[#030712] border-t border-white/5 py-10 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="flex items-center gap-4 opacity-40 hover:opacity-60 transition-opacity duration-300 ease-out cursor-default">
            <div className="h-[1px] w-8 bg-white/20 hidden md:block scale-x-0 hover:scale-x-100 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)" />
            <div className="flex items-center gap-2">
              <FaCalendar size={12} className="hover:scale-110 transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)" />
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white">
                Grab A Slot <span className="mx-2 text-gray-600 font-light">|</span> 2026
              </p>
            </div>
            <div className="h-[1px] w-8 bg-white/20 hidden md:block scale-x-0 hover:scale-x-100 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)" />
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components for cleaner code
function NavLink({ to, icon, label, color = "text-sky-400" }: { to: string; icon: React.ReactNode; label: string; color?: string }) {
  return (
    <Link 
      to={to} 
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/[0.08] hover:text-white transition-all duration-300 ease-out group relative overflow-hidden cursor-pointer active:scale-95"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      <span className={`${color} group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) relative z-10`}>{icon}</span>
      <span className="relative z-10 transition-transform duration-300 ease-out group-hover:translate-x-0.5">{label}</span>
    </Link>
  );
}

function MobileNavLink({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all duration-300 ease-out active:scale-95 cursor-pointer"
    >
      <span className="text-sky-400 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
