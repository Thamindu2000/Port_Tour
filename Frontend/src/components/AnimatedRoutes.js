import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './Home';
// eslint-disable-next-line no-unused-vars
import ResetPassword from './ResetPassword';
import BookingForm from './BookingForm';
import MyBookings from './MyBookings';
import Profile from './Profile';
import AdminPanel from './AdminPanel';
import UserProfilePage from './UserProfilePage';

import PublicBookings from './PublicBookings';
import ProtectedRoute from './ProtectedRoute';
import FAQ from './FAQ';
import { pageTransition } from './animations/AnimationWrapper';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransition}
            >
              <Home />
            </motion.div>
          }
        />


        <Route
          path="/public-bookings"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransition}
            >
              <ProtectedRoute clerkAllowed={true}>
                <PublicBookings />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route
          path="/booking"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransition}
            >
              <ProtectedRoute clerkAllowed={false}>
                <BookingForm />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransition}
            >
              <ProtectedRoute clerkAllowed={false}>
                <MyBookings />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route
          path="/profile"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransition}
            >
              <ProtectedRoute clerkAllowed={false}>
                <Profile />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route
          path="/admin"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransition}
            >
              <ProtectedRoute adminOnly={false} clerkAllowed={true}>
                <AdminPanel />
              </ProtectedRoute>
            </motion.div>
          }
        />

        <Route
          path="/user-profile"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransition}
            >
              <ProtectedRoute clerkAllowed={true}>
                <UserProfilePage />
              </ProtectedRoute>
            </motion.div>
          }
        />
        <Route
          path="/faq"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageTransition}
            >
              <FAQ />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
