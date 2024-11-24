// server/db.js
import mysql from 'mysql2/promise';
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'c3fd60b2f8b66150',
  database: 'novels',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
export default db;
