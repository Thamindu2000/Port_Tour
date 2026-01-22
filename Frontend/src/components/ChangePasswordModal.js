import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';
import ErrorModal from './ErrorModal';



const ChangePasswordModal = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Blur background when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
      // Add a class to blur the background
      document.getElementById('root').style.filter = 'blur(5px)';
      document.getElementById('root').style.transition = 'filter 0.3s ease';
    } else {
      document.body.style.overflow = '';
      // Remove blur
      document.getElementById('root').style.filter = 'none';
    }
    return () => {
      document.body.style.overflow = '';
      // Ensure blur is removed on component unmount
      document.getElementById('root').style.filter = 'none';
    };
  }, [show]);

  // --- Styles (Glassmorphism UI) ---
  const modalStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '15px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    color: 'white',
  };

  const modalHeaderStyle = {
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
  };



  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setShowErrorModal(true);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setShowErrorModal(true);
      return;
    }


    setLoading(true);
    setError('');

    try {
      // eslint-disable-next-line no-unused-vars
      const response = await api.put('/api/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      toast.success('Password changed successfully!');
      onHide();
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }

  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    onHide();
  };

  return (
    <>
      {/* Style tag for modal styling */}
      <style>
        {`
          .modal-content {
            background-color: transparent !important;
            border: none !important;
          }
          .modal-header .btn-close {
            filter: invert(1) grayscale(100%) brightness(200%);
          }
          .form-control::placeholder {
            color: #eee !important;
            opacity: 1 !important;
          }
          .form-control:-ms-input-placeholder {
            color: #eee !important;
          }
          .form-control::-ms-input-placeholder {
            color: #eee !important;
          }
        `}
      </style>
      <Modal
        show={show}
        onHide={handleClose}
        centered
        size="lg"
        backdrop={true}
        data-bs-theme="dark"
        style={{ zIndex: 9999 }}
      >
        <div style={modalStyle}>
          <Modal.Header closeButton style={modalHeaderStyle}>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body style={{ padding: '2rem' }}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: 'white', fontWeight: '600' }}>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your current password"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: 'white',
                    borderRadius: '10px'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: 'white', fontWeight: '600' }}>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your new password"
                  minLength="6"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: 'white',
                    borderRadius: '10px'
                  }}
                />
                <Form.Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Password must be at least 6 characters long.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ color: 'white', fontWeight: '600' }}>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your new password"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: 'white',
                    borderRadius: '10px'
                  }}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <Button variant="secondary" onClick={handleClose} disabled={loading} style={{ backgroundColor: '#6c757d', border: 'none' }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading} style={{
                background: '#0033a0',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px'
              }}>
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </Modal.Footer>
          </Form>
          <ErrorModal
            show={showErrorModal}
            onHide={() => setShowErrorModal(false)}
            message={error}
          />
        </div>
      </Modal>
    </>
  );

};

export default ChangePasswordModal;
