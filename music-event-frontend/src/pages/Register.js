import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaMusic, FaMapMarkerAlt, FaPhone, FaGlobe, FaMicrophone, FaBuilding } from 'react-icons/fa';
import { authAPI } from '../services/api';
import { API_URL } from '../services/api';
import './Pages.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    genre: '',
    location: '',
    phone: '',
    bio: '',
    price: '',
    type: '',
    specialties: '',
    website: '',
    contact: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      let profileData = null;
      if (formData.role === 'musician') {
        profileData = {
          genre: formData.genre,
          location: formData.location,
          phone: formData.phone,
          bio: formData.bio,
          price: parseFloat(formData.price),
          rating: 4.5,
          upcomingShows: 0
        };
      } else if (formData.role === 'organizer') {
        profileData = {
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
        };
      }

      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toUpperCase(),
        profile: profileData
      };

const response = await axios.post(`${API_URL}/auth/register`, registerData);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      window.dispatchEvent(new Event('userLogin'));

      const role = response.data.role.toUpperCase();
      if (role === 'ORGANIZER') navigate('/organizer-dashboard');
      else if (role === 'MUSICIAN') navigate('/musician-dashboard');
      else navigate('/dashboard');

    } 
    catch (err) {
  console.error('Registration error:', err.response || err);
  setError(err.response?.data?.error || 'Registration failed. Try again.');
}
    
    
    
     finally {
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

        {error && <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label>I am a:</label>
            <div className="role-selector">
              <div className={`role-option ${formData.role === 'user' ? 'selected' : ''}`} onClick={() => handleRoleSelect('user')}>User</div>
              <div className={`role-option ${formData.role === 'organizer' ? 'selected' : ''}`} onClick={() => handleRoleSelect('organizer')}>Organizer</div>
              <div className={`role-option ${formData.role === 'musician' ? 'selected' : ''}`} onClick={() => handleRoleSelect('musician')}>Musician</div>
            </div>
          </div>

          <div className="input-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} style={{ paddingLeft: '45px' }} required disabled={loading} />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} style={{ paddingLeft: '45px' }} required disabled={loading} />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} style={{ paddingLeft: '45px' }} required disabled={loading} />
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} style={{ paddingLeft: '45px' }} required disabled={loading} />
            </div>
          </div>

          {formData.role === 'musician' && (
            <div className="artist-fields">
              <div className="input-group">
                <label>Music Genre</label>
                <select name="genre" value={formData.genre} onChange={handleChange} disabled={loading}>
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
                <label>Location</label>
                <div style={{ position: 'relative' }}>
                  <FaMapMarkerAlt style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="text" name="location" placeholder="City, State" value={formData.location} onChange={handleChange} style={{ paddingLeft: '45px' }} disabled={loading} />
                </div>
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <FaPhone style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} style={{ paddingLeft: '45px' }} disabled={loading} />
                </div>
              </div>

              <div className="input-group">
                <label>Performance Fee (₹)</label>
                <div style={{ position: 'relative' }}>
                  <FaMusic style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="number" name="price" placeholder="50000" value={formData.price} onChange={handleChange} style={{ paddingLeft: '45px' }} min="0" disabled={loading} />
                </div>
              </div>

              <div className="input-group">
                <label>Bio/Description</label>
                <textarea name="bio" placeholder="Tell us about your music, experience, and achievements..." value={formData.bio} onChange={handleChange} disabled={loading} />
              </div>
            </div>
          )}

          {formData.role === 'organizer' && (
            <div className="organizer-fields">
              <div className="input-group">
                <label>Organization Type</label>
                <select name="type" value={formData.type} onChange={handleChange} disabled={loading}>
                  <option value="">Select Type</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Independent">Independent</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Regional">Regional</option>
                </select>
              </div>

              <div className="input-group">
                <label>Location</label>
                <div style={{ position: 'relative' }}>
                  <FaMapMarkerAlt style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="text" name="location" placeholder="City, State" value={formData.location} onChange={handleChange} style={{ paddingLeft: '45px' }} disabled={loading} />
                </div>
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <FaPhone style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="tel" name="phone" placeholder="+91 22 1234 5678" value={formData.phone} onChange={handleChange} style={{ paddingLeft: '45px' }} disabled={loading} />
                </div>
              </div>

              <div className="input-group">
                <label>Contact Email</label>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="email" name="contact" placeholder="contact@example.com" value={formData.contact} onChange={handleChange} style={{ paddingLeft: '45px' }} disabled={loading} />
                </div>
              </div>

              <div className="input-group">
                <label>Website</label>
                <div style={{ position: 'relative' }}>
                  <FaGlobe style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="url" name="website" placeholder="www.example.com" value={formData.website} onChange={handleChange} style={{ paddingLeft: '45px' }} disabled={loading} />
                </div>
              </div>

              <div className="input-group">
                <label>Specialties (comma separated)</label>
                <input type="text" name="specialties" placeholder="Music Festivals, Concerts" value={formData.specialties} onChange={handleChange} disabled={loading} />
              </div>

              <div className="input-group">
                <label>Bio/Description</label>
                <textarea name="bio" placeholder="Tell us about your organization..." value={formData.bio} onChange={handleChange} disabled={loading} />
              </div>
            </div>
          )}

          <label>
            <input type="checkbox" required disabled={loading} /> I agree to the Terms of Service and Privacy Policy
          </label>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
