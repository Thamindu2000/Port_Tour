import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Logo from './Logo';
import ErrorModal from './ErrorModal';
import { useTranslation } from 'react-i18next';
import api from '../services/api';


const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Modal states for password change
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    username: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  const { login, user, isClerk } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleChangePasswordDataChange = (e) => {
    setChangePasswordData({
      ...changePasswordData,
      [e.target.name]: e.target.value
    });
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    if (changePasswordData.newPassword !== changePasswordData.confirmNewPassword) {
      setError('Passwords do not match');
      setShowErrorModal(true);
      return;
    }

    setChangePasswordLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/admin-change-password', {
        username: changePasswordData.username,
        newPassword: changePasswordData.newPassword
      });

      if (response.data.success) {
        toast.success('Password changed successfully!');
        setShowChangePasswordModal(false);
        setChangePasswordData({
          username: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } else {
        setError(response.data.message || 'Failed to change password');
        setShowErrorModal(true);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        toast.success(t('login.successMessage') || 'Login successful!');
        // Check if there's a redirect path stored
        const redirectPath = localStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          localStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          // Default redirect based on user role
          if (isClerk()) {
            navigate('/public-bookings');
          } else {
            navigate('/');
          }
        }
      } else {
        setError(result.error);
        setShowErrorModal(true);
      }
    } catch (err) {
      setError(t('login.unexpectedError') || 'An unexpected error occurred');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }

  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="booking-form">
            <Card.Header className="card-header-custom text-center">
              <div className="d-flex justify-content-center mb-3">
                <Logo size="medium" showText={false} />
              </div>
              <h3>{t('login.title')}</h3>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3">
                  <Form.Label>{t('login.email')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>{t('login.password')}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100"
                  disabled={loading}
                  style={{ fontWeight: 'bold', fontStyle: 'italic', borderRadius: '40px', boxShadow: '0 10px 20px rgba(0,123,255,0.4)', transition: 'all 0.3s ease', padding: '12px 24px', fontSize: '1.1rem', textShadow: '1px 1px 2px rgba(0,0,0,0.3)', letterSpacing: '1px', border: 'none' }}
                >
                  {loading ? t('common.loading') : t('login.loginButton')}
                </Button>
              </Form>
              <div className="text-center mt-3">
                <p>
                  {t('login.noAccount')} <Link to="/register">{t('login.registerHere')}</Link>
                </p>
                <p>
                  <Button
                    variant="link"
                    onClick={() => setShowChangePasswordModal(true)}
                    style={{ textDecoration: 'underline', color: '#007bff' }}
                  >
                    Change Password
                  </Button>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ErrorModal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        message={error}
      />

      {/* Change Password Modal */}
      <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Admin Password</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleChangePasswordSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={changePasswordData.username}
                onChange={handleChangePasswordDataChange}
                required
                placeholder="Enter your username"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={changePasswordData.newPassword}
                onChange={handleChangePasswordDataChange}
                required
                placeholder="Enter new password"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmNewPassword"
                value={changePasswordData.confirmNewPassword}
                onChange={handleChangePasswordDataChange}
                required
                placeholder="Confirm new password"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)} disabled={changePasswordLoading}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={changePasswordLoading}>
              {changePasswordLoading ? 'Submitting...' : 'Submit Change'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Login;
