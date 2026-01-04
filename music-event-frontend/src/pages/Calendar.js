import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaMusic, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "./Pages.css";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Sample events data - in a real app, this would come from an API
  const events = [
    { id: 1, date: new Date(2025, 0, 15), title: "Rock Concert", time: "7:00 PM", location: "Mumbai", type: "concert" },
    { id: 2, date: new Date(2025, 0, 22), title: "Jazz Night", time: "8:00 PM", location: "Delhi", type: "concert" },
    { id: 3, date: new Date(2025, 1, 5), title: "EDM Festival", time: "6:00 PM", location: "Goa", type: "festival" },
    { id: 4, date: new Date(2025, 1, 14), title: "Classical Performance", time: "7:30 PM", location: "Kolkata", type: "concert" },
    { id: 5, date: new Date(2025, 1, 20), title: "Bollywood Night", time: "8:00 PM", location: "Mumbai", type: "concert" },
    { id: 6, date: new Date(2025, 2, 8), title: "Hip-Hop Show", time: "9:00 PM", location: "Bangalore", type: "concert" },
    { id: 7, date: new Date(2025, 2, 15), title: "Music Festival", time: "5:00 PM", location: "Pune", type: "festival" },
    { id: 8, date: new Date(2025, 2, 25), title: "Acoustic Session", time: "7:00 PM", location: "Delhi", type: "concert" },
    { id: 9, date: new Date(2025, 3, 10), title: "Pop Concert", time: "8:30 PM", location: "Mumbai", type: "concert" },
    { id: 10, date: new Date(2025, 3, 18), title: "Indie Music Night", time: "7:00 PM", location: "Bangalore", type: "concert" },
    { id: 11, date: new Date(2025, 4, 1), title: "Summer Music Fest", time: "4:00 PM", location: "Goa", type: "festival" },
    { id: 12, date: new Date(2025, 4, 12), title: "Classical Evening", time: "6:30 PM", location: "Kolkata", type: "concert" },
    { id: 13, date: new Date(2025, 4, 20), title: "Rock Night", time: "8:00 PM", location: "Mumbai", type: "concert" },
    { id: 14, date: new Date(2025, 5, 5), title: "Jazz Festival", time: "7:00 PM", location: "Delhi", type: "festival" },
    { id: 15, date: new Date(2025, 5, 15), title: "EDM Party", time: "9:00 PM", location: "Goa", type: "concert" },
    { id: 16, date: new Date(2025, 6, 4), title: "Monsoon Music Fest", time: "6:00 PM", location: "Mumbai", type: "festival" },
    { id: 17, date: new Date(2025, 6, 18), title: "Bollywood Special", time: "7:30 PM", location: "Delhi", type: "concert" },
    { id: 18, date: new Date(2025, 7, 8), title: "Hip-Hop Night", time: "8:00 PM", location: "Bangalore", type: "concert" },
    { id: 19, date: new Date(2025, 7, 22), title: "Classical Concert", time: "7:00 PM", location: "Kolkata", type: "concert" },
    { id: 20, date: new Date(2025, 8, 10), title: "Indie Festival", time: "5:00 PM", location: "Pune", type: "festival" },
    { id: 21, date: new Date(2025, 8, 25), title: "Pop Night", time: "8:30 PM", location: "Mumbai", type: "concert" },
    { id: 22, date: new Date(2025, 9, 5), title: "Acoustic Evening", time: "7:00 PM", location: "Delhi", type: "concert" },
    { id: 23, date: new Date(2025, 9, 18), title: "Rock Festival", time: "6:00 PM", location: "Goa", type: "festival" },
    { id: 24, date: new Date(2025, 10, 2), title: "Jazz Night", time: "8:00 PM", location: "Mumbai", type: "concert" },
    { id: 25, date: new Date(2025, 10, 15), title: "EDM Concert", time: "9:00 PM", location: "Bangalore", type: "concert" },
    { id: 26, date: new Date(2025, 11, 5), title: "Year End Music Fest", time: "7:00 PM", location: "Mumbai", type: "festival" },
    { id: 27, date: new Date(2025, 11, 20), title: "Christmas Concert", time: "7:30 PM", location: "Delhi", type: "concert" },
    { id: 28, date: new Date(2025, 11, 31), title: "New Year Eve Party", time: "10:00 PM", location: "Goa", type: "festival" }
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = event.date;
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(prevDate.getMonth() - 1);
      } else {
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthEvents = events.filter(event => 
    event.date.getMonth() === month && event.date.getFullYear() === year
  );

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="calendar-page">
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: 800, marginBottom: "16px", background: "var(--gradient-1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Event Calendar
          </h1>
          <p style={{ fontSize: "18px", color: "var(--dark-light)" }}>
            View all upcoming music events and set reminders
          </p>
        </div>

        <div className="calendar-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
            <button
              onClick={() => navigateMonth('prev')}
              style={{
                padding: "10px 20px",
                background: "var(--gradient-1)",
                color: "var(--white)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <FaChevronLeft />
              Previous
            </button>
            
            <h2 style={{ fontSize: "32px", fontWeight: 700, color: "var(--dark)" }}>
              {months[month]} {year}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              style={{
                padding: "10px 20px",
                background: "var(--gradient-1)",
                color: "var(--white)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              Next
              <FaChevronRight />
            </button>
          </div>

          <div className="calendar-grid">
            {daysOfWeek.map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
            
            {Array.from({ length: startingDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`}></div>
            ))}
            
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const dayEvents = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={day}
                  className={`calendar-day ${dayEvents.length > 0 ? 'has-events' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    background: isToday ? "rgba(99, 102, 241, 0.15)" : dayEvents.length > 0 ? "rgba(99, 102, 241, 0.1)" : "transparent",
                    border: isSelected ? "3px solid var(--primary)" : isToday ? "2px solid var(--primary)" : "2px solid #e2e8f0",
                    cursor: "pointer"
                  }}
                >
                  <div className="calendar-day-number" style={{ fontWeight: isToday ? 700 : 600 }}>
                    {day}
                  </div>
                  {dayEvents.length > 0 && (
                    <div style={{ marginTop: "5px" }}>
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="calendar-event-dot"
                          style={{
                            width: "100%",
                            height: "4px",
                            borderRadius: "2px",
                            background: event.type === "festival" ? "#ec4899" : "#6366f1",
                            margin: "2px 0"
                          }}
                          title={event.title}
                        />
                      ))}
                      {dayEvents.length > 2 && (
                        <div style={{ fontSize: "10px", color: "var(--primary)", fontWeight: 600, marginTop: "2px" }}>
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {monthEvents.length > 0 && (
            <div style={{ marginTop: "40px", padding: "20px", background: "var(--light)", borderRadius: "12px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "15px", color: "var(--dark)" }}>
                Events in {months[month]} {year}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
                {monthEvents.map(event => (
                  <div
                    key={event.id}
                    style={{
                      padding: "15px",
                      background: "var(--white)",
                      borderRadius: "8px",
                      boxShadow: "var(--shadow)",
                      borderLeft: `4px solid ${event.type === "festival" ? "#ec4899" : "#6366f1"}`
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
                      <FaMusic style={{ color: "var(--primary)", fontSize: "20px", marginTop: "2px" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "var(--dark)", marginBottom: "5px" }}>
                          {event.title}
                        </div>
                        <div style={{ fontSize: "14px", color: "var(--dark-light)", display: "flex", flexDirection: "column", gap: "3px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaClock style={{ fontSize: "12px" }} />
                            <span>{event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {event.time}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaMapMarkerAlt style={{ fontSize: "12px" }} />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDate && selectedDateEvents.length > 0 && (
            <div style={{ marginTop: "30px", padding: "25px", background: "var(--white)", borderRadius: "12px", boxShadow: "var(--shadow-lg)", border: "2px solid var(--primary)" }}>
              <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "15px", color: "var(--dark)" }}>
                Events on {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedDateEvents.map(event => (
                  <div
                    key={event.id}
                    style={{
                      padding: "15px",
                      background: "var(--light)",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "15px"
                    }}
                  >
                    <div style={{ width: "50px", height: "50px", borderRadius: "8px", background: "var(--gradient-1)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "20px" }}>
                      <FaMusic />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "var(--dark)", marginBottom: "5px", fontSize: "18px" }}>
                        {event.title}
                      </div>
                      <div style={{ fontSize: "14px", color: "var(--dark-light)", display: "flex", gap: "15px" }}>
                        <span><FaClock style={{ marginRight: "5px" }} />{event.time}</span>
                        <span><FaMapMarkerAlt style={{ marginRight: "5px" }} />{event.location}</span>
                      </div>
                    </div>
                    <button
                      style={{
                        padding: "10px 20px",
                        background: "var(--gradient-1)",
                        color: "var(--white)",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "14px"
                      }}
                    >
                      Set Reminder
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
