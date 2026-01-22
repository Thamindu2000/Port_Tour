import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, InputGroup, CloseButton } from 'react-bootstrap'; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

import ErrorModal from './ErrorModal';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash, faKey } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Modal
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ''
  });
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const { login, isClerk } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPasswordDataChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setError('');

    try {
      await api.post('/api/auth/forgot-password', {
        email: forgotPasswordData.email
      });
      // toast.success
      setShowForgotPasswordModal(false);
      setForgotPasswordData({ email: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        // toast.success(t('login.successMessage') || 'Login successful!'); // Toast ඉවත් කර ඇත
        // Always redirect to home after successful login; clear any stored redirect path
        localStorage.removeItem('redirectAfterLogin');
        navigate('/');
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

  // styles moved to src/App.css (auth-page, auth-card, auth-form-control, auth-btn)

  return (
    <>
      {/* placeholder styles consolidated into src/App.css (scoped .auth-page) */}

  <Container fluid className="auth-page d-flex align-items-center justify-content-center">
        <Row className="justify-content-center w-100">
          <Col md={6} lg={4}>
            <Card className="auth-card">
              <Card.Body>
                <div className="text-center mb-4">
                  <h2 className="fw-bold">WELCOME TO SLPA</h2>
                </div>
                <h3 className="text-center fw-bold mb-4">
                  {t('login.title')}
                </h3>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="form-label">{t('login.username')}</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="auth-input-group-text">
                        <FontAwesomeIcon icon={faUser} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder={t('login.username')}
                        className="white-placeholder auth-form-control rounded-right"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label">{t('login.password')}</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="auth-input-group-text">
                        <FontAwesomeIcon icon={faLock} />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder={t('login.password')}
                        className="white-placeholder auth-form-control rounded-right-0"
                      />
                      <InputGroup.Text onClick={() => setShowPassword(!showPassword)} className="auth-password-toggle">
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="auth-btn"
                  >
                    {loading ? t('common.loading') : t('login.loginButton')}
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  <p>
                    <Button variant="link" onClick={() => setShowForgotPasswordModal(true)} className="text-white" style={{ textDecoration: 'none', fontSize: '0.9rem', padding: '0.25rem' }}>
                      <FontAwesomeIcon icon={faKey} style={{ marginRight: '5px' }} />
                      Forgot Password?
                    </Button>
                  </p>
                  <p style={{ fontSize: '0.9rem' }}>
                    {t('login.noAccount')} <Link to="/register" className="fw-bold text-white">{t('login.registerHere')}</Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Error Modal */}
      <ErrorModal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        message={error}
      />

      {/* ===============================================
        ❇️ FIX: Forgot Password Modal (Glassmorphism Fix)
        ===============================================
      */}
      <Modal
        show={showForgotPasswordModal}
        onHide={() => setShowForgotPasswordModal(false)}
        centered
        /* data-bs-theme="dark" ඉවත් කර ඇත */
        className="auth-modal" 
        contentClassName="modal-content" // ❇️ App.css එකේ Glassmorphism style එකට මෙය අනිවාර්යයි
      >
        {/* <Modal.Header> ඉවත් කර ඇත (App.css එකෙන් hide වන නිසා) */}
        
        <Form onSubmit={handleForgotPasswordSubmit}>
          <Modal.Body className="modal-body-custom"> {/* ❇️ App.css එකේ padding: 0 style එක */}
            
            {/* --- ❇️ App.css එකට ගැලපෙන අලුත් Custom Header එක --- */}
            <div className="d-flex justify-content-between align-items-center p-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.18)' }}>
              <h5 className="modal-title" style={{ color: '#ffffff', fontWeight: 700 }}>Forgot Password</h5>
              <CloseButton variant="white" onClick={() => setShowForgotPasswordModal(false)} />
            </div>

            {/* --- ❇️ අලුත් Body Content එක --- */}
            <div className="p-4">
              <Form.Group className="mb-3">
                <Form.Label className="form-label">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={forgotPasswordData.email}
                  onChange={handleForgotPasswordDataChange}
                  required
                  placeholder="Enter your email address"
                  className="white-placeholder auth-form-control" 
                />
              </Form.Group>
            </div>
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowForgotPasswordModal(false)} disabled={forgotPasswordLoading} className="text-white">
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={forgotPasswordLoading} className="text-white">
              {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Login;