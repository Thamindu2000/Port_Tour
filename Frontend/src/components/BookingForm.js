import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingForm.css'; // Add custom CSS for datepicker styling
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line no-unused-vars
import Logo from './Logo';
import ErrorModal from './ErrorModal';
import { bookingAPI, publicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingForm = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin } = useAuth();

  const [isDateAvailable, setIsDateAvailable] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [formData, setFormData] = useState({
    visitDate: null,
    selectedPort: '',
    numberOfStudents: '',
    numberOfTeachers: '',
    purposeOfVisit: '',
    customPurpose: '',
    specialRequirements: '',
    institutionContactNumber: '',
    contactNumber: user?.contactNumber || '',
    contactEmail: '',
    educationInstitute: '',
    guardians: [{ name: '', nic: '', contactNumber: '' }],
    buses: [
      {
        busCompany: '',
        conductorName: '',
        conductorNic: '',
        driverName: '',
        driverContact: '',
        driverLicenseNumber: '',
        busNumber: '',
        busCapacity: '',
        estimatedArrivalTime: '08:30',
        estimatedDepartureTime: '15:00',
      },
    ],
    teachers: [{ name: '', nic: '' }],
    attachments: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [languageKey, setLanguageKey] = useState(i18n.language);

  useEffect(() => {
    const onLanguageChanged = (lng) => {
      setLanguageKey(lng);
    };
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, [i18n]);

  const formatDateLocal = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.visitDate) {
        setIsDateAvailable(null);
        return;
      }
      setAvailabilityLoading(true);
      const formattedDate = formatDateLocal(formData.visitDate);
      try {
        const { data } = await publicAPI.checkAvailability(formattedDate);
        setIsDateAvailable(Boolean(data?.available));
      } catch (error) {
        console.error('Error checking availability:', error);
        setIsDateAvailable(null);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    checkAvailability();
  }, [formData.visitDate]);

  useEffect(() => {
    if (location.state?.resubmitData) {
      const resubmitData = location.state.resubmitData;
      const predefinedPurposes = ["Educational Tour", "Field Study", "Research Visit", "Training Program", "Cultural Exchange", "Other"];
      let purpose = resubmitData.purposeOfVisit || '';
      let customPurpose = resubmitData.customPurpose || '';
      if (purpose && !predefinedPurposes.includes(purpose)) {
        customPurpose = purpose;
        purpose = 'Other';
      }
      setFormData({
        visitDate: resubmitData.visitDate || null,
        selectedPort: resubmitData.selectedPort || '',
        numberOfStudents: resubmitData.numberOfStudents || '',
        numberOfTeachers: resubmitData.numberOfTeachers || '',
        purposeOfVisit: purpose,
        customPurpose: customPurpose,
        specialRequirements: resubmitData.specialRequirements || '',
        institutionContactNumber: resubmitData.institutionContactNumber || '',
        contactEmail: resubmitData.contactEmail || '',
        educationInstitute: resubmitData.educationInstitute || '',
        guardians: resubmitData.guardians && resubmitData.guardians.length > 0
          ? resubmitData.guardians.map(g => ({
              name: g.name || '',
              nic: g.nic || '',
              contactNumber: g.contactNumber || ''
            }))
          : [{ name: '', nic: '', contactNumber: '' }],
        buses: resubmitData.buses || [
          {
            busCompany: '',
            conductorName: '',
            conductorNic: '',
            driverName: '',
            driverContact: '',
            driverLicenseNumber: '',
            busNumber: '',
            busCapacity: '',
            estimatedArrivalTime: '08:30',
            estimatedDepartureTime: '15:00',
          },
        ],
        teachers: resubmitData.teachers || [{ name: '', nic: '' }],
        attachments: resubmitData.attachments || [],
      });
      toast.info('Form pre-filled with previous booking data. Please review and update as needed.');
    }
  }, [location.state]);

  // Convert 24-hour time string to 12-hour format with AM/PM
  const to12HourFormat = (time24) => {
    if (!time24) return '';
    let [hour, minute] = time24.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  };

  // Generate arrival time options starting from 8:00 AM to 3:30 PM
  const generateArrivalTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 15; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 15 && minute > 30) continue; // Max 3:30 PM
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  // Generate departure time options up to 4:30 PM, starting after arrival time
  const generateDepartureTimeOptions = (arrivalTime) => {
    const options = [];
    const [arrHour, arrMinute] = arrivalTime ? arrivalTime.split(':').map(Number) : [8, 0];
    for (let hour = 8; hour <= 16; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeInMinutes = hour * 60 + minute;
        const arrivalInMinutes = arrHour * 60 + arrMinute;
        if (timeInMinutes <= arrivalInMinutes) continue; // Departure must be after arrival
        if (hour === 16 && minute > 30) continue; // Max 4:30 PM
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const nicValid = (nic) => /^(?:[1-9]\d{11}|[1-9]\d{8}[Vv])$/.test(nic || '');

  const phoneValid = (phone) => /^0[0-9]{9}$/.test(phone || '');

  const licenseValid = (license) => /^[A-Z][0-9]{7}$/.test(license || '');

  // eslint-disable-next-line no-unused-vars
  const timeValid = (timeString) => {
    if (!timeString) return true; // Optional field

    const [hours, minutes] = timeString.split(':').map(Number);

    if (hours < 7 || hours > 18) {
      return false;
    }

    return minutes === 0 || minutes === 30;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMessage('');
  };

  const handleBusChange = (index, field, value) => {
    const updated = [...formData.buses];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, buses: updated });
    setError('');
    setSuccessMessage('');
  };

  const handleTeacherChange = (index, field, value) => {
    const updated = [...formData.teachers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, teachers: updated });
  };

  const addTeacher = () => {
    if (formData.teachers.length >= 50) {
      toast.warn('Maximum 50 teachers allowed');
      return;
    }
    setFormData({ ...formData, teachers: [...formData.teachers, { name: '', nic: '' }] });
  };

  const removeTeacher = (index) => {
    const updated = formData.teachers.filter((_, i) => i !== index);
    setFormData({ ...formData, teachers: updated.length ? updated : [{ name: '', nic: '' }] });
  };

  const addBus = () => {
    setFormData({
      ...formData,
      buses: [
        ...formData.buses,
        {
          busCompany: '',
          conductorName: '',
          conductorNic: '',
          driverName: '',
          driverContact: '',
          driverLicenseNumber: '',
          busNumber: '',
          busCapacity: '',
          estimatedArrivalTime: '08:30',
          estimatedDepartureTime: '15:00',
        },
      ],
    });
  };

  const removeBus = (index) => {
    const updated = formData.buses.filter((_, i) => i !== index);
    setFormData({ ...formData, buses: updated.length ? updated : [
      {
        busCompany: '',
        conductorName: '',
        conductorNic: '',
        driverName: '',
        driverContact: '',
        driverLicenseNumber: '',
        busNumber: '',
        busCapacity: '',
        estimatedArrivalTime: '08:30',
        estimatedDepartureTime: '15:00',
      }
    ]});
  };

  const handleGuardianChange = (index, field, value) => {
    const updated = [...formData.guardians];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, guardians: updated });
  };

  const addGuardian = () => {
    if (formData.guardians.length >= 50) {
      toast.warn('Maximum 50 guardians allowed');
      return;
    }
    setFormData({ ...formData, guardians: [...formData.guardians, { name: '', nic: '', contactNumber: '' }] });
  };

  const removeGuardian = (index) => {
    const updated = formData.guardians.filter((_, i) => i !== index);
    setFormData({ ...formData, guardians: updated.length ? updated : [{ name: '', nic: '', contactNumber: '' }] });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, attachments: [...(formData.attachments || []), ...files] });
  };

  const removeAttachment = (index) => {
    const updated = formData.attachments.filter((_, i) => i !== index);
    setFormData({ ...formData, attachments: updated });
  };

  const validateTime = (timeString, maxTime, fieldName) => {
    if (!timeString) return true; // Optional field

    const [hours, minutes] = timeString.split(':').map(Number);
    const [maxHours, maxMinutes] = maxTime.split(':').map(Number);

    const timeInMinutes = hours * 60 + minutes;
    const maxTimeInMinutes = maxHours * 60 + maxMinutes;

    if (timeInMinutes > maxTimeInMinutes) {
      throw new Error(`${fieldName} cannot be later than ${maxTime}`);
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrorModal(false);

    // Preliminary check to prevent submission if form is invalid
    const isFormInvalid = !formData.visitDate ||
      !formData.selectedPort ||
      !formData.numberOfStudents ||
      !formData.numberOfTeachers ||
      !formData.purposeOfVisit ||
      (formData.purposeOfVisit === 'Other' && !formData.customPurpose) ||
      formData.teachers.filter(teacher => teacher.name.trim() && teacher.nic.trim()).length === 0 ||
      formData.guardians.filter(guardian => guardian.name.trim() && guardian.nic.trim() && guardian.contactNumber.trim()).length === 0 ||
      formData.buses.some(bus => !bus.busCompany.trim() || !bus.conductorName.trim() || !bus.conductorNic.trim() || !bus.busNumber.trim() || !bus.busCapacity || !bus.driverName.trim() || !bus.driverContact.trim() || !bus.driverLicenseNumber.trim());

    if (isFormInvalid) {
      setError('Please fill in all required fields correctly.');
      setShowErrorModal(true);
      toast.error('Please fill in all required fields correctly.');
      return;
    }

    // Validate required fields
    if (!formData.visitDate) {
      setError('Visit Date is required');
      setShowErrorModal(true);
      toast.error('Visit Date is required');
      return;
    }
    if (!formData.selectedPort) {
      setError('Port selection is required');
      setShowErrorModal(true);
      toast.error('Port selection is required');
      return;
    }
    if (!formData.numberOfStudents || isNaN(parseInt(formData.numberOfStudents)) || parseInt(formData.numberOfStudents) <= 0) {
      setError('Number of Students must be a valid number greater than 0');
      setShowErrorModal(true);
      toast.error('Number of Students must be a valid number greater than 0');
      return;
    }
    if (!formData.numberOfTeachers || isNaN(parseInt(formData.numberOfTeachers)) || parseInt(formData.numberOfTeachers) <= 0) {
      setError('Number of Teachers must be a valid number greater than 0');
      setShowErrorModal(true);
      toast.error('Number of Teachers must be a valid number greater than 0');
      return;
    }
    if (!formData.purposeOfVisit) {
      setError('Purpose of Visit is required');
      setShowErrorModal(true);
      toast.error('Purpose of Visit is required');
      return;
    }
    if (formData.purposeOfVisit === 'Other' && !formData.customPurpose) {
      setError('Custom Purpose is required when "Other" is selected');
      setShowErrorModal(true);
      toast.error('Custom Purpose is required when "Other" is selected');
      return;
    }
    // Validate that at least one teacher with name and NIC is provided
    const validTeachers = formData.teachers.filter(teacher => teacher.name.trim() && teacher.nic.trim());
    if (validTeachers.length === 0) {
      setError('At least one teacher with name and NIC is required');
      setShowErrorModal(true);
      toast.error('At least one teacher with name and NIC is required');
      return;
    }
    // Validate that at least one guardian with name, NIC, and contact number is provided
    const validGuardians = formData.guardians.filter(guardian => guardian.name.trim() && guardian.nic.trim() && guardian.contactNumber.trim());
    if (validGuardians.length === 0) {
      setError('At least one guardian with name, NIC, and contact number is required');
      setShowErrorModal(true);
      toast.error('At least one guardian with name, NIC, and contact number is required');
      return;
    }
    // Validate bus details
    for (let i = 0; i < formData.buses.length; i++) {
      const bus = formData.buses[i];
      if (!bus.busCompany.trim()) {
        setError(`Bus ${i + 1}: Bus Company is required`);
        setShowErrorModal(true);
        toast.error(`Bus ${i + 1}: Bus Company is required`);
        return;
      }
      if (!bus.conductorName.trim()) {
        setError(`Bus ${i + 1}: Conductor Name is required`);
        setShowErrorModal(true);
        toast.error(`Bus ${i + 1}: Conductor Name is required`);
        return;
      }
      if (!bus.conductorNic.trim()) {
        setError(`Bus ${i + 1}: Conductor NIC is required`);
        setShowErrorModal(true);
        toast.error(`Bus ${i + 1}: Conductor NIC is required`);
        return;
      }
      if (!bus.busNumber.trim()) {
        setError(`Bus ${i + 1}: Bus Number is required`);
        setShowErrorModal(true);
        toast.error(`Bus ${i + 1}: Bus Number is required`);
        return;
      }
      if (!bus.busCapacity) {
        setError(`Bus ${i + 1}: Bus Capacity is required`);
        setShowErrorModal(true);
        toast.error(`Bus ${i + 1}: Bus Capacity is required`);
        return;
      }
      if (!bus.driverName.trim()) {
        setError(`Bus ${i + 1}: Driver Name is required`);
        setShowErrorModal(true);
        toast.error(`Bus ${i + 1}: Driver Name is required`);
        return;
      }
      if (!bus.driverContact.trim()) {
        setError(`Bus ${i + 1}: Driver Contact Number is required`);
        setShowErrorModal(true);
        toast.error(`Bus ${i + 1}: Driver Contact Number is required`);
        return;
      }
      if (!bus.driverLicenseNumber.trim()) {
        setError(`Bus ${i + 1}: Driver License Number is required`);
        setShowErrorModal(true);
        toast.error(`Bus ${i + 1}: Driver License Number is required`);
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Ensure required fields are valid before proceeding
      if (!formData.visitDate) {
        throw new Error('Visit Date is required');
      }
      if (!formData.selectedPort) {
        throw new Error('Port selection is required');
      }
      if (!formData.numberOfStudents || isNaN(parseInt(formData.numberOfStudents)) || parseInt(formData.numberOfStudents) < 0) {
        throw new Error('Number of Students must be a valid number greater than or equal to 0');
      }
      if (!formData.numberOfTeachers || isNaN(parseInt(formData.numberOfTeachers)) || parseInt(formData.numberOfTeachers) < 0) {
        throw new Error('Number of Teachers must be a valid number greater than or equal to 0');
      }
      if (!formData.purposeOfVisit) {
        throw new Error('Purpose of Visit is required');
      }
      if (formData.purposeOfVisit === 'Other' && !formData.customPurpose) {
        throw new Error('Custom Purpose is required when "Other" is selected');
      }
      const validTeachers = formData.teachers.filter(teacher => teacher.name.trim() && teacher.nic.trim());
      if (validTeachers.length === 0) {
        throw new Error('At least one teacher with name and NIC is required');
      }
      const validGuardians = formData.guardians.filter(guardian => guardian.name.trim() && guardian.nic.trim() && guardian.contactNumber.trim());
      if (validGuardians.length === 0) {
        throw new Error('At least one guardian with name, NIC, and contact number is required');
      }
      for (let i = 0; i < formData.buses.length; i++) {
        const bus = formData.buses[i];
        if (!bus.busCompany.trim()) {
          throw new Error(`Bus ${i + 1}: Bus Company is required`);
        }
        if (!bus.conductorName.trim()) {
          throw new Error(`Bus ${i + 1}: Conductor Name is required`);
        }
        if (!bus.conductorNic.trim()) {
          throw new Error(`Bus ${i + 1}: Conductor NIC is required`);
        }
        if (!bus.busNumber.trim()) {
          throw new Error(`Bus ${i + 1}: Bus Number is required`);
        }
        if (!bus.busCapacity) {
          throw new Error(`Bus ${i + 1}: Bus Capacity is required`);
        }
        if (!bus.driverName.trim()) {
          throw new Error(`Bus ${i + 1}: Driver Name is required`);
        }
        if (!bus.driverContact.trim()) {
          throw new Error(`Bus ${i + 1}: Driver Contact Number is required`);
        }
        if (!bus.driverLicenseNumber.trim()) {
          throw new Error(`Bus ${i + 1}: Driver License Number is required`);
        }
      }

      formData.buses.forEach((bus, index) => {
        if (bus.estimatedArrivalTime) {
          validateTime(bus.estimatedArrivalTime, '15:30', `Bus ${index + 1} arrival time`);
        }
        if (bus.estimatedDepartureTime) {
          validateTime(bus.estimatedDepartureTime, '16:30', `Bus ${index + 1} departure time`);
        }
        if (bus.estimatedArrivalTime && bus.estimatedDepartureTime) {
          const [arrH, arrM] = bus.estimatedArrivalTime.split(':').map(Number);
          const [depH, depM] = bus.estimatedDepartureTime.split(':').map(Number);
          const arrivalMinutes = arrH * 60 + arrM;
          const departureMinutes = depH * 60 + depM;
          if (departureMinutes <= arrivalMinutes) {
            throw new Error(`Bus ${index + 1} departure time must be later than arrival time`);
          }
        }
      });



      const bookingData = {
        visitDate: formatDateLocal(formData.visitDate),
        selectedPort: formData.selectedPort,
        numberOfStudents: parseInt(formData.numberOfStudents || 0) || 0,
        numberOfTeachers: parseInt(formData.numberOfTeachers || 0) || 0,
        purposeOfVisit: formData.purposeOfVisit === 'Other' ? formData.customPurpose : formData.purposeOfVisit,
        specialRequirements: formData.specialRequirements,
        institutionContactNumber: formData.institutionContactNumber?.trim() || null,
        contactNumber: formData.contactNumber?.trim() || null,
        contactEmail: formData.contactEmail?.trim() || null,
        educationInstitute: formData.educationInstitute?.trim() || null,
        buses: (formData.buses || [])
          .map(b => ({
            busCompany: b.busCompany?.trim() || '',
            conductorName: b.conductorName?.trim() || '',
            conductorNic: b.conductorNic?.trim() || '',
            driverName: b.driverName?.trim() || '',
            driverContact: b.driverContact?.trim() || '',
            driverLicenseNumber: b.driverLicenseNumber?.trim() || '',
            busNumber: b.busNumber?.trim() || '',
            busCapacity: b.busCapacity ? parseInt(b.busCapacity) : null,
            estimatedArrivalTime: b.estimatedArrivalTime || '',
            estimatedDepartureTime: b.estimatedDepartureTime || '',
          })),
        teachers: (formData.teachers || [])
          .filter(teacher => (teacher.name && teacher.name.trim()) || (teacher.nic && teacher.nic.trim()))
          .map(teacher => ({ name: teacher.name?.trim() || '', nic: teacher.nic?.trim() || '' })),
        guardians: (formData.guardians || [])
          .filter(guardian => (guardian.name && guardian.name.trim()) || (guardian.nic && guardian.nic.trim()))
          .map(guardian => ({
            name: guardian.name?.trim() || '',
            nic: guardian.nic?.trim() || '',
            contactNumber: guardian.contactNumber?.trim() || ''
          })),
      };

      await bookingAPI.createBooking(bookingData, formData.attachments);

      setSuccessMessage('Booking created successfully!');
      toast.success('Booking created successfully!');
      navigate('/my-bookings');
    } catch (err) {
      console.error('Booking error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);

      let errorMessage = 'Failed to create booking';

      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (err.response?.data?.validationErrors) {
        const validationErrors = err.response.data.validationErrors;
        const firstError = Object.values(validationErrors).find(Boolean);
        errorMessage = firstError || 'Validation failed. Please check your inputs.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setShowErrorModal(true);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Bookings must be made at least 14 days in advance
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 14);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);

  const bgStyle = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'background-image 0.8s ease-in-out',
    minHeight: '100vh'
  };

  return (
    <div style={bgStyle}>
      <Container className="pt-5 pb-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card
              className="booking-form"
              style={{
                /* === FIX: Changed light mode background to light yellow === */
                backgroundColor: 'rgba(255, 255, 224, 0.95)',
                color: 'inherit',
              }}
            >
              <Card.Header
                className="text-center"
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 20,
                  /* === FIX: Changed light mode background to light yellow === */
                  backgroundColor: 'rgba(255, 255, 224, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderBottom: '1px solid #dee2e6',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  WebkitBackdropFilter: 'blur(10px)' // Safari support
                }}
              >
                <div className="d-flex justify-content-center mb-2">
                  <img src="/SLPA.jpg" alt="SLPA" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }} />
                </div>
                <h3>{t('bookingForm.title')}</h3>
              </Card.Header>
              
              {/* === FIX: Added maxHeight and overflowY to make the card body scrollable === */}
              <Card.Body style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                {successMessage && <Alert variant="success">{successMessage}</Alert>}
                <Form onSubmit={handleSubmit}>
                  {/* Visit Date */}
                  <Form.Group className="mb-3">
                    <Form.Label>{t('bookingForm.visitDate')} *</Form.Label>
                    <div style={{ maxWidth: '250px', position: 'relative', zIndex: 10 }}>
                      <DatePicker
                        selected={formData.visitDate}
                        onChange={(date) => setFormData({ ...formData, visitDate: date })}
                        minDate={minDate}
                        maxDate={maxDate}
                        dateFormat="yyyy-MM-dd"
                        className="form-control"
                        placeholderText={t('bookingForm.selectDate')}
                        required
                        calendarClassName="custom-datepicker-calendar"
                        popperClassName="custom-datepicker-popper"
                        popperPlacement="bottom-start"
                        showPopperArrow={false}
                        wrapperClassName="datepicker-wrapper"
                      />
                    </div>
                  </Form.Group>

                  {/* Port Selection */}
                  <Form.Group className="mb-3">
                    <Form.Label>Select Port *</Form.Label>
                    <Form.Select
                      name="selectedPort"
                      value={formData.selectedPort || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a port</option>
                      <option value="Port of Colombo">Port of Colombo</option>
                      <option value="Port of Galle">Port of Galle</option>
                      <option value="Port of Trincomalee">Port of Trincomalee</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Availability Status Indicator */}
                  {formData.visitDate && (
                    <div
                      className="mt-3 p-3 rounded-lg border transition-all duration-300 ease-in-out"
                      style={{
                        maxWidth: '400px',
                        backgroundColor: availabilityLoading
                          ? 'rgba(59, 130, 246, 0.05)'
                          : isDateAvailable === true
                            ? 'rgba(34, 197, 94, 0.05)'
                            : isDateAvailable === false
                              ? 'rgba(239, 68, 68, 0.05)'
                              : 'transparent',
                        borderColor: availabilityLoading
                          ? 'rgba(59, 130, 246, 0.2)'
                          : isDateAvailable === true
                            ? 'rgba(34, 197, 94, 0.2)'
                            : isDateAvailable === false
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'transparent'
                      }}
                    >
                      {availabilityLoading && (
                        <div className="d-flex align-items-center">
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            style={{
                              color: '#3b82f6',
                              width: '1.2rem',
                              height: '1.2rem'
                            }}
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <span style={{
                            color: '#2563eb',
                            fontWeight: '500',
                            fontSize: '0.95rem'
                          }}>
                            Checking availability...
                          </span>
                        </div>
                      )}

                      {!availabilityLoading && isDateAvailable === true && (
                        <div className="d-flex align-items-center">
                          <span
                            style={{
                              fontSize: '1.5rem',
                              marginRight: '0.5rem'
                            }}
                          >
                            ✅
                          </span>
                          <div>
                            <div style={{
                              color: '#16a34a',
                              fontWeight: '600',
                              fontSize: '1rem'
                            }}>
                              Available
                            </div>
                            <div style={{
                              color: '#15803d',
                              fontSize: '0.85rem',
                              marginTop: '0.15rem'
                            }}>
                              This date is open for booking
                            </div>
                          </div>
                        </div>
                      )}

                      {!availabilityLoading && isDateAvailable === false && (
                        <div className="d-flex align-items-center">
                          <span
                            style={{
                              fontSize: '1.5rem',
                              marginRight: '0.5rem'
                            }}
                          >
                            ❌
                          </span>
                          <div>
                            <div style={{
                              color: '#dc2626',
                              fontWeight: '600',
                              fontSize: '1rem'
                            }}>
                              Not Available
                            </div>
                            <div style={{
                              color: '#b91c1c',
                              fontSize: '0.85rem',
                              marginTop: '0.15rem'
                            }}>
                              This date is fully booked. Please select another date.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Number of Students and Teachers */}
                  <Form.Group className="mb-3">
                    <Form.Label>{t('bookingForm.numberOfStudents')} *</Form.Label>
                    <Form.Control
                      type="number"
                      name="numberOfStudents"
                      value={formData.numberOfStudents}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('bookingForm.numberOfTeachers')} *</Form.Label>
                    <Form.Control
                      type="number"
                      name="numberOfTeachers"
                      value={formData.numberOfTeachers}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                  </Form.Group>

                  {/* Purpose & Requirements */}
                  <Form.Group className="mb-3">
                    <Form.Label>{t('bookingForm.purposeOfVisit')} *</Form.Label>
                    <Form.Select
                      name="purposeOfVisit"
                      value={formData.purposeOfVisit}
                      onChange={handleChange}
                      required
                    >
                      <option value="">{t('bookingForm.selectPurpose')}</option>
                      <option value="Educational Tour">{t('bookingForm.educationalTour')}</option>
                      <option value="Field Study">{t('bookingForm.fieldStudy')}</option>
                      <option value="Research Visit">{t('bookingForm.researchVisit')}</option>
                      <option value="Training Program">{t('bookingForm.trainingProgram')}</option>
                      <option value="Cultural Exchange">{t('bookingForm.culturalExchange')}</option>
                      <option value="Other">{t('bookingForm.other')}</option>
                    </Form.Select>
                  </Form.Group>
                  {formData.purposeOfVisit === 'Other' && (
                    <Form.Group className="mb-3">
                      <Form.Label>Custom Purpose *</Form.Label>
                      <Form.Control
                        type="text"
                        name="customPurpose"
                        value={formData.customPurpose}
                        onChange={handleChange}
                        placeholder="Please specify your purpose of visit"
                        required
                      />
                    </Form.Group>
                  )}
                  <Form.Group className="mb-3">
                    <Form.Label>{t('bookingForm.specialRequirements')}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={handleChange}
                      placeholder={t('bookingForm.specialRequirementsPlaceholder')}
                    />
                  </Form.Group>

                  {/* Institution Contact - Optional */}
                  <Form.Group className="mb-4">
                    <Form.Label>{t('bookingForm.institutionContactNumber')}</Form.Label>
                    <Form.Control
                      type="tel"
                      name="institutionContactNumber"
                      value={formData.institutionContactNumber}
                      onChange={handleChange}
                      placeholder={t('bookingForm.contactPlaceholder')}
                      isInvalid={formData.institutionContactNumber && !phoneValid(formData.institutionContactNumber)}
                    />
                    <Form.Control.Feedback type="invalid">
                      {t('bookingForm.phoneValidation')}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Education Institute - Only for admin and superadmin */}
                  {(isAdmin && isAdmin()) || (isSuperAdmin && isSuperAdmin()) ? (
                    <Form.Group className="mb-4">
                      <Form.Label>Education Institute</Form.Label>
                      <Form.Control
                        type="text"
                        name="educationInstitute"
                        value={formData.educationInstitute}
                        onChange={handleChange}
                        placeholder="Enter the name of the education institute"
                      />
                    </Form.Group>
                  ) : null}

                  {/* Teachers */}
                  <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '5px', padding: '10px', marginBottom: '20px' }}>
                    <h5 className="text-primary mb-3 mt-3">{t('bookingForm.teachers')}</h5>
                    {formData.teachers.map((teacher, idx) => (
                      <div key={idx} className="mb-3">
                        <Form.Group className="mb-2">
                          <Form.Label>{idx + 1}. {t('bookingForm.teacherName')} *</Form.Label>
                          <Form.Control
                            type="text"
                            value={teacher.name}
                            onChange={(e) => handleTeacherChange(idx, 'name', e.target.value)}
                            placeholder={t('bookingForm.teacherNamePlaceholder', { number: idx + 1 })}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>{idx + 1}. {t('bookingForm.teacherNic')} *</Form.Label>
                          <Form.Control
                            type="text"
                            value={teacher.nic}
                            onChange={(e) => handleTeacherChange(idx, 'nic', e.target.value)}
                            placeholder={t('bookingForm.nicPlaceholderGeneric')}
                            isInvalid={teacher.nic && !nicValid(teacher.nic)}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {t('bookingForm.nicValidation')}
                          </Form.Control.Feedback>
                        </Form.Group>
                        <Button variant="outline-danger" onClick={() => removeTeacher(idx)} className="mb-3">
                          {t('bookingForm.removeTeacher', { number: idx + 1 })}
                        </Button>
                      </div>
                    ))}
                    <div className="mb-3">
                      <Button variant="outline-primary" onClick={addTeacher} disabled={formData.teachers.length >= 50}>
                        {t('bookingForm.addTeacher')}
                      </Button>
                    </div>
                  </div>

                  {/* Guardians */}
                  <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '5px', padding: '10px', marginBottom: '20px' }}>
                    <h5 className="text-primary mb-3">{t('bookingForm.guardians')}</h5>
                    {formData.guardians.map((guardian, idx) => (
                      <div key={idx} className="mb-3">
                        <Form.Group className="mb-2">
                          <Form.Label>{idx + 1}. {t('bookingForm.guardianName')} *</Form.Label>
                          <Form.Control
                            type="text"
                            value={guardian.name}
                            onChange={(e) => handleGuardianChange(idx, 'name', e.target.value)}
                            placeholder={t('bookingForm.guardianNamePlaceholder', { number: idx + 1 })}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>{idx + 1}. {t('bookingForm.guardianNic')} *</Form.Label>
                          <Form.Control
                            type="text"
                            value={guardian.nic}
                            onChange={(e) => handleGuardianChange(idx, 'nic', e.target.value)}
                            placeholder={t('bookingForm.nicPlaceholderGeneric')}
                            isInvalid={guardian.nic && !nicValid(guardian.nic)}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {t('bookingForm.nicValidation')}
                          </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-2">
                          {/* === FIX: Corrected translation key === */}
                          <Form.Label>{idx + 1}. {t('bookingForm.guardianContactNumber', 'Guardian Contact Number')} *</Form.Label>
                          <Form.Control
                            type="tel"
                            value={guardian.contactNumber}
                            onChange={(e) => handleGuardianChange(idx, 'contactNumber', e.target.value)}
                            placeholder={t('bookingForm.contactPlaceholder')}
                            isInvalid={guardian.contactNumber && !phoneValid(guardian.contactNumber)}
                            required
                          />
                          <Form.Control.Feedback type="invalid">
                            {t('bookingForm.phoneValidation')}
                          </Form.Control.Feedback>
                        </Form.Group>
                        {idx > 0 && (
                          <Button variant="outline-danger" onClick={() => removeGuardian(idx)} className="mb-3">
                            {t('bookingForm.removeGuardian', { number: idx + 1 })}
                          </Button>
                        )}
                      </div>
                    ))}
                    <div className="mb-3">
                      <Button variant="outline-primary" onClick={addGuardian} disabled={formData.guardians.length >= 50}>
                        {t('bookingForm.addGuardian')}
                      </Button>
                    </div>
                  </div>

                  {/* Attachments */}
                  <Form.Group className="mb-3">
                    <Form.Label>Attachments (Optional)</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.pdf"
                      onChange={handleFileChange}
                    />
                    <Form.Text className="text-muted">
                      Upload JPEG images (e.g., ex-insurance, driving licence)
                    </Form.Text>
                  </Form.Group>

                  {/* Display Selected Files */}
                  {formData.attachments && formData.attachments.length > 0 && (
                    <div className="mb-3">
                      <h6>Selected Files:</h6>
                      <ul className="list-group">
                        {formData.attachments.map((file, idx) => (
                          <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                            {file.name}
                            <Button variant="outline-danger" size="sm" onClick={() => removeAttachment(idx)}>
                              Remove
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bus Details - Multiple */}
                  <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '5px', padding: '10px', marginBottom: '20px' }}>
                    <h5 className="text-primary mb-3">{t('bookingForm.busDetails')}</h5>
                    <Alert
                      variant="info"
                      className="mb-3"
                      style={{
                        backgroundColor: undefined,
                        color: undefined,
                        borderColor: undefined,
                      }}
                    >
                      <strong>{t('bookingForm.important')}:</strong> {t('bookingForm.timeAlert')}
                    </Alert>
                    {formData.buses.map((b, idx) => (
                      <Card key={idx} className="mb-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>{t('bookingForm.busNumberLabel', { number: idx + 1 })}</strong>
                            <Button variant="outline-danger" size="sm" onClick={() => removeBus(idx)}>{t('bookingForm.remove')}</Button>
                          </div>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('bookingForm.busCompany')} *</Form.Label>
                            <Form.Control
                              type="text"
                              value={b.busCompany}
                              onChange={(e) => handleBusChange(idx, 'busCompany', e.target.value)}
                              required
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('bookingForm.busNumber')} *</Form.Label>
                            <Form.Control
                              type="text"
                              value={b.busNumber}
                              onChange={(e) => handleBusChange(idx, 'busNumber', e.target.value)}
                              placeholder={t('bookingForm.busNumberPlaceholder')}
                              required
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            {/* === FIX: Corrected translation key === */}
                            <Form.Label>{t('bookingForm.busSeatCapacity', 'Bus Seat Capacity')} *</Form.Label>
                            <Form.Control
                              type="number"
                              value={b.busCapacity}
                              onChange={(e) => handleBusChange(idx, 'busCapacity', e.target.value)}
                              min="1"
                              required
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('bookingForm.driverName')} *</Form.Label>
                            <Form.Control
                              type="text"
                              value={b.driverName}
                              onChange={(e) => handleBusChange(idx, 'driverName', e.target.value)}
                              required
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            {/* === FIX: Corrected translation key === */}
                            <Form.Label>{t('bookingForm.driverContactNumber', 'Driver Contact Number')} *</Form.Label>
                            <Form.Control
                              type="tel"
                              value={b.driverContact}
                              onChange={(e) => handleBusChange(idx, 'driverContact', e.target.value)}
                              isInvalid={b.driverContact && !phoneValid(b.driverContact)}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {t('bookingForm.phoneValidation')}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('bookingForm.driverLicense')} *</Form.Label>
                            <Form.Control
                              type="text"
                              value={b.driverLicenseNumber}
                              onChange={(e) => handleBusChange(idx, 'driverLicenseNumber', e.target.value)}
                              placeholder={t('bookingForm.licensePlaceholder')}
                              isInvalid={b.driverLicenseNumber && !licenseValid(b.driverLicenseNumber)}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {t('bookingForm.licenseValidation')}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('bookingForm.conductorName')} *</Form.Label>
                            <Form.Control
                              type="text"
                              value={b.conductorName}
                              onChange={(e) => handleBusChange(idx, 'conductorName', e.target.value)}
                              required
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('bookingForm.conductorNic')} *</Form.Label>
                            <Form.Control
                              type="text"
                              value={b.conductorNic}
                              onChange={(e) => handleBusChange(idx, 'conductorNic', e.target.value)}
                              placeholder={t('bookingForm.nicPlaceholderGeneric')}
                              isInvalid={b.conductorNic && !nicValid(b.conductorNic)}
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {t('bookingForm.nicValidation')}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('bookingForm.estimatedArrivalTime')}</Form.Label>
                            <Form.Select
                              value={b.estimatedArrivalTime}
                              onChange={(e) => handleBusChange(idx, 'estimatedArrivalTime', e.target.value)}
                            >
                              <option value="">{t('bookingForm.selectTime')}</option>
                              {generateArrivalTimeOptions().map(time => (
                                <option key={time} value={time}>{to12HourFormat(time)}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('bookingForm.estimatedDepartureTime')}</Form.Label>
                            <Form.Select
                              value={b.estimatedDepartureTime}
                              onChange={(e) => handleBusChange(idx, 'estimatedDepartureTime', e.target.value)}
                            >
                              <option value="">{t('bookingForm.selectTime')}</option>
                              {generateDepartureTimeOptions(b.estimatedArrivalTime).map(time => (
                                <option key={time} value={time}>{to12HourFormat(time)}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Card.Body>
                      </Card>
                    ))}
                    <div className="mb-3">
                      <Button variant="outline-primary" onClick={addBus}>
                        {/* === FIX: Corrected translation key === */}
                        {t('bookingForm.addBus', 'Add Bus')}
                      </Button>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={
                        loading ||
                        isDateAvailable === false ||
                        !formData.visitDate ||
                        !formData.selectedPort ||
                        !formData.numberOfStudents ||
                        !formData.numberOfTeachers ||
                        !formData.purposeOfVisit ||
                        (formData.purposeOfVisit === 'Other' && !formData.customPurpose) ||
                        formData.teachers.filter(teacher => teacher.name.trim() && teacher.nic.trim()).length === 0 ||
                        formData.guardians.filter(guardian => guardian.name.trim() && guardian.nic.trim() && guardian.contactNumber.trim()).length === 0 ||
                        formData.buses.some(bus => !bus.busCompany.trim() || !bus.conductorName.trim() || !bus.conductorNic.trim() || !bus.busNumber.trim() || !bus.busCapacity || !bus.driverName.trim() || !bus.driverContact.trim() || !bus.driverLicenseNumber.trim())
                      }
                      className="me-2"
                    >
                      {loading ? t('common.loading') : t('bookingForm.createBooking')}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
      </Col>
    </Row>
  </Container>
  <ErrorModal
    show={showErrorModal}
    onHide={() => setShowErrorModal(false)}
    message={error}
  />
</div>

  );
};

export default BookingForm;
