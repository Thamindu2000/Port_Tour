import React from 'react';

/**
 * Formats bus details array into readable vertical list
 * Handles the busDetails array from your booking objects
 */
export const formatBusDetails = (busDetails, t) => {
  if (!Array.isArray(busDetails) || busDetails.length === 0) {
    return <div>{t ? t('adminPanel.noBusDetails') : 'No bus details'}</div>;
  }

  return (
    <div
      className="p-2 rounded bg-light"
      style={{
        minWidth: '300px', // Set a minimum width for clarity
      }}
    >
      <strong>
        {t ? t('adminPanel.busDetails') : 'Bus Details'} ({busDetails.length} {t ? t('adminPanel.buses') : 'buses'})
      </strong>
      <div className="mt-2">
        {busDetails.map((b, i) => (
          <div
            key={i}
            className="mb-2 p-2 rounded border bg-white"
            style={{
              whiteSpace: 'normal', // Allow text to wrap *inside* this small box
            }}
          >
            <div className="mb-1">
              <strong>{b.busCompany}</strong> — Bus: <strong>{b.busNumber}</strong>
            </div>
            <small>
              <div><strong>Conductor:</strong> {b.conductorName} ({b.conductorNIC})</div>
              {b.driverName && <div><strong>Driver:</strong> {b.driverName} {b.driverContact ? `(${b.driverContact})` : ''}</div>}
              <div><strong>Capacity:</strong> {b.busCapacity}</div>
              {b.estimatedArrivalTime && (
                <div><strong>Arrival:</strong> {b.estimatedArrivalTime}
                  {b.estimatedArrivalTime > '15:30' && <span> ⚠️ (After 3:30 PM)</span>}
                </div>
              )}
              {b.estimatedDepartureTime && (
                <div><strong>Departure:</strong> {b.estimatedDepartureTime}
                  {b.estimatedDepartureTime > '16:30' && <span> ⚠️ (After 4:30 PM)</span>}
                </div>
              )}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};


/**
 * Formats teacher/guardian details array into a readable box
 * THIS IS THE UPDATED FUNCTION - now displays NIC numbers
 */
export const formatPersonDetails = (persons, title, t) => {
  if (!Array.isArray(persons) || persons.length === 0) {
    const noDataText = title.includes('Teacher')
      ? (t ? t('adminPanel.noTeachersListed') : 'No Teachers Listed')
      : (t ? t('adminPanel.noGuardiansListed') : 'No Guardians Listed');
    return <div style={{ whiteSpace: 'nowrap' }}>{noDataText}</div>;
  }

  // Determine the correct color based on type
  const titleColor = title.includes('Teacher')
    ? '#0d6efd' // Blue for Teachers
    : '#198754'; // Green for Guardians

  return (
    <div
      className="p-2 rounded"
      style={{
        backgroundColor: '#f8f9fa',
        minWidth: '300px', // Set a minimum width for clarity
      }}
    >
      <strong style={{ color: titleColor }}>
        {title} ({persons.length})
      </strong>
      <div className="mt-2">
        {persons.map((p, i) => {
          // Extract NIC - check multiple possible field names
          const nic = p.NIC || p.nic || p.nicNumber || p.nicNo || 'No NIC';
          
          return (
            <div
              key={i}
              className="mb-1 p-2 rounded border"
              style={{
                backgroundColor: '#fff',
                whiteSpace: 'normal', // Allow text to wrap *inside* this small box
                borderLeft: `3px solid ${titleColor}`
              }}
            >
              <small>
                <div><strong>{i + 1}. {p.name || 'No name'}</strong></div>
                <div>NIC: <strong>{nic}</strong></div>
                {p.contactNumber && (
                  <div>Contact: <strong>{p.contactNumber}</strong></div>
                )}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
};
