import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
// import { useTheme } from '../context/ThemeContext'; // Removed unused import
import { toast } from 'react-toastify';
import ErrorModal from './ErrorModal';
// import { useTranslation } from 'react-i18next'; // Removed unused import
import api from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ResetPassword = () => {
  // const { t } = useTranslation(); // Removed unused
  // const { isDarkMode } = useTheme(); // Removed unused
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
      setShowErrorModal(true);
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setShowErrorModal(true);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/api/auth/reset-password', {
        token: token,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      toast.success('Password reset successfully! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // styles moved to src/App.css (auth-page, auth-card, auth-form-control, auth-btn)


  // Helper function to render a password field
  const renderPasswordField = (name, label, value, show, toggleShow) => (
     <Form.Group className="mb-4">
      <Form.Label className="form-label">
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
          placeholder={label}
          className="white-placeholder auth-form-control rounded-right-0"
        />
         <InputGroup.Text onClick={toggleShow} className="auth-password-toggle">
          <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
        </InputGroup.Text>
      </InputGroup>
    </Form.Group>
  );

  return (
    <>
      {/* Style tag removed as it is now in App.css */}
  <Container fluid className="auth-page d-flex align-items-center justify-content-center">
        <Row className="justify-content-center w-100">
          <Col md={6} lg={4}>
            <Card className="auth-card">
              <Card.Body>
                
                <div className="text-center mb-4">
                  <h2 className="fw-bold">WELCOME TO SLPA</h2>
                </div>
                <h3 className="text-center fw-bold mb-4">Reset Password</h3>

                <Form onSubmit={handleSubmit}>
                  
                  {renderPasswordField('password', 'New Password', formData.password, showPassword, () => setShowPassword(!showPassword))}
                  
                  {renderPasswordField('confirmPassword', 'Confirm New Password', formData.confirmPassword, showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="auth-btn mt-3"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </Form>
                <div className="text-center mt-3">
                  
                  {/* --- ✅ මෙන්න නිවැරදි කළ කොටස --- */}
                  <p style={{ fontSize: '0.9rem' }}>
                    Remember your password? <Link to="/login" className="fw-bold text-white">Login here</Link>
                  </p>
                  {/* --- අර අනවශ්‍ය </a> tag එක ඉවත් කළා --- */}

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

export default ResetPassword;