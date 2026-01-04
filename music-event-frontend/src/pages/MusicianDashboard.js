import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMusic, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaMapMarkerAlt, FaRupeeSign, FaClock, FaFileContract, FaUser, FaEnvelope } from "react-icons/fa";
import { getCurrentUser, initializeData } from "../utils/auth";
import { contractAPI, eventAPI } from "../services/api";
import "./Pages.css";

function MusicianDashboard() {
  const [user, setUser] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('contracts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeData();
    const currentUser = getCurrentUser();
    const userRole = currentUser?.role?.toLowerCase();
    if (!currentUser || userRole !== 'musician') {
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
      const [contractsResponse, eventsResponse] = await Promise.all([
        contractAPI.getArtistContracts(userId),
        eventAPI.getAllEvents()
      ]);

      const contractsData = contractsResponse.data || [];
      console.log('Musician - Loaded contracts:', contractsData);
      console.log('Musician - Contracts count:', contractsData.length);
      setContracts(contractsData);
      setEvents(eventsResponse.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptContract = async (contractId) => {
    try {
      await contractAPI.updateContractStatus(contractId, 'accepted');
      await loadDashboardData(user.id);
    } catch (err) {
      console.error('Error accepting contract:', err);
      setError('Failed to accept contract. Please try again.');
    }
  };

  const handleRejectContract = async (contractId) => {
    try {
      await contractAPI.updateContractStatus(contractId, 'rejected');
      await loadDashboardData(user.id);
    } catch (err) {
      console.error('Error rejecting contract:', err);
      setError('Failed to reject contract. Please try again.');
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

  const upcomingPerformances = acceptedContracts
    .map(contract => {
      const event = getEventDetails(contract.eventId);
      if (!event) return null;
      const eventDate = new Date(event.date);
      if (eventDate >= new Date()) {
        return { ...contract, event };
      }
      return null;
    })
    .filter(Boolean);

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
          <div style={{ padding: '40px', textAlign: 'center', background: 'var(--white)', borderRadius: '16px', boxShadow: 'var(--shadow)', margin: '20px 0' }}>
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
            <h1>Musician Dashboard</h1>
            <p style={{ color: 'var(--dark-light)', marginTop: '8px' }}>Welcome, {user.name}! Manage your contracts and performances</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{pendingContracts.length}</div>
            <div className="stat-label">Pending Contracts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{acceptedContracts.length}</div>
            <div className="stat-label">Accepted Contracts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{upcomingPerformances.length}</div>
            <div className="stat-label">Upcoming Performances</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              <FaRupeeSign style={{ fontSize: '24px', display: 'inline' }} />
              {acceptedContracts.reduce((sum, c) => sum + (c.paymentAmount || 0), 0).toLocaleString()}
            </div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`dashboard-tab ${activeTab === 'contracts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contracts')}
          >
            <FaFileContract style={{ marginRight: '8px' }} />
            Contracts ({pendingContracts.length})
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'performances' ? 'active' : ''}`}
            onClick={() => setActiveTab('performances')}
          >
            <FaCalendarAlt style={{ marginRight: '8px' }} />
            Upcoming Performances
          </button>
          <button 
            className={`dashboard-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FaClock style={{ marginRight: '8px' }} />
            Contract History
          </button>
        </div>

        <div style={{ marginTop: '30px' }}>
          {activeTab === 'contracts' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)' }}>
                Pending Contracts
              </h2>
              {pendingContracts.length === 0 ? (
                <div style={{ 
                  padding: '60px 20px', 
                  textAlign: 'center', 
                  background: 'var(--white)', 
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow)'
                }}>
                  <FaFileContract style={{ fontSize: '64px', color: 'var(--primary)', opacity: 0.3, marginBottom: '20px' }} />
                  <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '10px', color: 'var(--dark)' }}>
                    No pending contracts
                  </h3>
                  <p style={{ color: 'var(--dark-light)' }}>
                    You don't have any pending contract requests at the moment.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {pendingContracts.map(contract => {
                    return (
                      <div
                        key={contract.id}
                        style={{
                          background: 'var(--white)',
                          padding: '30px',
                          borderRadius: '16px',
                          boxShadow: 'var(--shadow)',
                          border: '2px solid var(--primary)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                          <div style={{ flex: 1 }}>
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
                                🎵
                              </div>
                              <div>
                                <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '5px', color: 'var(--dark)' }}>
                                  {contract.eventName || 'Event'}
                                </h3>
                                <div style={{ fontSize: '14px', color: 'var(--dark-light)' }}>
                                  <FaUser style={{ marginRight: '5px' }} />
                                  {contract.organizerName}
                                </div>
                              </div>
                            </div>
                            <div style={{ 
                              display: 'grid', 
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                              gap: '15px',
                              padding: '20px',
                              background: 'var(--light)',
                              borderRadius: '12px',
                              marginBottom: '20px'
                            }}>
                              {contract.venue && (
                                <div>
                                  <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Venue</div>
                                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaMapMarkerAlt /> {contract.venue}
                                  </div>
                                </div>
                              )}
                              {contract.eventDate && (
                                <div>
                                  <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Event Date</div>
                                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaCalendarAlt /> {formatDate(contract.eventDate)}
                                  </div>
                                </div>
                              )}
                              {contract.eventTime && (
                                <div>
                                  <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Performance Time</div>
                                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--dark)' }}>
                                    {contract.eventTime}
                                  </div>
                                </div>
                              )}
                              <div>
                                <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '5px' }}>Payment Amount</div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <FaRupeeSign /> {contract.paymentAmount?.toLocaleString() || '0'}
                                </div>
                              </div>
                            </div>
                            {contract.eventDescription && (
                              <div style={{ 
                                padding: '15px', 
                                background: 'var(--light)', 
                                borderRadius: '8px',
                                marginBottom: '20px'
                              }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dark-light)', marginBottom: '5px' }}>Event Description:</div>
                                <div style={{ fontSize: '14px', color: 'var(--dark)' }}>{contract.eventDescription}</div>
                              </div>
                            )}
                            {contract.notes && (
                              <div style={{ 
                                padding: '15px', 
                                background: 'var(--light)', 
                                borderRadius: '8px',
                                marginBottom: '20px'
                              }}>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dark-light)', marginBottom: '5px' }}>Additional Notes:</div>
                                <div style={{ fontSize: '14px', color: 'var(--dark)' }}>{contract.notes}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleRejectContract(contract.id)}
                            style={{
                              padding: '12px 24px',
                              background: 'var(--white)',
                              color: '#ef4444',
                              border: '2px solid #ef4444',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#ef4444';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--white)';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                          >
                            <FaTimesCircle /> Reject
                          </button>
                          <button
                            onClick={() => handleAcceptContract(contract.id)}
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
                              gap: '8px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <FaCheckCircle /> Accept Contract
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'performances' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)' }}>
                Upcoming Performances
              </h2>
              {upcomingPerformances.length === 0 ? (
                <div style={{ 
                  padding: '60px 20px', 
                  textAlign: 'center', 
                  background: 'var(--white)', 
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow)'
                }}>
                  <FaCalendarAlt style={{ fontSize: '64px', color: 'var(--primary)', opacity: 0.3, marginBottom: '20px' }} />
                  <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '10px', color: 'var(--dark)' }}>
                    No upcoming performances
                  </h3>
                  <p style={{ color: 'var(--dark-light)' }}>
                    Accepted contracts will appear here as upcoming performances.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {upcomingPerformances.map(contract => {
                    const event = contract.event;
                    return (
                      <div
                        key={contract.id}
                        style={{
                          background: 'var(--white)',
                          padding: '25px',
                          borderRadius: '16px',
                          boxShadow: 'var(--shadow)',
                          border: '2px solid #10b981'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: '15px', marginBottom: '20px' }}>
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
                            <div style={{ fontSize: '12px', color: 'var(--dark-light)', marginBottom: '10px' }}>
                              <FaUser style={{ marginRight: '5px' }} />
                              Organized by {contract.organizerName}
                            </div>
                            <div style={{ 
                              display: 'inline-block',
                              padding: '4px 12px',
                              background: '#10b981',
                              color: 'white',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              <FaCheckCircle style={{ marginRight: '5px' }} />
                              Confirmed
                            </div>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '15px',
                          background: 'var(--light)',
                          borderRadius: '8px',
                          marginBottom: '15px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--dark-light)' }}>Date</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                              {formatDate(event.date)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--dark-light)' }}>Time</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                              {event.time}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--dark-light)' }}>Location</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                              {event.location}
                            </span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            paddingTop: '10px',
                            borderTop: '2px solid #e2e8f0'
                          }}>
                            <span style={{ fontSize: '14px', color: 'var(--dark-light)' }}>Payment</span>
                            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>
                              <FaRupeeSign style={{ fontSize: '14px', display: 'inline' }} />
                              {contract.paymentAmount?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px', color: 'var(--dark)' }}>
                Contract History
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[...acceptedContracts, ...rejectedContracts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(contract => {
                  const contractStatus = contract.status?.toLowerCase();
                  // For history, show contracts even if event doesn't exist yet
                  const event = contract.eventId ? getEventDetails(contract.eventId) : null;

                  return (
                    <div
                      key={contract.id}
                      style={{
                        background: 'var(--white)',
                        padding: '20px',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow)',
                        opacity: contractStatus === 'rejected' ? 0.7 : 1
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              background: contractStatus === 'accepted' ? '#10b981' : '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px'
                            }}>
                              {event?.emoji || '🎵'}
                            </div>
                            <div>
                              <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '3px', color: 'var(--dark)' }}>
                                {event?.name || contract.eventName || 'Event'}
                              </h4>
                              <div style={{ fontSize: '12px', color: 'var(--dark-light)' }}>
                                {contract.organizerName} • {formatDateTime(contract.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: '14px', color: 'var(--dark-light)' }}>
                            {event ? `${event.location} • ${formatDate(event.date)}` : contract.venue ? `${contract.venue} • ${formatDate(contract.eventDate)}` : 'Event details'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            padding: '6px 16px',
                            background: contractStatus === 'accepted' ? '#10b981' : contractStatus === 'rejected' ? '#ef4444' : '#f59e0b',
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            marginBottom: '8px',
                            display: 'inline-block'
                          }}>
                            {contractStatus ? contractStatus.charAt(0).toUpperCase() + contractStatus.slice(1) : 'Unknown'}
                          </div>
                          {contractStatus === 'accepted' && (
                            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                              <FaRupeeSign style={{ fontSize: '12px', display: 'inline' }} />
                              {contract.paymentAmount?.toLocaleString() || '0'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {acceptedContracts.length === 0 && rejectedContracts.length === 0 && (
                  <div style={{ 
                    padding: '60px 20px', 
                    textAlign: 'center', 
                    background: 'var(--white)', 
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow)'
                  }}>
                    <FaClock style={{ fontSize: '64px', color: 'var(--primary)', opacity: 0.3, marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '10px', color: 'var(--dark)' }}>
                      No contract history
                    </h3>
                    <p style={{ color: 'var(--dark-light)' }}>
                      Your contract history will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MusicianDashboard;
