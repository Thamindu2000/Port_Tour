import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
// eslint-disable-next-line no-unused-vars
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  ScrollReveal,
  StaggeredScrollReveal,
  TypingAnimation
} from './animations/ScrollAnimations';
import { AnimatedButton, AnimatedCard } from './animations/AnimationWrapper';
import api from '../services/api';

// Custom hook for counting animation
const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
};

const Home = () => {
  const { t } = useTranslation();
  const { user, isSuperAdmin, isAdmin, isClerk } = useAuth();
  const { openModal, isOpen } = useAuthModal();

  // eslint-disable-next-line no-unused-vars
  const [showLoader, setShowLoader] = useState(true);
  const { isDarkMode } = useTheme();
  const [statistics, setStatistics] = useState({
    students: 1500,
    teachers: 100,
    guardians: 1200,
    bussers: 50
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Animated counts
  const animatedStudents = useCountUp(statistics.students, 2000);
  const animatedTeachers = useCountUp(statistics.teachers, 2000);
  const animatedGuardians = useCountUp(statistics.guardians, 2000);
  const animatedBussers = useCountUp(statistics.bussers, 2000);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 3500); // Hide after 3.5 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await api.get('/api/public/statistics');
        setStatistics(response.data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        // Keep default values if API fails
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistics();
  }, []);



  // Video background instead of cycling images

  const heroStyle = {
    position: 'relative',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textAlign: 'center',
    backgroundColor: isDarkMode ? 'var(--bs-body-bg, #000)' : 'var(--bg-primary, #ffffff)'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.35)',
    zIndex: 1
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    maxWidth: '800px',
    padding: '0 20px'
  };

  const headingStyle = {
    fontWeight: '900',
    fontSize: '3.5rem',
    marginBottom: '20px',
    color: '#ffffff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    textAlign: 'center',
    lineHeight: '1.2',
    letterSpacing: '1px'
  };

  const subheadingStyle = {
    fontSize: '1.5rem',
    marginBottom: '30px',
    textShadow: '2px 2px 6px rgba(0,0,0,0.6)'
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center'
  };

  return (
    <div className="home-content">
      {/* Hero Section with Cover Image */}
      <div style={heroStyle}>
        <video
          autoPlay
          loop
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            filter: isDarkMode ? 'brightness(0.3) contrast(0.8)' : 'none'
          }}
        >
          <source src="/web_video_2.mp4" type="video/mp4" />
        </video>
          <div style={{...overlayStyle, display: isOpen ? 'none' : 'block'}} />
        <div style={contentStyle}>
          <ScrollReveal direction="up" delay={0.2}>
            <img
              src="/SLPA.jpg"
              alt="SLPA"
              style={{
                width: '140px',
                height: '140px',
                objectFit: 'cover',
                borderRadius: '50%',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.34)',
                margin: '0 auto 20px auto',
                display: 'block'
              }}
            />
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4}>
            <h1 style={headingStyle}>
              <TypingAnimation
                text="PORT AUTHORITY EDUCATIONAL TOUR BOOKING SYSTEM"
                speed={80}
                className="typing-text"
              />
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.6}>
            <p style={{...subheadingStyle, color: 'white', fontWeight: '600', whiteSpace: 'normal', textAlign: 'center'}}>
              Explore the fascinating world of port operations and educational tours
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.8}>
            <div style={buttonGroupStyle}>
              {(user && (isSuperAdmin() || isAdmin())) && (
                <AnimatedButton as={Link} to="/public-bookings" variant="info" size="lg" style={{ fontWeight: 'bold', fontStyle: 'italic', borderRadius: '40px', boxShadow: '0 10px 20px rgba(0,123,255,0.4)', transition: 'all 0.3s ease', padding: '16px 32px', fontSize: '1.2rem', textShadow: '1px 1px 2px rgba(0,0,0,0.3)', letterSpacing: '1px', border: 'none' }}>
                  {t('home.viewToursNow')}
                </AnimatedButton>
              )}
              {user && !isClerk() ? (
                <AnimatedButton as={Link} to="/booking" variant="success" size="lg" className="book-now-header" style={{ fontWeight: 'bold', fontStyle: 'italic', borderRadius: '40px', boxShadow: '0 10px 20px rgba(40,167,69,0.4)', transition: 'all 0.3s ease', padding: '16px 32px', fontSize: '1.2rem', textShadow: '1px 1px 2px rgba(0,0,0,0.3)', letterSpacing: '1px', border: 'none' }}>
                  {t('home.bookNow')}
                </AnimatedButton>
              ) : !user ? (
                <AnimatedButton onClick={() => openModal('signIn')} variant="success" size="lg" className="login-to-book-button" style={{ fontWeight: 'bold', fontStyle: 'italic', borderRadius: '40px', boxShadow: '0 10px 20px rgba(40,167,69,0.4)', transition: 'all 0.3s ease', padding: '16px 32px', fontSize: '1.2rem', textShadow: '1px 1px 2px rgba(0,0,0,0.3)', letterSpacing: '1px', border: 'none' }}>
                  {t('home.loginToBook')}
                </AnimatedButton>
              ) : null}
            </div>
          </ScrollReveal>
        </div>
      </div>

      <Container className="mt-5 mb-0">
        {/* Cards Section */}
        <StaggeredScrollReveal className="mb-5">
          <Row>
            <Col md={4} className="mb-4">
              <ScrollReveal direction="up" delay={0.1}>
                <AnimatedCard className="h-100 shadow border-0" style={{
                  borderRadius: '15px',
                  overflow: 'hidden',
                  minHeight: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--bs-card-bg, #ffffff)',
                  color: 'var(--bs-body-color, #1a202c)'
                }}>
                  <Card.Body className="text-center p-4 d-flex flex-column h-100">
                    <i className="bi bi-compass text-primary" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                    <Card.Title className="text-primary fw-bold">{t('home.educationalTours')}</Card.Title>
                    <Card.Text className="flex-grow-1 d-flex align-items-center">
                      {t('home.educationalToursDesc')}
                    </Card.Text>
                    {user && (isSuperAdmin() || isAdmin() || isClerk()) && (
                      <AnimatedButton as={Link} to="/public-bookings" variant="info" size="lg" className="mt-auto" style={{ fontWeight: 'bold', fontStyle: 'italic', borderRadius: '25px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }}>
                        {t('home.viewAvailableTours')}
                      </AnimatedButton>
                    )}
                  </Card.Body>
                </AnimatedCard>
              </ScrollReveal>
            </Col>

            <Col md={4} className="mb-4">
              <ScrollReveal direction="up" delay={0.2}>
                <AnimatedCard className="h-100 shadow border-0" style={{
                  borderRadius: '15px',
                  overflow: 'hidden',
                  minHeight: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--bs-card-bg, #ffffff)',
                  color: 'var(--bs-body-color, #1a202c)'
                }}>
                  <Card.Body className="text-center p-4 d-flex flex-column h-100">
                    <i className="bi bi-calendar-check text-success" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                    <Card.Title className="text-primary fw-bold">{t('home.bookYourVisit')}</Card.Title>
                    <Card.Text className="flex-grow-1 d-flex align-items-center">
                      {t('home.bookYourVisitDesc')}
                    </Card.Text>
                    {user && !isClerk() ? (
                      <AnimatedButton as={Link} to="/booking" variant="success" size="lg" className="mt-auto make-booking-card-button" style={{ fontWeight: 'bold', fontStyle: 'italic', borderRadius: '25px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }}>
                        {t('home.makeABooking')}
                      </AnimatedButton>
                    ) : (
                      <AnimatedButton onClick={() => openModal('createAccount')} variant="outline-primary" size="lg" className="mt-auto" style={{ fontWeight: 'bold', fontStyle: 'italic', borderRadius: '25px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }}>
                        {t('home.registerNow')}
                      </AnimatedButton>
                    )}
                  </Card.Body>
                </AnimatedCard>
              </ScrollReveal>
            </Col>

            <Col md={4} className="mb-4">
              <ScrollReveal direction="up" delay={0.3}>
                <AnimatedCard className="h-100 shadow border-0" style={{
                  borderRadius: '15px',
                  overflow: 'hidden',
                  minHeight: '350px',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--bs-card-bg, #ffffff)',
                  color: 'var(--bs-body-color, #1a202c)'
                }}>
                  <Card.Body className="text-center p-4 d-flex flex-column h-100">
                    <i className="bi bi-person-circle text-info" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                    <Card.Title className="text-primary fw-bold">{t('home.manageBookings')}</Card.Title>
                    <Card.Text className="flex-grow-1 d-flex align-items-center">
                      {t('home.manageBookingsDesc')}
                    </Card.Text>
                    {user && !isClerk() ? (
                      <AnimatedButton as={Link} to="/my-bookings" variant="info" size="lg" className="mt-auto my-bookings-card-button" style={{ fontWeight: 'bold', fontStyle: 'italic', borderRadius: '25px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }}>
                        {t('home.myBookings')}
                      </AnimatedButton>
                    ) : (
                      <AnimatedButton onClick={() => openModal('createAccount')} variant="outline-primary" size="lg" className="mt-auto" style={{ fontWeight: 'bold', fontStyle: 'italic', borderRadius: '25px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', transition: 'all 0.3s ease' }}>
                        {t('home.registerNow')}
                      </AnimatedButton>
                    )}
                  </Card.Body>
                </AnimatedCard>
              </ScrollReveal>
            </Col>
          </Row>
        </StaggeredScrollReveal>

        {/* Statistics Summary Section */}
          <ScrollReveal direction="up" delay={0.2}>
          <Row className="p-5 rounded shadow mb-5" style={{
            borderRadius: '15px',
            backgroundColor: 'var(--bg-secondary, #f7fafc)',
            color: 'var(--bs-body-color, #1a202c)'
          }}>
            <Col>
              <h3 className="text-center mb-4 fw-bold text-primary">{t('Statistics')}</h3>
              <Row className="justify-content-center">
                <Col xs={6} md={3} className="mb-4">
                  <AnimatedCard className="h-100 shadow border-0 text-center" style={{
                    borderRadius: '15px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: isDarkMode ? 'var(--bs-card-bg, #2d2d2d)' : '#ffffff',
                    color: isDarkMode ? 'var(--bs-body-color, #f8f9fa)' : '#1a202c'
                  }}>
                    <Card.Body className="p-4">
                      <div className={`text-4xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {loadingStats ? '...' : `${animatedStudents}+`}
                      </div>
                      <div className={`text-xl ${isDarkMode ? 'text-gray-100' : 'text-gray-600'}`}>Students</div>
                    </Card.Body>
                  </AnimatedCard>
                </Col>
                <Col xs={6} md={3} className="mb-4">
                  <AnimatedCard className="h-100 shadow border-0 text-center" style={{
                    borderRadius: '15px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: isDarkMode ? 'var(--bs-card-bg, #2d2d2d)' : '#ffffff',
                    color: isDarkMode ? 'var(--bs-body-color, #f8f9fa)' : '#1a202c'
                  }}>
                    <Card.Body className="p-4">
                      <div className={`text-4xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {loadingStats ? '...' : `${animatedTeachers}+`}
                      </div>
                      <div className={`text-xl ${isDarkMode ? 'text-gray-100' : 'text-gray-600'}`}>Teachers</div>
                    </Card.Body>
                  </AnimatedCard>
                </Col>
                <Col xs={6} md={3} className="mb-4">
                  <AnimatedCard className="h-100 shadow border-0 text-center" style={{
                    borderRadius: '15px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: isDarkMode ? 'var(--bs-card-bg, #2d2d2d)' : '#ffffff',
                    color: isDarkMode ? 'var(--bs-body-color, #f8f9fa)' : '#1a202c'
                  }}>
                    <Card.Body className="p-4">
                      <div className={`text-4xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        {loadingStats ? '...' : `${animatedGuardians}+`}
                      </div>
                      <div className={`text-xl ${isDarkMode ? 'text-gray-100' : 'text-gray-600'}`}>Guardians</div>
                    </Card.Body>
                  </AnimatedCard>
                </Col>
                <Col xs={6} md={3} className="mb-4">
                  <AnimatedCard className="h-100 shadow border-0 text-center" style={{
                    borderRadius: '15px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: isDarkMode ? 'var(--bs-card-bg, #2d2d2d)' : '#ffffff',
                    color: isDarkMode ? 'var(--bs-body-color, #f8f9fa)' : '#1a202c'
                  }}>
                    <Card.Body className="p-4">
                      <div className={`text-4xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        {loadingStats ? '...' : `${animatedBussers}+`}
                      </div>
                      <div className={`text-xl ${isDarkMode ? 'text-gray-100' : 'text-gray-600'}`}>Bussers</div>
                    </Card.Body>
                  </AnimatedCard>
                </Col>
              </Row>
            </Col>
          </Row>
        </ScrollReveal>

        {/* Tour Info Section */}
          <ScrollReveal direction="up" delay={0.2}>
          <Row className="p-5 rounded shadow mb-0" style={{
            borderRadius: '15px',
            backgroundColor: 'var(--bg-secondary, #f7fafc)',
            color: 'var(--bs-body-color, #1a202c)'
          }}>
            <Col>
              <h3 className="text-center mb-4 fw-bold text-primary">{t('home.tourInformation')}</h3>
              <Row>
                <Col md={6} className="mb-4">
                  <ScrollReveal direction="left" delay={0.3}>
                    <h5 className="fw-bold"><i className="bi bi-check-circle text-success me-2"></i>{t('home.whatToExpect')}</h5>
                    <ul className="list-unstyled">
                      <li><i className="bi bi-arrow-right text-primary me-2"></i>{t('home.guidedTour')}</li>
                      <li><i className="bi bi-arrow-right text-primary me-2"></i>{t('home.interactiveDemonstrations')}</li>
                      <li><i className="bi bi-arrow-right text-primary me-2"></i>{t('home.qaSessions')}</li>
                      <li><i className="bi bi-arrow-right text-primary me-2"></i>{t('home.educationalMaterials')}</li>
                    </ul>
                  </ScrollReveal>
                </Col>
                <Col md={6} className="mb-4">
                  <ScrollReveal direction="right" delay={0.4}>
                    <h5 className="fw-bold"><i className="bi bi-info-circle text-warning me-2"></i>{t('home.requirements')}</h5>
                    <ul className="list-unstyled">
                      <li><i className="bi bi-arrow-right text-primary me-2"></i>{t('home.maxInstitutions')}</li>
                      <li><i className="bi bi-arrow-right text-primary me-2"></i>{t('home.advanceBooking')}</li>
                      <li><i className="bi bi-arrow-right text-primary me-2"></i>{t('home.validId')}</li>
                      <li><i className="bi bi-arrow-right text-primary me-2"></i>{t('home.busDetails')}</li>
                    </ul>
                  </ScrollReveal>
                </Col>
              </Row>
            </Col>
          </Row>
        </ScrollReveal>

        {/* Who We Are Section */}
          <ScrollReveal direction="up" delay={0.2}>
          <Row className="p-5 rounded shadow mb-0" style={{
            borderRadius: '15px',
            backgroundColor: 'var(--bg-secondary, #f7fafc)',
            color: 'var(--bs-body-color, #1a202c)'
          }}>
            <Col className="text-center">
              <h2 className="mb-4 fw-bold text-primary">{t('home.whoWeAre')}</h2>
              <p className="lead mb-0" style={{ color: '#4a5568' }}>
                {t('home.whoWeAreDesc')}
              </p>
              <div className="mt-4">
                <AnimatedButton as="a" href="https://www.slpa.lk/port-colombo/slpa" target="_blank" variant="primary" size="lg" style={{ color: 'var(--bs-body-color, white)', fontWeight: 'bold', fontStyle: 'italic' }}>
                  {t('home.viewSlpa')}
                </AnimatedButton>
              </div>
            </Col>
          </Row>
        </ScrollReveal>

      </Container>

      {/* Port Video Section */}
      <div className="port-video-section">
        <video autoPlay loop muted playsInline className="port-video-player">
          <source src="/ships.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default Home;
