import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Tabs, Tab, Modal, Form, InputGroup } from 'react-bootstrap';
import { bookingAPI, authAPI, settingsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaDownload } from 'react-icons/fa';
import Logo from './Logo';
import LoadingSkeleton from './LoadingSkeleton';
import './LoadingSkeleton.css';
import './TableStyles.css'; // Correct CSS file is imported
import { formatBusDetails, formatPersonDetails } from './TableHelpers'; // Correct helpers are imported
import MonthlySummary from './MonthlySummary';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminPanel = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const chartRef = useRef(null);

  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [adminForm, setAdminForm] = useState({
    username: '',
    email: '',
    password: '',
    contactNumber: ''
  });
  const [clerkForm, setClerkForm] = useState({
    username: '',
    password: '',
    computerNo: ''
  });
  const [footerForm, setFooterForm] = useState({
    address: '',
    phone: '',
    email: '',
    telegrams: '',
    telex: ''
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [creatingClerk, setCreatingClerk] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [summaryTotals, setSummaryTotals] = useState({
    institutions: 0,
    students: 0,
    teachers: 0,
    guardians: 0,
    buses: 0
  });
  const [pieChartData, setPieChartData] = useState(null);
  const [selectedInstitute, setSelectedInstitute] = useState('');
  const [instituteBookings, setInstituteBookings] = useState([]);
  const [uniqueInstitutes, setUniqueInstitutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartType, setChartType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [chartData, setChartData] = useState(null);
  const [summaryMonth, setSummaryMonth] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showClerkPassword, setShowClerkPassword] = useState(false);

  const [missingBusReports, setMissingBusReports] = useState([]);
  const [loadingMissingBusReports, setLoadingMissingBusReports] = useState(true);

  const [users, setUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userRoleChartData, setUserRoleChartData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [approvingBookingId, setApprovingBookingId] = useState(null);
  const [rejectingBookingId, setRejectingBookingId] = useState(null);

  const fetchAllBookings = async () => {
    try {
      const response = await bookingAPI.getAllBookings();
      setBookings(response.data);
    } catch (err) {
      setError(t('adminPanel.failedToFetchBookings'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingBookings = async () => {
    try {
      const response = await bookingAPI.getPendingBookings();
      setPendingBookings(response.data);
    } catch (err) {
      setError(t('adminPanel.failedToFetchPending'));
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchFooterSettings = async () => {
    try {
      const response = await settingsAPI.getFooterSettings();
      setFooterForm(response.data);
    } catch (err) {
      console.error('Failed to fetch footer settings', err);
    }
  };

  const fetchMissingBusReports = async () => {
    try {
      const response = await bookingAPI.getMissingBusReports();
      setMissingBusReports(response.data);
    } catch (err) {
      console.error('Failed to fetch missing bus reports', err);
    } finally {
      setLoadingMissingBusReports(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
    fetchPendingBookings();
    fetchMissingBusReports();
    fetchUsers();
    fetchFooterSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, selectedDate, searchTerm]);

  useEffect(() => {
    if ((chartType === 'monthly' && selectedMonth) || (chartType === 'yearly' && selectedYear)) {
      calculateChartData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear, chartType, bookings]);

  useEffect(() => {
    if (summaryMonth) {
      calculateSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryMonth, bookings]);

  useEffect(() => {
    calculatePieChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);





  useEffect(() => {
    // Populate unique institutes from bookings
    const institutes = [...new Set(bookings.map(booking => booking.institutionName).filter(Boolean))];
    setUniqueInstitutes(institutes);
  }, [bookings]);

  useEffect(() => {
    // Filter bookings for selected institute
    if (selectedInstitute) {
      const filtered = bookings.filter(booking => booking.institutionName === selectedInstitute);
      setInstituteBookings(filtered);
    } else {
      setInstituteBookings([]);
    }
  }, [selectedInstitute, bookings]);



  const filterBookings = () => {
    let filtered = bookings;

    if (selectedDate) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.visitDate).toISOString().split('T')[0];
        return bookingDate === selectedDate;
      });
    }

  if (searchTerm) {
    filtered = filtered.filter(booking =>
      (booking.institutionName && booking.institutionName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.contactEmail && booking.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.contactNumber && booking.contactNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.selectedPort && booking.selectedPort.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

    setFilteredBookings(filtered);
  };

  const handleDownloadAttachment = async (bookingId, filename) => {
    try {
      const response = await bookingAPI.downloadAttachment(bookingId, filename);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download attachment');
    }
  };

  const updateBookingStatus = async (bookingId, status, reason) => {
    try {
      await bookingAPI.updateBookingStatus(bookingId, status, reason ? { rejectionReason: reason } : undefined);
      toast.success(status === 'APPROVED' ? t('adminPanel.bookingApproved') : t('adminPanel.bookingRejected'));
      fetchAllBookings();
      fetchPendingBookings();
    } catch (err) {
      toast.error(t('adminPanel.failedToUpdateStatus'));
    } finally {
      if (status === 'APPROVED') {
        setApprovingBookingId(null);
      } else if (status === 'REJECTED') {
        setRejectingBookingId(null);
      }
    }
  };
  const openRejectModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedBookingId) return;
    await updateBookingStatus(selectedBookingId, 'REJECTED', rejectReason);
    setShowRejectModal(false);
    setSelectedBookingId(null);
    setRejectReason('');
  };

  const handleAdminFormChange = (e) => {
    setAdminForm({
      ...adminForm,
      [e.target.name]: e.target.value
    });
  };

  const handleClerkFormChange = (e) => {
    setClerkForm({
      ...clerkForm,
      [e.target.name]: e.target.value
    });
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      await authAPI.createAdmin(adminForm);
      toast.success(t('adminPanel.adminCreated'));
      setAdminForm({
        username: '',
        email: '',
        password: '',
        contactNumber: ''
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || t('adminPanel.failedToCreateAdmin');
      toast.error(errorMessage);
    } finally {
      setCreatingAdmin(false);
    }
  };

  const createClerk = async (e) => {
    e.preventDefault();
    setCreatingClerk(true);
    try {
      await authAPI.createClerk(clerkForm);
      toast.success('Clerk created successfully!');
      setClerkForm({
        username: '',
        password: '',
        computerNo: ''
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create clerk';
      toast.error(errorMessage);
    } finally {
      setCreatingClerk(false);
    }
  };

  const calculateChartData = () => {
    if (chartType === 'monthly' && !selectedMonth) return;
    if (chartType === 'yearly' && !selectedYear) return;

    const monthlyBgColor = 'rgba(54, 162, 235, 0.6)';
    const monthlyBorderColor = 'rgba(54, 162, 235, 1)';
    const yearlyBgColor = 'rgba(75, 192, 192, 0.6)';
    const yearlyBorderColor = 'rgba(75, 192, 192, 1)';

    let data;

    if (chartType === 'monthly') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.visitDate);
        return bookingDate.getFullYear() === year && bookingDate.getMonth() === month - 1;
      });

      const weeks = [];
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);

      for (let week = 0; week < 5; week++) {
        const weekStart = new Date(startOfMonth);
        weekStart.setDate(startOfMonth.getDate() + week * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        if (weekStart > endOfMonth) break;

        const weekBookings = monthBookings.filter(booking => {
          const bookingDate = new Date(booking.visitDate);
          return bookingDate >= weekStart && bookingDate <= weekEnd;
        });

        const approvedCount = weekBookings.filter(b => b.status === 'APPROVED').length;
        weeks.push({
          week: `Week ${week + 1}`,
          approved: approvedCount
        });
      }

      data = {
        labels: weeks.map(w => w.week),
        datasets: [{
          label: 'Approved Bookings',
          data: weeks.map(w => w.approved),
          backgroundColor: monthlyBgColor,
          borderColor: monthlyBorderColor,
          borderWidth: 1,
        }],
      };
    } else if (chartType === 'yearly') {
      const year = parseInt(selectedYear);
      const yearBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.visitDate);
        return bookingDate.getFullYear() === year;
      });

      const months = [];
      for (let month = 0; month < 12; month++) {
        const monthBookings = yearBookings.filter(booking => {
          const bookingDate = new Date(booking.visitDate);
          return bookingDate.getMonth() === month;
        });

        const approvedCount = monthBookings.filter(b => b.status === 'APPROVED').length;
        months.push({
          month: new Date(year, month).toLocaleString('default', { month: 'short' }),
          approved: approvedCount
        });
      }

      data = {
        labels: months.map(m => m.month),
        datasets: [{
          label: 'Approved Bookings',
          data: months.map(m => m.approved),
          backgroundColor: yearlyBgColor,
          borderColor: yearlyBorderColor,
          borderWidth: 1,
        }],
      };
    }

    setChartData(data);
  };

  const calculateSummary = () => {
    if (!summaryMonth) return;

    const [year, month] = summaryMonth.split('-').map(Number);
    const monthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.visitDate);
      return bookingDate.getFullYear() === year && bookingDate.getMonth() === month - 1;
    });

    const totals = {
      institutions: monthBookings.length,
      students: monthBookings.reduce((sum, b) => sum + (b.numberOfStudents || 0), 0),
      teachers: monthBookings.reduce((sum, b) => sum + (b.numberOfTeachers || 0), 0),
      guardians: monthBookings.reduce((sum, b) => sum + (Array.isArray(b.guardians) ? b.guardians.length : 0), 0),
      buses: monthBookings.reduce((sum, b) => sum + (Array.isArray(b.busDetails) ? b.busDetails.length : 0), 0)
    };

    setSummaryTotals(totals);
  };

  const calculatePieChartData = () => {
    const statusCounts = {
      APPROVED: bookings.filter(b => b.status === 'APPROVED').length,
      PENDING: bookings.filter(b => b.status === 'PENDING').length,
      REJECTED: bookings.filter(b => b.status === 'REJECTED').length
    };

    const data = {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{
        data: [statusCounts.APPROVED, statusCounts.PENDING, statusCounts.REJECTED],
        backgroundColor: [
          'rgba(25, 135, 84, 0.6)', // Green for Approved
          'rgba(255, 193, 7, 0.6)',  // Yellow for Pending
          'rgba(220, 53, 69, 0.6)'   // Red for Rejected
        ],
        borderColor: [
          'rgba(25, 135, 84, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1,
      }],
    };

    setPieChartData(data);
  };



  const downloadChartAsImage = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      const fileName = chartType === 'monthly'
        ? `booking-summary-${selectedMonth}.png`
        : `booking-summary-${selectedYear}.png`;
      link.download = fileName;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      toast.error('Failed to download chart');
    }
  };

  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);

  // Blur background when PDF viewer modal is open
  useEffect(() => {
    if (showPdfViewer) {
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
  }, [showPdfViewer]);

  // Glassmorphism style for PDF viewer modal

  const generatePDF = (bookingsToExport = null, returnBlob = false) => {
    const bookingsForPDF = bookingsToExport || bookings;
    const approvedBookings = bookingsForPDF.filter(b => b.status === 'APPROVED');
    if (approvedBookings.length === 0) {
      toast.info('No approved bookings to export');
      return;
    }

    const doc = new jsPDF();

    // Define theme-based colors
    const textColor = [0, 0, 0];
    const backgroundColor = [255, 255, 255];
    const headerFillColor = [240, 240, 240];
    const alternateRowFillColor = [250, 250, 250];

    // Set background color for the entire document
    doc.setFillColor(...backgroundColor);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

    let yPosition = 15;

    // Compact Header (Titles Centered)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('SRI LANKA PORTS AUTHORITY', 105, yPosition, { align: 'center' });
    yPosition += 6;

    doc.setFontSize(12);
    doc.text('COLOMBO PORT', 105, yPosition, { align: 'center' });
    yPosition += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Port Access & Security Division | Tel: +94 11 2441068', 14, yPosition);
    yPosition += 8;

    // Reference and Date (Left Aligned)
    doc.setFontSize(9);
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    doc.text(`Date: ${dateStr}`, 14, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Ref: SD/DCSM/PortsVisit/2025', 14, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');

    // Addressing (Left Aligned)
    doc.setFont('helvetica', 'bold');
    doc.text('TO: Security Officers, Sri Lanka Ports Authority, Colombo Port', 14, yPosition);
    yPosition += 8;

    // Subject (Left Aligned)
    doc.setFont('helvetica', 'normal');
    doc.text('SUBJECT: Permission to Visit Colombo Port - Educational Institutions', 14, yPosition);
    yPosition += 10;

    // Introduction (Left Aligned)
    doc.setFontSize(8);
    const introText = 'As per the requests submitted by the educational institutions mentioned below, permission has been granted to the said groups to visit the port on the specified dates. I am hereby informing you to take steps to issue permission as per the correct procedures for the above requirements and to instruct Gate No. 01-A to act.';
    const introLines = doc.splitTextToSize(introText, 180);
    doc.text(introLines, 14, yPosition);
    yPosition += introLines.length * 4 + 8;

    // Compact Table
    const tableData = [];
    approvedBookings.forEach((booking, index) => {
      const numGuardians = Array.isArray(booking.guardians) ? booking.guardians.length : 0;
      const numTeachers = booking.numberOfTeachers || 0;

      // Teachers details (only names, skip undefined)
      const teachersDetails = Array.isArray(booking.teachers) && booking.teachers.length > 0
        ? booking.teachers
            .filter(t => t && t.name)
            .map(t => t.name)
            .join('; ')
        : 'N/A';

      // Guardians details (only names, skip undefined)
      const guardiansDetails = Array.isArray(booking.guardians) && booking.guardians.length > 0
        ? booking.guardians
            .filter(g => g && g.name)
            .map(g => g.name)
            .join('; ')
        : 'N/A';

      // Bus details - ONLY BUS NUMBERS (no other info)
      const busDetails = Array.isArray(booking.busDetails) && booking.busDetails.length > 0
          ? booking.busDetails
              .filter(bus => bus && bus.busNumber)
              .map(bus => bus.busNumber)
              .join('; ')
        : 'N/A';

      tableData.push([
        (index + 1).toString().padStart(2, '0') + '.',
        booking.institutionName,
        booking.contactNumber || booking.institutionContactNumber || 'N/A',
        booking.numberOfStudents,
        numTeachers + numGuardians,
        teachersDetails,
        guardiansDetails,
        busDetails
      ]);
    });

    autoTable(doc, {
      head: [['NO', 'Institute', 'Contact', 'Students', 'Staff', 'Teachers', 'Guardians', 'Bus Details']],
      body: tableData,
      startY: yPosition,
      theme: 'grid',
      styles: {
        fontSize: 6,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        valign: 'top',
        textColor: textColor
      },
      headStyles: {
        fillColor: headerFillColor,
        textColor: textColor,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 7
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 16, halign: 'center' },
        3: { cellWidth: 10, halign: 'center' },
        4: { cellWidth: 10, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
        6: { cellWidth: 25, halign: 'center' },
        7: { cellWidth: 42, halign: 'center' }
      },
      alternateRowStyles: { fillColor: alternateRowFillColor },
      margin: { top: 5, left: 17.5, right: 17.5 } // Center table with equal margins
    });

    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text('Approved by:', 14, finalY);
    doc.text('Deputy Chief Security Manager', 14, finalY + 5);
    doc.text('Sri Lanka Ports Authority, Colombo Port', 14, finalY + 10);
    doc.text(`Date: ${dateStr}`, 14, finalY + 15);

    if (returnBlob) {
      return doc.output('blob');
    } else {
      const fileName = selectedDate
        ? `SLPA_Port_Visit_Booking_Summary_${selectedDate}.pdf`
        : 'SLPA_Port_Visit_Booking_Summary.pdf';
      doc.save(fileName);
    }
  };

  const handleViewPDF = async () => {
    const blob = generatePDF(filteredBookings, true);
    if (blob) {
      setPdfBlob(blob);
      setShowPdfViewer(true);
    }
  };

  const handlePrintPDF = () => {
    const blob = generatePDF(null, true);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(url);
        };
      }
    }
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

  if (loading || pendingLoading) {
    return (
      <Container className="mt-5 admin-panel">
        <Row>
          <Col>
            <Card>
              <Card.Header
                className="card-header-custom"
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 20,
                  backgroundColor: '#fff',
                  borderBottom: '1px solid #dee2e6',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div className="d-flex align-items-center">
                  <Logo size="small" showText={false} />
                  <h3 className="mb-0 ms-3">{t('adminPanel.title')}</h3>
                </div>
              </Card.Header>
              <Card.Body>
                <Tabs defaultActiveKey="pending" className="mb-4">
                  <Tab eventKey="pending" title={`${t('adminPanel.pendingBookings')} (Loading...)`}>
                  <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <Table className="modern-table" style={{ position: 'relative' }}>
                      <caption className="sr-only">Pending Bookings Table - Shows bookings awaiting approval with institution details, contact information, and approval/rejection actions</caption>
                      <thead style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        borderBottom: '2px solid #dee2e6'
                      }}>
                        <tr>
                          <th>{t('adminPanel.institution')}</th>
                          <th>{t('adminPanel.institutionContact')}</th>
                          <th>{t('adminPanel.contact')}</th>
                          <th>{t('adminPanel.email')}</th>
                          <th>{t('adminPanel.visitDate')}</th>
                          <th>Selected Port</th>
                          <th>{t('adminPanel.students')}</th>
                          <th>{t('adminPanel.teachers')}</th>
                          <th>{t('adminPanel.guardians')}</th>
                          <th>{t('adminPanel.purpose')}</th>
                            <th>{t('adminPanel.busDetails')}</th>
                            <th>Attachments</th>
