import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

import ErrorModal from './ErrorModal';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faBuilding, faPhone, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


const Register = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    institutionName: '',
    contactNumber: '',
    role: 'USER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = t('register.usernameRequired') || 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = t('register.usernameMinLength') || 'Username must be at least 3 characters';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('register.invalidEmail') || 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = t('register.passwordRequired') || 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = t('register.passwordMinLength') || 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = t('register.confirmPasswordRequired') || 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('register.passwordMismatch') || 'Passwords do not match';
    }
    if (!formData.institutionName.trim()) {
      errors.institutionName = t('register.institutionRequired') || 'Institution name is required';
    }
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = t('register.contactRequired') || 'Contact number is required';
    } else if (!/^\d{10,15}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      errors.contactNumber = t('register.invalidContact') || 'Please enter a valid contact number';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      const result = await register(userData);
      if (result.success) {
        toast.success(t('register.successMessage') || 'Registration successful! Please login.');
        navigate('/login');
      } else {
        setError(result.error || t('register.registrationFailed') || 'Registration failed. Please try again.');
        setShowErrorModal(true);
      }
    } catch (err) {
      setError(t('register.unexpectedError') || 'An unexpected error occurred. Please try again later.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // styles moved to src/App.css (auth-page, auth-card, auth-form-control, auth-btn)


  // Helper function to render a form field
  const renderFormField = (name, type, icon, label, required = false, isInvalid = false, errorMsg = '', options = {}) => (
    <Form.Group className="mb-4">
      <Form.Label className="form-label"> {/* label color handled by CSS */}
        {label}
      </Form.Label>
      <InputGroup>
        <InputGroup.Text className="auth-input-group-text">
          <FontAwesomeIcon icon={icon} />
        </InputGroup.Text>
        <Form.Control
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required={required}
          isInvalid={isInvalid}
          placeholder={label.replace(' (Optional)', '')}
          className="white-placeholder auth-form-control rounded-right"
          {...options}
        />
        <Form.Control.Feedback type="invalid" style={{color: '#f87171', background: 'rgba(252, 165, 165, 0.1)', padding: '5px', borderRadius: '5px', marginTop: '5px'}}>
          {errorMsg}
        </Form.Control.Feedback>
      </InputGroup>
    </Form.Group>
  );
  
  // Helper function to render a password field
  const renderPasswordField = (name, label, value, show, toggleShow, isInvalid = false, errorMsg = '') => (
     <Form.Group className="mb-4">
      <Form.Label className="form-label"> {/* label color handled by CSS */}
        {label}
      </Form.Label>
      <InputGroup>
        <InputGroup.Text className="auth-input-group-text">
          <FontAwesomeIcon icon={faLock} />
        </InputGroup.Text>
        <Form.Control
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleChange}
          required
          isInvalid={isInvalid}
          placeholder={label}
          className="white-placeholder auth-form-control rounded-right-0"
          minLength={name === 'password' ? 6 : undefined}
        />
         <InputGroup.Text onClick={toggleShow} className="auth-password-toggle">
          <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
        </InputGroup.Text>
        <Form.Control.Feedback type="invalid" style={{color: '#f87171', background: 'rgba(252, 165, 165, 0.1)', padding: '5px', borderRadius: '5px', marginTop: '5px'}}>
          {errorMsg}
        </Form.Control.Feedback>
      </InputGroup>
    </Form.Group>
  );


  return (
    <>
  {/* Style tag removed as it is now in App.css */}
  <Container fluid className="auth-page d-flex align-items-center justify-content-center">
        <Row className="justify-content-center w-100">
          <Col md={8} lg={6}>
    <Card className="auth-card">

              <Card.Body>

                <div className="text-center mb-4">
                  <h2 className="fw-bold">WELCOME TO SLPA</h2>
                </div>
                <h3 className="text-center fw-bold mb-4">
                  {t('register.title')}
                </h3>

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      {renderFormField('username', 'text', faUser, t('register.username'), true, !!fieldErrors.username, fieldErrors.username)}
                    </Col>
                    <Col md={6}>
                      {renderFormField('email', 'email', faEnvelope, 'Email', false, !!fieldErrors.email, fieldErrors.email)}
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      {renderPasswordField('password', t('register.password'), formData.password, showPassword, () => setShowPassword(!showPassword), !!fieldErrors.password, fieldErrors.password)}
                    </Col>
                    <Col md={6}>
                      {renderPasswordField('confirmPassword', t('register.confirmPassword'), formData.confirmPassword, showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword), !!fieldErrors.confirmPassword, fieldErrors.confirmPassword)}
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      {renderFormField('institutionName', 'text', faBuilding, t('register.institutionName'), true, !!fieldErrors.institutionName, fieldErrors.institutionName)}
                    </Col>
                    <Col md={6}>
                      {renderFormField('contactNumber', 'tel', faPhone, t('register.contactNumber'), true, !!fieldErrors.contactNumber, fieldErrors.contactNumber)}
                    </Col>
                  </Row>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="auth-btn mt-3"
                  >
                    {loading ? t('common.loading') : t('register.registerButton')}
                  </Button>

                </Form>
                <div className="text-center mt-3">
                  <p style={{ fontSize: '0.9rem' }}> {/* label color handled by CSS */}
                    {t('register.haveAccount')} <Link to="/login" className="fw-bold text-white">{t('register.loginHere')}</Link>
                  </p>
                </div>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <ErrorModal
        show={showErrorModal}
        onHide={() => setShowErrorModal(false)}
        message={error}
      />
    </>
  );
};

export default Register;