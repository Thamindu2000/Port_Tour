import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faBuilding, faPhone, faEye, faEyeSlash, faSpinner, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const AuthModal = () => {
  const { t } = useTranslation();
  

  const { isOpen, currentView, closeModal, switchView } = useAuthModal();
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [signInData, setSignInData] = useState({ username: '', password: '' });
  const [createAccountData, setCreateAccountData] = useState({
    username: '', email: '', password: '', confirmPassword: '', institutionName: '', contactNumber: ''
  });
  const [resetPasswordData, setResetPasswordData] = useState({ email: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [newPasswordData, setNewPasswordData] = useState({ newPassword: '', confirmNewPassword: '' });
  const [resetStep, setResetStep] = useState('email'); // 'email', 'verify', 'newPassword'
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const resetForms = () => {
    setSignInData({ username: '', password: '' });
    setCreateAccountData({ username: '', email: '', password: '', confirmPassword: '', institutionName: '', contactNumber: '' });
    setResetPasswordData({ email: '' });
    setVerificationCode('');
    setNewPasswordData({ newPassword: '', confirmNewPassword: '' });
    setResetStep('email');
    setError('');
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  const handleClose = () => {
    resetForms();
    closeModal();
  };

  const handleSwitchView = (newView) => {
    resetForms();
    switchView(newView);
  };

  // Sign In handlers (logic unchanged)
  const handleSignInChange = (e) => {
    setSignInData({ ...signInData, [e.target.name]: e.target.value });
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(signInData.username, signInData.password);
      if (result.success) {
        toast.success(t('login.successMessage') || 'Login successful!');
        handleClose();
        // Always redirect to home after successful login; clear any stored redirect path
        localStorage.removeItem('redirectAfterLogin');
        navigate('/');
      } else {
        setError('Invalid username or password. Please try again.');
        console.error('Login error:', result.error);
      }
    } catch (err) {
      setError(t('login.unexpectedError') || 'An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create Account handlers (logic unchanged)
  const handleCreateAccountChange = (e) => {
    const { name, value } = e.target;
    setCreateAccountData({ ...createAccountData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateCreateAccountForm = () => {
    const errors = {};
    if (!createAccountData.username.trim()) {
      errors.username = t('register.usernameRequired') || 'Username is required';
    } else if (createAccountData.username.length < 3) {
      errors.username = t('register.usernameMinLength') || 'Username must be at least 3 characters';
    }
    if (createAccountData.email && !/\S+@\S+\.\S+/.test(createAccountData.email)) {
      errors.email = t('register.invalidEmail') || 'Please enter a valid email address';
    }
    if (!createAccountData.password) {
      errors.password = t('register.passwordRequired') || 'Password is required';
    } else if (createAccountData.password.length < 6) {
      errors.password = t('register.passwordMinLength') || 'Password must be at least 6 characters';
    }
    if (!createAccountData.confirmPassword) {
      errors.confirmPassword = t('register.confirmPasswordRequired') || 'Please confirm your password';
    } else if (createAccountData.password !== createAccountData.confirmPassword) {
      errors.confirmPassword = t('register.passwordMismatch') || 'Passwords do not match';
    }
    if (!createAccountData.institutionName.trim()) {
      errors.institutionName = t('register.institutionRequired') || 'Institution name is required';
    }
    if (!createAccountData.contactNumber.trim()) {
      errors.contactNumber = t('register.contactRequired') || 'Contact number is required';
    } else if (!/^\d{10,15}$/.test(createAccountData.contactNumber.replace(/\D/g, ''))) {
      errors.contactNumber = t('register.invalidContact') || 'Please enter a valid contact number';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    if (!validateCreateAccountForm()) {
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...userData } = createAccountData;
      const result = await register(userData);
      if (result.success) {
        toast.success(t('register.successMessage') || 'Registration successful! Please login.');
        handleSwitchView('signIn');
      } else {
        setError(result.error || t('register.registrationFailed') || 'Registration failed. Please try again.');
        console.error('Registration error:', result.error);
      }
    } catch (err) {
      setError(t('register.unexpectedError') || 'An unexpected error occurred. Please try again later.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset Password handlers
  const handleResetPasswordChange = (e) => {
    setResetPasswordData({ ...resetPasswordData, [e.target.name]: e.target.value });
  };

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPasswordData({ ...newPasswordData, [e.target.name]: e.target.value });
  };

  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/forgot-password', {
        email: resetPasswordData.email
      });
      toast.success('Verification code sent to your email.');
      setResetStep('verify');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset code';
      setError(errorMessage);
      console.error('Send reset code error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/verify-code', {
        email: resetPasswordData.email,
        code: verificationCode
      });
      toast.success('Code verified successfully.');
      setResetStep('newPassword');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid verification code';
      setError(errorMessage);
      console.error('Verify code error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!validatePasswordStrength(newPasswordData.newPassword)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
      setLoading(false);
      return;
    }
    if (newPasswordData.newPassword !== newPasswordData.confirmNewPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      await api.post('/api/auth/reset-password', {
        email: resetPasswordData.email,
        code: verificationCode,
        newPassword: newPasswordData.newPassword
      });
      toast.success('Password reset successfully. Please sign in.');
      handleSwitchView('signIn');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Styles (Premium Glassmorphism UI) ---
  const modalStyle = {
    background: 'rgba(255, 255, 255, 0.11)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
    color: 'white',
    padding: '2px',
  };

  const inputGroupTextStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRight: 'none',
    color: 'white',
    borderTopLeftRadius: '12px',
    borderBottomLeftRadius: '12px',
    backdropFilter: 'blur(5px)',
  };

  const formControlStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderLeft: 'none',
    color: 'white',
    backdropFilter: 'blur(5px)',
  };

  const passwordToggleStyle = {
    ...inputGroupTextStyle,
    borderLeft: 'none',
    borderRight: '1px solid rgba(255, 255, 255, 0.3)',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: '12px',
    borderBottomRightRadius: '12px',
    cursor: 'pointer',
  };

  const buttonStyle = {
    fontWeight: 'bold',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #0033a0 0%, #0052cc 100%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '12px 24px',
    transition: 'all 0.3s ease',
    width: '100%',
    color: 'white',
    boxShadow: '0 4px 15px rgba(0, 51, 160, 0.3)',
  };

  const linkButtonStyle = {
    color: '#0033a0',
    textDecoration: 'none',
    fontSize: '0.9rem',
    padding: '0.25rem'
  };

  const linkButtonBoldStyle = {
    ...linkButtonStyle,
    fontWeight: 'bold',
    padding: '0',
    marginLeft: '5px'
  };
  // --- End Styles ---

  const renderSignInView = () => (
    <>
      <div className="text-center mb-4">
        <h2 className="fw-bold" style={{ color: 'white', letterSpacing: '1px' }}>WELCOME TO SLPA</h2>
      </div>
      <Form onSubmit={handleSignInSubmit}>
        <Form.Group className="mb-3">
          <Form.Label style={{ color: 'white', fontWeight: '600' }}>Username</Form.Label>
          <InputGroup>
            <InputGroup.Text style={inputGroupTextStyle}>
              <FontAwesomeIcon icon={faUser} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              name="username"
              value={signInData.username}
              onChange={handleSignInChange}
              required
              style={{...formControlStyle, borderTopRightRadius: '10px', borderBottomRightRadius: '10px'}}
              placeholder="Enter your username"
              className="white-placeholder"
            />
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label style={{ color: 'white', fontWeight: '600' }}>Password</Form.Label>
          <InputGroup>
            <InputGroup.Text style={inputGroupTextStyle}>
              <FontAwesomeIcon icon={faLock} />
            </InputGroup.Text>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={signInData.password}
              onChange={handleSignInChange}
              required
              style={{...formControlStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0}}
              placeholder="Enter your password"
              className="white-placeholder"
            />
            <InputGroup.Text
              style={passwordToggleStyle}
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100 mt-3" style={buttonStyle} disabled={loading}>
          {loading ? (
            <><FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Signing In...</>
          ) : (
            <><FontAwesomeIcon icon={faArrowRight} className="me-2" /> Sign In</>
          )}
        </Button>
      </Form>

      {error && (
        <div className="mt-3" style={{ backgroundColor: 'rgba(220, 53, 69, 0.8)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div className="text-center mt-3">
        <Button
          variant="link"
          onClick={() => handleSwitchView('resetPassword')}
          style={linkButtonStyle}
        >
          Forgot your password?
        </Button>
        <div className="mt-2" style={{ color: 'white', fontSize: '0.9rem' }}>
          <span>Don't have an account?</span>
          <Button
            variant="link"
            style={linkButtonBoldStyle}
            onClick={() => handleSwitchView('createAccount')}
          >
            Create Account
          </Button>
        </div>
      </div>
    </>
  );
  
  // Helper to render form fields in the modal
  const renderModalFormField = (name, type, icon, label, required = false, isInvalid = false, errorMsg = '', options = {}) => (
    <Form.Group className="mb-3">
      <Form.Label style={{ color: 'white', fontWeight: '600' }}>{label}</Form.Label>
      <InputGroup>
        <InputGroup.Text style={inputGroupTextStyle}>
          <FontAwesomeIcon icon={icon} />
        </InputGroup.Text>
        <Form.Control
          type={type}
          name={name}
          value={createAccountData[name]}
          onChange={handleCreateAccountChange}
          required={required}
          isInvalid={isInvalid}
          style={{...formControlStyle, borderTopRightRadius: '10px', borderBottomRightRadius: '10px'}}
          placeholder={`Enter your ${name.toLowerCase()}`}
          {...options}
        />
        <Form.Control.Feedback type="invalid" style={{color: 'white', background: 'rgba(200, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginTop: '5px'}}>
          {errorMsg}
        </Form.Control.Feedback>
      </InputGroup>
    </Form.Group>
  );

  // Helper to render password fields in the modal
  const renderModalPasswordField = (name, label, value, show, toggleShow, isInvalid = false, errorMsg = '') => (
     <Form.Group className="mb-3">
      <Form.Label style={{ color: 'white', fontWeight: '600' }}>{label}</Form.Label>
      <InputGroup>
        <InputGroup.Text style={inputGroupTextStyle}>
          <FontAwesomeIcon icon={faLock} />
        </InputGroup.Text>
        <Form.Control
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={handleCreateAccountChange}
          required
          isInvalid={isInvalid}
          style={{...formControlStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0}}
          placeholder={`Enter your ${name.toLowerCase()}`}
          minLength={name === 'password' ? 6 : undefined}
        />
         <InputGroup.Text
          onClick={toggleShow}
          style={passwordToggleStyle}
        >
          <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
        </InputGroup.Text>
        <Form.Control.Feedback type="invalid" style={{color: 'white', background: 'rgba(200, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginTop: '5px'}}>
          {errorMsg}
        </Form.Control.Feedback>
      </InputGroup>
    </Form.Group>
  );


  const renderCreateAccountView = () => (
    <>
      <div className="text-center mb-4">
        <h2 className="fw-bold" style={{ color: 'white', letterSpacing: '1px' }}>WELCOME TO SLPA</h2>
      </div>
      <Form onSubmit={handleCreateAccountSubmit}>
        <Row>
          <Col md={6}>
            {renderModalFormField('username', 'text', faUser, 'Username', true, !!fieldErrors.username, fieldErrors.username)}
          </Col>
          <Col md={6}>
            {renderModalFormField('email', 'email', faEnvelope, 'Email', false, !!fieldErrors.email, fieldErrors.email)}
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            {renderModalPasswordField('password', 'Password', createAccountData.password, showPassword, () => setShowPassword(!showPassword), !!fieldErrors.password, fieldErrors.password)}
          </Col>
          <Col md={6}>
            {renderModalPasswordField('confirmPassword', 'Confirm Password', createAccountData.confirmPassword, showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword), !!fieldErrors.confirmPassword, fieldErrors.confirmPassword)}
          </Col>
        </Row>
         <Row>
          <Col md={6}>
            {renderModalFormField('institutionName', 'text', faBuilding, 'Institution Name', true, !!fieldErrors.institutionName, fieldErrors.institutionName)}
          </Col>
          <Col md={6}>
            {renderModalFormField('contactNumber', 'tel', faPhone, 'Contact Number', true, !!fieldErrors.contactNumber, fieldErrors.contactNumber)}
          </Col>
        </Row>
        
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label={
              <span style={{ color: 'white', fontSize: '0.9rem' }}>
                I agree to the <Button variant="link" href="#" style={linkButtonBoldStyle}>Terms of Service</Button> and <Button variant="link" href="#" style={linkButtonBoldStyle}>Privacy Policy</Button>
              </span>
            }
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100 mt-3" style={buttonStyle} disabled={loading}>
          {loading ? (
            <><FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Creating Account...</>
          ) : (
            <><FontAwesomeIcon icon={faCheck} className="me-2" /> Create Account</>
          )}
        </Button>
      </Form>

      <div className="text-center mt-3" style={{ color: 'white', fontSize: '0.9rem' }}>
        <span>Already have an account? </span>
        <Button
          variant="link"
          style={linkButtonBoldStyle}
          onClick={() => handleSwitchView('signIn')}
        >
          Sign In
        </Button>
      </div>
    </>
  );

  const renderResetPasswordView = () => {
    const renderEmailStep = () => (
      <>
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: 'white', letterSpacing: '1px' }}>Reset Password</h2>
          <p style={{ color: 'white', fontSize: '0.9rem' }}>Enter your email address to receive a verification code.</p>
        </div>
        <Form onSubmit={handleSendResetCode}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: 'white', fontWeight: '600' }}>Email Address</Form.Label>
            <InputGroup>
              <InputGroup.Text style={inputGroupTextStyle}>
                <FontAwesomeIcon icon={faEnvelope} />
              </InputGroup.Text>
              <Form.Control
                type="email"
                name="email"
                value={resetPasswordData.email}
                onChange={handleResetPasswordChange}
                required
                style={{...formControlStyle, borderTopRightRadius: '10px', borderBottomRightRadius: '10px'}}
                placeholder="Enter your email"
              />
            </InputGroup>
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100 mt-3" style={buttonStyle} disabled={loading}>
            {loading ? (
              <><FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Sending...</>
            ) : (
              <><FontAwesomeIcon icon={faArrowRight} className="me-2" /> Send Verification Code</>
            )}
          </Button>
        </Form>

        {error && (
          <div className="mt-3" style={{ backgroundColor: 'rgba(220, 53, 69, 0.8)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div className="text-center mt-3" style={{ color: 'white', fontSize: '0.9rem' }}>
          <span>Remember your password? </span>
          <Button
            variant="link"
            style={linkButtonBoldStyle}
            onClick={() => handleSwitchView('signIn')}
          >
            Back to Sign In
          </Button>
        </div>
      </>
    );

    const renderVerifyStep = () => (
      <>
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: 'white', letterSpacing: '1px' }}>Verify Code</h2>
          <p style={{ color: 'white', fontSize: '0.9rem' }}>Enter the verification code sent to your email.</p>
        </div>
        <Form onSubmit={handleVerifyCode}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: 'white', fontWeight: '600' }}>Verification Code</Form.Label>
            <InputGroup>
              <InputGroup.Text style={inputGroupTextStyle}>
                <FontAwesomeIcon icon={faLock} />
              </InputGroup.Text>
              <Form.Control
                type="text"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
                required
                style={{...formControlStyle, borderTopRightRadius: '10px', borderBottomRightRadius: '10px'}}
                placeholder="Enter verification code"
              />
            </InputGroup>
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100 mt-3" style={buttonStyle} disabled={loading}>
            {loading ? (
              <><FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Verifying...</>
            ) : (
              <><FontAwesomeIcon icon={faCheck} className="me-2" /> Verify Code</>
            )}
          </Button>
        </Form>

        {error && (
          <div className="mt-3" style={{ backgroundColor: 'rgba(220, 53, 69, 0.8)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div className="text-center mt-3" style={{ color: 'white', fontSize: '0.9rem' }}>
          <Button
            variant="link"
            style={linkButtonStyle}
            onClick={() => setResetStep('email')}
          >
            Back to Email
          </Button>
        </div>
      </>
    );

    const renderNewPasswordStep = () => (
      <>
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{ color: 'white', letterSpacing: '1px' }}>New Password</h2>
          <p style={{ color: 'white', fontSize: '0.9rem' }}>Enter your new password.</p>
        </div>
        <Form onSubmit={handleResetPasswordSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: 'white', fontWeight: '600' }}>New Password</Form.Label>
            <InputGroup>
              <InputGroup.Text style={inputGroupTextStyle}>
                <FontAwesomeIcon icon={faLock} />
              </InputGroup.Text>
              <Form.Control
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={newPasswordData.newPassword}
                onChange={handleNewPasswordChange}
                required
                style={{...formControlStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0}}
                placeholder="Enter new password"
              />
              <InputGroup.Text
                style={passwordToggleStyle}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ color: 'white', fontWeight: '600' }}>Confirm New Password</Form.Label>
            <InputGroup>
              <InputGroup.Text style={inputGroupTextStyle}>
                <FontAwesomeIcon icon={faLock} />
              </InputGroup.Text>
              <Form.Control
                type={showConfirmNewPassword ? 'text' : 'password'}
                name="confirmNewPassword"
                value={newPasswordData.confirmNewPassword}
                onChange={handleNewPasswordChange}
                required
                style={{...formControlStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0}}
                placeholder="Confirm new password"
              />
              <InputGroup.Text
                style={passwordToggleStyle}
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              >
                <FontAwesomeIcon icon={showConfirmNewPassword ? faEyeSlash : faEye} />
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100 mt-3" style={buttonStyle} disabled={loading}>
            {loading ? (
              <><FontAwesomeIcon icon={faSpinner} spin className="me-2" /> Resetting...</>
            ) : (
              <><FontAwesomeIcon icon={faCheck} className="me-2" /> Reset Password</>
            )}
          </Button>
        </Form>

        {error && (
          <div className="mt-3" style={{ backgroundColor: 'rgba(220, 53, 69, 0.8)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div className="text-center mt-3" style={{ color: 'white', fontSize: '0.9rem' }}>
          <Button
            variant="link"
            style={linkButtonStyle}
            onClick={() => setResetStep('verify')}
          >
            Back to Verify
          </Button>
        </div>
      </>
    );

    switch (resetStep) {
      case 'email':
        return renderEmailStep();
      case 'verify':
        return renderVerifyStep();
      case 'newPassword':
        return renderNewPasswordStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <>
      {/* Style tag for glassmorphism effects */}
      <style>
        {`
          /* Ensure modal displays above blurred background - NO BACKDROP */
          .modal.show {
            z-index: 10001 !important;
            filter: none !important;
            background-color: transparent !important;
          }
          
          /* Remove any default modal background */
          .modal {
            background-color: transparent !important;
          }
          
          .modal-dialog {
            z-index: 10001 !important;
          }
          
          .modal-content {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            z-index: 10001 !important;
          }
          
          .modal-body {
            background-color: transparent !important;
            border: none !important;
            padding: 0 !important;
          }
          
          .modal-dialog .modal-content {
            background: rgba(255, 255, 255, 0.11) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255, 255, 255, 0.25) !important;
            border-radius: 20px !important;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 2px rgba(255, 255, 255, 0.1) !important;
          }
          .form-control.white-placeholder {
            background-color: rgba(255, 255, 255, 0.12) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            color: #ffffff !important;
          }
          .form-control.white-placeholder::placeholder {
            color: #ffffff !important;
            opacity: 0.85 !important;
          }
          .form-control.white-placeholder::-webkit-input-placeholder {
            color: #ffffff !important;
            opacity: 0.85 !important;
          }
          .form-control.white-placeholder:-ms-input-placeholder {
            color: #ffffff !important;
          }
          .form-control.white-placeholder::-ms-input-placeholder {
            color: #ffffff !important;
          }
          .modal-header .btn-close {
            filter: none;
            opacity: 0.8;
          }
          .modal-header .btn-close:hover {
            opacity: 1;
          }
          .btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 51, 160, 0.4) !important;
          }
        `}
      </style>
      {/* Dark Backdrop Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 10000
          }}
          onClick={handleClose}
        />
      )}

      <Modal
        show={isOpen}
        onHide={handleClose}
        centered
        size="lg"
        backdrop={false}
        data-bs-theme="light"
        style={{ zIndex: 10001 }}
        dialogClassName="custom-modal-dialog"
      >
        {/* Empty Modal.Body with no padding to use our custom content */}
        <Modal.Body style={{ padding: 0, border: 'none', background: 'transparent' }} className="modal-body-custom">
          <div style={modalStyle} className="custom-modal-container">
            {/* Custom Header - No Modal.Header to avoid Bootstrap dark styling */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 2rem 1rem 2rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
              background: 'transparent'
            }}>
              <h2 style={{ 
                color: 'white', 
                fontWeight: 'bold', 
                letterSpacing: '1px',
                margin: 0,
                fontSize: '1.5rem'
              }}>
                {currentView === 'signIn' ? 'Sign In' : currentView === 'createAccount' ? 'Create Account' : 'Reset Password'}
              </h2>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  opacity: 0.8,
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: 'white'
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{padding: '2rem'}}>
              {currentView === 'signIn' && renderSignInView()}
              {currentView === 'createAccount' && renderCreateAccountView()}
              {currentView === 'resetPassword' && renderResetPasswordView()}
            </div>
          </div>
        </Modal.Body>
      </Modal>


    </>
  );
};

export default AuthModal;