<th>{t('adminPanel.created')}</th>
{(user?.role === 'SUPER_ADMIN') && (
  <th>Education Institute</th>
)}
<th>{t('adminPanel.actions')}</th>
                        </tr>
                      </thead>
                        <LoadingSkeleton rows={10} columns={14} />
                      </Table>
                    </div>
                  </Tab>
                  <Tab eventKey="all" title={`${t('adminPanel.allBookings')} (Loading...)`}>
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <h5 className="mb-0">All Bookings (Loading...)</h5>
                      </div>
                    </div>
                    <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      <Table className="modern-table" style={{ position: 'relative' }}>
                        <thead style={{
                          position: 'sticky',
                          top: 0,
                          zIndex: 1,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          <tr>
                            <th>{t('adminPanel.institution')}</th>
                            <th>{t('adminPanel.contact')}</th>
                            <th>{t('adminPanel.institutionContact')}</th>
                            <th>{t('adminPanel.email')}</th>
                            <th>{t('adminPanel.visitDate')}</th>
                            <th>Selected Port</th>
                            <th>{t('adminPanel.students')}</th>
                            <th>{t('adminPanel.teachers')}</th>
                            <th>{t('adminPanel.guardians')}</th>
                            <th>{t('myBookings.status')}</th>
                            <th>{t('adminPanel.purpose')}</th>
                            <th>Special Requirements</th>
                          <th>{t('adminPanel.busDetails')}</th>
                          <th>Attachments</th>
                          <th>{t('adminPanel.rejectionReason')}</th>
<th>{t('adminPanel.created')}</th>
{(user?.role === 'SUPER_ADMIN') && (
  <th>Education Institute</th>
)}
</tr>
                        </thead>
                        <LoadingSkeleton rows={10} columns={16} />
                      </Table>
                    </div>
                  </Tab>
                  <Tab eventKey="details" title="Booking Summary (Loading...)">
                    <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      <Table className="modern-table" style={{ position: 'relative' }}>
                        <thead style={{
                          position: 'sticky',
                          top: 0,
                          zIndex: 1,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                        <tr>
                          <th>{t('adminPanel.institution')}</th>
                          <th>{t('adminPanel.visitDate')}</th>
                          <th>Selected Port</th>
                          <th>{t('myBookings.status')}</th>
                          <th>{t('adminPanel.students')}</th>
                          <th>{t('adminPanel.teachersDetails')}</th>
                          <th>{t('adminPanel.guardiansDetails')}</th>
                          <th>{t('adminPanel.busDetails')}</th>
                          <th>Attachments</th>
<th>{t('adminPanel.contactInfo')}</th>
{(user?.role === 'ADMIN') && (
  <th>Education Institute</th>
)}
</tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 10 }, (_, i) => (
                            <LoadingSkeleton key={i} type="dataTable" />
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-5 admin-panel">
      <Row>
        <Col>
          <Card>
            <Card.Header
              className="card-header-custom"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                backgroundColor: '#fff',
                borderBottom: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div className="d-flex align-items-center">
                <Logo size="small" showText={false} />
                <h3 className="mb-0 ms-3">{t('adminPanel.title')}</h3>
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Tabs defaultActiveKey="pending" className="mb-4">
                <Tab eventKey="pending" title={`${t('adminPanel.pendingBookings')} ${pendingLoading ? '(Loading...)' : `(${pendingBookings.length})`}`}>
                  <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <Table className="modern-table" style={{ position: 'relative' }}>
                      <thead style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        borderBottom: '2px solid #dee2e6'
                      }}>
                        <tr>
                          <th>{t('adminPanel.institution')}</th>
                          <th>{t('adminPanel.institutionContact')}</th>
                          <th>{t('adminPanel.contact')}</th>
                          <th>{t('adminPanel.email')}</th>
                          <th>{t('adminPanel.visitDate')}</th>
                          <th>Selected Port</th>
                          <th>{t('adminPanel.students')}</th>
                          <th>{t('adminPanel.teachers')}</th>
                          <th>{t('adminPanel.guardians')}</th>
                          <th>{t('adminPanel.purpose')}</th>
                            <th>{t('adminPanel.busDetails')}</th>
                            <th>Attachments</th>
                            <th>{t('adminPanel.created')}</th>
                          {(user?.role === 'SUPER_ADMIN') && (
                            <th>Education Institute</th>
                          )}
                          <th>{t('adminPanel.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>{booking.institutionName}</td>
                            <td>{booking.institutionContactNumber}</td>
                            <td>{booking.contactNumber}</td>
                            <td>{booking.contactEmail}</td>
                            <td>{new Date(booking.visitDate).toLocaleDateString()}</td>
                            <td>{booking.selectedPort || 'N/A'}</td>
                            <td>{booking.numberOfStudents}</td>

                            {/* === FIXED: PENDING TAB TEACHERS === */}
                            <td>
                              {formatPersonDetails(booking.teachers, t('adminPanel.teachersLabel'), t)}
                            </td>

                            <td>
                              {formatPersonDetails(booking.guardians, t('adminPanel.guardiansLabel'), t)}
                            </td>

                            <td>
                              {booking.purposeOfVisit ?
                                (booking.purposeOfVisit.length > 30 ?
                                  `${booking.purposeOfVisit.substring(0, 30)}...` :
                                  booking.purposeOfVisit
                                ) : 'N/A'
                              }
                            </td>
                            <td>
                              {formatBusDetails(booking.busDetails, t)}
                            </td>
                            <td>
                              {booking.attachmentFilenames && booking.attachmentFilenames.length > 0 ? (
                                <div>
                                  {booking.attachmentFilenames.map((filename, i) => (
                                    <div key={i} className="mb-1">
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => handleDownloadAttachment(booking.id, filename)}
                                        style={{ padding: 0, fontSize: '0.8rem' }}
                                      >
                                        {filename}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : 'N/A'}
                            </td>
<td>{new Date(booking.createdAt).toLocaleDateString()}</td>
{(user?.role === 'SUPER_ADMIN') && (
  <td>{booking.educationInstitute || 'N/A'}</td>
)}
<td>
  <div className="d-flex gap-2" style={{ minWidth: 200 }}>
                                <Button
                                  variant="success"
                                  size="sm"
                                  className="w-50"
                                  onClick={() => { setApprovingBookingId(booking.id); updateBookingStatus(booking.id, 'APPROVED'); }}
                                  disabled={approvingBookingId === booking.id}
                                >
                                  {approvingBookingId === booking.id ? 'Approving...' : t('adminPanel.approve')}
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="w-50"
                                  onClick={() => openRejectModal(booking.id)}
                                  disabled={rejectingBookingId === booking.id}
                                >
                                  {rejectingBookingId === booking.id ? 'Rejecting...' : t('adminPanel.reject')}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

{(user?.role === 'SUPER_ADMIN') && (
  <>
    <Card className="mt-4">
      <Card.Header>{t('adminPanel.createNewAdmin')}</Card.Header>
                        <Card.Body>
                          <Form onSubmit={createAdmin}>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>{t('adminPanel.username')}</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="username"
                                    value={adminForm.username}
                                    onChange={handleAdminFormChange}
                                    required
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>{t('adminPanel.email')}</Form.Label>
                                  <Form.Control
                                    type="email"
                                    name="email"
                                    value={adminForm.email}
                                    onChange={handleAdminFormChange}
                                    required
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>{t('adminPanel.password')}</Form.Label>
                                  <InputGroup>
                                    <Form.Control
                                      type={showAdminPassword ? "text" : "password"}
                                      name="password"
                                      value={adminForm.password}
                                      onChange={handleAdminFormChange}
                                      required
                                      minLength="8"
                                      pattern="^(?=.*[A-Za-z])(?=.*[^A-Za-z0-9]).{8,}$"
                                      title="Must be at least 8 characters, including letters and symbols."
                                    />
                                    <Button
                                      variant="outline-secondary"
                                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                                    >
                                      {showAdminPassword ? "Hide" : "Show"}
                                    </Button>
                                  </InputGroup>
                                  <small className="form-text text-muted">Must be 8+ characters, including letters and symbols.</small>
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>{t('adminPanel.contactNumber')}</Form.Label>
                                  <Form.Control
                                    type="tel"
                                    name="contactNumber"
                                    value={adminForm.contactNumber}
                                    onChange={handleAdminFormChange}
                                    required
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Button type="submit" variant="primary" disabled={creatingAdmin}>
                              {creatingAdmin ? t('adminPanel.creating') : t('adminPanel.createAdministrator')}
                            </Button>
                          </Form>
                        </Card.Body>
                      </Card>

                      <Card className="mt-4">
                        <Card.Header>Create New Clerk</Card.Header>
                        <Card.Body>
                          <Form onSubmit={createClerk}>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Username</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="username"
                                    value={clerkForm.username}
                                    onChange={handleClerkFormChange}
                                    required
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Password</Form.Label>
                                  <InputGroup>
                                    <Form.Control
                                      type={showClerkPassword ? "text" : "password"}
                                      name="password"
                                      value={clerkForm.password}
                                      onChange={handleClerkFormChange}
                                      required
                                      minLength="8"
                                      pattern="^(?=.*[A-Za-z])(?=.*[^A-Za-z0-9]).{8,}$"
                                      title="Must be at least 8 characters, including letters and symbols."
                                    />
                                    <Button
                                      variant="outline-secondary"
                                      onClick={() => setShowClerkPassword(!showClerkPassword)}
                                    >
                                      {showClerkPassword ? "Hide" : "Show"}
                                    </Button>
                                  </InputGroup>
                                  <small className="form-text text-muted">Must be 8+ characters, including letters and symbols.</small>
                                </Form.Group>
                              </Col>
                            </Row>
                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Computer No</Form.Label>
                                  <Form.Control
                                    type="text"
                                    name="computerNo"
                                    value={clerkForm.computerNo}
                                    onChange={handleClerkFormChange}
                                    required
                                  />
                                </Form.Group>
                              </Col>
                            </Row>
                            <Button type="submit" variant="primary" disabled={creatingClerk}>
                              {creatingClerk ? 'Creating...' : 'Create Clerk'}
                            </Button>
                          </Form>
                        </Card.Body>
                      </Card>
                    </>
                  )}
                </Tab>
                
                <Tab eventKey="all" title={`${t('adminPanel.allBookings')} ${loading ? '(Loading...)' : `(${bookings.length})`}`}>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                    <h5 className="mb-0">All Bookings ({filteredBookings.length})</h5>
                      <InputGroup style={{ width: '200px' }}>
                        <InputGroup.Text>Filter by Date</InputGroup.Text>
                        <Form.Control
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </InputGroup>
                      {selectedDate && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setSelectedDate('')}
                        >
                          Clear Filter
                        </Button>
                      )}
                      <InputGroup style={{ width: '250px' }}>
                        <InputGroup.Text>Search</InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Institution, email, phone, port..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ color: 'black' }}
                        />
                      </InputGroup>
                      {searchTerm && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setSearchTerm('')}
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <Button variant="primary" onClick={() => generatePDF(filteredBookings)}>
                        <FaDownload /> Download PDF Summary ({filteredBookings.length} bookings)
                      </Button>
                      <Button variant="outline-primary" onClick={handleViewPDF}>
                        View PDF
                      </Button>
                      <Button variant="outline-secondary" onClick={handlePrintPDF}>
                        Print PDF
                      </Button>
                    </div>
                  </div>
                  <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <Table className="modern-table" style={{ position: 'relative' }}>
                      <thead style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <tr>
                          <th>{t('adminPanel.institution')}</th>
                          <th>{t('adminPanel.contact')}</th>
                          <th>{t('adminPanel.institutionContact')}</th>
                          <th>{t('adminPanel.email')}</th>
                          <th>{t('adminPanel.visitDate')}</th>
                          <th>Selected Port</th>
                          <th>{t('adminPanel.students')}</th>
                          <th>{t('adminPanel.teachers')}</th>
                          <th>{t('adminPanel.guardians')}</th>
                          <th>{t('myBookings.status')}</th>
                          <th>{t('adminPanel.purpose')}</th>
                          <th>Special Requirements</th>
                          <th>{t('adminPanel.busDetails')}</th>
                          <th>Attachments</th>
                          <th>{t('adminPanel.rejectionReason')}</th>
                          <th>{t('adminPanel.created')}</th>
                          {(user?.role === 'SUPER_ADMIN') && (
                            <th>Education Institute</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>{booking.institutionName}</td>
                            <td>{booking.contactNumber}</td>
                            <td>{booking.institutionContactNumber}</td>
                            <td>{booking.contactEmail}</td>
                            <td>{new Date(booking.visitDate).toLocaleDateString()}</td>
                            <td>{booking.selectedPort || 'N/A'}</td>
                            <td>{booking.numberOfStudents}</td>
                            
                            {/* === FIXED: ALL BOOKINGS TAB TEACHERS === */}
                            <td>
                              {formatPersonDetails(booking.teachers, t('adminPanel.teachersLabel'), t)}
                            </td>
                            
                            {/* === FIXED: ALL BOOKINGS TAB GUARDIANS === */}
                            <td>
                              {formatPersonDetails(booking.guardians, t('adminPanel.guardiansLabel'), t)}
                            </td>

                            <td>{getStatusBadge(booking.status)}</td>
                            <td>
                              {booking.purposeOfVisit ?
                                (booking.purposeOfVisit.length > 30 ?
                                  `${booking.purposeOfVisit.substring(0, 30)}...` :
                                  booking.purposeOfVisit
                                ) : 'N/A'
                              }
                            </td>
                            <td>
                              {booking.specialRequirements ?
                                (booking.specialRequirements.length > 30 ?
                                  `${booking.specialRequirements.substring(0, 30)}...` :
                                  booking.specialRequirements
                                ) : 'N/A'
                              }
                            </td>
                            <td>
                              {formatBusDetails(booking.busDetails, t)}
                            </td>
                            <td>
                              {booking.attachmentFilenames && booking.attachmentFilenames.length > 0 ? (
                                <div>
                                  {booking.attachmentFilenames.map((filename, i) => (
                                    <div key={i} className="mb-1">
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => handleDownloadAttachment(booking.id, filename)}
                                        style={{ padding: 0, fontSize: '0.8rem' }}
                                      >
                                        {filename}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : 'N/A'}
                            </td>
                            <td>
                              {booking.status === 'REJECTED' && booking.rejectionReason ? (
                                <small className="text-danger">{booking.rejectionReason}</small>
                              ) : '—'}
                            </td>
<td>{new Date(booking.createdAt).toLocaleDateString()}</td>
{(user?.role === 'SUPER_ADMIN') && (
  <td>{booking.educationInstitute || 'N/A'}</td>
)}
</tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Tab>

{(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
  <Tab eventKey="instituteDetails" title="Institute Details">
                    <div className="mb-3">
                      <Form.Group>
                        <Form.Label>Select Institute</Form.Label>
                        <Form.Select
                          value={selectedInstitute}
                          onChange={(e) => setSelectedInstitute(e.target.value)}
                        >
                          <option value="">Select an institute</option>
                          {uniqueInstitutes.map((institute, index) => (
                            <option key={index} value={institute}>
                              {institute}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                    {instituteBookings.length > 0 ? (
                      <div>
                        {instituteBookings.map((booking) => (
                          <Card key={booking.id} className="mb-3">
                            <Card.Header>
                              <h5>{booking.institutionName} - {new Date(booking.visitDate).toLocaleDateString()}</h5>
                              <small className="text-muted">ID: {booking.id} | Status: {getStatusBadge(booking.status)}</small>
                            </Card.Header>
                            <Card.Body>
                              <Row>
                                <Col md={4}>
                                  <h6>Bus Details</h6>
                                  {Array.isArray(booking.busDetails) && booking.busDetails.length > 0 ? (
                                    <div>
                                      {booking.busDetails.map((bus, i) => (
                                        <div key={i} className="mb-2 p-2 rounded" style={{ backgroundColor: isDarkMode ? '#343a40' : '#f8f9fa' }}>
                                          <strong>{bus.busCompany} - {bus.busNumber}</strong>
                                          <br />
                                          <small>Conductor: {bus.conductorName} ({bus.conductorNIC})</small>
                                          {bus.driverName && <><br /><small>Driver: {bus.driverName} ({bus.driverContact})</small></>}
                                          <br />
                                          <small>Capacity: {bus.busCapacity}</small>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div style={{ color: isDarkMode ? '#6c757d' : undefined }}>No bus details</div>
                                  )}
                                </Col>
                                <Col md={4}>
                                  <h6>Teacher Details</h6>
                                  {Array.isArray(booking.teachers) && booking.teachers.length > 0 ? (
                                    <div>
                                      {booking.teachers.map((teacher, i) => (
                                        <div key={i} className="mb-2 p-2 rounded" style={{ backgroundColor: isDarkMode ? '#343a40' : '#f0f8ff', borderLeft: '3px solid #0d6efd' }}>
                                          <div><strong>{i + 1}. {teacher.name || 'No name'}</strong></div>
                                          <div><small>NIC: <strong>{teacher.NIC || teacher.nic || teacher.nicNumber || teacher.nicNo || 'N/A'}</strong></small></div>
                                          {teacher.contactNumber && <div><small>Contact: <strong>{teacher.contactNumber}</strong></small></div>}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div style={{ color: isDarkMode ? '#6c757d' : undefined }}>No teachers listed</div>
                                  )}
                                </Col>
                                <Col md={4}>
                                  <h6>Guardian Details</h6>
                                  {Array.isArray(booking.guardians) && booking.guardians.length > 0 ? (
                                    <div>
                                      {booking.guardians.map((guardian, i) => (
                                        <div key={i} className="mb-2 p-2 rounded" style={{ backgroundColor: isDarkMode ? '#343a40' : '#f0fff4', borderLeft: '3px solid #198754' }}>
                                          <div><strong>{i + 1}. {guardian.name || 'No name'}</strong></div>
                                          <div><small>NIC: <strong>{guardian.NIC || guardian.nic || guardian.nicNumber || guardian.nicNo || 'N/A'}</strong></small></div>
                                          {guardian.contactNumber && <div><small>Contact: <strong>{guardian.contactNumber}</strong></small></div>}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div style={{ color: isDarkMode ? '#6c757d' : undefined }}>No guardians listed</div>
                                  )}
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    ) : selectedInstitute ? (
                      <div className="text-center text-muted">No bookings found for the selected institute.</div>
                    ) : (
                      <div className="text-center text-muted">Please select an institute to view details.</div>
                    )}
                  </Tab>
                )}

                <Tab eventKey="details" title="Booking Summary">
                  <div className="mb-3">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Chart Type</Form.Label>
                          <Form.Select
                            value={chartType}
                            onChange={(e) => {
                              setChartType(e.target.value);
                              setSelectedMonth('');
                              setSelectedYear('');
                              setChartData(null);
                            }}
                          >
                            <option value="monthly">Monthly Chart</option>
                            <option value="yearly">Yearly Chart</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        {chartType === 'monthly' ? (
                          <Form.Group>
                            <Form.Label>Select Month</Form.Label>
                            <Form.Control
                              type="month"
                              value={selectedMonth}
                              onChange={(e) => setSelectedMonth(e.target.value)}
                            />
                          </Form.Group>
                        ) : (
                          <Form.Group>
                            <Form.Label>Select Year</Form.Label>
                            <Form.Control
                              type="number"
                              min="2025"
                              max="2100"
                              value={selectedYear}
                              onChange={(e) => setSelectedYear(e.target.value)}
                              placeholder="Enter year ( eg: 2025 )"
                            />
                          </Form.Group>
                        )}
                      </Col>
                    </Row>
                  </div>

                  {user?.role === 'SUPER_ADMIN' && (
                    <div className="mb-3">
                      <Row>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Select Month for Monthly Summary</Form.Label>
                            <Form.Control
                              type="month"
                              value={summaryMonth}
                              onChange={(e) => setSummaryMonth(e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      {summaryMonth && <MonthlySummary summaryData={summaryTotals} />}
                    </div>
                  )}
                  {chartData && (
                    <div className="mb-3">
                      <Card>
                        <Card.Header>
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                              {chartType === 'monthly'
                                ? `Approved Bookings per Week - ${selectedMonth}`
                                : `Approved Bookings per Month - ${selectedYear}`
                              }
                            </h5>
                            <Button variant="outline-primary" onClick={downloadChartAsImage}>
                              Download Chart
                            </Button>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          <div ref={chartRef}>
                            <Bar
                              data={chartData}
                              options={{
                                responsive: true,
                                plugins: {
                                  legend: {
                                    position: 'top',
                                  },
                                  title: {
                                    display: true,
                                    text: `Approved Bookings for ${chartType === 'monthly' ? selectedMonth : selectedYear}`,
                                  },
                                },
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    ticks: {
                                      stepSize: 1,
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  )}

                  {pieChartData && (
                    <div className="mb-3">
                      <Card>
                        <Card.Header>
                          <h5 className="mb-0">Booking Status Distribution</h5>
                        </Card.Header>
                        <Card.Body>
                          <div style={{ maxWidth: '600px', maxHeight: '600px', margin: '0 auto' }}>
                            <Pie
                              key={JSON.stringify(pieChartData)}
                              data={pieChartData}
                              options={{
                                responsive: true,
                                plugins: {
                                  legend: {
                                    position: 'top',
                                  },
                                  title: {
                                    display: true,
                                    text: 'Overall Booking Statuses',
                                  },
                                },
                              }}
                            />
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  )}

                  <div className="mb-3">
                    <Button variant="primary" onClick={() => generatePDF(bookings)}>
                      Download PDF Summary
                    </Button>
                  </div>

                  <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <Table className="modern-table" style={{ position: 'relative' }}>
                      <thead style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <tr>
                          <th>{t('adminPanel.institution')}</th>
                          <th>{t('adminPanel.visitDate')}</th>
                          <th>Selected Port</th>
                          <th>{t('myBookings.status')}</th>
                          <th>{t('adminPanel.students')}</th>
                          <th>{t('adminPanel.teachersDetails')}</th>
                          <th>{t('adminPanel.guardiansDetails')}</th>
                          <th>{t('adminPanel.busDetails')}</th>
                          <th>Attachments</th>
                          <th>{t('adminPanel.contactInfo')}</th>
                          {(user?.role === 'SUPER_ADMIN') && (
                            <th>Education Institute</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>
                              <strong>{booking.institutionName}</strong>
                              <br/>
                              <small className="text-muted">ID: {booking.id}</small>
                            </td>
                            <td>
                              <strong>{new Date(booking.visitDate).toLocaleDateString()}</strong>
                              <br/>
                              <small className="text-muted">Created: {new Date(booking.createdAt).toLocaleDateString()}</small>
                            </td>
                            <td>{booking.selectedPort || 'N/A'}</td>
                            <td>{getStatusBadge(booking.status)}</td>
                            <td>
                              <strong>{booking.numberOfStudents}</strong> {t('adminPanel.students')}
                              <br/>
                              <strong>{booking.numberOfTeachers}</strong> {t('adminPanel.teachers')}
                            </td>
                            
                            {/* === FIXED: BOOKING SUMMARY TAB TEACHERS === */}
                            <td>
                              {formatPersonDetails(booking.teachers, t('adminPanel.teachersDetails'), t)}
                            </td>
                            
                            {/* === FIXED: BOOKING SUMMARY TAB GUARDIANS === */}
                            <td>
                              {formatPersonDetails(booking.guardians, t('adminPanel.guardiansDetails'), t)}
                            </td>
                            
                            <td>
                              {formatBusDetails(booking.busDetails, t)}
                            </td>
                            <td>
                              {booking.attachmentFilenames && booking.attachmentFilenames.length > 0 ? (
                                <div>
                                  {booking.attachmentFilenames.map((filename, i) => (
                                    <div key={i} className="mb-1">
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => handleDownloadAttachment(booking.id, filename)}
                                        style={{ padding: 0, fontSize: '0.8rem' }}
                                      >
                                        {filename}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : 'N/A'}
                            </td>
                            <td>
                              <div
                                className="p-2 rounded"
                                style={{
                                  backgroundColor: isDarkMode ? '#212529' : '#f8f9fa',
                                  color: isDarkMode ? '#f8f9fa' : undefined,
                                }}
                              >
                                <div><strong>{t('adminPanel.email')}:</strong> {booking.contactEmail || t('adminPanel.notProvided')}</div>
                                <div><strong>{t('adminPanel.phone')}:</strong> {booking.contactNumber || t('adminPanel.notProvided')}</div>
                                {booking.rejectionReason && (
                                  <div
                                    className="mt-2 p-2 rounded"
                                    style={{
                                      backgroundColor: isDarkMode ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)',
                                      color: isDarkMode ? '#f8f9fa' : undefined,
                                    }}
                                  >
                                    <strong style={{ color: isDarkMode ? '#dc3545' : undefined }}>{t('adminPanel.rejectionReason')}:</strong>
                                    <div style={{ color: isDarkMode ? '#dc3545' : undefined }}>{booking.rejectionReason}</div>
                                  </div>
                                )}
                              </div>
                            </td>
                            {(user?.role === 'SUPER_ADMIN') && (
                              <td>{booking.educationInstitute || 'N/A'}</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Tab>

{(user?.role === 'SUPER_ADMIN') && (
  <Tab eventKey="missingBusReports" title={`Missing Bus Reports ${loadingMissingBusReports ? '(Loading...)' : `(${missingBusReports.length})`}`}>
                    <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                      <Table className="modern-table" style={{ position: 'relative' }}>
                        <thead style={{
                          position: 'sticky',
                          top: 0,
                          zIndex: 1,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          <tr>
                            <th>Report ID</th>
                            <th>Booking ID</th>
                            <th>Institution</th>
                            <th>Reported By</th>
                            <th>Report Date</th>
                            <th>Visit Date</th>
                            <th>Missing Bus</th>
                            <th>Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {missingBusReports.map((report) => (
                            <tr key={report.id}>
                              <td>{report.id}</td>
                              <td>{report.bookingId}</td>
                              <td>{report.institutionName}</td>
                              <td>{report.reportedBy}</td>
                              <td>{report.reportedAt ? new Date(report.reportedAt).toLocaleDateString() : 'Invalid Date'}</td>
                              <td>{report.visitDate ? new Date(report.visitDate).toLocaleDateString() : 'Invalid Date'}</td>
                              <td>
                                <div>
                                  <small>
                                    <strong>{report.busNumber}</strong> ({report.busCompany})
                                  </small>
                                </div>
                              </td>
                              <td>
                                <small>{report.reason}</small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Tab>
                )}
              </Tabs>





              <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered className="glass-modal">
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '15px',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                  color: 'white',
                }}>
                  <Modal.Header closeButton style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}>
                    <Modal.Title>{t('adminPanel.rejectBooking')}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body style={{ padding: '2rem' }}>
                    <Form.Group>
                      <Form.Label style={{ color: 'white', fontWeight: '600' }}>{t('adminPanel.reasonForRejection')}</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder={t('adminPanel.provideBriefReason')}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                          color: 'white',
                          borderRadius: '10px',
                        }}
                      />
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  }}>
                    <Button
                      variant="secondary"
                      onClick={() => setShowRejectModal(false)}
                      style={{
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        color: 'white',
                        padding: '10px 24px',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {t('adminPanel.cancel')}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => { setRejectingBookingId(selectedBookingId); confirmReject(); }}
                      disabled={!rejectReason.trim() || rejectingBookingId === selectedBookingId}
                      style={{
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        background: '#dc3545',
                        border: 'none',
                        padding: '10px 24px',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {rejectingBookingId === selectedBookingId ? 'Rejecting...' : t('adminPanel.reject')}
                    </Button>
                  </Modal.Footer>
                </div>
              </Modal>

              <Modal show={showPdfViewer} onHide={() => setShowPdfViewer(false)} size="xl" className="pdf-modal-glass">
                <Modal.Header closeButton>
                  <Modal.Title>PDF Preview</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ height: '80vh' }}>
                  {pdfBlob && (
                    <iframe
                      src={URL.createObjectURL(pdfBlob)}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title="PDF Preview"
                    />
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowPdfViewer(false)}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={handlePrintPDF}>
                    Print PDF
                  </Button>
                </Modal.Footer>
              </Modal>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel;