import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';
import './EventCard.css';

function EventCard({ event }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return timeString || '7:00 PM';
  };

  // Map event categories to Unsplash images
  const getEventImage = (category) => {
    const imageMap = {
      'Rock': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      'Jazz': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      'EDM': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
      'Classical': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      'Pop': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      'Hip-Hop': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      'default': 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'
    };
    return event.image || imageMap[category] || imageMap['default'];
  };

  return (
    <div className="event-card fade-in">
      <div className="event-card-image">
        <div 
          className="event-image-placeholder"
          style={{ 
            backgroundImage: `linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%), url(${getEventImage(event.category)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <span className="event-emoji">{event.emoji || '🎵'}</span>
        </div>
        {event.featured && <span className="event-badge">Featured</span>}
      </div>
      
      <div className="event-card-content">
        <div className="event-category">{event.category || 'Music'}</div>
        <h3 className="event-title">{event.name}</h3>
        <p className="event-description">{event.description}</p>
        
        <div className="event-details">
          <div className="event-detail-item">
            <FaMapMarkerAlt />
            <span>{event.location}</span>
          </div>
          <div className="event-detail-item">
            <FaCalendarAlt />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="event-detail-item">
            <FaClock />
            <span>{formatTime(event.time)}</span>
          </div>
          {event.musicianName && (
            <div className="event-detail-item" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              🎵 {event.musicianName}
            </div>
          )}
          {(event.availableTickets !== undefined || event.capacity) && (
            <div className="event-detail-item">
              <FaUsers />
              <span>{event.availableTickets !== undefined ? event.availableTickets : event.capacity} tickets left</span>
            </div>
          )}
        </div>

        <div className="event-card-footer">
          <div className="event-price">
            <span className="price-currency">₹</span>
            <span className="price-amount">{event.price || '500'}</span>
          </div>
          <Link to={`/event/${event.id}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
