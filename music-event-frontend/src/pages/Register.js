import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaMusic, FaMapMarkerAlt, FaPhone, FaGlobe, FaMicrophone, FaBuilding } from 'react-icons/fa';
import { authAPI, testConnection } from '../services/api';
import './Pages.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    // Artist/Musician fields
    genre: '',
    location: '',
    phone: '',
    bio: '',
    price: '',
    // Organizer fields
    type: '',
    specialties: '',
    website: '',
    contact: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const navigate = useNavigate();

  // Test backend connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const result = await testConnection();
      setConnectionStatus(result);
      if (!result.connected) {
        setError(result.details || 'Backend server is not accessible. Please ensure it is running on port 8080.');
      }
    };
    checkConnection();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      role: role
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Role-specific validation
    if (formData.role === 'musician') {
      if (!formData.genre || !formData.location || !formData.phone || !formData.bio || !formData.price) {
        setError('Please fill in all artist profile fields');
        setLoading(false);
        return;
      }
    }

    if (formData.role === 'organizer') {
      if (!formData.type || !formData.location || !formData.phone || !formData.bio) {
        setError('Please fill in all organizer profile fields');
        setLoading(false);
        return;
      }
    }

    try {
      // Prepare profile data as JSON string
      let profileData = null;
      if (formData.role === 'musician') {
        profileData = JSON.stringify({
          genre: formData.genre,
          location: formData.location,
          phone: formData.phone,
          bio: formData.bio,
          price: parseFloat(formData.price),
          rating: 4.5,
          upcomingShows: 0
        });
      } else if (formData.role === 'organizer') {
        profileData = JSON.stringify({
          type: formData.type,
          location: formData.location,
          phone: formData.phone,
          contact: formData.contact || formData.email,
          website: formData.website || '',
          bio: formData.bio,
          specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
          eventsOrganized: 0,
          totalAttendees: '0',
          rating: 4.5
        });
      }

      // Prepare registration data
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toUpperCase(), // Backend expects USER, ORGANIZER, MUSICIAN
      };
      
      // Only include profile if it's not null
      if (profileData !== null) {
        registerData.profile = profileData;
      }

      // Register user
      const response = await authAPI.register(registerData);

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        profile: response.data.profile
      }));

      // Dispatch custom event to update navbar
      window.dispatchEvent(new Event('userLogin'));
      
      // Redirect based on role (backend returns uppercase: USER, ORGANIZER, MUSICIAN)
      const role = response.data.role.toUpperCase();
      if (role === 'ORGANIZER') {
        navigate('/organizer-dashboard');
      } else if (role === 'MUSICIAN') {
        navigate('/musician-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Handle different error response formats
      let errorMessage = 'Registration failed. Please try again.';
      
      // Check for network errors first
      if (error.networkError || !error.response) {
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
          errorMessage = 'Cannot connect to backend server. Please ensure:\n' +
            '1. Backend server is running on port 8080\n' +
            '2. Backend URL is correct (http://localhost:8080)\n' +
            '3. No firewall is blocking the connection';
        } else {
          errorMessage = error.message || 'Network error. Please check your connection and ensure the backend server is running.';
        }
      } else if (error.response?.data) {
        // Check for error field
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        // Check for message field (validation errors)
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        // Check for multiple messages (validation errors)
        else if (Array.isArray(error.response.data)) {
          errorMessage = error.response.data.map(err => err.message || err).join(', ');
        }
        // Check if data is a string
        else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <FaMusic style={{ fontSize: '48px', background: 'var(--gradient-1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }} />
        </div>
        <h1>Create Account</h1>
        <p>Join thousands of music lovers and start your journey</p>

        {/* Connection Status Indicator */}
        {connectionStatus && (
          <div style={{ 
            padding: '12px', 
            background: connectionStatus.connected 
              ? 'rgba(34, 197, 94, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)', 
            color: connectionStatus.connected ? '#22c55e' : '#ef4444', 
            borderRadius: '8px', 
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {connectionStatus.connected 
              ? '✓ Backend server connected' 
              : '✗ Backend server not connected - Please start the backend server on port 8080'}
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '12px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            borderRadius: '8px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label style={{ marginBottom: '10px', display: 'block', fontWeight: '600' }}>I am a:</label>
            <div className="role-selector">
              <div 
                className={`role-option ${formData.role === 'user' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('user')}
              >
                User
              </div>
              <div 
                className={`role-option ${formData.role === 'organizer' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('organizer')}
              >
                Organizer
              </div>
              <div 
                className={`role-option ${formData.role === 'musician' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('musician')}
              >
                Musician
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ 
                position: 'absolute', 
                left: '15px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                style={{ paddingLeft: '45px' }}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ 
                position: 'absolute', 
                left: '15px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '45px' }}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ 
                position: 'absolute', 
                left: '15px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: '45px' }}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ 
                position: 'absolute', 
                left: '15px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ paddingLeft: '45px' }}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Artist/Musician Specific Fields */}
          {formData.role === 'musician' && (
            <>
              <div style={{ marginTop: '20px', padding: '15px', background: 'var(--light)', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '15px', color: 'var(--dark)' }}>
                  <FaMicrophone style={{ marginRight: '8px' }} />
                  Artist Profile Information
                </h3>
                
                <div className="input-group">
                  <label>Music Genre *</label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Genre</option>
                    <option value="Bollywood">Bollywood</option>
                    <option value="Pop">Pop</option>
                    <option value="Classical">Classical</option>
                    <option value="Hip-Hop">Hip-Hop</option>
                    <option value="Rock">Rock</option>
                    <option value="Jazz">Jazz</option>
                    <option value="EDM">EDM</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Acoustic">Acoustic</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Location *</label>
                  <div style={{ position: 'relative' }}>
                    <FaMapMarkerAlt style={{ 
                      position: 'absolute', 
                      left: '15px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }} />
                    <input
                      type="text"
                      name="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={handleChange}
                      style={{ paddingLeft: '45px', width: '100%' }}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <FaPhone style={{ 
                      position: 'absolute', 
                      left: '15px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }} />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{ paddingLeft: '45px', width: '100%' }}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Performance Fee (₹) *</label>
                  <div style={{ position: 'relative' }}>
                    <FaMusic style={{ 
                      position: 'absolute', 
                      left: '15px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }} />
                    <input
                      type="number"
                      name="price"
                      placeholder="50000"
                      value={formData.price}
                      onChange={handleChange}
                      style={{ paddingLeft: '45px', width: '100%' }}
                      min="0"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Bio/Description *</label>
                  <textarea
                    name="bio"
                    placeholder="Tell us about your music, experience, and achievements..."
                    value={formData.bio}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', minHeight: '100px' }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          {/* Organizer Specific Fields */}
          {formData.role === 'organizer' && (
            <>
              <div style={{ marginTop: '20px', padding: '15px', background: 'var(--light)', borderRadius: '8px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '15px', color: 'var(--dark)' }}>
                  <FaBuilding style={{ marginRight: '8px' }} />
                  Organizer Profile Information
                </h3>
                
                <div className="input-group">
                  <label>Organization Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Type</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Independent">Independent</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Regional">Regional</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Location *</label>
                  <div style={{ position: 'relative' }}>
                    <FaMapMarkerAlt style={{ 
                      position: 'absolute', 
                      left: '15px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }} />
                    <input
                      type="text"
                      name="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={handleChange}
                      style={{ paddingLeft: '45px', width: '100%' }}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <FaPhone style={{ 
                      position: 'absolute', 
                      left: '15px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }} />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 22 1234 5678"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{ paddingLeft: '45px', width: '100%' }}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Contact Email</label>
                  <div style={{ position: 'relative' }}>
                    <FaEnvelope style={{ 
                      position: 'absolute', 
                      left: '15px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }} />
                    <input
                      type="email"
                      name="contact"
                      placeholder="contact@example.com"
                      value={formData.contact}
                      onChange={handleChange}
                      style={{ paddingLeft: '45px', width: '100%' }}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Website</label>
                  <div style={{ position: 'relative' }}>
                    <FaGlobe style={{ 
                      position: 'absolute', 
                      left: '15px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }} />
                    <input
                      type="url"
                      name="website"
                      placeholder="www.example.com"
                      value={formData.website}
                      onChange={handleChange}
                      style={{ paddingLeft: '45px', width: '100%' }}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Specialties (comma separated)</label>
                  <input
                    type="text"
                    name="specialties"
                    placeholder="Music Festivals, Concerts, Corporate Events"
                    value={formData.specialties}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                    disabled={loading}
                  />
                </div>

                <div className="input-group">
                  <label>Bio/Description *</label>
                  <textarea
                    name="bio"
                    placeholder="Tell us about your organization, experience, and events you organize..."
                    value={formData.bio}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '8px', minHeight: '100px' }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </>
          )}

          <label style={{ display: 'flex', alignItems: 'start', gap: '8px', cursor: 'pointer', marginBottom: '20px' }}>
            <input type="checkbox" required disabled={loading} />
            <span style={{ fontSize: '14px', color: 'var(--dark-light)' }}>
              I agree to the Terms of Service and Privacy Policy
            </span>
          </label>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ color: 'var(--dark-light)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
