import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaLock, FaMusic, FaMapMarkerAlt,
  FaPhone, FaGlobe
} from 'react-icons/fa';
import { authAPI } from '../services/api';
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
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
    }

    if (formData.role === 'organizer') {
      profileData = {
        type: formData.type,
        location: formData.location,
        phone: formData.phone,
        contact: formData.contact || formData.email,
        website: formData.website || '',
        bio: formData.bio,
        specialties: formData.specialties
          ? formData.specialties.split(',').map(s => s.trim())
          : [],
        eventsOrganized: 0,
        totalAttendees: 0,
        rating: 4.5
      };
    }

    try {
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toUpperCase(),
        profile: profileData ? JSON.stringify(profileData) : null   // ⭐ FIX HERE
      };

      const response = await authAPI.register(registerData);
      const data = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      window.dispatchEvent(new Event('userLogin'));

      if (data.role === 'ORGANIZER') navigate('/organizer-dashboard');
      else if (data.role === 'MUSICIAN') navigate('/musician-dashboard');
      else navigate('/dashboard');

    } catch (err) {
      console.error('Registration error:', err.response || err);
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <h1>Create Account</h1>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="role-selector">
            <div onClick={() => handleRoleSelect('user')}>User</div>
            <div onClick={() => handleRoleSelect('organizer')}>Organizer</div>
            <div onClick={() => handleRoleSelect('musician')}>Musician</div>
          </div>

          <input name="name" placeholder="Name" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />

          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

export default Register;
