import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { FaBell } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationIcon = () => {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await bookingAPI.getPendingBookingsCount();
        setPendingCount(response.data);
        if (response.data > 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      } catch (error) {
        console.error('Failed to fetch pending bookings count', error);
      }
    };

    fetchPendingCount();

    // Optionally, poll every minute
    const interval = setInterval(fetchPendingCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 15, -15, 15, -15, 0], x: [0, 2, -2, 2, -2, 0] }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'relative',
            display: 'inline-block',
            marginLeft: '10px',
            cursor: 'pointer',
            color: '#ffc107', // amber color for visibility
          }}
          title={`${pendingCount} pending bookings`}
          onClick={() => navigate('/admin')}
        >
          <FaBell size={24} />
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: 'red',
              borderRadius: '50%',
              color: 'white',
              padding: '2px 6px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {pendingCount}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationIcon;
