import React from 'react';

const LoadingSkeleton = ({ rows = 5, columns = 12 }) => {

  return (
    <tbody>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex}>
              {colIndex === columns - 1 ? (
                <div className="d-flex gap-2">
                  <div className="skeleton skeleton-button"></div>
                  <div className="skeleton skeleton-button"></div>
                </div>
              ) : (
                <div className="skeleton skeleton-text"></div>
              )}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default LoadingSkeleton;
