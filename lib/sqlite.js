const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../crm-leads.db');
const db = new Database(dbPath);

// Migraciones: crear tablas si no existen
db.prepare(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  viewConfig TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  evento TEXT NOT NULL,
  fecha TEXT NOT NULL
)`).run();

module.exports = db;