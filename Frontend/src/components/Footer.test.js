import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import Footer from './Footer';

const renderFooter = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    </I18nextProvider>
  );
};

describe('Footer Component', () => {
  test('renders footer with correct structure', () => {
    renderFooter();

    // Check if footer is rendered
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    // Check for logo
    const logo = screen.getByAltText('SLPA Logo');
    expect(logo).toBeInTheDocument();

    // Check for social media links
    const facebookLink = screen.getByLabelText('Facebook');
    expect(facebookLink).toBeInTheDocument();

    const twitterLink = screen.getByLabelText('X');
    expect(twitterLink).toBeInTheDocument();

    const linkedinLink = screen.getByLabelText('LinkedIn');
    expect(linkedinLink).toBeInTheDocument();

    const instagramLink = screen.getByLabelText('Instagram');
    expect(instagramLink).toBeInTheDocument();

    const youtubeLink = screen.getByLabelText('YouTube');
    expect(youtubeLink).toBeInTheDocument();

    // Check for Google Play link
    const googlePlayLink = screen.getByAltText('Get it on Google Play');
    expect(googlePlayLink).toBeInTheDocument();

    // Check for iframe with title
    const iframe = screen.getByTitle(/location/i);
    expect(iframe).toBeInTheDocument();

    // Check for copyright text
    const copyright = screen.getByText(/©/);
    expect(copyright).toBeInTheDocument();
  });

  test('renders translated text correctly', () => {
    renderFooter();

    // Check if translated text is rendered (assuming default language is English)
    expect(screen.getByText('Sri Lanka Ports Authority')).toBeInTheDocument();
  });

  test('renders all links correctly', () => {
    renderFooter();

    // Check for external links
    expect(screen.getByRole('link', { name: /read more/i })).toHaveAttribute('href', 'https://www.slpa.lk/port-colombo/slpa');

    // Check for internal link
    const slparsoaLink = screen.getByRole('link', { name: /slparsoa/i });
    expect(slparsoaLink).toHaveAttribute('href', '/slparsoa');
  });

  test('iframe has accessibility attributes', () => {
    renderFooter();

    const iframe = screen.getByTitle(/location/i);
    expect(iframe).toHaveAttribute('title');
    expect(iframe).toHaveAttribute('loading', 'lazy');
  });
});
