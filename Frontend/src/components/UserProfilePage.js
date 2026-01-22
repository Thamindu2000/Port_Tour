import React, { useState } from 'react';
// import './ProfilePage.css'; // අපි දැන් inline styles භාවිතා කරන නිසා මෙය අවශ්‍ය නැහැ
import { useTheme } from '../context/ThemeContext';
import {
  FaLinkedin, FaTwitter, FaEnvelope, FaBuilding, FaCalendarAlt,
  FaEdit, FaKey, FaDownload, FaCamera
} from 'react-icons/fa';

const UserProfilePage = ({ user = {} }) => {
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);

  // Placeholder user data - in real app, this would come from props/context/API
  const [userData, setUserData] = useState({
    fullName: user.fullName || 'Super Admin',
    username: user.username || 'superadmin',
    email: user.email || 'superadmin@port.com',
    institution: user.institution || 'Port Administration',
    joinDate: user.joinDate || 'January 2020',
    bookingsCount: user.bookingsCount || 150,
    // NEW: State for profile image
    profileImage: user.profileImage || 'avatar.png', // Default avatar
    bio: user.bio || 'Passionate about port administration and efficient booking systems.'
  });

  // NEW: Handle changes to form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  // NEW: Handle profile picture change
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imgUrl = URL.createObjectURL(e.target.files[0]);
      setUserData(prev => ({ ...prev, profileImage: imgUrl }));
      // In a real app, you'd upload the file to a server here
    }
  };
  
  // NEW: Handle save logic
  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you'd send 'userData' to your API to save it
    console.log("Saving data:", userData);
  };

  // Calculate years active (simple example)
  const getYearsActive = () => {
    const joinYear = parseInt(userData.joinDate.split(' ')[1]);
    const currentYear = new Date().getFullYear();
    return Math.max(currentYear - joinYear, 1); // Return at least 1
  };

  return (
    <>
      {/* ======================================= */}
      {/* = NEW PROFESSIONAL PROFILE PAGE STYLES = */}
      {/* ======================================= */}
      <style>
        {`
          :root {
            --profile-bg-light: #f4f7fc;
            --profile-bg-dark: #1a1a1a;
            --card-bg-light: #ffffff;
            --card-bg-dark: #2a2a2a;
            --text-light: #121212;
            --text-dark: #f1f1f1;
            --text-muted-light: #555;
            --text-muted-dark: #aaa;
            --border-light: #e0e0e0;
            --border-dark: #444;
            --primary-color: #0056b3;
            --primary-hover: #004494;
            --gold-color: #ffc107;
          }

          .profile-page-container {
            width: 100%;
            min-height: 100vh;
            padding: 40px;
            background-color: var(${isDarkMode ? '--profile-bg-dark' : '--profile-bg-light'});
            color: var(${isDarkMode ? '--text-dark' : '--text-light'});
            transition: background-color 0.3s ease, color 0.3s ease;
          }

          .page-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 30px;
            color: var(${isDarkMode ? '--gold-color' : '--primary-color'});
          }

          .profile-card-professional {
            max-width: 1200px;
            margin: 0 auto;
            background-color: var(${isDarkMode ? '--card-bg-dark' : '--card-bg-light'});
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
            border: 1px solid var(${isDarkMode ? '--border-dark' : '--border-light'});
            overflow: hidden;
          }

          .profile-grid {
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 0;
          }

          /* --- Left Column --- */
          .profile-left {
            padding: 40px;
            background-color: var(${isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(240, 245, 255, 0.5)'});
            border-right: 1px solid var(${isDarkMode ? '--border-dark' : '--border-light'});
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          
          .profile-picture-wrapper {
            position: relative;
            width: 160px;
            height: 160px;
            border-radius: 50%;
            margin-bottom: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            border: 4px solid var(${isDarkMode ? '--gold-color' : '--primary-color'});
          }

          #profile-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }

          #file-upload {
            display: none;
          }

          .change-photo-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.5);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.5rem;
            opacity: 0;
            transition: opacity 0.3s ease;
            cursor: pointer;
          }

          .profile-picture-wrapper:hover .change-photo-overlay {
            opacity: 1;
          }

          .profile-header .full-name {
            font-size: 1.8rem;
            font-weight: 600;
            margin: 0;
          }

          .profile-header .username {
            font-size: 1.1rem;
            color: var(${isDarkMode ? '--gold-color' : '--primary-color'});
            margin-bottom: 10px;
          }

          .profile-header .institution {
            font-size: 1rem;
            color: var(${isDarkMode ? '--text-muted-dark' : '--text-muted-light'});
          }

          .bio-section {
            width: 100%;
            text-align: left;
            margin-top: 30px;
          }
          
          .bio-section h3, .social-links h3 {
            font-size: 1.2rem;
            font-weight: 600;
            border-bottom: 2px solid var(${isDarkMode ? '--border-dark' : '--border-light'});
            padding-bottom: 8px;
            margin-bottom: 15px;
          }

          .bio-text {
            font-size: 0.95rem;
            line-height: 1.6;
            color: var(${isDarkMode ? '--text-muted-dark' : '--text-muted-light'});
          }
          
          .bio-textarea {
            width: 100%;
            height: 120px;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid var(${isDarkMode ? '--border-dark' : '--border-light'});
            background-color: var(${isDarkMode ? '--profile-bg-dark' : '#f9f9f9'});
            color: var(${isDarkMode ? '--text-dark' : '--text-light'});
            font-family: inherit;
            resize: vertical;
          }
          
          .social-links {
            width: 100%;
            text-align: left;
            margin-top: 30px;
          }

          .social-icons {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
          }

          .social-link {
            font-size: 1.8rem;
            color: var(${isDarkMode ? '--text-muted-dark' : '--text-muted-light'});
            transition: color 0.3s ease, transform 0.3s ease;
          }

          .social-link:hover {
            color: var(${isDarkMode ? '--gold-color' : '--primary-color'});
            transform: scale(1.1);
          }
          
          /* --- Right Column --- */
          .profile-right {
            padding: 40px;
            display: flex;
            flex-direction: column;
            gap: 30px;
          }

          .profile-section-card {
            background-color: var(${isDarkMode ? '--card-bg-dark' : '--card-bg-light'});
            border: 1px solid var(${isDarkMode ? '--border-dark' : '--border-light'});
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }

          .profile-section-card h3 {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(${isDarkMode ? '--border-dark' : '--border-light'});
          }

          /* Stats */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 20px;
            text-align: center;
          }

          .stat-item {
            display: flex;
            flex-direction: column;
            padding: 15px;
            border-radius: 8px;
            background-color: var(${isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(240, 245, 255, 0.5)'});
          }

          .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(${isDarkMode ? '--gold-color' : '--primary-color'});
          }

          .stat-label {
            font-size: 0.9rem;
            color: var(${isDarkMode ? '--text-muted-dark' : '--text-muted-light'});
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          /* Contact Info */
          .contact-info .info-field {
            display: flex;
            align-items: center;
            font-size: 1rem;
            margin-bottom: 15px;
            gap: 15px;
          }
          
          .contact-info .info-icon {
            font-size: 1.2rem;
            color: var(${isDarkMode ? '--text-muted-dark' : '--text-muted-light'});
            width: 20px;
            text-align: center;
          }

          .info-label {
            font-weight: 600;
            min-width: 120px;
          }

          .info-value {
            color: var(${isDarkMode ? '--text-muted-dark' : '--text-muted-light'});
          }
          
          .info-value.editable {
            padding: 5px 8px;
            border-radius: 6px;
            border: 1px solid var(${isDarkMode ? '--border-dark' : '--border-light'});
            background-color: var(${isDarkMode ? '--profile-bg-dark' : '#f9f9f9'});
            color: var(${isDarkMode ? '--text-dark' : '--text-light'});
          }

          /* Action Buttons */
          .action-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 10px;
          }

          .btn-primary, .btn-secondary, .btn-outline {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            font-size: 0.95rem;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-primary {
            background-color: var(${isDarkMode ? '--gold-color' : '--primary-color'});
            color: ${isDarkMode ? '#000' : '#fff'};
          }
          .btn-primary:hover {
            background-color: var(${isDarkMode ? '#ffce3a' : '--primary-hover'});
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }

          .btn-secondary {
            background-color: var(${isDarkMode ? '--border-dark' : '#6c757d'});
            color: #fff;
          }
          .btn-secondary:hover {
            background-color: ${isDarkMode ? '#555' : '#5a6268'};
            transform: translateY(-2px);
          }

          .btn-outline {
            background-color: transparent;
            color: var(${isDarkMode ? '--text-muted-dark' : '--text-muted-light'});
            border: 1px solid var(${isDarkMode ? '--border-dark' : '--border-light'});
          }
          .btn-outline:hover {
            background-color: var(${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'});
          }
          
          /* Responsive */
          @media (max-width: 992px) {
            .profile-grid {
              grid-template-columns: 1fr;
            }
            .profile-left {
              border-right: none;
              border-bottom: 1px solid var(${isDarkMode ? '--border-dark' : '--border-light'});
            }
          }
          
          @media (max-width: 768px) {
             .profile-page-container {
               padding: 20px;
             }
             .page-title {
               font-size: 2rem;
             }
             .profile-left, .profile-right {
               padding: 30px;
             }
             .action-buttons {
               flex-direction: column;
             }
          }
        `}
      </style>

      <div className={`profile-page-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
        <h1 className="page-title">Professional Profile</h1>
        <div className="profile-card-professional">
          <div className="profile-grid">
            
            {/* Left Column */}
            <div className="profile-left">
              <div className="profile-picture-wrapper">
                <img id="profile-img" src={userData.profileImage} alt="User Profile" />
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="file-upload" className="change-photo-overlay">
                  <FaCamera />
                </label>
              </div>
              <div className="profile-header">
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    className="info-value editable"
                    value={userData.fullName}
                    onChange={handleChange}
                    style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '10px' }}
                  />
                ) : (
                  <h2 className="full-name">{userData.fullName}</h2>
                )}
                <p className="username">@{userData.username}</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="institution"
                    className="info-value editable"
                    value={userData.institution}
                    onChange={handleChange}
                    style={{ textAlign: 'center' }}
                  />
                ) : (
                  <p className="institution">{userData.institution}</p>
                )}
              </div>
              <div className="bio-section">
                <h3>Bio</h3>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleChange}
                    className="bio-textarea"
                  />
                ) : (
                  <p className="bio-text">{userData.bio}</p>
                )}
              </div>
              <div className="social-links">
                <h3>Connect</h3>
                <div className="social-icons">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link"><FaLinkedin /></a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link"><FaTwitter /></a>
                  <a href={`mailto:${userData.email}`} className="social-link"><FaEnvelope /></a>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="profile-right">
              <div className="profile-section-card stats-section">
                <h3>Activity Stats</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{userData.bookingsCount}</span>
                    <span className="stat-label">Bookings</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{getYearsActive()}</span>
                    <span className="stat-label">Years Active</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">4.9</span>
                    <span className="stat-label">Rating</span>
                  </div>
                </div>
              </div>

              <div className="profile-section-card contact-info">
                <h3>Contact Information</h3>
                <div className="info-field">
                  <FaEnvelope className="info-icon" />
                  <span className="info-label">Email:</span>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      className="info-value editable"
                      value={userData.email}
                      onChange={handleChange}
                    />
                  ) : (
                    <span className="info-value">{userData.email}</span>
                  )}
                </div>
                <div className="info-field">
                  <FaBuilding className="info-icon" />
                  <span className="info-label">Institution:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="institution"
                      className="info-value editable"
                      value={userData.institution}
                      onChange={handleChange}
                    />
                  ) : (
                    <span className="info-value">{userData.institution}</span>
                  )}
                </div>
                <div className="info-field">
                  <FaCalendarAlt className="info-icon" />
                  <span className="info-label">Member Since:</span>
                  <span className="info-value">{userData.joinDate}</span>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (isEditing) {
                      handleSave();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  <FaEdit /> {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
                <button className="btn-secondary">
                  <FaKey /> Change Password
                </button>
                <button className="btn-outline">
                  <FaDownload /> Export Data
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;