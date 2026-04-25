import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

// Mutex: serializa todas las operaciones de escritura para evitar race conditions.
let queue = Promise.resolve();

const mutateDb = (fn) => {
  const next = queue.then(async () => {
    const content = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(content);
    const result = await fn(db);
    const tmp = dbPath + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf8');
    await fs.rename(tmp, dbPath);
    return result;
  });
  queue = next.catch(() => {});
  return next;
};

const readDb = async () => {
  const content = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(content);
};

export const getUsers = async () => {
  const db = await readDb();
  return db.users || [];
};

export const getClients = async () => {
  const db = await readDb();
  return db.clients || [];
};

export const addUser = (user) =>
  mutateDb((db) => {
    const nextId = String(Date.now());
    db.users = db.users || [];
    const payload = {
      id: nextId,
      ...user,
      email: String(user.email || '').trim().toLowerCase(),
    };
    db.users.push(payload);
    return payload;
  });

export const updateUser = (updatedUser) =>
  mutateDb((db) => {
    const payload = {
      ...updatedUser,
      email: String(updatedUser.email || '').trim().toLowerCase(),
    };
    db.users = db.users.map((u) => (u.id === payload.id ? payload : u));
    return payload;
  });

export const getProfiles = async () => {
  const db = await readDb();
  return db.profiles || [];
};

export const upsertProfile = (profile) =>
  mutateDb((db) => {
    db.profiles = db.profiles || [];
    const idx = db.profiles.findIndex((p) => p.userId === profile.userId);
    if (idx >= 0) {
      db.profiles[idx] = profile;
    } else {
      db.profiles.push(profile);
    }
    return profile;
  });

export const getBanking = async () => {
  const db = await readDb();
  return db.banking || [];
};

export const upsertBanking = (entry) =>
  mutateDb((db) => {
    db.banking = db.banking || [];
    const idx = db.banking.findIndex((b) => b.userId === entry.userId);
    if (idx >= 0) {
      db.banking[idx] = entry;
    } else {
      db.banking.push(entry);
    }
    return entry;
  });

export const addClient = (client) =>
  mutateDb((db) => {
    const nextId = String(Date.now());
    db.clients = db.clients || [];
    const newClient = { id: nextId, status: 'Nuevo', ...client };
    db.clients.push(newClient);
    return newClient;
  });

export const getTickets = async () => {
  const db = await readDb();
  return db.tickets || [];
};

export const addTicket = (ticket) =>
  mutateDb((db) => {
    const nextId = 'T-' + String(Date.now());
    db.tickets = db.tickets || [];
    const newTicket = {
      id: nextId,
      status: 'nuevo',
      reply: null,
      repliedAt: null,
      creatorSeenAt: null,
      createdAt: new Date().toISOString(),
      ...ticket,
    };
    db.tickets.push(newTicket);
    return newTicket;
  });

export const updateTicket = (id, changes) =>
  mutateDb((db) => {
    db.tickets = db.tickets || [];
    const idx = db.tickets.findIndex((t) => t.id === id);
    if (idx < 0) return null;
    const nextChanges = { ...changes };
    if (nextChanges.reply !== undefined) {
      nextChanges.creatorSeenAt = null;
    }
    db.tickets[idx] = { ...db.tickets[idx], ...nextChanges };
    return db.tickets[idx];
  });
