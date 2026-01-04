import React from "react";
import EventCard from "./EventCard";

function EventList() {
  const events = [
    { id: 1, name: "Rock Night", date: "20 Aug 2025", location: "Chennai" },
    { id: 2, name: "Jazz Evening", date: "25 Aug 2025", location: "Bangalore" },
    { id: 3, name: "EDM Festival", date: "30 Aug 2025", location: "Hyderabad" }
  ];

  return (
    <div className="event-list">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default EventList;
