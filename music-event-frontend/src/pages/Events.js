import { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import EventCard from '../components/EventCard';
import { eventAPI } from '../services/api';
import './Pages.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getUpcomingEvents();
      // Filter out completed events (events with date in the past) and only show events with musicians
      const now = new Date();
      const upcomingEvents = response.data.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now && event.status !== 'completed' && event.musicianId; // Only show events with assigned musicians
      });
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(events.map(e => e.category).filter(Boolean))];
  const locations = ['All', ...new Set(events.map(e => e.location?.split(',')[0]).filter(Boolean))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || event.location?.includes(selectedLocation);
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (loading) {
    return (
      <div className="events-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Discover Amazing Music Events</h1>
        <p>Find your perfect music experience from hundreds of events</p>
      </div>

      <div className="events-filters">
        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
          <FaSearch style={{ 
            position: 'absolute', 
            left: '15px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#94a3b8'
          }} />
          <input
            type="text"
            placeholder="Search events..."
            className="filter-input"
            style={{ paddingLeft: '45px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="events-container">
        {filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No events found matching your criteria. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
