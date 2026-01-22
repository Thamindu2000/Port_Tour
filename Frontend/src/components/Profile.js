import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { FaCamera, FaUser, FaEdit, FaLock, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import ChangePasswordModal from './ChangePasswordModal';
import './Profile.css'; // This CSS file is now fully utilized

const Profile = () => {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentProfileImage, setCurrentProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.username || '',
    email: user?.email || '',
    institution: user?.institutionName || ''
  });

  // Load current profile image on component mount
  useEffect(() => {
    if (user?.id) {
      loadProfileImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadProfileImage = async () => {
    try {
      const response = await api.get(`/api/auth/profile-image/${user.id}`, {
        responseType: 'blob' // To handle image data
      });
      if (response.data) {
        const imageUrl = URL.createObjectURL(response.data);
        setCurrentProfileImage(imageUrl);
      }
    } catch (error) {
      // Image not found or error, that's okay - will show placeholder
      console.log('No profile image found');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload the image to the backend
      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        const response = await api.put('/api/auth/update-profile-image', formData);
        console.log('Profile image uploaded successfully:', response.data);
        toast.success('Profile image uploaded successfully!');
        // Reload the profile image from backend to show the saved version
        await loadProfileImage();
        // Clear the preview after successful upload
        setImagePreview(null);
        // Clear the file input
        e.target.value = '';
      } catch (error) {
        console.error('Error uploading profile image:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
          toast.error(`Failed to upload profile image: ${error.response.data.message || 'Unknown error'}`);
        } else if (error.request) {
          console.error('No response received:', error.request);
          toast.error('Failed to upload profile image: No response from server');
        } else {
          console.error('Request setup error:', error.message);
          toast.error('Failed to upload profile image: Request setup error');
        }
      }
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setFormData({
      fullName: user?.username || '',
      email: user?.email || '',
      institution: user?.institutionName || ''
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/api/auth/update-profile', {
        username: formData.fullName,
        email: formData.email,
        institutionName: formData.institution
      });
      console.log('Profile updated successfully:', response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      // Note: You might need to update the user context here if the username changes
      // e.g., auth.setUser(response.data.user);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <h5>{t('profile.notLoggedIn', 'Please log in to view your profile.')}</h5>
        </div>
      </Container>
    );
  }

  if (!isAdmin()) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <h5>Access Denied: Only administrators can view this page.</h5>
        </div>
      </Container>
    );
  }

  return (
    // This container controls the theme for the CSS file
    <div className="profile-container">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            {/* THIS IS THE CARD FROM YOUR CSS */}
            <div className="profile-card">
              
              {/* THIS IS THE HEADER FROM YOUR CSS */}
              <div className="profile-header">
                <img src="/SLPA.jpg" alt="Logo" className="header-logo" />
                <h2>{t('profile.title', 'My Profile')}</h2>
              </div>
              
              {/* THIS IS THE BODY FROM YOUR CSS */}
              <div className="profile-body">
                
                {/* Avatar and Change Photo Button */}
                <div className="avatar-container">
                  {currentProfileImage || imagePreview ? (
                    <img 
                      src={imagePreview || currentProfileImage} 
                      alt="Profile" 
                      className="profile-avatar" 
                    />
                  ) : (
                    // Placeholder when no image is available
                    <div className="profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6c757d' }}>
                      <FaUser size={80} style={{ color: '#ffffff', opacity: 0.8 }} />
                    </div>
                  )}
                  <button 
                    className="btn btn-secondary-outline btn-change-photo"
                    onClick={() => document.getElementById('profile-image-upload').click()}
                  >
                    <FaCamera /> {t('profile.changePhoto', 'Change Photo')}
                  </button>
                  <Form.Control
                    type="file"
                    id="profile-image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* User's Name */}
                <h3 className="profile-name">{user.username}</h3>

                {/* --- CONDITIONAL VIEW: EDITING OR VIEWING --- */}
                {isEditing ? (
                  // --- EDITING FORM ---
                  <Form className="profile-edit-form">
                    <Form.Group className="mb-3">
                      <Form.Label>{t('profile.fullName', 'Full Name')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('profile.email', 'Email')}</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email"
                      />
                    </Form.Group>
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <Form.Group className="mb-3">
                        <Form.Label>{t('profile.institution', 'Institution')}</Form.Label>
                        <Form.Control
                          type="text"
                          name="institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                          placeholder="Enter institution"
                        />
                      </Form.Group>
                    )}
                  </Form>
                ) : (
                  // --- VIEWING DETAILS ---
                  <ul className="profile-details">
                    <li><strong>{t('profile.fullName', 'Full Name')}:</strong> <span>{user.username}</span></li>
                    <li><strong>{t('profile.username', 'Username')}:</strong> <span>{user.username}</span></li>
                    <li><strong>{t('profile.email', 'Email')}:</strong> <span>{user.email}</span></li>
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                      <li><strong>{t('profile.institution', 'Institution')}:</strong> <span>{user.institutionName}</span></li>
                    )}
                  </ul>
                )}
                
                {/* THESE ARE THE ACTION BUTTONS FROM YOUR CSS */}
                <div className="profile-actions">
                  {isEditing ? (
                    <>
                      <button className="btn btn-primary" onClick={handleSave}>
                        <FaSave /> {t('profile.save', 'Save Changes')}
                      </button>
                      <button className="btn btn-secondary-outline" onClick={handleCancel}>
                        <FaTimes /> {t('profile.cancel', 'Cancel')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-primary" onClick={handleEdit}>
                        <FaEdit /> {t('profile.edit', 'Edit Profile')}
                      </button>
                      <button className="btn btn-secondary-outline" onClick={handleChangePassword}>
                        <FaLock /> {t('profile.changePassword', 'Change Password')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <ChangePasswordModal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default Profile;
