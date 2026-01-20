const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initSqlJs = require('sql.js');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'petrecord-secret-change-me';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database setup
let db = null;

async function initDb() {
  const SQL = await initSqlJs();
  db = new SQL.Database();
  
  db.run(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, password_hash TEXT, first_name TEXT, last_name TEXT, subscription_tier TEXT DEFAULT 'FREE', email_forwarding TEXT);
    CREATE TABLE IF NOT EXISTS pets (id TEXT PRIMARY KEY, owner_id TEXT, name TEXT, species TEXT, breed TEXT, sex TEXT, date_of_birth TEXT, weight_kg REAL, microchip_id TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS allergies (id TEXT PRIMARY KEY, pet_id TEXT, allergen TEXT, reaction TEXT, severity TEXT);
    CREATE TABLE IF NOT EXISTS conditions (id TEXT PRIMARY KEY, pet_id TEXT, condition TEXT, status TEXT, diagnosed_date TEXT);
    CREATE TABLE IF NOT EXISTS medications (id TEXT PRIMARY KEY, pet_id TEXT, drug_name TEXT, dose TEXT, frequency TEXT, indication TEXT, status TEXT DEFAULT 'ACTIVE', start_date TEXT);
    CREATE TABLE IF NOT EXISTS vaccinations (id TEXT PRIMARY KEY, pet_id TEXT, vaccine_name TEXT, administration_date TEXT, valid_until TEXT, facility_name TEXT);
    CREATE TABLE IF NOT EXISTS medical_records (id TEXT PRIMARY KEY, pet_id TEXT, record_type TEXT, date_of_service TEXT, facility_name TEXT, summary TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS lab_results (id TEXT PRIMARY KEY, pet_id TEXT, panel_name TEXT, collection_date TEXT, results TEXT, interpretation TEXT);
    CREATE TABLE IF NOT EXISTS access_tokens (id TEXT PRIMARY KEY, user_id TEXT, pet_id TEXT, token TEXT UNIQUE, permission_level TEXT, valid_until TEXT, is_active INTEGER DEFAULT 1);
    CREATE TABLE IF NOT EXISTS weight_records (id TEXT PRIMARY KEY, pet_id TEXT, weight_kg REAL, date TEXT);
  `);
  
  // Seed demo data
  const existing = db.exec("SELECT id FROM users WHERE email = 'demo@petrecord.com'");
  if (existing.length === 0) {
    const userId = uuidv4();
    const hash = bcrypt.hashSync('demo123', 10);
    db.run("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)", [userId, 'demo@petrecord.com', hash, 'Demo', 'User', 'PREMIUM', uuidv4()]);
    
    const maxId = 'demo-pet-max';
    const lunaId = 'demo-pet-luna';
    db.run("INSERT INTO pets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))", [maxId, userId, 'Max', 'DOG', 'Golden Retriever', 'MALE_NEUTERED', '2019-03-15', 32.5, '985112345678901', 'Friendly, loves fetch']);
    db.run("INSERT INTO pets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))", [lunaId, userId, 'Luna', 'CAT', 'Maine Coon', 'FEMALE_SPAYED', '2021-07-22', 5.2, '985198765432109', null]);
    
    db.run("INSERT INTO allergies VALUES (?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Chicken', 'GI upset, itching', 'moderate']);
    db.run("INSERT INTO allergies VALUES (?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Cephalexin', 'Hives', 'severe']);
    
    db.run("INSERT INTO conditions VALUES (?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Hip Dysplasia', 'managed', '2023-06-15']);
    db.run("INSERT INTO conditions VALUES (?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Environmental Allergies', 'active', '2022-04-01']);
    
    db.run("INSERT INTO medications VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Apoquel', '16mg', 'Once daily', 'Allergic dermatitis', 'ACTIVE', '2024-01-01']);
    db.run("INSERT INTO medications VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Cosequin', '1 chew', 'Once daily', 'Joint support', 'ACTIVE', '2023-06-20']);
    db.run("INSERT INTO medications VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Simparica Trio', '24mg', 'Monthly', 'Prevention', 'ACTIVE', '2024-01-01']);
    
    db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Rabies', '2024-01-15', '2027-01-15', 'Happy Paws Veterinary']);
    db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'DAPP', '2024-01-15', '2025-01-15', 'Happy Paws Veterinary']);
    db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Bordetella', '2024-07-15', '2025-01-15', 'Happy Paws Veterinary']);
    db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?)", [uuidv4(), lunaId, 'FVRCP', '2024-01-20', '2025-01-20', 'City Cat Clinic']);
    db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?)", [uuidv4(), lunaId, 'Rabies', '2024-01-20', '2027-01-20', 'City Cat Clinic']);
    
    db.run("INSERT INTO medical_records VALUES (?, ?, ?, ?, ?, ?, datetime('now'))", [uuidv4(), maxId, 'WELLNESS', '2024-01-15', 'Happy Paws Veterinary', 'Annual wellness exam. Max is healthy overall. Allergic dermatitis remains well-controlled on Apoquel.']);
    db.run("INSERT INTO medical_records VALUES (?, ?, ?, ?, ?, ?, datetime('now'))", [uuidv4(), maxId, 'SPECIALIST', '2023-06-15', 'Regional Vet Specialists', 'Orthopedic consultation confirms bilateral hip dysplasia. Starting conservative management.']);
    db.run("INSERT INTO medical_records VALUES (?, ?, ?, ?, ?, ?, datetime('now'))", [uuidv4(), lunaId, 'WELLNESS', '2024-01-20', 'City Cat Clinic', 'Annual wellness exam. Luna is healthy. Mild dental tartar noted.']);
    
    db.run("INSERT INTO lab_results VALUES (?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Chemistry Panel', '2024-01-15', JSON.stringify([{test:'BUN',value:'18',unit:'mg/dL',range:'7-27'},{test:'Creatinine',value:'1.2',unit:'mg/dL',range:'0.5-1.8'},{test:'ALT',value:'45',unit:'U/L',range:'10-125'}]), 'All values within normal limits']);
    db.run("INSERT INTO lab_results VALUES (?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'CBC', '2024-01-15', JSON.stringify([{test:'WBC',value:'12.5',unit:'K/uL',range:'5.5-16.9'},{test:'RBC',value:'7.2',unit:'M/uL',range:'5.5-8.5'}]), 'CBC within normal limits']);
    
    db.run("INSERT INTO weight_records VALUES (?, ?, ?, ?)", [uuidv4(), maxId, 32.5, '2024-01-15']);
    db.run("INSERT INTO weight_records VALUES (?, ?, ?, ?)", [uuidv4(), maxId, 33.2, '2023-10-01']);
    db.run("INSERT INTO weight_records VALUES (?, ?, ?, ?)", [uuidv4(), maxId, 31.8, '2023-01-20']);
    
    db.run("INSERT INTO access_tokens VALUES (?, ?, ?, ?, ?, ?, 1)", [uuidv4(), userId, maxId, 'demo-share-token', 'FULL_ACCESS', '2025-12-31']);
    
    console.log('✅ Demo data seeded');
  }
}

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// Helper
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results[0] || null;
}

// AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) return res.status(400).json({ error: 'All fields required' });
  
  const existing = queryOne("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
  if (existing) return res.status(400).json({ error: 'Email already registered' });
  
  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO users VALUES (?, ?, ?, ?, ?, 'FREE', ?)", [id, email.toLowerCase(), hash, firstName, lastName, uuidv4()]);
  
  const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id, email, firstName, lastName } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = queryOne("SELECT * FROM users WHERE email = ?", [email?.toLowerCase()]);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, subscriptionTier: user.subscription_tier } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = queryOne("SELECT * FROM users WHERE id = ?", [req.userId]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const pets = query("SELECT COUNT(*) as count FROM pets WHERE owner_id = ?", [req.userId]);
  res.json({ id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, subscriptionTier: user.subscription_tier, emailForwarding: user.email_forwarding, _count: { pets: pets[0]?.count || 0 } });
});

// PET ROUTES
app.get('/api/pets', auth, (req, res) => {
  const pets = query("SELECT * FROM pets WHERE owner_id = ? ORDER BY created_at DESC", [req.userId]);
  const enriched = pets.map(p => ({
    id: p.id, name: p.name, species: p.species, breed: p.breed, sex: p.sex, dateOfBirth: p.date_of_birth, weightKg: p.weight_kg, microchipId: p.microchip_id, notes: p.notes,
    allergies: query("SELECT * FROM allergies WHERE pet_id = ?", [p.id]),
    conditions: query("SELECT * FROM conditions WHERE pet_id = ?", [p.id]),
    medications: query("SELECT * FROM medications WHERE pet_id = ? AND status = 'ACTIVE'", [p.id]),
    _count: {
      medicalRecords: query("SELECT COUNT(*) as c FROM medical_records WHERE pet_id = ?", [p.id])[0]?.c || 0,
      vaccinations: query("SELECT COUNT(*) as c FROM vaccinations WHERE pet_id = ?", [p.id])[0]?.c || 0,
    }
  }));
  res.json(enriched);
});

app.get('/api/pets/:id', auth, (req, res) => {
  const pet = queryOne("SELECT * FROM pets WHERE id = ? AND owner_id = ?", [req.params.id, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  res.json({
    id: pet.id, name: pet.name, species: pet.species, breed: pet.breed, sex: pet.sex, dateOfBirth: pet.date_of_birth, weightKg: pet.weight_kg, microchipId: pet.microchip_id, notes: pet.notes,
    allergies: query("SELECT * FROM allergies WHERE pet_id = ?", [pet.id]),
    conditions: query("SELECT * FROM conditions WHERE pet_id = ?", [pet.id]),
    medications: query("SELECT * FROM medications WHERE pet_id = ?", [pet.id]),
    vaccinations: query("SELECT * FROM vaccinations WHERE pet_id = ?", [pet.id]),
    weightHistory: query("SELECT * FROM weight_records WHERE pet_id = ? ORDER BY date DESC LIMIT 10", [pet.id]),
  });
});

app.post('/api/pets', auth, (req, res) => {
  const { name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes } = req.body;
  if (!name || !species || !sex) return res.status(400).json({ error: 'Name, species, sex required' });
  const id = uuidv4();
  db.run("INSERT INTO pets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))", [id, req.userId, name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes]);
  if (weightKg) db.run("INSERT INTO weight_records VALUES (?, ?, ?, date('now'))", [uuidv4(), id, weightKg]);
  res.status(201).json({ id, name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes, allergies: [], conditions: [] });
});

app.delete('/api/pets/:id', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.id, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  db.run("DELETE FROM pets WHERE id = ?", [req.params.id]);
  db.run("DELETE FROM allergies WHERE pet_id = ?", [req.params.id]);
  db.run("DELETE FROM conditions WHERE pet_id = ?", [req.params.id]);
  db.run("DELETE FROM medications WHERE pet_id = ?", [req.params.id]);
  db.run("DELETE FROM vaccinations WHERE pet_id = ?", [req.params.id]);
  db.run("DELETE FROM medical_records WHERE pet_id = ?", [req.params.id]);
  res.json({ message: 'Deleted' });
});

// TIMELINE
app.get('/api/pets/:id/timeline', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.id, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  
  const records = query("SELECT *, 'record' as type FROM medical_records WHERE pet_id = ?", [req.params.id]);
  const vaccinations = query("SELECT *, 'vaccination' as type FROM vaccinations WHERE pet_id = ?", [req.params.id]);
  const labs = query("SELECT *, 'lab' as type FROM lab_results WHERE pet_id = ?", [req.params.id]);
  
  const timeline = [
    ...records.map(r => ({ type: 'record', subtype: r.record_type, date: r.date_of_service, data: r })),
    ...vaccinations.map(v => ({ type: 'vaccination', subtype: v.vaccine_name, date: v.administration_date, data: v })),
    ...labs.map(l => ({ type: 'lab', subtype: l.panel_name, date: l.collection_date, data: { ...l, results: JSON.parse(l.results || '[]') } })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json(timeline);
});

// RECORDS
app.get('/api/records/pet/:petId', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  res.json(query("SELECT * FROM medical_records WHERE pet_id = ? ORDER BY date_of_service DESC", [req.params.petId]));
});

app.post('/api/records', auth, (req, res) => {
  const { petId, recordType, dateOfService, facilityName, summary } = req.body;
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const id = uuidv4();
  db.run("INSERT INTO medical_records VALUES (?, ?, ?, ?, ?, ?, datetime('now'))", [id, petId, recordType, dateOfService, facilityName, summary]);
  res.status(201).json({ id, petId, recordType, dateOfService, facilityName, summary });
});

// VACCINATIONS
app.get('/api/records/vaccinations/pet/:petId', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  res.json(query("SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY administration_date DESC", [req.params.petId]));
});

app.post('/api/records/vaccinations', auth, (req, res) => {
  const { petId, vaccineName, administrationDate, validUntil, facilityName } = req.body;
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const id = uuidv4();
  db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?)", [id, petId, vaccineName, administrationDate, validUntil, facilityName]);
  res.status(201).json({ id, petId, vaccineName, administrationDate, validUntil, facilityName });
});

// MEDICATIONS
app.get('/api/records/medications/pet/:petId', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const status = req.query.status;
  const sql = status ? "SELECT * FROM medications WHERE pet_id = ? AND status = ?" : "SELECT * FROM medications WHERE pet_id = ?";
  res.json(query(sql, status ? [req.params.petId, status] : [req.params.petId]));
});

app.post('/api/records/medications', auth, (req, res) => {
  const { petId, drugName, dose, frequency, indication, status } = req.body;
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const id = uuidv4();
  db.run("INSERT INTO medications VALUES (?, ?, ?, ?, ?, ?, ?, date('now'))", [id, petId, drugName, dose, frequency, indication, status || 'ACTIVE']);
  res.status(201).json({ id, petId, drugName, dose, frequency, indication, status: status || 'ACTIVE' });
});

// LABS
app.get('/api/records/labs/pet/:petId', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const labs = query("SELECT * FROM lab_results WHERE pet_id = ? ORDER BY collection_date DESC", [req.params.petId]);
  res.json(labs.map(l => ({ ...l, results: JSON.parse(l.results || '[]') })));
});

// ALLERGIES
app.post('/api/pets/:id/allergies', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.id, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const { allergen, reaction, severity } = req.body;
  const id = uuidv4();
  db.run("INSERT INTO allergies VALUES (?, ?, ?, ?, ?)", [id, req.params.id, allergen, reaction, severity]);
  res.status(201).json({ id, allergen, reaction, severity });
});

app.delete('/api/pets/:petId/allergies/:allergyId', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  db.run("DELETE FROM allergies WHERE id = ?", [req.params.allergyId]);
  res.json({ message: 'Deleted' });
});

// CONDITIONS
app.post('/api/pets/:id/conditions', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.id, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const { condition, status, diagnosedDate } = req.body;
  const id = uuidv4();
  db.run("INSERT INTO conditions VALUES (?, ?, ?, ?, ?)", [id, req.params.id, condition, status || 'active', diagnosedDate]);
  res.status(201).json({ id, condition, status: status || 'active', diagnosedDate });
});

// SHARING
app.post('/api/share/quick-share', auth, async (req, res) => {
  const { petId, duration, permissionLevel } = req.body;
  const pet = queryOne("SELECT id, name FROM pets WHERE id = ? AND owner_id = ?", [petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  
  let validUntil = null;
  const now = new Date();
  if (duration === '1h') validUntil = new Date(now.getTime() + 60*60*1000).toISOString();
  else if (duration === '24h') validUntil = new Date(now.getTime() + 24*60*60*1000).toISOString();
  else if (duration === '7d') validUntil = new Date(now.getTime() + 7*24*60*60*1000).toISOString();
  else if (duration === '30d') validUntil = new Date(now.getTime() + 30*24*60*60*1000).toISOString();
  
  const id = uuidv4();
  const token = uuidv4();
  db.run("INSERT INTO access_tokens VALUES (?, ?, ?, ?, ?, ?, 1)", [id, req.userId, petId, token, permissionLevel || 'FULL_ACCESS', validUntil]);
  
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  const shareUrl = `${baseUrl}/share/${token}`;
  const qrCode = await QRCode.toDataURL(shareUrl, { width: 300 });
  
  res.json({ token: { id, petId, token, permissionLevel: permissionLevel || 'FULL_ACCESS', validUntil, pet }, shareUrl, qrCode });
});

app.get('/api/share/my-shares', auth, (req, res) => {
  const shares = query(`SELECT at.*, p.name as pet_name FROM access_tokens at JOIN pets p ON at.pet_id = p.id WHERE at.user_id = ? AND at.is_active = 1`, [req.userId]);
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  res.json(shares.map(s => ({
    id: s.id, petId: s.pet_id, token: s.token, permissionLevel: s.permission_level, validUntil: s.valid_until,
    pet: { id: s.pet_id, name: s.pet_name },
    shareUrl: `${baseUrl}/share/${s.token}`,
    isExpired: s.valid_until && new Date(s.valid_until) < new Date()
  })));
});

app.post('/api/share/:tokenId/revoke', auth, (req, res) => {
  db.run("UPDATE access_tokens SET is_active = 0 WHERE id = ? AND user_id = ?", [req.params.tokenId, req.userId]);
  res.json({ message: 'Revoked' });
});

app.get('/api/share/validate/:token', (req, res) => {
  const token = queryOne("SELECT * FROM access_tokens WHERE token = ?", [req.params.token]);
  if (!token) return res.status(404).json({ error: 'Invalid share link' });
  if (!token.is_active) return res.status(403).json({ error: 'Share has been revoked' });
  if (token.valid_until && new Date(token.valid_until) < new Date()) return res.status(403).json({ error: 'Share has expired' });
  
  const pet = queryOne("SELECT id, name, species FROM pets WHERE id = ?", [token.pet_id]);
  res.json({ valid: true, pet, permissionLevel: token.permission_level });
});

app.post('/api/share/access/:token', (req, res) => {
  const token = queryOne("SELECT * FROM access_tokens WHERE token = ?", [req.params.token]);
  if (!token || !token.is_active) return res.status(404).json({ error: 'Invalid share link' });
  if (token.valid_until && new Date(token.valid_until) < new Date()) return res.status(403).json({ error: 'Expired' });
  
  const pet = queryOne("SELECT * FROM pets WHERE id = ?", [token.pet_id]);
  const allergies = query("SELECT * FROM allergies WHERE pet_id = ?", [token.pet_id]);
  const conditions = query("SELECT * FROM conditions WHERE pet_id = ?", [token.pet_id]);
  const medications = query("SELECT * FROM medications WHERE pet_id = ? AND status = 'ACTIVE'", [token.pet_id]);
  const vaccinations = query("SELECT * FROM vaccinations WHERE pet_id = ?", [token.pet_id]);
  
  let data = { pet: { name: pet.name, species: pet.species, breed: pet.breed, sex: pet.sex, weightKg: pet.weight_kg }, allergies, conditions, activeMedications: medications, vaccinations };
  
  if (token.permission_level === 'FULL_ACCESS') {
    const records = query("SELECT * FROM medical_records WHERE pet_id = ? ORDER BY date_of_service DESC", [token.pet_id]);
    const labs = query("SELECT * FROM lab_results WHERE pet_id = ?", [token.pet_id]).map(l => ({ ...l, results: JSON.parse(l.results || '[]') }));
    data.medicalRecords = records;
    data.labResults = labs;
  }
  
  res.json(data);
});

// HEALTH CHECK
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐾 PetRecord running on http://localhost:${PORT}`);
    console.log(`   Demo: demo@petrecord.com / demo123`);
  });
});
