const db = require('./sqlite');

function getAllClients() {
  return db.prepare('SELECT * FROM clients').all();
}

function getClientById(id) {
  return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
}

function addClient(client) {
  const stmt = db.prepare('INSERT INTO clients (name, email, phone, company, status) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(
    client.name,
    client.email,
    client.phone,
    client.company,
    client.status
  );
  return info.lastInsertRowid;
}

function updateClient(client) {
  const stmt = db.prepare('UPDATE clients SET name=?, email=?, phone=?, company=?, status=? WHERE id=?');
  stmt.run(
    client.name,
    client.email,
    client.phone,
    client.company,
    client.status,
    client.id
  );
}

module.exports = {
  getAllClients,
  getClientById,
  addClient,
  updateClient
};
