import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

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

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MariaDB!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to MariaDB:', error);
    return false;
  }
}

// Initialize database
async function initDb() {
  try {
    const connection = await pool.getConnection();

    try {
      // Create tables
      await connection.query(`
        CREATE TABLE IF NOT EXISTS companies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_name VARCHAR(255) NOT NULL,
          company_address TEXT,
          company_contact_number VARCHAR(50),
          company_email VARCHAR(255),
          company_email_key VARCHAR(255)
        );
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          user_type ENUM('Admin', 'Client') NOT NULL,
          company INT,
          user_role VARCHAR(50),
          fname VARCHAR(100),
          lname VARCHAR(100),
          contact_number VARCHAR(50),
          address TEXT,
          last_login DATETIME,
          online TINYINT DEFAULT 0,
          status VARCHAR(50),
          FOREIGN KEY (company) REFERENCES companies(id)
        );
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          email VARCHAR(255) PRIMARY KEY,
          token VARCHAR(255) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Check if companies exist
      const [companies] = await connection.query('SELECT COUNT(*) as count FROM companies');
      
      if (companies[0].count === 0) {
        // Insert companies
        const [speakerDrive] = await connection.query(
          'INSERT INTO companies (company_name, company_address) VALUES (?, ?)',
          ['Speaker Drive', 'Philadelphia']
        );
        
        const [testDrive] = await connection.query(
          'INSERT INTO companies (company_name, company_address) VALUES (?, ?)',
          ['Test Drive', 'New York']
        );

        // Hash password
        const hashedPassword = await bcrypt.hash('12345Qwe!', 10);

        // Insert users
        await connection.query(`
          INSERT INTO users (email, password, user_type, user_role, fname, lname, status, company)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, ['fevegapo@teleg.eu', hashedPassword, 'Admin', 'Owner', 'Austin', 'Benton', 'Active', speakerDrive.insertId]);

        await connection.query(`
          INSERT INTO users (email, password, user_type, user_role, fname, lname, status, company)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, ['bleuewulf@gmail.com', hashedPassword, 'Admin', 'Staff', 'Jiggy', 'Alteros', 'Active', speakerDrive.insertId]);

        await connection.query(`
          INSERT INTO users (email, password, user_type, user_role, fname, lname, status, company)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, ['bleuewulf+sdrive01@gmail.com', hashedPassword, 'Client', 'Owner', 'John Test', 'Doe', 'Active', testDrive.insertId]);
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export async function authenticateUser(email: string, password: string) {
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
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      // Update last login and online status
      await connection.query(`
        UPDATE users 
        SET last_login = CURRENT_TIMESTAMP, online = 1 
        WHERE id = ?
      `, [user.id]);

      return {
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
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Test the connection immediately
testConnection();

// Initialize the database
initDb();

export default pool;