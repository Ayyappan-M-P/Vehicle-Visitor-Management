// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',  
  password: '123456', 
  database: 'visitor_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function to generate a random 4-digit visitor number
const generateVisitorNumber = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

// API Routes

// Get all visitors
app.get('/api/visitors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM visitors ORDER BY dateOfVisit DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ message: 'Error fetching visitors' });
  }
});

// Get a specific visitor
app.get('/api/visitors/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM visitors WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching visitor:', error);
    res.status(500).json({ message: 'Error fetching visitor' });
  }
});

// Create a new visitor
app.post('/api/visitors', async (req, res) => {
  const { 
    username, 
    idType, 
    idNumber, 
    vehicleType, 
    vehicleNumber, 
    inTime, 
    duration, 
    dateOfVisit 
  } = req.body;

  // Generate a random 4-digit visitor number
  const visitorNumber = generateVisitorNumber();

  try {
    const [result] = await pool.query(
      `INSERT INTO visitors 
      (username, idType, idNumber, vehicleType, vehicleNumber, inTime, duration, dateOfVisit, visitorNumber, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, idType, idNumber, vehicleType, vehicleNumber, inTime, duration, dateOfVisit, visitorNumber, 'Pending']
    );
    
    res.status(201).json({
      id: result.insertId,
      visitorNumber,
      message: 'Visitor registered successfully'
    });
  } catch (error) {
    console.error('Error creating visitor:', error);
    res.status(500).json({ message: 'Error registering visitor' });
  }
});

// Update visitor status
app.put('/api/visitors/:id/status', async (req, res) => {
  const { status } = req.body;
  
  try {
    await pool.query(
      'UPDATE visitors SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    
    res.json({ message: 'Visitor status updated successfully' });
  } catch (error) {
    console.error('Error updating visitor status:', error);
    res.status(500).json({ message: 'Error updating visitor status' });
  }
});

// Delete a visitor
app.delete('/api/visitors/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM visitors WHERE id = ?', [req.params.id]);
    res.json({ message: 'Visitor deleted successfully' });
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).json({ message: 'Error deleting visitor' });
  }
});

// Generate PDF for completed visits
app.get('/api/visitors/:id/pdf', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM visitors WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    
    const visitor = rows[0];
    
    // Check if the visit is complete
    if (visitor.status !== 'Complete') {
      return res.status(400).json({ message: 'PDF can only be generated for completed visits' });
    }
    
    // Create a PDF document
    const doc = new PDFDocument();
    const filename = `visitor-${visitor.visitorNumber}.pdf`;
    
    // Set response headers
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/pdf');
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to the PDF
    doc.fontSize(25).text('Visitor Pass', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Visitor Management System', { align: 'center' });
    doc.moveDown(2);
    
    // Add visitor information
    const visitDate = new Date(visitor.dateOfVisit).toLocaleDateString();
    
    doc.fontSize(12).text(`Visitor Number: ${visitor.visitorNumber}`);
    doc.moveDown(0.5);
    doc.text(`Name: ${visitor.username}`);
    doc.moveDown(0.5);
    doc.text(`ID Type: ${visitor.idType === 'aadhar' ? 'Aadhar Card' : 'PAN Card'}`);
    doc.moveDown(0.5);
    doc.text(`ID Number: ${visitor.idNumber}`);
    doc.moveDown(0.5);
    doc.text(`Vehicle Type: ${visitor.vehicleType}`);
    doc.moveDown(0.5);
    doc.text(`Vehicle Number: ${visitor.vehicleNumber}`);
    doc.moveDown(0.5);
    doc.text(`Date of Visit: ${visitDate}`);
    doc.moveDown(0.5);
    doc.text(`In Time: ${visitor.inTime}`);
    doc.moveDown(0.5);
    doc.text(`Duration: ${visitor.duration} minutes`);
    doc.moveDown(0.5);
    doc.text(`Status: ${visitor.status}`);
    doc.moveDown(2);
    
    // Add verification section
    doc.fontSize(14).text('Verification', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('This document certifies that the visitor mentioned above completed their visit as per the records in our Visitor Management System.');
    doc.moveDown(2);
    
    // Add signature line
    doc.text('_______________________', { align: 'right' });
    doc.moveDown(0.5);
    doc.fontSize(10).text('Authorized Signature', { align: 'right' });
    
    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Export for testing
module.exports = app;