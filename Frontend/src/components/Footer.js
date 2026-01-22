import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { publicAPI } from '../services/api';

const Footer = () => {
  const { t } = useTranslation();
  const [footerSettings, setFooterSettings] = useState({
    address: t('footer.address'),
    phone: t('footer.phone'),
    email: t('footer.email'),
    telegrams: t('footer.telegrams'),
    telex: t('footer.telex')
  });

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await publicAPI.getFooterSettings();
        setFooterSettings(response.data);
      } catch (error) {
        console.warn('Failed to fetch footer settings, using defaults:', error);
        // Keep default values from translation
      }
    };

    fetchFooterSettings();
  }, [t]);

  return (
    <footer className="footer bg-dark text-light py-5 mt-0">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <div className="footer-logo mb-3 d-flex align-items-center gap-2">
              <img src="/SLPA.jpg" alt="SLPA Logo" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
              <h5 className="mb-0" style={{ color: 'white' }}>{t('footer.title')}</h5>
            </div>
            <p style={{ color: '#add8e6' }}>
              {t('footer.description')}
            </p>
            <a href="https://www.slpa.lk/port-colombo/slpa" target="_blank" rel="noopener noreferrer" className="text-info">{t('footer.readMore')} &raquo;</a>
            <div className="social-icons mt-3 d-flex gap-3">
              <a href="https://www.facebook.com/slpa.lk" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-info"><i className="bi bi-facebook" style={{ fontSize: '1.5rem' }}></i></a>
              <a href="https://twitter.com/slpa_lk" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-info"><i className="bi bi-x" style={{ fontSize: '1.5rem' }}></i></a>
              <a href="https://www.linkedin.com/company/slpa-lk" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-info"><i className="bi bi-linkedin" style={{ fontSize: '1.5rem' }}></i></a>
              <a href="https://www.instagram.com/slpa.lk" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-info"><i className="bi bi-instagram" style={{ fontSize: '1.5rem' }}></i></a>
              <a href="https://www.youtube.com/slpa.lk" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-info"><i className="bi bi-youtube" style={{ fontSize: '1.5rem' }}></i></a>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <h5 className="mb-3" style={{ fontStyle: 'italic', color: 'white' }}>{t('footer.media')}</h5>
            <ul className="list-unstyled" style={{ fontStyle: 'italic' }}>
              <li><a href="https://www.slpa.lk/port-colombo/port-downloads" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.downloads')}</a></li>
              <li><a href="https://www.slpa.lk/port-colombo-list/news" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.news')}</a></li>
              <li><a href="https://www.slpa.lk/port-colombo-list/advertisements" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.advertisement')}</a></li>
            </ul>
            <a href="https://play.google.com/store/apps/details?id=slpa.app" target="_blank" rel="noopener noreferrer">
              <img src="/Google_Play-Badge-Logo.wine.png" alt="Get it on Google Play" style={{ width: '150px' }} />
            </a>
          </Col>
          <Col md={4} className="mb-4">
            <h5 className="mb-3" style={{ fontStyle: 'italic', color: 'white' }}>{t('footer.quickLinks')}</h5>
            <ul className="list-unstyled" style={{ fontStyle: 'italic' }}>
              <li><a href="https://mpma.slpa.lk/" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.mahapolaAcademy')}</a></li>
              <li><a href="https://news.slpa.lk" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.newsSlpa')}</a></li>
              <li><Link to="/slparsoa" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.slparsoa')}</Link></li>
              <li><a href="https://www.slpa.lk/port-colombo/site-index" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.siteIndex')}</a></li>
              <li><a href="https://www.slpa.lk/port-colombo/csr" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.csr')}</a></li>
              <li><a href="https://www.slpa.lk/port-colombo/faq" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.faq')}</a></li>
              <li><a href="https://www.slpa.lk/port-colombo/tariff" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.tariff')}</a></li>
              <li><a href="https://www.slpa.lk/port-colombo/opportunities" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.opportunities')}</a></li>
              <li><a href="https://www.slpa.lk/port-colombo/right-to-information" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.rti')}</a></li>
              <li><a href="https://www.slpa.lk/port-colombo/zero-tolerance-notice" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.zeroTolerance')}</a></li>
              <li><a href="https://www.slpa.lk/" target="_blank" rel="noopener noreferrer" style={{ color: '#add8e6', textDecoration: 'none' }}>{t('footer.slpaLk')}</a></li>
            </ul>
          </Col>
        </Row>
        <Row>
          <Col md={6} className="mb-4">
            <h5 className="mb-3" style={{ color: 'white' }}>{t('footer.headOffice')}</h5>
            <p style={{ color: '#add8e6' }}>
              {footerSettings.address}
            </p>
            <p style={{ color: '#add8e6' }}>
              <i className="bi bi-telephone me-2"></i> {footerSettings.phone}
            </p>
            <p style={{ color: '#add8e6' }}>
              <i className="bi bi-envelope me-2"></i> {footerSettings.email}
            </p>
            <p style={{ color: '#add8e6' }}>
              <i className="bi bi-telegram me-2"></i> {footerSettings.telegrams}
            </p>
            <p style={{ color: '#add8e6' }}>
              <i className="bi bi-telephone me-2"></i> {footerSettings.telex}
            </p>
          </Col>
          <Col md={6} className="mb-4">
            <h5 className="mb-3" style={{ color: 'white' }}>{t('footer.location')}</h5>
            <div style={{ width: '100%' }}>
              <iframe
                title={t('footer.location')}
                width="100%"
                height="300"
                frameborder="0"
                scrolling="no"
                marginheight="0"
                marginwidth="0"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.672017770857!2d79.84883407572718!3d6.9388329930689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2591605335355%3A0x6b490f2b2d0b04a9!2sGate%201A%20(Colombo%20Harbour)!5e0!3m2!1sen!2slk"
                style={{ border: '0', borderRadius: '8px' }}
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </Col>
        </Row>

        <Row className="border-top pt-3 mt-4">
          <Col className="text-center">
            <p className="mb-0 text-light small">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
