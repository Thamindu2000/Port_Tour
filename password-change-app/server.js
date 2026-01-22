const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change this to your MySQL username
  password: '', // Change this to your MySQL password
  database: 'password_change_app'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Endpoint to check if user is admin/superadmin
app.post('/api/check-admin-role', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ isAuthorized: false });
  }

  const query = 'SELECT role FROM users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ isAuthorized: false });
    }

    if (results.length === 0) {
      return res.status(404).json({ isAuthorized: false });
    }

    const role = results[0].role;
    const isAuthorized = role === 'admin' || role === 'superadmin';

    res.status(200).json({ isAuthorized });
  });
});

// Endpoint to change password (only for admin/superadmin)
app.post('/api/change-password', async (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({ success: false, message: 'Username and new password are required' });
  }

  try {
    // First, check if user exists and has admin/superadmin role
    const checkQuery = 'SELECT role FROM users WHERE username = ?';
    db.query(checkQuery, [username], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(403).json({ success: false, message: 'User is not authorized' });
      }

      const role = results[0].role;
      if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'User is not authorized' });
      }

      // User is authorized, hash the new password
      bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error('Hashing error:', hashErr);
          return res.status(500).json({ success: false, message: 'Password hashing failed' });
        }

        // Update the password in the database
        const updateQuery = 'UPDATE users SET password = ? WHERE username = ?';
        db.query(updateQuery, [hashedPassword, username], (updateErr, updateResults) => {
          if (updateErr) {
            console.error('Update error:', updateErr);
            return res.status(500).json({ success: false, message: 'Failed to update password' });
          }

          res.status(200).json({ success: true, message: 'Password updated successfully' });
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
