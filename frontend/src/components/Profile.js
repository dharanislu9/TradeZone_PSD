import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    imagePath: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5001/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUser(data);
        setImagePreview(`http://localhost:5001/${data.imagePath}`);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Could not load user data.');
      }
    };

    fetchUserData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('email', user.email);
    formData.append('phone', user.phone);
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5001/user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Profile update failed');
      const updatedUser = await response.json();
      setUser(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error updating profile.');
    }
  };

  // Handle logout and navigate to the landing page
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear token
    navigate('/'); // Redirect to the landing page
  };

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit}>
        {imagePreview && <img src={imagePreview} alt="Profile" className="profile-image" />}
        <input type="text" name="firstName" value={user.firstName} onChange={handleChange} placeholder="First Name" required />
        <input type="text" name="lastName" value={user.lastName} onChange={handleChange} placeholder="Last Name" required />
        <input type="email" name="email" value={user.email} onChange={handleChange} placeholder="Email" required />
        <input type="tel" name="phone" value={user.phone} onChange={handleChange} placeholder="Phone" required />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit">Update Profile</button>
        <button type="button" onClick={() => navigate('/home')}>Back</button>
      </form>

      {/* Only "Logout" button */}
      <div className="profile-actions">
        <button className="action-button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Profile;