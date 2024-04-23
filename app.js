const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// const autoIncrement = require('mongoose-auto-increment');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const User = require('./models/user');
const Invoice = require('./models/invoice');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/myapp');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.use(bodyParser.json());

// Dummy user data
// const getUserData = (userId) => {
//   return {
//     userId,
//     name: 'Vicky roy ',
//     email: 'royv@example.com'
//   };
// };

// Login API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email);

  try {
    const collection = db.collection('user');
    const user = await collection.findOne({ email, password });

    if (user) {
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, 'secret', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Email Notification API
app.get('/send-email', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId).exec();
  // Logic for email sending
  res.send('Email sent successfully');
});

// Email Notification API
// app.get('/send-email', authenticateToken, async (req, res) => {
//   try {
//     const userData = getUserData(req.user.userId);

//     // Create reusable transporter object using the default SMTP transport
//     let transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'vishnuborah@gmail.com',
//         pass: '123',
//       },
//     });

//     // Send email
//     let info = await transporter.sendMail({
//       from: 'vishnuborah523@gmail.com',
//       to: userData.email,
//       subject: 'User Data',
//       text: `Hello ${userData.name}, here is your user data: ${JSON.stringify(userData)}`,
//     });

//     console.log('Email sent:', info.response);
//     res.sendStatus(200);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     res.status(500).send('Internal server error');
//   }
// });

// PDF Download API
app.get('/download-invoice/:userId', authenticateToken, async (req, res) => {
  const collection = db.collection('invoice');
  const userCollection = db.collection('user');
  const userIdd = req.params.userId;
  const user = await User.findById(req.user.userId).exec();
  const userObject = await userCollection.findOne({ user });
  const invoice = await collection.findOne({ user: userIdd});
  console.log(' Users: ',userObject);
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('invoice.pdf'));
  doc.fontSize(16).text(`Invoice for ${userObject.name}`);

  // invoices.forEach((invoice) => {
    doc.text(`Email: ${userObject.email}`);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Invoice Name: ${invoice.invoiceName}`);
    doc.text(`User: ${req.params.userId}`);
    doc.text(`Amount: ${invoice.amount}`);
    doc.text(`Tax: ${invoice.tax}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();
  // });

  doc.end();
  // res.json('invoice.pdf');
  res.download('invoice.pdf');
});

// Function to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log(authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  console.log("token", token);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'secret', (err, user) => {
    if (err) {
      // console.error('JWT verification error:', err);
      return res.sendStatus(403);}
    req.user = user;
    console.log(' User1: ',user);
    next();
  });
}

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Schedule email sending every 30 seconds
// setInterval(async () => {
//   try {
//     const token = jwt.sign({ userId: '123' }, 'secret', { expiresIn: '30s' });

//     await fetch('http://localhost:3000/send-email', {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });
//   } catch (error) {
//     console.error('Error scheduling email:', error);
//   }
// }, 30000);
