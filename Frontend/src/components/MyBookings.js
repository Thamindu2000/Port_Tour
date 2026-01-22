import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import LoadingSkeleton from './LoadingSkeleton';
import './LoadingSkeleton.css';
import './TableStyles.css'; // <-- ADDED THIS IMPORT
import { formatBusDetails, formatPersonDetails } from './TableHelpers'; // <-- ADDED THIS IMPORT
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [languageKey, setLanguageKey] = useState(i18n.language);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onLanguageChanged = (lng) => {
      setLanguageKey(lng);
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, [i18n]);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data);
    } catch (err) {
      setError(t('myBookings.failedToFetch'));
      toast.error(t('myBookings.failedToFetch'));
    } finally {
      setLoading(false);
    }
  };

  const handleResubmit = (booking) => {
    navigate('/booking', {
      state: {
        resubmitData: {
          ...booking,
          visitDate: new Date(booking.visitDate),
          buses: booking.busDetails || booking.buses || [],
          teachers: booking.teachers || [],
        }
      }
    });
    toast.info(t('myBookings.resubmitInfo'));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { variant: 'warning', text: t('myBookings.pending') },
      APPROVED: { variant: 'success', text: t('myBookings.approved') },
      REJECTED: { variant: 'danger', text: t('myBookings.rejected') }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <Container className="mt-5 bg-gray-50 text-gray-900 min-h-screen py-5">
        <Row>
          <Col>
            <Card className="bg-white shadow-lg border-0">
              <Card.Header
                className="bg-gray-100 text-gray-900 border-b border-gray-200"
              >
                <div className="d-flex align-items-center">
                  <Logo size="small" showText={false} />
                  <h3 className="mb-0 ms-3 text-xl font-bold">{t('myBookings.title')}</h3>
                </div>
              </Card.Header>
              <Card.Body>
                {/* FIXED: Applied .table-container and .modern-table */}
                <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <Table className="modern-table bg-white" style={{ position: 'relative' }}>
                    <thead className="bg-gray-100" style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      borderBottom: '2px solid #dee2e6'
                    }}>
                      <tr>
                        <th>{t('myBookings.visitDate')}</th>
                        <th>Selected Port</th>
                        <th>{t('myBookings.students')}</th>
                        <th>{t('myBookings.teachers')}</th>
                        <th>{t('myBookings.guardians')}</th>
                        <th>{t('myBookings.status')}</th>
                        <th>{t('myBookings.email')}</th>
                        <th>{t('myBookings.purpose')}</th>
                        <th>{t('myBookings.busDetails')}</th>
                        <th>{t('myBookings.created')}</th>
                        <th>{t('myBookings.rejectionReason')}</th>
                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                          <th>Education Institute</th>
                        )}
                        <th className="text-nowrap">{t('myBookings.actions')}</th>
                      </tr>
                    </thead>
                    <LoadingSkeleton />
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-5 bg-gray-50 text-gray-900 min-h-screen py-5">
      <Row>
        <Col>
          <Card className="bg-white shadow-lg border-0">
            <Card.Header
              className="bg-gray-100 text-gray-900 border-b border-gray-200"
            >
              <div className="d-flex align-items-center">
                <Logo size="small" showText={false} />
                <h3 className="mb-0 ms-3 text-xl font-bold">{t('myBookings.title')}</h3>
              </div>
            </Card.Header>
            <Card.Body className="text-gray-900">
              {error && <Alert variant="danger" className="bg-red-100 text-red-800 border-red-300">{error}</Alert>}

              {bookings.length === 0 ? (
                <div className="text-center py-5">
                  <h5>{t('myBookings.noBookings')}</h5>
                  <p className="text-gray-600">{t('myBookings.noBookingsDesc')}</p>
                </div>
              ) : (
                /* FIXED: Applied .table-container */
                <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {/* FIXED: Applied .modern-table */}
                  <Table className="modern-table bg-white" style={{ position: 'relative' }}>
                    <thead className="bg-gray-100" style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      borderBottom: '2px solid #dee2e6'
                    }}>
                      <tr>
                        <th>{t('myBookings.visitDate')}</th>
                        <th>Selected Port</th>
                        <th>{t('myBookings.students')}</th>
                        <th>{t('myBookings.teachers')}</th>
                        <th>{t('myBookings.guardians')}</th>
                        <th>{t('myBookings.status')}</th>
                        <th>{t('myBookings.email')}</th>
                        <th>Contact Number</th>
                        <th>{t('myBookings.purpose')}</th>
                        <th>{t('myBookings.busDetails')}</th>
                        <th>{t('myBookings.created')}</th>
                        <th>{t('myBookings.rejectionReason')}</th>
                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                          <th>Education Institute</th>
                        )}
                        <th className="text-nowrap">{t('myBookings.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td>{new Date(booking.visitDate).toLocaleDateString()}</td>
                          <td>{booking.selectedPort || 'N/A'}</td>
                          <td>{booking.numberOfStudents}</td>

                          {/* === FIXED: MYBOOKINGS TAB TEACHERS === */}
                          <td>
                            {formatPersonDetails(booking.teachers, t('myBookings.teachers'), false, t)}
                          </td>

                          {/* === FIXED: MYBOOKINGS TAB GUARDIANS === */}
                          <td>
                            {formatPersonDetails(booking.guardians, t('myBookings.guardians'), false, t)}
                          </td>

                          <td>{getStatusBadge(booking.status)}</td>
                          <td>{booking.contactEmail}</td>
                          <td><strong>{booking.contactNumber || 'N/A'}</strong></td>
                          <td>
                            {booking.purposeOfVisit ?
                              (booking.purposeOfVisit.length > 50 ?
                                `${booking.purposeOfVisit.substring(0, 50)}...` :
                                booking.purposeOfVisit
                              ) : t('myBookings.na')
                            }
                          </td>

                          {/* === FIXED: MYBOOKINGS TAB BUS DETAILS === */}
                          <td>
                            {formatBusDetails(booking.busDetails, t)}
                          </td>

                          <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                          <td>
                            {booking.status === 'REJECTED' && booking.rejectionReason ? (
                              <small className="text-red-600">{booking.rejectionReason}</small>
                            ) : '—'}
                          </td>
                          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                            <td>{booking.educationInstitute || 'N/A'}</td>
                          )}
                          <td>
                            <div className="d-flex gap-2 flex-wrap align-items-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="text-nowrap btn-modern bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                                onClick={() => {
                                  toast.info(t('myBookings.detailsComingSoon'));
                                }}
                              >
                                {t('myBookings.viewDetails')}
                              </Button>
                              {booking.attachmentFilenames && booking.attachmentFilenames.length > 0 && (
                                <div className="d-flex flex-column gap-1">
                                  {booking.attachmentFilenames.map((filename, idx) => (
                                    <Button
                                      key={idx}
                                      variant="outline-info"
                                      size="sm"
                                      className="text-nowrap btn-modern bg-cyan-50 text-cyan-700 border-cyan-300 hover:bg-cyan-100"
                                      onClick={async () => {
                                        try {
                                          const response = await bookingAPI.downloadMyAttachment(booking.id, filename);
                                          const url = window.URL.createObjectURL(new Blob([response.data]));
                                          const link = document.createElement('a');
                                          link.href = url;
                                          link.setAttribute('download', filename);
                                          document.body.appendChild(link);
                                          link.click();
                                          link.remove();
                                          window.URL.revokeObjectURL(url);
                                          toast.success(`Downloaded ${filename}`);
                                        } catch (error) {
                                          console.error('Download error:', error);
                                          toast.error('Failed to download attachment');
                                        }
                                      }}
                                    >
                                      📎 {filename.length > 15 ? `${filename.substring(0, 15)}...` : filename}
                                    </Button>
                                  ))}
                                </div>
                              )}
                              {booking.status === 'REJECTED' && (
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  className="text-nowrap btn-modern bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                                  onClick={() => handleResubmit(booking)}
                                >
                                  {t('myBookings.resubmit')}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MyBookings;
