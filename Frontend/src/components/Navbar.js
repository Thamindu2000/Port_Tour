import React, { useState, useEffect } from 'react';
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  NavDropdown,
  Button
} from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { useTheme } from '../context/ThemeContext';
import NotificationIcon from './NotificationIcon';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';



const Navbar = () => {
  const { user, logout, isAdmin, isClerk } = useAuth();
  const { openModal } = useAuthModal();
  const { isDarkMode, toggleTheme } = useTheme();

  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    // navigate to home and force reload to ensure no stale state remains
    window.location.href = '/';
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const isActive = (path) => location.pathname === path;

  const getWelcomeMessage = () => {
    if (!user) return null;
    switch (user.role) {
      case 'SUPER_ADMIN': return t('common.welcomeSuperAdmin');
      case 'ADMIN': return t('common.welcomeAdmin');
      case 'CLERK': return t('common.welcomeClerk');
      default: return user.institutionName || user.username;
    }
  };

  const navbarClasses = [
    'navbar-custom',
    isDarkMode ? 'dark-mode' : 'light-mode',
    'sticky-top',
    isScrolled ? 'scrolled' : ''
  ].join(' ');

  // Cache role checks to avoid repeated evaluation and reduce risk of inconsistent rendering
  const isAdminRole = isAdmin ? isAdmin() : false;
  const isClerkRole = isClerk ? isClerk() : false;

  return (
    <>
      <style>
        {`
          /* =======================
             PREMIUM TRANSPARENT NAVBAR STYLE
             ======================= */

          :root {
            --color-navy: #002b5e;
            --color-gold: #ffc107;
            --color-dark-text: #1a1a1a;
            --color-light-text: #f8f9fa;
            --color-light-bg: #ffffff;
            --color-dark-bg: #1f1f1f;
            --blur-bg-light: rgba(6, 133, 237, 0.58); /* <-- වෙනස් කරන ලද ස්ථානය */
            --blur-bg-dark: rgba(33, 33, 33, 0.65);
          }

          .navbar-custom {
            transition: all 0.35s ease-in-out;
            padding: 16px 24px;
            backdrop-filter: none;
            /* *NEW:* Ensure default bootstrap borders are reset */
            border: none !important; 
            border-radius: 0 !important;
          }

          .navbar-custom.scrolled {
            padding: 10px 24px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
          }

          /* LIGHT MODE */
          .navbar-custom.light-mode {
            background-color: var(--color-light-bg);
          }

          .navbar-custom.light-mode.scrolled {
            background-color: var(--blur-bg-light);
            box-shadow: 0 4px 15px rgba(0,0,0,0.08); /* Only show shadow on scroll */
          }
          
          /* * ========================
           * === UPDATED SECTION START ===
           * ========================
           */

          /* *ULTIMATE FIX:* Nuclear option - override ALL possible Bootstrap dark theme navbar interference */
          .navbar-custom {
            border: none !important;
            border-top: none !important;
            border-bottom: none !important;
            border-left: none !important;
            border-right: none !important;
            box-shadow: none !important;
            outline: none !important;
          }

          /* Target ALL dark mode combinations */
          .navbar-custom.dark-mode,
          [data-bs-theme="dark"] .navbar-custom,
          .dark-mode .navbar-custom,
          .navbar-custom[data-bs-theme="dark"] {
            background-color: var(--color-dark-bg) !important;
            border: none !important;
            border-top: none !important;
            border-bottom: none !important;
            border-left: none !important;
            border-right: none !important;
            box-shadow: none !important;
            outline: none !important;
          }

          .navbar-custom.dark-mode.scrolled,
          [data-bs-theme="dark"] .navbar-custom.scrolled,
          .dark-mode .navbar-custom.scrolled,
          .navbar-custom[data-bs-theme="dark"].scrolled {
            background-color: var(--blur-bg-dark) !important;
            border: none !important;
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: none !important;
            outline: none !important;
          }

          /* Override Bootstrap's base navbar styles in dark mode */
          [data-bs-theme="dark"] .navbar,
          .dark-mode .navbar {
            border: none !important;
            border-top: none !important;
            border-bottom: none !important;
            border-left: none !important;
            border-right: none !important;
            box-shadow: none !important;
            outline: none !important;
          }

          /* Override navbar-expand and navbar-collapse in dark mode */
          [data-bs-theme="dark"] .navbar-expand-lg,
          .dark-mode .navbar-expand-lg {
            border: none !important;
            box-shadow: none !important;
          }

          /* Nuclear override for any remaining borders */
          .navbar-custom::before,
          .navbar-custom::after,
          [data-bs-theme="dark"] .navbar-custom::before,
          [data-bs-theme="dark"] .navbar-custom::after {
            border: none !important;
            box-shadow: none !important;
          }

          /* * ========================
           * === UPDATED SECTION END ===
           * ========================
           */


          /* Text Colors */
          .navbar-custom.light-mode .navbar-brand-custom,
          .navbar-custom.light-mode .nav-link,
          .navbar-custom.light-mode .dropdown-toggle {
            color: var(--color-dark-text) !important;
          }

          .navbar-custom.dark-mode .navbar-brand-custom,
          .navbar-custom.dark-mode .nav-link,
          .navbar-custom.dark-mode .dropdown-toggle {
            color: var(--color-light-text) !important;
          }


          /* Hover & Active Links */
          .nav-link {
            position: relative;
            transition: color 0.3s ease;
          }

          .nav-link:hover,
          .nav-link.active {
            color: var(--color-gold) !important;
          }

          .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            left: 50%;
            bottom: -2px;
            background-color: var(--color-gold);
            transition: all 0.3s ease;
            transform: translateX(-50%);
          }

          .nav-link:hover::after,
          .nav-link.active::after {
            width: 70%;
          }

          /* Remove underline for Language dropdown and user dropdown */
          .dropdown-toggle::after,
          .user-dropdown-toggle::after {
            content: none !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Remove underline for dropdown toggles */
          .navbar-custom .dropdown-toggle::after,
          .navbar-custom .user-dropdown-toggle::after {
            content: none !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* CTA Button */
          .cta-button {
            background-color: var(--color-gold);
            color: #000;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
          }

          .cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }




          /* Dropdowns */
          .dropdown-menu {
            border-radius: 8px;
            border: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .dropdown-menu.light-mode,
          [data-bs-theme="light"] .dropdown-menu {
            background-color: var(--color-light-bg);
            color: var(--color-dark-text);
          }

          .dropdown-menu.light-mode .dropdown-item,
          [data-bs-theme="light"] .dropdown-menu .dropdown-item {
            color: var(--color-dark-text);
          }

          .dropdown-menu.light-mode .dropdown-item:hover,
          .dropdown-menu.light-mode .dropdown-item:focus,
          [data-bs-theme="light"] .dropdown-menu .dropdown-item:hover,
          [data-bs-theme="light"] .dropdown-menu .dropdown-item:focus {
            background-color: var(--color-gold);
            color: #000;
          }

          .dropdown-menu.dark-mode,
          [data-bs-theme="dark"] .dropdown-menu {
            background-color: #2a2a2a;
            color: var(--color-light-text);
          }

          .dropdown-menu.dark-mode .dropdown-item,
          [data-bs-theme="dark"] .dropdown-menu .dropdown-item {
            color: var(--color-light-text);
          }

          .dropdown-menu.dark-mode .dropdown-item:hover,
          .dropdown-menu.dark-mode .dropdown-item:focus,
          [data-bs-theme="dark"] .dropdown-menu .dropdown-item:hover,
          [data-bs-theme="dark"] .dropdown-menu .dropdown-item:focus {
            background-color: var(--color-gold);
            color: #000;
          }

          /* User Dropdown */
          .user-dropdown-toggle {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 500;
          }

          /* Smooth fade on scroll */
          .navbar-custom {
            transition: background-color 0.4s ease, padding 0.3s ease, box-shadow 0.4s ease;
          }
        `}
      </style>

      <BootstrapNavbar expand="lg" className={navbarClasses}>
        <Container fluid>
          <BootstrapNavbar.Brand
            as={Link}
            to="/"
            className="navbar-brand-custom"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <img
              src="/SLPA.jpg"
              alt="SLPA Logo"
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'cover',
                borderRadius: '5px',
                marginRight: '10px'
              }}
            />
            SLPA EDUCATIONAL VISIT
          </BootstrapNavbar.Brand>

          <BootstrapNavbar.Toggle aria-controls="navbar-content" />
          <BootstrapNavbar.Collapse id="navbar-content">
            <Nav className="me-auto nav-links">
              <Nav.Link
                as={Link}
                to="/"
                className={isActive('/') ? 'active' : ''}
                style={{
                  textTransform: 'uppercase',
                  color: isActive('/') ? undefined : '#ADD8E6'
                }}

              >
                {t('navbar.home', 'Home')}
              </Nav.Link>

              {(isAdminRole || isClerkRole) && (
                <Nav.Link as={Link} to="/public-bookings" className={isActive('/public-bookings') ? 'active' : ''}>
                  {t('navbar.viewBookings', 'View Bookings')}
                </Nav.Link>
              )}

              {user && !isClerkRole && (
                <>
                  <Nav.Link as={Link} to="/my-bookings" className={isActive('/my-bookings') ? 'active' : ''}>
                    {t('navbar.myBookings', 'My Bookings')}
                  </Nav.Link>

                  {isAdminRole && (
                    <Nav.Link as={Link} to="/admin" className={isActive('/admin') ? 'active' : ''}>
                      {t('navbar.adminPanel', 'Admin Panel')}
                    </Nav.Link>
                  )}
                </>
              )}
            </Nav>

            <Nav className="d-flex align-items-center">
              {user && !isClerkRole && (
                <Button as={Link} to="/booking" className="cta-button mx-3">
                  {t('navbar.makeBooking', 'Make Booking')}
                </Button>
              )}




              <NavDropdown title={t('navbar.language', 'Language')} align="end" className="mx-2">
                <NavDropdown.Item onClick={() => changeLanguage('en')}>English</NavDropdown.Item>
                <NavDropdown.Item onClick={() => changeLanguage('si')}>සිංහල</NavDropdown.Item>
                <NavDropdown.Item onClick={() => changeLanguage('ta')}>தமிழ்</NavDropdown.Item>
              </NavDropdown>

              <Button
                onClick={toggleTheme}
                className="mx-2"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'transform 0.3s ease'
                }}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <FaSun /> : <FaMoon />}
              </Button>

              {user && isAdminRole && (
                <div className="mx-2">
                  <NotificationIcon />
                </div>
              )}

              {user ? (
                <NavDropdown
                  title={
                    <span className="user-dropdown-toggle">
                      <FaUserCircle />
                      {getWelcomeMessage()}
                    </span>
                  }
                  align="end"
                >
                  {isAdminRole && (
                    <NavDropdown.Item as={Link} to="/profile">
                      {t('navbar.myProfile', 'My Profile')}
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Item as={Link} to="/faq">FAQ</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    {t('common.logout', 'Logout')}
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Nav.Link onClick={() => openModal('signIn')} style={{ cursor: 'pointer' }}>{t('navbar.login', 'Login')}</Nav.Link>
                  <Nav.Link onClick={() => openModal('createAccount')} style={{ cursor: 'pointer' }}>{t('navbar.register', 'Register')}</Nav.Link>
                </>
              )}
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
    </>
  );
};

export default Navbar;