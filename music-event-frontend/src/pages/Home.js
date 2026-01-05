import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTicketAlt, FaCalendarCheck, FaHandshake, FaCalendarAlt, FaStar, FaArrowRight } from 'react-icons/fa';
import EventCard from '../components/EventCard';
import { eventAPI } from '../services/api';
import './Pages.css';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Music Enthusiast',
    text: 'Best platform for discovering and booking music events! The QR ticket system is so convenient.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Event Organizer',
    text: 'Managing events has never been easier. The calendar and scheduling features are fantastic.',
    rating: 5
  },
  {
    name: 'Emma Davis',
    role: 'Musician',
    text: 'Love how seamless the contract signing process is. This platform connects artists perfectly.',
    rating: 5
  }
];

function Home() {
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentEvents();
  }, []);

  const fetchRecentEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getUpcomingEvents();
      const now = new Date();
      
      // Filter upcoming events and sort by date (nearest upcoming first)
      const upcomingEvents = response.data
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= now && event.status !== 'completed';
        })
        .sort((a, b) => {
          // Sort by date (nearest upcoming events first)
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA - dateB;
        })
        .slice(0, 3); // Get the 3 most recent events
      
      setRecentEvents(upcomingEvents);
    } catch (error) {
      console.error('Error fetching recent events:', error);
      setRecentEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Experience Music Like Never Before
            <span className="gradient-text"> 🎵</span>
          </h1>
          <p className="hero-subtitle">
            Discover amazing music events, book tickets instantly, and connect with artists and organizers
            all in one place. Your next musical adventure starts here.
          </p>
          <div className="hero-actions">
            <Link to="/events" className="btn btn-primary btn-large">
              Explore Events
              <FaArrowRight style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/register" className="btn btn-outline btn-large">
              Get Started
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <FaTicketAlt />
            <span>Instant Booking</span>
          </div>
          <div className="floating-card card-2">
            <FaCalendarCheck />
          </div>
          <div className="floating-card card-3">
            <FaHandshake />
            <span>Easy Contracts</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose MusicEvent?</h2>
          <p className="section-subtitle">Everything you need for the perfect music event experience</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--gradient-1)' }}>
                <FaTicketAlt />
              </div>
              <h3>Easy Ticket Booking</h3>
              <p>Book your favorite music events in seconds with our streamlined booking system. Get instant QR code tickets delivered to your phone.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--gradient-2)' }}>
                <FaCalendarCheck />
              </div>
              <h3>Smart Event Scheduling</h3>
              <p>Organizers can easily schedule shows, manage multiple events, and keep track of everything with our intelligent calendar system.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--gradient-3)' }}>
                <FaHandshake />
              </div>
              <h3>Digital Contracts</h3>
              <p>Musicians and organizers can sign contracts digitally, making the booking process fast, secure, and hassle-free.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'var(--gradient-4)' }}>
                <FaCalendarAlt />
              </div>
              <h3>Event Calendar</h3>
              <p>Never miss an event with our comprehensive calendar view. Filter by date, location, genre, and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Events */}
      <section className="featured-events">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recent Events</h2>
            <Link to="/events" className="view-all-link">
              View All Events <FaArrowRight />
            </Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading events...</p>
            </div>
          ) : recentEvents.length > 0 ? (
            <div className="events-grid">
              {recentEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No events available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="star" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience Amazing Music Events?</h2>
            <p>Join thousands of music lovers, artists, and organizers on our platform</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Create Free Account
              </Link>
              <Link to="/events" className="btn btn-outline btn-large">
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
