import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          Appointments
        </Link>
        <nav className="nav">
          {user ? (
            <>
              <Link to="/calendar">Book</Link>
              <Link to="/my">My appointments</Link>
              {user.role === "admin" && (
                <>
                  <Link to="/admin/slots">Admin slots</Link>
                  <Link to="/admin/bookings">All bookings</Link>
                </>
              )}
              <span className="nav-user">{user.name}</span>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
