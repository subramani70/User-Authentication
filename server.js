const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Create an Express app
const app = express();
const port = 5000;

app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse incoming JSON requests

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // MySQL username (update if needed)
  password: '',  // MySQL password (update if needed)
  database: 'hospital_management',  // Your database name
});

// Check if the database connection is successful
db.connect((err) => {
  if (err) {
    console.error('Could not connect to database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// JWT Secret Key
const JWT_SECRET = 'yourSecretKey'; // Change this to a strong secret key

// Registration Route
app.post('/register', (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  // Check if the user already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      return res.status(500).send('Database query error');
    }

    if (result.length > 0) {
      return res.status(400).send('User already exists');
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).send('Password hashing error');
      }

      // Insert the new user into the database
      const query = 'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(query, [name, email, hashedPassword, role, phone, address], (err, result) => {
        if (err) {
          return res.status(500).send('Database insert error');
        }

        res.status(200).send('User registered successfully');
      });
    });
  });
});

// Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      return res.status(500).send('Database query error');
    }

    if (result.length === 0) {
      return res.status(400).send('User not found');
    }

    const user = result[0]; // Get the first user from the result (should be unique)

    // Compare the password with the hashed password stored in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).send('Password comparison error');
      }

      if (!isMatch) {
        return res.status(400).send('Incorrect password');
      }

      // Generate JWT token for user session
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      // Send the token as a response (you can use this for authentication in the frontend)
      res.status(200).json({
        message: 'Login successful',
        token: token, // Send token for session handling
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    });
  });
});

app.post('/Appointment', (req, res) => {
  const { name, date, time } = req.body;

  // SQL query to insert appointment into the database
  const query = 'INSERT INTO appointments (name, date, time) VALUES (?, ?, ?)';

  db.query(query, [name, date, time], (err, result) => {
    if (err) {
      console.error('Error inserting data: ', err);
      return res.status(500).json({ message: 'Failed to schedule appointment' });
    }

    console.log('Appointment scheduled:', result);
    return res.status(200).json({ message: 'Appointment scheduled successfully' });
  });
});
// Add a new doctor
app.post('/add-doctor', (req, res) => {
  const { name, specialization, phone, email, address } = req.body;

  // Validate input
  if (!name || !specialization || !email) {
    return res.status(400).send('All fields (name, specialization, email) are required');
  }

  // Insert the doctor into the MySQL database
  const query = 'INSERT INTO doctors (name, specialization, phone, email, address) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, specialization, phone, email, address], (err, result) => {
    if (err) {
      console.error('Error inserting doctor:', err);
      return res.status(500).send('Failed to add doctor');
    }

    res.status(200).send('Doctor added successfully');
  });
});

// Get the list of all doctors
app.get('/doctors', (req, res) => {
  const query = 'SELECT * FROM doctors';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching doctors:', err);
      return res.status(500).send('Failed to fetch doctors');
    }

    res.status(200).json(results);
  });
});

app.post("/Receipt", (req, res) => {
  const { name, service, amount, date } = req.body;

  const query = "INSERT INTO receipts (name, service, amount, date) VALUES (?, ?, ?, ?)";
  db.query(query, [name, service, amount, date], (err, results) => {
    if (err) {
      console.error("error running query:", err);
      res.status(500).send({ message: "Error saving receipt" });
    } else {
      res.send({ message: "Receipt saved successfully" });
    }
  });
});
app.post("/AddPatient", (req, res) => {
  const { name, age, mobile, email, address } = req.body;

  const query = "INSERT INTO patients (name, age, mobile, email, address) VALUES (?, ?, ?, ?, ?)";
  db.query(query, [name, age, mobile, email, address], (err, results) => {
    if (err) {
      console.error("error running query:", err);
      res.status(500).send({ message: "Error adding patient" });
    } else {
      res.send({ message: "Patient added successfully" });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});