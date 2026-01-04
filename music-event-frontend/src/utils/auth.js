// Authentication utility functions
export const AUTH_KEYS = {
  USERS: 'musicEventUsers',
  CURRENT_USER: 'user',
  EVENTS: 'musicEventEvents',
  BOOKINGS: 'musicEventBookings',
  CONTRACTS: 'musicEventContracts'
};

// Initialize default data
export const initializeData = () => {
  // Initialize users array if it doesn't exist
  if (!localStorage.getItem(AUTH_KEYS.USERS)) {
    const defaultUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'user@example.com',
        password: 'password',
        role: 'user',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Event Organizer',
        email: 'organizer@example.com',
        password: 'password',
        role: 'organizer',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Musician',
        email: 'musician@example.com',
        password: 'password',
        role: 'musician',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  // Initialize events if they don't exist
  if (!localStorage.getItem(AUTH_KEYS.EVENTS)) {
    const defaultEvents = [
      {
        id: 1,
        name: 'Rock Night Extravaganza',
        description: 'Experience the ultimate rock music festival with top artists from around the world. Join us for an unforgettable night of electrifying performances.',
        location: 'Chennai, Tamil Nadu',
        date: '2025-08-25',
        time: '7:00 PM',
        price: 1500,
        category: 'Rock',
        emoji: '🎸',
        featured: true,
        availableTickets: 45,
        totalTickets: 100,
        organizerId: 2,
        organizerName: 'Event Organizer',
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'
      },
      {
        id: 2,
        name: 'Jazz Evening Soiree',
        description: 'A sophisticated evening of smooth jazz and elegant melodies. Perfect for jazz enthusiasts.',
        location: 'Bangalore, Karnataka',
        date: '2025-09-02',
        time: '6:30 PM',
        price: 1200,
        category: 'Jazz',
        emoji: '🎷',
        featured: true,
        availableTickets: 32,
        totalTickets: 50,
        organizerId: 2,
        organizerName: 'Event Organizer',
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80'
      }
    ];
    localStorage.setItem(AUTH_KEYS.EVENTS, JSON.stringify(defaultEvents));
  }

  // Initialize bookings array
  if (!localStorage.getItem(AUTH_KEYS.BOOKINGS)) {
    localStorage.setItem(AUTH_KEYS.BOOKINGS, JSON.stringify([]));
  }

  // Initialize contracts array
  if (!localStorage.getItem(AUTH_KEYS.CONTRACTS)) {
    localStorage.setItem(AUTH_KEYS.CONTRACTS, JSON.stringify([]));
  }
};

// User management functions
export const registerUser = (userData) => {
  const users = JSON.parse(localStorage.getItem(AUTH_KEYS.USERS) || '[]');
  
  // Check if user already exists
  if (users.find(u => u.email === userData.email)) {
    return { success: false, error: 'User with this email already exists' };
  }

  const newUser = {
    id: Date.now(),
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role,
    profile: userData.profile || {},
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
  
  return { success: true, user: newUser };
};

export const loginUser = (email, password) => {
  const users = JSON.parse(localStorage.getItem(AUTH_KEYS.USERS) || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
    return { success: true, user: userWithoutPassword };
  }
  
  return { success: false, error: 'Invalid email or password' };
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem(AUTH_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const logoutUser = () => {
  localStorage.removeItem(AUTH_KEYS.CURRENT_USER);
};

// Event management functions
export const getEvents = () => {
  return JSON.parse(localStorage.getItem(AUTH_KEYS.EVENTS) || '[]');
};

export const getUpcomingEvents = () => {
  const events = getEvents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today && event.status === 'upcoming';
  });
};

export const createEvent = (eventData) => {
  const events = getEvents();
  const currentUser = getCurrentUser();
  
  const newEvent = {
    id: Date.now(),
    ...eventData,
    organizerId: currentUser.id,
    organizerName: currentUser.name,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    availableTickets: eventData.totalTickets || 100,
    emoji: eventData.emoji || '🎵',
    totalTickets: eventData.totalTickets || 100
  };
  
  events.push(newEvent);
  localStorage.setItem(AUTH_KEYS.EVENTS, JSON.stringify(events));
  
  return newEvent;
};

export const updateEvent = (eventId, updates) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === eventId);
  
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    localStorage.setItem(AUTH_KEYS.EVENTS, JSON.stringify(events));
    return events[index];
  }
  
  return null;
};

export const getOrganizerEvents = (organizerId) => {
  const events = getEvents();
  return events.filter(e => e.organizerId === organizerId);
};

// Booking management functions
export const createBooking = (bookingData) => {
  const bookings = JSON.parse(localStorage.getItem(AUTH_KEYS.BOOKINGS) || '[]');
  const events = getEvents();
  const event = events.find(e => e.id === bookingData.eventId);
  
  if (!event || event.availableTickets < bookingData.tickets) {
    return { success: false, error: 'Not enough tickets available' };
  }
  
  const booking = {
    id: Date.now(),
    ...bookingData,
    bookingDate: new Date().toISOString(),
    status: 'confirmed',
    qrCode: `QR-${Date.now()}-${bookingData.eventId}`
  };
  
  bookings.push(booking);
  localStorage.setItem(AUTH_KEYS.BOOKINGS, JSON.stringify(bookings));
  
  // Update event tickets
  updateEvent(bookingData.eventId, {
    availableTickets: event.availableTickets - bookingData.tickets
  });
  
  return { success: true, booking };
};

export const getUserBookings = (userId) => {
  const bookings = JSON.parse(localStorage.getItem(AUTH_KEYS.BOOKINGS) || '[]');
  return bookings.filter(b => b.userId === userId);
};

// Contract management functions
export const createContract = (contractData) => {
  const contracts = JSON.parse(localStorage.getItem(AUTH_KEYS.CONTRACTS) || '[]');
  
  const contract = {
    id: Date.now(),
    ...contractData,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  contracts.push(contract);
  localStorage.setItem(AUTH_KEYS.CONTRACTS, JSON.stringify(contracts));
  
  return contract;
};

export const getArtistContracts = (artistId) => {
  const contracts = JSON.parse(localStorage.getItem(AUTH_KEYS.CONTRACTS) || '[]');
  return contracts.filter(c => c.artistId === artistId);
};

export const getOrganizerContracts = (organizerId) => {
  const contracts = JSON.parse(localStorage.getItem(AUTH_KEYS.CONTRACTS) || '[]');
  return contracts.filter(c => c.organizerId === organizerId);
};

export const updateContractStatus = (contractId, status) => {
  const contracts = JSON.parse(localStorage.getItem(AUTH_KEYS.CONTRACTS) || '[]');
  const index = contracts.findIndex(c => c.id === contractId);
  
  if (index !== -1) {
    contracts[index].status = status;
    contracts[index].updatedAt = new Date().toISOString();
    localStorage.setItem(AUTH_KEYS.CONTRACTS, JSON.stringify(contracts));
    return contracts[index];
  }
  
  return null;
};

// User management functions
export const getAllUsers = (role = null) => {
  const users = JSON.parse(localStorage.getItem(AUTH_KEYS.USERS) || '[]');
  if (role) {
    return users.filter(u => u.role === role).map(({ password: _, ...user }) => user);
  }
  return users.map(({ password: _, ...user }) => user);
};

export const getArtists = () => {
  return getAllUsers('musician');
};

