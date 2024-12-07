// src/components/EventList.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './EventList.css';

const EventList = () => {
  const { categoryCode } = useParams(); // Capture category code from URL
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/events/${categoryCode}`);
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [categoryCode]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="event-list">
      <h2>Events for Category: {categoryCode}</h2>
      <div className="events-container">
        {events.map((event) => (
          <div key={event._id} className="event-item">
            <img src={event.imageUrl} alt={event.title} />
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Start:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
            <p><strong>End:</strong> {new Date(event.endDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
