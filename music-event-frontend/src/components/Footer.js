import { Link } from 'react-router-dom';
import { FaMusic, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <FaMusic />
            <span>MusicEvent</span>
          </div>
          <p>Your premier destination for music events, artist bookings, and unforgettable experiences.</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/events">Browse Events</Link></li>
            <li><Link to="/artists">Artists</Link></li>
            <li><Link to="/organizers">Organizers</Link></li>
            <li><Link to="/calendar">Calendar</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>For Users</h4>
          <ul>
            <li><Link to="/register">Create Account</Link></li>
            <li><Link to="/dashboard">My Dashboard</Link></li>
            <li><Link to="/bookings">My Bookings</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>For Partners</h4>
          <ul>
            <li><Link to="/organizer-dashboard">Organizer Portal</Link></li>
            <li><Link to="/musician-dashboard">Musician Portal</Link></li>
            <li><Link to="/register">Become a Partner</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 MusicEvent Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
