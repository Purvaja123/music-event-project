import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import MusicianDashboard from './pages/MusicianDashboard';
import Calendar from './pages/Calendar';
import Artists from './pages/Artists';
import Organizers from './pages/Organizers';
import Bookings from './pages/Bookings';
import BookTicket from './pages/BookTicket';
import { initializeData } from './utils/auth';
import './App.css';

function App() {
  useEffect(() => {
    initializeData();
  }, []);
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
          <Route path="/musician-dashboard" element={<MusicianDashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/organizers" element={<Organizers />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/book-ticket" element={<BookTicket />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
