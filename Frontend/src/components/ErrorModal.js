import React, { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ErrorModal = ({ show, onHide, message }) => {
  // Blur background when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
      // Add a class to blur the background
      document.getElementById('root').style.filter = 'blur(5px)';
      document.getElementById('root').style.transition = 'filter 0.3s ease';
    } else {
      document.body.style.overflow = '';
      // Remove blur
      document.getElementById('root').style.filter = 'none';
    }
    return () => {
      document.body.style.overflow = '';
      // Ensure blur is removed on component unmount
      document.getElementById('root').style.filter = 'none';
    };
  }, [show]);

  // --- Styles (Glassmorphism UI) ---
  const modalStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '15px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    color: 'white',
  };

  const modalHeaderStyle = {
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
  };

  return (
    <>
      {/* Style tag for modal styling */}
      <style>
        {`
          .modal-content {
            background-color: transparent !important;
            border: none !important;
          }
          .modal-header .btn-close {
            filter: invert(1) grayscale(100%) brightness(200%);
          }
        `}
      </style>
      <Modal
        show={show}
        onHide={onHide}
        centered
        size="lg"
        backdrop={true}
        data-bs-theme="dark"
        style={{ zIndex: 9999 }}
      >
        <div style={modalStyle}>
          <Modal.Header closeButton style={modalHeaderStyle}>
            <Modal.Title>Oops!</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '2rem' }}>
            <p style={{ color: 'white', fontSize: '1.1rem' }}>{message}</p>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <Button variant="secondary" onClick={onHide} style={{ backgroundColor: '#6c757d', border: 'none' }}>
              Close
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
};

export default ErrorModal;
