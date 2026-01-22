import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthModalProvider, useAuthModal } from './context/AuthModalContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import AnimatedRoutes from './components/AnimatedRoutes';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AIChatbot from './components/AIChatbot';
import AuthModal from './components/AuthModal';
import './App.css';
import './TableDarkModeOverrides.css';

function AppContent() {
  const { isOpen } = useAuthModal();
  return (
    <div className="App" style={isOpen ? { filter: 'blur(5px)' } : {}}>
      <Navbar />
      <div className="page-transition">
        <ScrollToTop>
          <AnimatedRoutes />
        </ScrollToTop>
      </div>
      <AIChatbot />
      <ToastContainer />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthModalProvider>
          <AppContent />
          <AuthModal />
        </AuthModalProvider>
      </ThemeProvider>
    </Router>
  );
}

// -----------------------------------------------------------------
// 🚨 මෙන්න මෙම පේළිය අනිවාර්යයෙන්ම තිබිය යුතුයි!
// -----------------------------------------------------------------
export default App;