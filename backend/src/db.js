import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!config.databaseUrl) {
  console.error('CRITICAL: DATABASE_URL is not set in environment variables.');
}

// Clean up sqlite prefix if present in the connection string
let dbPath = config.databaseUrl || '../newspulse.db';
if (dbPath.startsWith('sqlite:///')) {
  dbPath = dbPath.replace('sqlite:///', '');
}

const resolvedPath = path.isAbsolute(dbPath) 
  ? dbPath 
  : path.resolve(__dirname, '..', dbPath);

console.log(`Connecting to SQLite database at: ${resolvedPath}`);

export const db = new sqlite3.Database(resolvedPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database', err);
  }
});

// Promise wrapper for querying database
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Promise wrapper for single row queries
export const queryOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};
