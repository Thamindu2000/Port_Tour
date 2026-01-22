import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, Button, Alert, Modal } from 'react-bootstrap';
import { publicAPI, bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import LoadingSkeleton from './LoadingSkeleton';
import './LoadingSkeleton.css';
import './TableStyles.css'; // <-- ADDED THIS IMPORT
import './MissingBusReport.css'; // <-- ADDED THIS IMPORT
import { formatBusDetails, formatPersonDetails } from './TableHelpers'; // <-- ADDED THIS IMPORT

const PublicBookings = () => {
  const { t } = useTranslation();
  const { user, isClerk } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMissingBusModal, setShowMissingBusModal] = useState(false);
  const [selectedBookingForReport, setSelectedBookingForReport] = useState(null);
  const [missingBusReasons, setMissingBusReasons] = useState({});
  const [reportingMissingBus, setReportingMissingBus] = useState(false);

  useEffect(() => {
    if (isClerk()) {
      fetchClerkAcceptedBookings();
    } else {
      fetchUpcomingBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUpcomingBookings = async () => {
    setLoading(true);
    try {
      const response = await publicAPI.getPublicUpcomingBookings();
      setBookings(response.data);
    } catch (err) {
      setError(t('publicBookings.failedToFetch'));
      toast.error(t('publicBookings.failedToFetch'));
    } finally {
      setLoading(false);
    }
  };

  const toDateKey = (dateStr) => {
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch (e) {
      return dateStr;
    }
  };

  const approvedCountByDate = bookings.reduce((acc, b) => {
    const key = toDateKey(b.visitDate);
    if (!acc[key]) acc[key] = 0;
    if (b.status === 'APPROVED') acc[key] += 1;
    return acc;
  }, {});

  const fetchClerkAcceptedBookings = async () => {
    setLoading(true);
    try {
      const response = await publicAPI.getClerkAcceptedBookings();
      setBookings(response.data);
    } catch (err) {
      setError(t('publicBookings.failedToFetch'));
      toast.error(t('publicBookings.failedToFetch'));
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsByDate = async (date) => {
    if (!date) return;

    setLoading(true);
    try {
      const response = isClerk()
        ? await publicAPI.getClerkApprovedBookingsByDate(date)
        : await publicAPI.getPublicBookingsByDate(date);
      setBookings(response.data);
    } catch (err) {
      setError(t('publicBookings.failedToFetchByDate'));
      toast.error(t('publicBookings.failedToFetchByDate'));
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      fetchBookingsByDate(date);
    } else {
      if (isClerk()) {
        fetchClerkAcceptedBookings();
      } else {
        fetchUpcomingBookings();
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { variant: 'warning', text: t('publicBookings.pending') },
      APPROVED: { variant: 'success', text: t('publicBookings.approved') },
      REJECTED: { variant: 'danger', text: t('publicBookings.rejected') }
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const openMissingBusReportModal = (booking) => {
    setSelectedBookingForReport(booking);
    setMissingBusReasons({});
    setShowMissingBusModal(true);
  };

  const handleMissingBusReasonChange = (busId, reason) => {
    setMissingBusReasons(prev => ({
      ...prev,
      [busId]: reason
    }));
  };

  const submitMissingBusReport = async () => {
    if (!selectedBookingForReport || !selectedBookingForReport.busDetails) return;

    const missingBuses = Object.entries(missingBusReasons)
      .filter(([busId, reason]) => reason && reason.trim())
      .map(([busId, reason]) => ({
        busDetailsId: parseInt(busId),
        reason: reason.trim()
      }));

    if (missingBuses.length === 0) {
      toast.error('Please provide reasons for at least one missing bus');
      return;
    }

    setReportingMissingBus(true);
    try {
      await bookingAPI.reportMissingBuses(selectedBookingForReport.id, { missingBuses });
      toast.success('Missing bus report submitted successfully');
      setShowMissingBusModal(false);
      setSelectedBookingForReport(null);
      setMissingBusReasons({});
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit missing bus report';
      toast.error(errorMessage);
    } finally {
      setReportingMissingBus(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card>
            <Card.Header className="card-header-custom">
              <div className="d-flex align-items-center">
                <Logo size="small" showText={false} />
                <h3 className="mb-0 ms-3">{t('publicBookings.title')}</h3>
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Row className="mb-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>{t('publicBookings.filterByDate')}</Form.Label>
                    <Form.Control
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      if (isClerk()) {
                        fetchClerkAcceptedBookings();
                      } else {
                        fetchUpcomingBookings();
                      }
                    }}
                    disabled={loading}
                  >
                    {isClerk() ? t('My Accepted Bookings') : t('publicBookings.showAllUpcoming')}
                  </Button>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <div className="alert alert-info mb-0 w-100 text-center">
                    <strong>
                      {t('publicBookings.dailyCount', { count: bookings.length })}
                      {selectedDate && (
                        <>
                          {' '}| {t('publicBookings.approved')}: {approvedCountByDate[toDateKey(selectedDate)] || 0}
                        </>
                      )}
                    </strong>
                  </div>
                </Col>
              </Row>

              {loading ? (
                /* FIXED: Applied .table-container and .modern-table */
                <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <Table className="modern-table" style={{ position: 'relative' }}>
                    <thead style={{
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#fff',
                      zIndex: 1,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <tr>
                        <th>{t('publicBookings.institution')}</th>
                        <th>{t('publicBookings.visitDate')}</th>
                        <th>{t('publicBookings.students')}</th>
                        <th>{t('publicBookings.teachers')}</th>
                        <th>{t('publicBookings.status')}</th>
                        <th>{t('publicBookings.email')}</th>
                        <th>{t('publicBookings.purpose')}</th>
                        <th>{t('publicBookings.busDetails')}</th>
                        <th>{t('publicBookings.teacherDetails')}</th>
                        <th>{t('publicBookings.approvedVisitsDay')}</th>
                        <th>{t('publicBookings.rejectionReason')}</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <LoadingSkeleton />
                  </Table>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-5">
                  <h5>{t('publicBookings.noBookingsFound')}</h5>
                  <p>
                    {selectedDate 
                      ? t('publicBookings.noBookingsForDate', { date: new Date(selectedDate).toLocaleDateString() })
                      : t('publicBookings.noUpcomingBookings')
                    }
                  </p>
                </div>
              ) : (
                /* FIXED: Applied .table-container */
                <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {/* FIXED: Applied .modern-table */}
                  <Table className="modern-table" style={{ position: 'relative' }}>
                    <thead style={{
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#fff',
                      zIndex: 1,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <tr>
                        <th>{t('publicBookings.institution')}</th>
                        <th>{t('publicBookings.visitDate')}</th>
                        <th>{t('publicBookings.students')}</th>
                        <th>{t('publicBookings.teachers')}</th>
                        <th>{t('publicBookings.status')}</th>
                        <th>{t('publicBookings.email')}</th>
                        <th>{t('publicBookings.purpose')}</th>
                        <th>{t('publicBookings.busDetails')}</th>
                        <th>{t('publicBookings.teacherDetails')}</th>
                        <th>{t('publicBookings.approvedVisitsDay')}</th>
                        <th>{t('publicBookings.rejectionReason')}</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => {
                        const canSeeSensitiveData = user && (booking.userId === user.id || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'CLERK');
                        return (
                        <tr
                          key={booking.id}
                          style={{
                            backgroundColor: 'transparent'
                          }}
                        >
                          <td>{booking.institutionName}</td>
                          <td>{new Date(booking.visitDate).toLocaleDateString()}</td>
                          <td>{booking.numberOfStudents}</td>
                          <td>{booking.numberOfTeachers}</td>
                          <td>{getStatusBadge(booking.status)}</td>
                          <td>{canSeeSensitiveData ? booking.contactEmail : t('publicBookings.hidden')}</td>
                          <td>
                            {booking.purposeOfVisit ?
                              (booking.purposeOfVisit.length > 40 ?
                                `${booking.purposeOfVisit.substring(0, 40)}...` :
                                booking.purposeOfVisit
                              ) : t('publicBookings.na')
                            }
                          </td>
                          
                          {/* === FIXED: PUBLICBOOKINGS TAB BUS DETAILS === */}
                          <td>
                            {canSeeSensitiveData
                              ? formatBusDetails(booking.busDetails, t)
                              : t('publicBookings.hidden')
                            }
                          </td>

                          {/* === FIXED: PUBLICBOOKINGS TAB TEACHER DETAILS === */}
                          <td>
                            {canSeeSensitiveData
                              ? formatPersonDetails(booking.teachers, t('publicBookings.teacherDetails'), false, t)
                              : t('publicBookings.hidden')
                            }
                          </td>
                          
                          <td>
                            {approvedCountByDate[toDateKey(booking.visitDate)] || 0}
                          </td>
                          <td>
                            {booking.status === 'REJECTED' && booking.rejectionReason ? (
                              <small className="text-danger">{booking.rejectionReason}</small>
                            ) : '—'}
                          </td>
                          <td>
                            {isClerk() && booking.status === 'APPROVED' ? (
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => openMissingBusReportModal(booking)}
                              >
                                Report Missing Bus
                              </Button>
                            ) : '—'}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Missing Bus Report Modal */}
              <Modal show={showMissingBusModal} onHide={() => setShowMissingBusModal(false)} className="missing-bus-modal">
                <Modal.Header closeButton>
                  <Modal.Title>Report Missing Buses</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedBookingForReport && (
                    <div>
                      <div className="booking-info">
                        <h6>Institution: {selectedBookingForReport.institutionName}</h6>
                        <p>Visit Date: {new Date(selectedBookingForReport.visitDate).toLocaleDateString()}</p>
                      </div>

                      {selectedBookingForReport.busDetails && selectedBookingForReport.busDetails.length > 0 ? (
                        <div>
                          <h6>Select buses that are missing and provide reasons:</h6>
                          {selectedBookingForReport.busDetails.map((bus) => (
                            <Card key={bus.id} className="bus-card">
                              <Card.Body>
                                <div className="bus-header">
                                  <span className="bus-company">{bus.busCompany}</span>
                                  <span className="bus-number ms-2">Bus: {bus.busNumber}</span>
                                </div>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  className="reason-textarea"
                                  placeholder="Reason for missing bus..."
                                  value={missingBusReasons[bus.id] || ''}
                                  onChange={(e) => handleMissingBusReasonChange(bus.id, e.target.value)}
                                />
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p>No bus details available for this booking.</p>
                      )}
                    </div>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" className="btn-cancel" onClick={() => setShowMissingBusModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="btn-submit"
                    onClick={submitMissingBusReport}
                    disabled={reportingMissingBus || !selectedBookingForReport?.busDetails?.length}
                  >
                    {reportingMissingBus ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </Modal.Footer>
              </Modal>

              <div
                className="mt-4 p-3 rounded"
                style={{}}
              >
                <h6>{t('publicBookings.bookingInformation')}</h6>
                <ul className="mb-0">
                  <li>{t('publicBookings.maxInstitutions')}</li>
                  <li>{t('publicBookings.approvalRequired')}</li>
                  <li>{t('publicBookings.notificationEmail')}</li>
                  <li>{t('publicBookings.busDetailsRequired')}</li>
                  <li><strong>{t('publicBookings.dailyBookingsCount', { count: 0 })}</strong></li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PublicBookings;
