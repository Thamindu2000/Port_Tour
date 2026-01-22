import React from 'react';
import { useTranslation } from 'react-i18next';

const FAQ = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>{t('faq.title', 'Frequently Asked Questions (FAQ)')}</h1>

      <section>
        <h2>{t('faq.aboutSystemTitle', 'About the System')}</h2>
        <p>{t('faq.aboutSystemDescription', 'This system allows users to book educational tours of the Port Authority facilities. Users can register, login, make bookings, view their bookings, and administrators can manage bookings.')}</p>
      </section>

      <section>
        <h2>{t('faq.commonIssuesTitle', 'Common Issues and Solutions')}</h2>
        <dl>
          <dt>{t('faq.issueRegisterLogin', 'Unable to register or login')}</dt>
          <dd>{t('faq.solutionRegisterLogin', 'Ensure you have a stable internet connection. Check that you are entering the correct credentials. If you forgot your password, use the password reset option if available.')}</dd>

          <dt>{t('faq.issueBookingForm', 'Booking form not submitting')}</dt>
          <dd>{t('faq.solutionBookingForm', 'Make sure all required fields are filled out correctly. Check for any validation error messages on the form. Refresh the page and try again.')}</dd>

          <dt>{t('faq.issueViewBookings', 'Cannot view my bookings')}</dt>
          <dd>{t('faq.solutionViewBookings', 'You must be logged in to view your bookings. If you are logged in and still cannot see your bookings, try logging out and logging back in.')}</dd>

          <dt>{t('faq.issueAdminPanel', 'Admin panel not accessible')}</dt>
          <dd>{t('faq.solutionAdminPanel', 'Only users with admin privileges can access the admin panel. If you believe you should have access, contact the system administrator.')}</dd>

          <dt>{t('faq.issueLanguageSwitcher', 'Language switcher not working')}</dt>
          <dd>{t('faq.solutionLanguageSwitcher', 'The language switcher is located below the navbar. If it does not change the language, try refreshing the page or clearing your browser cache.')}</dd>

          <dt>{t('faq.issueDarkMode', 'Dark mode toggle not working')}</dt>
          <dd>{t('faq.solutionDarkMode', 'The dark mode toggle is in the navbar. If it does not work, try refreshing the page or check your browser settings.')}</dd>
        </dl>
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>{t('faq.changeLanguage', 'Change Language')}</h2>
        <button onClick={() => changeLanguage('en')} style={{ marginRight: '10px' }}>English</button>
        <button onClick={() => changeLanguage('si')} style={{ marginRight: '10px' }}>සිංහල</button>
        <button onClick={() => changeLanguage('ta')}>தமிழ்</button>
      </section>
    </div>
  );
};

export default FAQ;
