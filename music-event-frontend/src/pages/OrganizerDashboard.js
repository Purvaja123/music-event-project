import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaMusic, FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaUser, FaFileContract, FaCheckCircle, FaTimesCircle, FaClock, FaEdit, FaTrash } from "react-icons/fa";
import { getCurrentUser, initializeData } from "../utils/auth";
import { userAPI, eventAPI, contractAPI, bookingAPI } from "../services/api";
import "./Pages.css";

function OrganizerDashboard() {
  const [user, setUser] = useState(null);
  const [artists, setArtists] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('events');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateContract, setShowCreateContract] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingEvent, setBookingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    location: '',
    date: '',
    time: '7:00 PM',
    price: '',
    category: 'Rock',
    totalTickets: '',
    emoji: '🎵',
    musicianId: '',
    musicianName: '',
    selectedContractId: '', // For dropdown selection
    contractId: null // For linking after creation
  });

  const [contractForm, setContractForm] = useState({
    eventName: '',
    venue: '',
    date: '',
    time: '7:00 PM',
    description: '',
    paymentAmount: '',
    notes: ''
  });

  const [bookingForm, setBookingForm] = useState({
    tickets: 1,
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    initializeData();
    const currentUser = getCurrentUser();
    const userRole = currentUser?.role?.toLowerCase();
    if (!currentUser || userRole !== 'organizer') {
      navigate('/login');
      return;
    }

    setUser(currentUser);
    loadDashboardData(currentUser.id);
  }, [navigate]);

  const loadDashboardData = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Load data in parallel
      const [artistsResponse, contractsResponse, eventsResponse] = await Promise.all([
        userAPI.getArtists(),
        contractAPI.getOrganizerContracts(userId),
        eventAPI.getOrganizerEvents(userId)
      ]);

      let eventsData = eventsResponse.data || [];

      // Auto-complete past events
      const now = new Date();
      for (const event of eventsData) {
        const eventDate = new Date(event.date);
        if (eventDate < now && event.status !== 'completed') {
          try {
            await eventAPI.updateEvent(event.id, { status: 'completed' });
            event.status = 'completed';
          } catch (err) {
            console.error('Error auto-completing event:', err);
          }
        }
      }

      setArtists(artistsResponse.data || []);
      const contractsData = contractsResponse.data || [];
      console.log('Loaded contracts:', contractsData);
      console.log('Contracts count:', contractsData.length);
      setContracts(contractsData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      if (!eventForm.selectedContractId || !eventForm.musicianId) {
        setError('Please select a musician from an accepted contract.');
        return;
      }

      const totalTickets = parseInt(eventForm.totalTickets);
      const eventData = {
        name: eventForm.name,
        description: eventForm.description,
        location: eventForm.location,
        date: eventForm.date,
        time: eventForm.time,
        price: parseFloat(eventForm.price),
        category: eventForm.category,
        totalTickets: totalTickets,
        availableTickets: totalTickets, // Set available tickets equal to total tickets initially
        emoji: eventForm.emoji || '🎵',
        organizerId: user.id,
        organizerName: user.name,
        musicianId: eventForm.musicianId ? parseInt(eventForm.musicianId) : null,
        musicianName: eventForm.musicianName || null
      };

      console.log('Creating event with data:', eventData);
      const response = await eventAPI.createEvent(eventData);
      const createdEvent = response.data;

      // Link the contract to the event if contractId exists
      if (eventForm.contractId && createdEvent.id) {
        try {
          await contractAPI.linkEventToContract(eventForm.contractId, createdEvent.id);
        } catch (err) {
          console.error('Error linking contract to event:', err);
        }
      }

      await loadDashboardData(user.id);

      setShowCreateEvent(false);
      setEventForm({
        name: '',
        description: '',
        location: '',
        date: '',
        time: '7:00 PM',
        price: '',
        category: 'Rock',
        totalTickets: '',
        emoji: '🎵',
        musicianId: '',
        musicianName: '',
        selectedContractId: '',
        contractId: null
      });
    } catch (err) {
      console.error('Error creating event:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to create event. Please try again.';
      setError(errorMessage);
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    if (!selectedArtist) {
      setError('Please select an artist first.');
      return;
    }

    // Validate required fields
    if (!contractForm.eventName || !contractForm.venue || !contractForm.date || !contractForm.paymentAmount) {
      setError('Please fill in all required fields (Event Name, Venue, Date, and Payment Amount).');
      return;
    }

    const paymentAmount = parseInt(contractForm.paymentAmount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    try {
      setError(null); // Clear previous errors
      const contractData = {
        organizerId: user.id,
        organizerName: user.name,
        artistId: selectedArtist.id,
        artistName: selectedArtist.name,
        eventName: contractForm.eventName.trim(),
        venue: contractForm.venue.trim(),
        eventDate: contractForm.date,
        eventTime: contractForm.time || '7:00 PM',
        eventDescription: contractForm.description?.trim() || '',
        paymentAmount: paymentAmount,
        notes: contractForm.notes?.trim() || ''
      };

      console.log('Sending contract data:', contractData);
      const response = await contractAPI.createContract(contractData);
      console.log('Contract created successfully:', response.data);
      await loadDashboardData(user.id);

      setShowCreateContract(false);
      setSelectedArtist(null);
      setContractForm({
        eventName: '',
        venue: '',
        date: '',
        time: '7:00 PM',
        description: '',
        paymentAmount: '',
        notes: ''
      });
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error creating contract:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to create contract. Please try again.';
      setError(errorMessage);
      // Keep the modal open so user can fix the issue
    }
  };

  const handleBookEvent = (event) => {
    setBookingEvent(event);
    setShowBooking(true);
    setBookingForm({
      tickets: 1,
      name: user.name,
      email: '',
      phone: ''
    });
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        userId: user.id,
        eventId: bookingEvent.id,
        tickets: parseInt(bookingForm.tickets),
        userName: bookingForm.name,
        userEmail: bookingForm.email,
        userPhone: bookingForm.phone,
        totalAmount: bookingEvent.price * parseInt(bookingForm.tickets)
      };

      await bookingAPI.createBooking(bookingData);
      await loadDashboardData(user.id);

      setShowBooking(false);
      setBookingEvent(null);
      setBookingForm({ tickets: 1, name: '', email: '', phone: '' });
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getEventDetails = (eventId) => {
    return events.find(e => e.id === eventId);
  };

  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate >= new Date() && e.status !== 'completed';
  });

  const completedEvents = events.filter(e => e.status === 'completed');

  // Handle both uppercase and lowercase status from backend
  const pendingContracts = contracts.filter(c => {
    const status = c.status?.toLowerCase();
    return status === 'pending';
  });
  const acceptedContracts = contracts.filter(c => {
    const status = c.status?.toLowerCase();
    return status === 'accepted';
  });
  const rejectedContracts = contracts.filter(c => {
    const status = c.status?.toLowerCase();
    return status === 'rejected';
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <div>Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-content">
          <div style={{
            padding: '40px',
            textAlign: 'center',
            background: 'var(--white)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow)',
            margin: '20px 0'
          }}>
            <h3 style={{ color: 'var(--error)', marginBottom: '10px' }}>Error</h3>
            <p style={{ color: 'var(--dark-light)' }}>{error}</p>
            <button
              onClick={() => loadDashboardData(user.id)}
              style={{
                padding: '10px 20px',
                background: 'var(--gradient-1)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '15px'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Organizer Dashboard</h1>
            <p style={{ color: 'var(--dark-light)', marginTop: '8px' }}>Welcome, {user.name}! Manage your events and contracts</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{upcomingEvents.length}</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completedEvents.length}</div>
            <div className="stat-label">Completed Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{pendingContracts.length}</div>
            <div className="stat-label">Pending Contracts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{acceptedContracts.length}</div>
            <div className="stat-label">Accepted Contracts</div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`dashboard-tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <FaCalendarAlt style={{ marginRight: '8px' }} />
            My Events
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'artists' ? 'active' : ''}`}
            onClick={() => setActiveTab('artists')}
          >
            <FaUser style={{ marginRight: '8px' }} />
            Artists ({artists.length})
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contracts')}
          >
            <FaFileContract style={{ marginRight: '8px' }} />
            Contracts
          </button>
        </div>

        <div style={{ marginTop: '30px' }}>
          {activeTab === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--dark)' }}>
                  My Events
                </h2>
                {acceptedContracts.length > 0 ? (
                  <button
                    onClick={() => setShowCreateEvent(true)}
                    style={{
                      padding: '12px 24px',
                      background: 'var(--gradient-1)',
                      color: 'var(--white)',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaPlus /> Create Event
                  </button>
                ) : (
                  <div style={{
                    padding: '12px 24px',
                    background: '#e2e8f0',
                    color: 'var(--dark-light)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaFileContract /> Create Event (Requires Accepted Contract)
                  </div>
                )}
              </div>

              {showCreateEvent && (
                <div style={{
                  background: 'var(--white)',
                  padding: '30px',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  marginBottom: '30px'
                }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)' }}>
                    Create New Event
                  </h3>
                  <form onSubmit={handleCreateEvent}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Event Name *</label>
                        <input
                          type="text"
                          required
                          value={eventForm.name}
                          onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                          style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                          placeholder="Enter event name"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Category *</label>
                        <select
                          required
                          value={eventForm.category}
                          onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                          style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                        >
                          <option value="Rock">Rock</option>
                          <option value="Jazz">Jazz</option>
                          <option value="EDM">EDM</option>
                          <option value="Classical">Classical</option>
                          <option value="Pop">Pop</option>
                          <option value="Hip-Hop">Hip-Hop</option>
                          <option value="Acoustic">Acoustic</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Date *</label>
                        <input
                          type="date"
                          required
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Time *</label>
                        <input
                          type="text"
                          required
                          value={eventForm.time}
                          onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                          style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                          placeholder="7:00 PM"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Location *</label>
                        <input
                          type="text"
                          required
                          value={eventForm.location}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                          placeholder="City, State"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Price (₹) *</label>
                        <input
                          type="number"
                          required
                          value={eventForm.price}
                          onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                          style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                          placeholder="500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Total Tickets *</label>
                        <input
                          type="number"
                          required
                          value={eventForm.totalTickets}
                          onChange={(e) => setEventForm({ ...eventForm, totalTickets: e.target.value })}
                          style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                          placeholder="100"
                          min="1"
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Select Musician (from Accepted Contracts) *</label>
                        <select
                          required
                          value={eventForm.selectedContractId}
                          onChange={(e) => {
                            const contractId = parseInt(e.target.value);
                            const contract = acceptedContracts.find(c => c.id === contractId);
                            if (contract) {
                              setEventForm({
                                ...eventForm,
                                selectedContractId: contractId.toString(),
                                musicianId: contract.artistId.toString(),
                                musicianName: contract.artistName,
                                contractId: contract.id
                              });
                            }
                          }}
                          style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                        >
                          <option value="">Select a musician</option>
                          {acceptedContracts.map(contract => (
                            <option key={contract.id} value={contract.id}>
                              {contract.artistName} - Payment: ₹{contract.paymentAmount?.toLocaleString() || '0'}
                            </option>
                          ))}
                        </select>
                        {eventForm.musicianName && (
                          <div style={{ marginTop: '8px', padding: '10px', background: 'var(--light)', borderRadius: '8px', fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>
                            🎵 Selected Musician: {eventForm.musicianName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Description *</label>
                      <textarea
                        required
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', minHeight: '100px' }}
                        placeholder="Enter event description"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateEvent(false);
                          setEventForm({
                            name: '',
                            description: '',
                            location: '',
                            date: '',
                            time: '7:00 PM',
                            price: '',
                            category: 'Rock',
                            totalTickets: '',
                            emoji: '🎵',
                            musicianId: '',
                            musicianName: '',
                            selectedContractId: '',
                            contractId: null
                          });
                        }}
                        style={{
                          padding: '12px 24px',
                          background: 'var(--white)',
                          color: 'var(--dark)',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '12px 24px',
                          background: 'var(--gradient-1)',
                          color: 'var(--white)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Create Event
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', color: 'var(--dark)' }}>
                  Upcoming Events
                </h3>
                {upcomingEvents.length === 0 ? (
                  <div style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    background: 'var(--white)', 
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow)'
                  }}>
                    <FaCalendarAlt style={{ fontSize: '48px', color: 'var(--primary)', opacity: 0.3, marginBottom: '15px' }} />
                    <p style={{ color: 'var(--dark-light)' }}>No upcoming events. Create your first event!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {upcomingEvents.map(event => (
                      <div
                        key={event.id}
                        style={{
                          background: 'var(--white)',
                          padding: '25px',
                          borderRadius: '16px',
                          boxShadow: 'var(--shadow)',
                          border: '2px solid var(--primary)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: '15px', marginBottom: '15px' }}>
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: 'var(--gradient-1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                          }}>
                            {event.emoji || '🎵'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '5px', color: 'var(--dark)' }}>
                              {event.name}
                            </h4>
                            <div style={{ fontSize: '12px', color: 'var(--dark-light)' }}>
                              {event.category}
                              {event.musicianName && (
                                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, marginTop: '4px' }}>
                                  🎵 {event.musicianName}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '15px',
                          background: 'var(--light)',
                          borderRadius: '8px',
                          marginBottom: '15px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--dark-light)' }}>Date</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                              {formatDate(event.date)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--dark-light)' }}>Location</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                              {event.location}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--dark-light)' }}>Tickets</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                              {event.availableTickets} / {event.totalTickets} available
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '14px', color: 'var(--dark-light)' }}>Price</span>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                              <FaRupeeSign style={{ fontSize: '12px', display: 'inline' }} />
                              {event.price}
                            </span>
                          </div>
                          {event.musicianName && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: '14px', color: 'var(--dark-light)' }}>Musician</span>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>
                                🎵 {event.musicianName}
                              </span>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {event.musicianName && event.availableTickets > 0 && (
                            <button
                              onClick={() => handleBookEvent(event)}
                              style={{
                                flex: 1,
                                padding: '10px',
                                background: 'var(--gradient-1)',
                                color: 'var(--white)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '14px'
                              }}
                            >
                              Book Event
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              const eventDate = new Date(event.date);
                              if (eventDate < new Date()) {
                                try {
                                  await eventAPI.updateEvent(event.id, { status: 'completed' });
                                  await loadDashboardData(user.id);
                                } catch (err) {
                                  console.error('Error updating event:', err);
                                  setError('Failed to update event status.');
                                }
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#e2e8f0',
                              color: 'var(--dark)',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '14px'
                            }}
                          >
                            Mark as Completed
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {completedEvents.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', color: 'var(--dark)' }}>
                    Completed Events
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {completedEvents.map(event => (
                      <div
                        key={event.id}
                        style={{
                          background: 'var(--white)',
                          padding: '25px',
                          borderRadius: '16px',
                          boxShadow: 'var(--shadow)',
                          opacity: 0.7
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                          <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                          }}>
                            {event.emoji || '🎵'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '5px', color: 'var(--dark)' }}>
                              {event.name}
                            </h4>
                            <div style={{ fontSize: '12px', color: 'var(--dark-light)' }}>
                              {formatDate(event.date)} • {event.location}
                            </div>
                          </div>
                          <div style={{
                            padding: '4px 12px',
                            background: '#e2e8f0',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: 'var(--dark-light)'
                          }}>
                            Completed
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'artists' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)' }}>
                Available Artists
              </h2>
              {artists.length === 0 ? (
                <div style={{ 
                  padding: '60px 20px', 
                  textAlign: 'center', 
                  background: 'var(--white)', 
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow)'
                }}>
                  <FaUser style={{ fontSize: '64px', color: 'var(--primary)', opacity: 0.3, marginBottom: '20px' }} />
                  <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '10px', color: 'var(--dark)' }}>
                    No artists available
                  </h3>
                  <p style={{ color: 'var(--dark-light)' }}>
                    Artists will appear here once they sign up.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {artists.map(artist => (
                    <div
                      key={artist.id}
                      style={{
                        background: 'var(--white)',
                        padding: '25px',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: 'var(--gradient-1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '20px',
                          fontWeight: 700
                        }}>
                          {artist.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '3px', color: 'var(--dark)' }}>
                            {artist.name}
                          </h4>
                          <div style={{ fontSize: '12px', color: 'var(--dark-light)' }}>
                            {artist.email}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedArtist(artist);
                          setShowCreateContract(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'var(--gradient-1)',
                          color: 'var(--white)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <FaFileContract /> Send Contract
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'contracts' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)' }}>
                My Contracts
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {contracts.length === 0 ? (
                  <div style={{ 
                    padding: '60px 20px', 
                    textAlign: 'center', 
                    background: 'var(--white)', 
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow)'
                  }}>
                    <FaFileContract style={{ fontSize: '64px', color: 'var(--primary)', opacity: 0.3, marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '10px', color: 'var(--dark)' }}>
                      No contracts yet
                    </h3>
                    <p style={{ color: 'var(--dark-light)' }}>
                      Send contracts to artists from the Artists tab.
                    </p>
                  </div>
                ) : (
                  [...pendingContracts, ...acceptedContracts, ...rejectedContracts]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map(contract => {
                      const contractStatus = contract.status?.toLowerCase();
                      return (
                        <div
                          key={contract.id}
                          style={{
                            background: 'var(--white)',
                            padding: '25px',
                            borderRadius: '16px',
                            boxShadow: 'var(--shadow)',
                            opacity: contractStatus === 'rejected' ? 0.7 : 1,
                            border: contractStatus === 'accepted' ? '2px solid #10b981' : contractStatus === 'pending' ? '2px solid #f59e0b' : '2px solid #ef4444'
                          }}
                        >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '15px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                              <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: contractStatus === 'accepted' ? '#10b981' : contractStatus === 'pending' ? '#f59e0b' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px'
                              }}>
                                🎵
                              </div>
                              <div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '5px', color: 'var(--dark)' }}>
                                  {contract.eventName || 'Event'}
                                </h4>
                                <div style={{ fontSize: '14px', color: 'var(--dark-light)' }}>
                                  Artist: {contract.artistName}
                                </div>
                              </div>
                            </div>
                            <div style={{ 
                              padding: '15px',
                              background: 'var(--light)',
                              borderRadius: '8px',
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                              gap: '15px',
                              marginBottom: '15px'
                            }}>
                              {contract.venue && (
                                <div>
                                  <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Venue</div>
                                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                                    {contract.venue}
                                  </div>
                                </div>
                              )}
                              {contract.eventDate && (
                                <div>
                                  <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Event Date</div>
                                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                                    {formatDate(contract.eventDate)}
                                  </div>
                                </div>
                              )}
                              {contract.eventTime && (
                                <div>
                                  <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Event Time</div>
                                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                                    {contract.eventTime}
                                  </div>
                                </div>
                              )}
                              <div>
                                <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Payment Amount</div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                                  <FaRupeeSign style={{ fontSize: '12px', display: 'inline' }} />
                                  {contract.paymentAmount?.toLocaleString() || '0'}
                                </div>
                              </div>
                            </div>
                            {contract.eventDescription && (
                              <div style={{ marginBottom: '15px', padding: '12px', background: 'var(--light)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dark-light)', marginBottom: '5px' }}>Event Description:</div>
                                <div style={{ fontSize: '14px', color: 'var(--dark)' }}>{contract.eventDescription}</div>
                              </div>
                            )}
                            {contract.notes && (
                              <div style={{ marginTop: '15px', padding: '12px', background: 'var(--light)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dark-light)', marginBottom: '5px' }}>Additional Notes:</div>
                                <div style={{ fontSize: '14px', color: 'var(--dark)' }}>{contract.notes}</div>
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              padding: '8px 16px',
                              background: contractStatus === 'accepted' ? '#10b981' : contractStatus === 'pending' ? '#f59e0b' : '#ef4444',
                              color: 'white',
                              borderRadius: '20px',
                              fontSize: '14px',
                              fontWeight: 600,
                              marginBottom: '10px',
                              display: 'inline-block'
                            }}>
                              {contractStatus === 'accepted' && <FaCheckCircle style={{ marginRight: '5px' }} />}
                              {contractStatus === 'rejected' && <FaTimesCircle style={{ marginRight: '5px' }} />}
                              {contractStatus === 'pending' && <FaClock style={{ marginRight: '5px' }} />}
                              {contractStatus ? contractStatus.charAt(0).toUpperCase() + contractStatus.slice(1) : 'Unknown'}
                            </div>
                            {contractStatus === 'accepted' && !contract.eventId && (
                              <button
                                onClick={() => {
                                  // Pre-fill event form with contract data
                                  setEventForm({
                                    name: contract.eventName,
                                    description: contract.eventDescription || '',
                                    location: contract.venue || '',
                                    date: contract.eventDate || '',
                                    time: contract.eventTime || '7:00 PM',
                                    price: '',
                                    category: 'Rock',
                                    totalTickets: '',
                                    emoji: '🎵',
                                    musicianId: contract.artistId.toString(),
                                    musicianName: contract.artistName,
                                    selectedContractId: contract.id.toString(), // Set the contract ID for dropdown
                                    contractId: contract.id
                                  });
                                  setShowCreateEvent(true);
                                  setActiveTab('events');
                                }}
                                style={{
                                  padding: '10px 20px',
                                  background: 'var(--gradient-1)',
                                  color: 'var(--white)',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: '14px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginTop: '10px'
                                }}
                              >
                                <FaPlus /> Create Event
                              </button>
                            )}
                          </div>
                        </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateContract && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--white)',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)' }}>
              Send Contract to {selectedArtist?.name}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--dark-light)', marginBottom: '20px' }}>
              Enter the event details. The event will be created after the musician accepts the contract.
            </p>
            {error && (
              <div style={{
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            <form onSubmit={handleCreateContract}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Event Name *</label>
                <input
                  type="text"
                  required
                  value={contractForm.eventName}
                  onChange={(e) => setContractForm({ ...contractForm, eventName: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                  placeholder="Enter event name"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Venue/Location *</label>
                <input
                  type="text"
                  required
                  value={contractForm.venue}
                  onChange={(e) => setContractForm({ ...contractForm, venue: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                  placeholder="City, State or Venue Name"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Event Date *</label>
                  <input
                    type="date"
                    required
                    value={contractForm.date}
                    onChange={(e) => setContractForm({ ...contractForm, date: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Event Time *</label>
                  <input
                    type="text"
                    required
                    value={contractForm.time}
                    onChange={(e) => setContractForm({ ...contractForm, time: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                    placeholder="7:00 PM"
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Event Description</label>
                <textarea
                  value={contractForm.description}
                  onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', minHeight: '80px' }}
                  placeholder="Describe the event..."
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={contractForm.paymentAmount}
                  onChange={(e) => setContractForm({ ...contractForm, paymentAmount: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                  placeholder="50000"
                  min="0"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>Additional Notes</label>
                <textarea
                  value={contractForm.notes}
                  onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', minHeight: '100px' }}
                  placeholder="Additional notes for the artist..."
                />
              </div>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateContract(false);
                    setSelectedArtist(null);
                    setContractForm({
                      eventName: '',
                      venue: '',
                      date: '',
                      time: '7:00 PM',
                      description: '',
                      paymentAmount: '',
                      notes: ''
                    });
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--white)',
                    color: 'var(--dark)',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'var(--gradient-1)',
                    color: 'var(--white)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Send Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBooking && bookingEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--white)',
            padding: '30px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)' }}>
              Book Event: {bookingEvent.name}
            </h3>

            <div style={{ marginBottom: '20px', padding: '15px', background: 'var(--light)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'var(--gradient-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  {bookingEvent.emoji || '🎵'}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)' }}>
                    {bookingEvent.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--dark-light)' }}>
                    {formatDate(bookingEvent.date)} • {bookingEvent.location}
                  </div>
                </div>
              </div>
              {bookingEvent.musicianName && (
                <div style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '10px' }}>
                  🎵 Performing: {bookingEvent.musicianName}
                </div>
              )}
              <div style={{ fontSize: '14px', color: 'var(--dark)' }}>
                Price: <FaRupeeSign style={{ fontSize: '12px', display: 'inline' }} />
                {bookingEvent.price} per ticket
              </div>
            </div>

            <form onSubmit={handleCreateBooking}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>
                  Number of Tickets *
                </label>
                <select
                  required
                  value={bookingForm.tickets}
                  onChange={(e) => setBookingForm({ ...bookingForm, tickets: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                >
                  {Array.from({ length: Math.min(bookingEvent.availableTickets, 10) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                  placeholder="Enter your full name"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                  placeholder="Enter your email"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--dark)' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                  placeholder="Enter your phone number"
                />
              </div>

              <div style={{ padding: '15px', background: 'var(--light)', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 600 }}>
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--primary)' }}>
                    <FaRupeeSign style={{ fontSize: '14px', display: 'inline' }} />
                    {bookingEvent.price * bookingForm.tickets}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowBooking(false);
                    setBookingEvent(null);
                    setBookingForm({ tickets: 1, name: '', email: '', phone: '' });
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--white)',
                    color: 'var(--dark)',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'var(--gradient-1)',
                    color: 'var(--white)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizerDashboard;
