import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaMusic, FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { getCurrentUser, logoutUser } from '../utils/auth';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user on mount
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };

    // Listen for custom login event
    const handleUserLogin = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin);
    
    // Also check on location change (when navigating after login)
    const checkUser = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };
    
    // Check user state on location change
    checkUser();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, [location]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setMobileMenuOpen(false);
    navigate('/');
    window.location.reload(); // Force refresh to update navbar
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    if (user.role === 'organizer') return '/organizer-dashboard';
    if (user.role === 'musician') return '/musician-dashboard';
    return '/dashboard';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          <FaMusic className="logo-icon" />
          <span>MusicEvent</span>
        </Link>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {user && (
            <>
              <Link 
                to="/events" 
                className={isActive('/events') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link 
                to="/artists" 
                className={isActive('/artists') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Artists
              </Link>
              <Link 
                to="/organizers" 
                className={isActive('/organizers') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Organizers
              </Link>
              <Link 
                to="/calendar" 
                className={isActive('/calendar') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Calendar
              </Link>
            </>
          )}

          <div className="nav-actions">
            {user ? (
              <>
                <Link 
                  to={getDashboardPath()}
                  className="user-menu"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    textDecoration: 'none',
                    color: 'var(--dark)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div className="user-avatar" style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--gradient-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '16px'
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600 }}>{user.name}</span>
                </Link>
                <button 
                  className="btn btn-outline"
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="btn btn-outline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
