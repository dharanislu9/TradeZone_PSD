import React, { useState } from 'react';
import './LocationPage.css';
import axios from 'axios';

const LocationPage = ({ onClose }) => {
  const [locations, setLocations] = useState([{ location: "", radius: "1 mile" }]);

  const handleLocationChange = (index, field, value) => {
    const updatedLocations = locations.map((loc, locIndex) =>
      locIndex === index ? { ...loc, [field]: value } : loc
    );
    setLocations(updatedLocations);
  };

  const addNewLocation = () => {
    setLocations([...locations, { location: "", radius: "1 mile" }]);
  };

  const saveLocations = async () => {
    try {
      const token = localStorage.getItem('token');

      // Send all locations to the server
      await axios.put(
        'http://localhost:5001/user/locations', // Adjust the endpoint if needed
        { locations },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Locations saved:", locations);
    } catch (error) {
      console.error("Error saving locations:", error.response?.data?.error || error.message);
    }

    // Close the modal after saving changes
    onClose();
  };

  return (
    <div className="location-page">
      <div className="modal-header">
        <h2>Change Location</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <div className="modal-content">
        {locations.map((loc, index) => (
          <div key={index} className="location-entry">
            <label>Location {index + 1}</label>
            <input
              type="text"
              value={loc.location}
              onChange={(e) => handleLocationChange(index, 'location', e.target.value)}
              placeholder="Search by city, neighborhood, or ZIP code"
              className="location-input"
            />
            <label>Radius</label>
            <select
              value={loc.radius}
              onChange={(e) => handleLocationChange(index, 'radius', e.target.value)}
              className="radius-select"
            >
              <option value="1 mile">1 mile</option>
              <option value="5 miles">5 miles</option>
              <option value="10 miles">10 miles</option>
              <option value="20 miles">20 miles</option>
            </select>
          </div>
        ))}
        <button className="add-location-button" onClick={addNewLocation}>Add Another Location</button>
        <button className="apply-button" onClick={saveLocations}>Apply</button>
      </div>
    </div>
  );
};

export default LocationPage;
