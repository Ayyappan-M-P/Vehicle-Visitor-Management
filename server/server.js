const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',  
  password: '123456', 
  database: 'visitor_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
const generateVisitorNumber = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

app.get('/api/visitors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM visitors ORDER BY dateOfVisit DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ message: 'Error fetching visitors' });
  }
});

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
app.delete('/api/visitors/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM visitors WHERE id = ?', [req.params.id]);
    res.json({ message: 'Visitor deleted successfully' });
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).json({ message: 'Error deleting visitor' });
  }
});
app.get('/api/visitors/:id/pdf', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM visitors WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    
    const visitor = rows[0];
    
    if (visitor.status !== 'Complete') {
      return res.status(400).json({ message: 'PDF can only be generated for completed visits' });
    }
    const doc = new PDFDocument();
    const filename = `visitor-${visitor.visitorNumber}.pdf`;
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(25).text('Visitor Pass', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Visitor Management System', { align: 'center' });
    doc.moveDown(2);
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
    doc.fontSize(14).text('Verification', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('This document certifies that the visitor mentioned above completed their visit as per the records in our Visitor Management System.');
    doc.moveDown(2);
    doc.text('Ayyappan', { align: 'right' });
    doc.moveDown(0.5);
    doc.fontSize(10).text('signature', { align: 'right' });
    doc.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
module.exports = app;