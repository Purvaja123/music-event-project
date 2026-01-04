import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaQrcode, FaCheckCircle, FaClock, FaTimesCircle, FaDownload } from "react-icons/fa";
import { QRCodeSVG } from 'qrcode.react';
import { bookingAPI, eventAPI } from "../services/api";
import "./Pages.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    
    const currentUser = JSON.parse(userStr);
    setUser(currentUser);
    
    fetchData(currentUser.id);
  }, [navigate]);

  const fetchData = async (userId) => {
    try {
      setLoading(true);
      // Fetch bookings and events in parallel
      const [bookingsResponse, eventsResponse] = await Promise.all([
        bookingAPI.getUserBookings(userId),
        eventAPI.getAllEvents()
      ]);
      
      setBookings(bookingsResponse.data || []);
      setEvents(eventsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setBookings([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventDetails = (eventId) => {
    return events.find(e => e.id === eventId);
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

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalSpent = bookings.reduce((sum, booking) => {
    const event = getEventDetails(booking.eventId);
    return sum + (event ? event.price * booking.tickets : 0);
  }, 0);

  const upcomingBookings = bookings.filter(booking => {
    const event = getEventDetails(booking.eventId);
    if (!event) return false;
    const eventDate = new Date(event.date);
    return eventDate >= new Date();
  });

  const pastBookings = bookings.filter(booking => {
    const event = getEventDetails(booking.eventId);
    if (!event) return false;
    const eventDate = new Date(event.date);
    return eventDate < new Date();
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1>Welcome back, {user.name}!</h1>
              <p style={{ color: 'var(--dark-light)', marginTop: '8px' }}>Manage your bookings and events</p>
            </div>
            <button
              onClick={() => navigate('/events')}
              style={{
                padding: '12px 24px',
                background: 'var(--gradient-1)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '16px'
              }}
            >
              Browse Events
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{upcomingBookings.length}</div>
            <div className="stat-label">Upcoming Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{pastBookings.length}</div>
            <div className="stat-label">Past Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              <FaRupeeSign style={{ fontSize: '24px', display: 'inline' }} />
              {totalSpent.toLocaleString()}
            </div>
            <div className="stat-label">Total Spent</div>
          </div>
        </div>

        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)' }}>
            My Bookings
          </h2>

          {bookings.length === 0 ? (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center', 
              background: 'var(--white)', 
              borderRadius: '16px',
              boxShadow: 'var(--shadow)'
            }}>
              <FaTicketAlt style={{ fontSize: '64px', color: 'var(--primary)', opacity: 0.3, marginBottom: '20px' }} />
              <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '10px', color: 'var(--dark)' }}>
                No bookings yet
              </h3>
              <p style={{ color: 'var(--dark-light)', marginBottom: '30px' }}>
                Start exploring amazing music events and book your tickets!
              </p>
              <button
                onClick={() => navigate('/events')}
                style={{
                  padding: '14px 28px',
                  background: 'var(--gradient-1)',
                  color: 'var(--white)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '16px'
                }}
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {upcomingBookings.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', color: 'var(--dark)' }}>
                    Upcoming Events
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {upcomingBookings.map(booking => {
                      const event = getEventDetails(booking.eventId);
                      if (!event) return null;
                      
                      return (
                        <div
                          key={booking.id}
                          style={{
                            background: 'var(--white)',
                            padding: '25px',
                            borderRadius: '16px',
                            boxShadow: 'var(--shadow)',
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: '20px',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                              <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '12px',
                                background: 'var(--gradient-1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px'
                              }}>
                                {event.emoji || '🎵'}
                              </div>
                              <div>
                                <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '5px', color: 'var(--dark)' }}>
                                  {event.name}
                                </h4>
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--dark-light)' }}>
                                  <span><FaCalendarAlt style={{ marginRight: '5px' }} />{formatDate(event.date)}</span>
                                  <span><FaMapMarkerAlt style={{ marginRight: '5px' }} />{event.location}</span>
                                </div>
                              </div>
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              gap: '30px', 
                              flexWrap: 'wrap',
                              padding: '15px',
                              background: 'var(--light)',
                              borderRadius: '8px'
                            }}>
                              <div>
                                <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Tickets</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dark)' }}>{booking.tickets}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Total Price</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
                                  <FaRupeeSign style={{ fontSize: '14px', display: 'inline' }} />
                                  {(event.price * booking.tickets).toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Booking Date</div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                                  {formatDateTime(booking.bookingDate)}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Status</div>
                                <div style={{ 
                                  fontSize: '14px', 
                                  fontWeight: 600, 
                                  color: '#10b981',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}>
                                  <FaCheckCircle /> Confirmed
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              padding: '20px',
                              background: 'var(--light)',
                              borderRadius: '12px',
                              marginBottom: '15px',
                              position: 'relative'
                            }}>
                              <QRCodeSVG 
                                value={JSON.stringify({
                                  bookingId: booking.id,
                                  eventId: event.id,
                                  qrCode: booking.qrCode || booking.id
                                })} 
                                size={120} 
                              />
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dark)', marginBottom: '5px' }}>
                              Booking ID
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--dark-light)', fontFamily: 'monospace' }}>
                              {booking.qrCode || booking.id}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {pastBookings.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', color: 'var(--dark)' }}>
                    Past Events
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {pastBookings.map(booking => {
                      const event = getEventDetails(booking.eventId);
                      if (!event) return null;
                      
                      return (
                        <div
                          key={booking.id}
                          style={{
                            background: 'var(--white)',
                            padding: '25px',
                            borderRadius: '16px',
                            boxShadow: 'var(--shadow)',
                            opacity: 0.8
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
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
                              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--dark-light)' }}>
                                <span><FaCalendarAlt style={{ marginRight: '5px' }} />{formatDate(event.date)}</span>
                                <span><FaMapMarkerAlt style={{ marginRight: '5px' }} />{event.location}</span>
                                <span>{booking.tickets} tickets • <FaRupeeSign style={{ fontSize: '10px', display: 'inline' }} />{(event.price * booking.tickets).toLocaleString()}</span>
                              </div>
                            </div>
                            <div style={{ 
                              padding: '8px 16px',
                              background: '#e2e8f0',
                              borderRadius: '20px',
                              fontSize: '14px',
                              fontWeight: 600,
                              color: 'var(--dark-light)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}>
                              <FaClock /> Completed
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
