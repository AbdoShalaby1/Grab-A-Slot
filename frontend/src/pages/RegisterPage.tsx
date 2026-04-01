import { type FormEvent, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaExclamationTriangle, 
  FaSpinner, 
  FaUserPlus, 
  FaCalendarAlt, 
  FaCog,
  FaUser,
  FaEnvelope,
  FaLock
} from "react-icons/fa";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Navigate after registration when user is set
  useEffect(() => {
    if (user && !pending) {
      navigate(user.role === "admin" ? "/admin/slots" : "/calendar", { replace: true });
    }
  }, [user, pending, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register(email, password, name, role);
      setPending(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
      setPending(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-12 font-sans">
      <div className="w-full max-w-md relative">

        <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-800">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              Create an Account
            </h1>
            <p className="text-sm text-gray-400">
              Join us to start booking and managing appointments
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm animate-pulse">
                <FaExclamationTriangle className="flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-gray-500" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={1}
                  className="w-full bg-gray-950/50 border border-gray-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 placeholder-gray-600"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-950/50 border border-gray-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 placeholder-gray-600"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password <span className="text-gray-500 font-normal">(min. 8 characters)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-gray-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-gray-950/50 border border-gray-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 placeholder-gray-600"
                />
              </div>
            </div>

            {/* Segmented Control for Role */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Type
              </label>
              <div className="flex p-1 bg-gray-950/50 rounded-xl border border-gray-700">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    role === "user"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent"
                  }`}
                >
                  <FaCalendarAlt /> Book
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    role === "admin"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent"
                  }`}
                >
                  <FaCog /> Manage
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pending}
              className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-200 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:hover:translate-y-0"
            >
              {pending ? (
                <>
                  <FaSpinner className="inline-block animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  <FaUserPlus className="inline-block mr-2 group-hover:scale-110 transition-transform" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-cyan-400 hover:after:w-full after:transition-all after:duration-300"
              >
                Sign In
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}