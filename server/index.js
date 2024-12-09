import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
  host: '146.190.90.121',
  port: 3306,
  user: 'bleue',
  password: 'hshudb5usub5',
  database: 'speaker_drive',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to MariaDB!');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to MariaDB:', err);
  });

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await pool.getConnection();

    try {
      const [users] = await connection.query(`
        SELECT users.*, companies.* 
        FROM users 
        LEFT JOIN companies ON users.company = companies.id 
        WHERE users.email = ?
      `, [email]);

      const user = users[0];
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login and online status
      await connection.query(`
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP, online = 1 
        WHERE id = ?
      `, [user.id]);

      res.json({
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        user_role: user.user_role,
        fname: user.fname,
        lname: user.lname,
        company: {
          id: user.company,
          company_name: user.company_name,
          company_address: user.company_address,
          company_contact_number: user.company_contact_number,
          company_email: user.company_email,
          company_email_key: user.company_email_key,
        },
        status: user.status,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Database connection error. Please try again later.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});