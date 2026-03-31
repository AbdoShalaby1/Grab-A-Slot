import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Pages.css";

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page-stack">
      <h1>Grab A Slot</h1>
      <p className="lead">
        Pick an open slot on the calendar and book in one step. Admins manage availability; the system blocks double
        bookings.
      </p>
      {user ? (
        <div className="actions">
          <Link className="btn primary" to="/calendar">
            Open calendar
          </Link>
          <Link className="btn" to="/my">
            My appointments
          </Link>
        </div>
      ) : (
        <div className="actions">
          <Link className="btn primary" to="/register">
            Create account
          </Link>
          <Link className="btn" to="/login">
            Log in
          </Link>
        </div>
      )}
    </div>
  );
}
