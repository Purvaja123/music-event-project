import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaArrowLeft, FaShareAlt, FaCheckCircle, FaDownload } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { eventAPI, bookingAPI } from '../services/api';
import './Pages.css';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [showQR, setShowQR] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getEventById(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!event) {
    return <div style={{ padding: '100px 20px', textAlign: 'center' }}>Event not found</div>;
  }

  const handleBookTicket = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    const role = user.role?.toUpperCase();
    
    if (role !== 'USER') {
      alert('Only regular users can book tickets. Please login with a user account.');
      return;
    }

    try {
      setBookingLoading(true);
      const bookingData = {
        userId: user.id,
        userName: user.name || user.email,
        eventId: event.id,
        tickets: ticketCount
      };

      console.log('Creating booking with data:', bookingData);
      const response = await bookingAPI.createBooking(bookingData);
      setBooking(response.data);
      setBookingConfirmed(true);
      setShowQR(true);
      
      // Refresh event data
      await fetchEvent();
    } catch (error) {
      alert(error.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const totalPrice = event.price * ticketCount;
  const qrData = booking ? JSON.stringify({
    bookingId: booking.id,
    eventId: event.id,
    eventName: event.name,
    ticketCount: booking.tickets,
    price: totalPrice,
    qrCode: booking.qrCode || booking.id,
    date: booking.bookingDate
  }) : '';

  const downloadTicket = async () => {
    if (!booking || !qrData || !qrRef.current) return;

    try {
      // Get the QR code SVG element
      const qrSvg = qrRef.current.querySelector('svg');
      if (!qrSvg) {
        alert('QR code not found. Please try again.');
        return;
      }

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(qrSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create an image from the SVG
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Create canvas to render the ticket
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 1200;
          const ctx = canvas.getContext('2d');

          // Background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Header with gradient
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(1, '#ec4899');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, 150);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🎵 Music Event Ticket', canvas.width / 2, 60);
          ctx.font = '24px Arial';
          ctx.fillText(event.name, canvas.width / 2, 100);

          // Event Details
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('Event Details', 50, 200);
          
          ctx.font = '18px Arial';
          ctx.fillStyle = '#64748b';
          ctx.fillText(`Date: ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 240);
          ctx.fillText(`Time: ${event.time}`, 50, 270);
          ctx.fillText(`Location: ${event.location}`, 50, 300);
          if (event.musicianName) {
            ctx.fillText(`Performing: 🎵 ${event.musicianName}`, 50, 330);
          }

          // Booking Details
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 24px Arial';
          ctx.fillText('Booking Details', 50, 400);
          
          ctx.font = '18px Arial';
          ctx.fillStyle = '#64748b';
          ctx.fillText(`Number of Tickets: ${booking.tickets}`, 50, 440);
          ctx.fillText(`Total Amount: ₹${totalPrice.toLocaleString()}`, 50, 470);
          ctx.fillText(`Booking Date: ${new Date(booking.bookingDate).toLocaleDateString()}`, 50, 500);

          // QR Code section
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(50, 550, canvas.width - 100, 400);
          
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Scan QR Code at Venue', canvas.width / 2, 580);

          // Draw QR code image
          const qrSize = 300;
          const qrX = (canvas.width - qrSize) / 2;
          const qrY = 620;
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

          // Booking ID
          ctx.fillStyle = '#6366f1';
          ctx.font = 'bold 18px monospace';
          ctx.fillText(booking.qrCode || booking.id, canvas.width / 2, qrY + qrSize + 30);

          ctx.fillStyle = '#64748b';
          ctx.font = '14px Arial';
          ctx.fillText('Show this QR code at the venue entrance', canvas.width / 2, qrY + qrSize + 60);

          // Convert canvas to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ticket-${booking.qrCode || booking.id}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              URL.revokeObjectURL(svgUrl);
            }
          }, 'image/png');

          resolve();
        };
        img.onerror = reject;
        img.src = svgUrl;
      });
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Failed to download ticket. Please try again.');
    }
  };

  return (
    <div className="event-details-page">
      <div className="event-details-container">
        <div className="event-details-main">
          <Link to="/events" className="btn btn-outline" style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FaArrowLeft /> Back to Events
          </Link>

          <div
            className="event-details-image"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%), url(${event.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '120px'
            }}
          >
            {event.emoji || '🎵'}
          </div>

          <div className="event-details-content">
            <div className="badge badge-info" style={{ marginBottom: '16px', display: 'inline-block' }}>
              {event.category}
            </div>
            <h1>{event.name}</h1>

            <div className="event-info-grid">
              <div className="event-info-item">
                <FaMapMarkerAlt />
                <div>
                  <strong>{event.location}</strong>
                  <div style={{ fontSize: '14px', color: 'var(--dark-light)' }}>{event.location}</div>
                </div>
              </div>
              <div className="event-info-item">
                <FaCalendarAlt />
                <div>
                  <strong>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  <div style={{ fontSize: '14px', color: 'var(--dark-light)' }}>{event.time}</div>
                </div>
              </div>
              <div className="event-info-item">
                <FaUsers />
                <div>
                  <strong>{event.availableTickets || 0} tickets available</strong>
                  <div style={{ fontSize: '14px', color: 'var(--dark-light)' }}>Out of {event.totalTickets || 100} total</div>
                </div>
              </div>
              <div className="event-info-item">
                <FaClock />
                <div>
                  <strong>Duration</strong>
                  <div style={{ fontSize: '14px', color: 'var(--dark-light)' }}>3-4 hours</div>
                </div>
              </div>
            </div>

            <div className="event-description-full">
              <h3 style={{ marginBottom: '16px', color: 'var(--dark)' }}>About This Event</h3>
              <p>{event.description}</p>

              <div style={{ marginTop: '30px', padding: '20px', background: 'var(--light)', borderRadius: '8px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Organized by:</strong> {event.organizerName || 'Event Organizer'}
                </div>
                {event.musicianName && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                    <strong>🎵 Performing Artist:</strong> {event.musicianName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="booking-card">
          <h3>Book Your Tickets</h3>
          
          {!bookingConfirmed ? (
            <>
              <div className="price-display">
                <span className="currency">₹</span>
                {event.price}
                <span style={{ fontSize: '18px', fontWeight: 'normal', color: 'var(--dark-light)' }}> per ticket</span>
              </div>

              <div className="input-group">
                <label>Number of Tickets</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    style={{ padding: '10px 20px' }}
                    disabled={bookingLoading}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={event.availableTickets}
                    style={{ flex: 1, textAlign: 'center', padding: '10px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                    disabled={bookingLoading}
                  />
                  <button 
                    className="btn btn-outline"
                    onClick={() => setTicketCount(Math.min(event.availableTickets || 100, ticketCount + 1))}
                    style={{ padding: '10px 20px' }}
                    disabled={bookingLoading}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ padding: '20px', background: 'var(--light)', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Subtotal ({ticketCount} tickets)</span>
                  <strong>₹{totalPrice.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '2px solid #e2e8f0' }}>
                  <span style={{ fontSize: '18px', fontWeight: '700' }}>Total</span>
                  <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>₹{totalPrice.toLocaleString()}</strong>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                onClick={handleBookTicket}
                style={{ width: '100%', padding: '16px', fontSize: '18px', marginBottom: '15px' }}
                disabled={event.availableTickets === 0 || bookingLoading}
              >
                {bookingLoading ? 'Booking...' : (event.availableTickets === 0 ? 'Sold Out' : 'Book Tickets')}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                padding: '20px', 
                background: 'rgba(16, 185, 129, 0.1)', 
                borderRadius: '12px',
                marginBottom: '25px'
              }}>
                <FaCheckCircle style={{ fontSize: '48px', color: '#10b981', marginBottom: '15px' }} />
                <h3 style={{ color: '#10b981', marginBottom: '10px' }}>Booking Confirmed!</h3>
                <p style={{ color: 'var(--dark-light)', marginBottom: '15px' }}>
                  Your tickets have been booked successfully.
                </p>
                <div style={{ 
                  padding: '15px', 
                  background: 'white', 
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Booking ID</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', fontFamily: 'monospace' }}>
                    {booking.qrCode || booking.id}
                  </div>
                </div>
              </div>
              
              {showQR && qrData && (
                <div style={{ 
                  padding: '25px', 
                  background: 'var(--white)', 
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '2px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ color: 'var(--dark)', margin: 0 }}>Your Ticket QR Code</h4>
                    <button
                      onClick={downloadTicket}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--gradient-1)',
                        color: 'var(--white)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FaDownload /> Download Ticket
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }} ref={qrRef}>
                    <QRCodeSVG value={qrData} size={200} />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--dark-light)', textAlign: 'center' }}>
                    Show this QR code at the venue entrance
                  </p>
                </div>
              )}

              <div style={{ 
                padding: '20px', 
                background: 'var(--light)', 
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'left'
              }}>
                <h4 style={{ marginBottom: '15px', color: 'var(--dark)' }}>Booking Details</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--dark-light)' }}>Event:</span>
                  <strong>{event.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--dark-light)' }}>Tickets:</span>
                  <strong>{booking.tickets}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--dark-light)' }}>Total Amount:</span>
                  <strong style={{ color: 'var(--primary)' }}>₹{totalPrice.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--dark-light)' }}>Date:</span>
                  <strong>{new Date(event.date).toLocaleDateString()}</strong>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/dashboard')}
                style={{ width: '100%', padding: '16px', fontSize: '18px', marginBottom: '10px' }}
              >
                View My Bookings
              </button>
              
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setBookingConfirmed(false);
                  setShowQR(false);
                  setBooking(null);
                  setTicketCount(1);
                }}
                style={{ width: '100%', padding: '12px' }}
              >
                Book More Tickets
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
