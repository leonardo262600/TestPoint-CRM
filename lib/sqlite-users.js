const db = require('./sqlite');

function getAllUsers() {
  const rows = db.prepare('SELECT * FROM users').all();
  return rows.map(row => ({
    ...row,
    viewConfig: row.viewConfig ? JSON.parse(row.viewConfig) : undefined
  }));
}

function getUserByEmail(email) {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!row) return null;
  return {
    ...row,
    viewConfig: row.viewConfig ? JSON.parse(row.viewConfig) : undefined
  };
}

function addUser(user) {
  const stmt = db.prepare('INSERT INTO users (name, email, password, role, viewConfig) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(
    user.name,
    user.email,
    user.password,
    user.role,
    user.viewConfig ? JSON.stringify(user.viewConfig) : null
  );
  // Devolver el usuario completo recién creado
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  return {
    ...row,
    viewConfig: row.viewConfig ? JSON.parse(row.viewConfig) : undefined
  };
}

function updateUser(user) {
  const stmt = db.prepare('UPDATE users SET name=?, password=?, role=?, viewConfig=? WHERE email=?');
  stmt.run(
    user.name,
    user.password,
    user.role,
    user.viewConfig ? JSON.stringify(user.viewConfig) : null,
    user.email
  );
}

module.exports = {
  getAllUsers,
  getUserByEmail,
  addUser,
  updateUser
};
