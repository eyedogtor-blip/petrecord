const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'petrecord-secret-change-me';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    cb(null, allowed.includes(file.mimetype));
  }
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database setup - PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, email TEXT UNIQUE, password_hash TEXT, first_name TEXT, 
        last_name TEXT, subscription_tier TEXT DEFAULT 'FREE', email_forwarding TEXT
      );
      CREATE TABLE IF NOT EXISTS pets (
        id TEXT PRIMARY KEY, owner_id TEXT, name TEXT, species TEXT, breed TEXT, sex TEXT, 
        date_of_birth TEXT, weight_kg REAL, microchip_id TEXT, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS allergies (id TEXT PRIMARY KEY, pet_id TEXT, allergen TEXT, reaction TEXT, severity TEXT);
      CREATE TABLE IF NOT EXISTS conditions (id TEXT PRIMARY KEY, pet_id TEXT, condition TEXT, status TEXT, diagnosed_date TEXT);
      CREATE TABLE IF NOT EXISTS medications (
        id TEXT PRIMARY KEY, pet_id TEXT, drug_name TEXT, dose TEXT, frequency TEXT, 
        indication TEXT, status TEXT DEFAULT 'ACTIVE', start_date TEXT, prescribed_by TEXT
      );
      CREATE TABLE IF NOT EXISTS vaccinations (
        id TEXT PRIMARY KEY, pet_id TEXT, vaccine_name TEXT, administration_date TEXT, 
        valid_until TEXT, facility_name TEXT, lot_number TEXT
      );
      CREATE TABLE IF NOT EXISTS medical_records (
        id TEXT PRIMARY KEY, pet_id TEXT, record_type TEXT, date_of_service TEXT, facility_name TEXT, 
        provider_name TEXT, summary TEXT, chief_complaint TEXT, diagnosis TEXT, treatment TEXT, 
        notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS lab_results (
        id TEXT PRIMARY KEY, pet_id TEXT, panel_name TEXT, collection_date TEXT, 
        results TEXT, interpretation TEXT, facility_name TEXT
      );
      CREATE TABLE IF NOT EXISTS access_tokens (
        id TEXT PRIMARY KEY, user_id TEXT, pet_id TEXT, token TEXT UNIQUE, 
        permission_level TEXT, valid_until TEXT, is_active INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS weight_records (id TEXT PRIMARY KEY, pet_id TEXT, weight_kg REAL, date TEXT);
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY, pet_id TEXT, filename TEXT, mimetype TEXT, file_data TEXT, 
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, extracted_data TEXT, processing_status TEXT DEFAULT 'pending'
      );
      CREATE TABLE IF NOT EXISTS recordings (
        id TEXT PRIMARY KEY, pet_id TEXT, title TEXT, duration_seconds INTEGER, audio_data TEXT, 
        transcript TEXT, summary TEXT, extracted_data TEXT, recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
        processing_status TEXT DEFAULT 'pending'
      );
    `);
    
    // Seed demo data
    const existing = await client.query("SELECT id FROM users WHERE email = 'demo@petrecord.com'");
    if (existing.rows.length === 0) {
      const userId = uuidv4();
      const hash = bcrypt.hashSync('demo123', 10);
      await client.query("INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6, $7)", [userId, 'demo@petrecord.com', hash, 'Demo', 'User', 'PREMIUM', uuidv4()]);
      
      const maxId = 'demo-pet-max';
      const lunaId = 'demo-pet-luna';
      await client.query("INSERT INTO pets VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)", [maxId, userId, 'Max', 'DOG', 'Golden Retriever', 'MALE_NEUTERED', '2019-03-15', 32.5, '985112345678901', 'Friendly, loves fetch']);
      await client.query("INSERT INTO pets VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)", [lunaId, userId, 'Luna', 'CAT', 'Maine Coon', 'FEMALE_SPAYED', '2021-07-22', 5.2, '985198765432109', null]);
      
      await client.query("INSERT INTO allergies VALUES ($1, $2, $3, $4, $5)", [uuidv4(), maxId, 'Chicken', 'GI upset, itching', 'moderate']);
      await client.query("INSERT INTO allergies VALUES ($1, $2, $3, $4, $5)", [uuidv4(), maxId, 'Cephalexin', 'Hives', 'severe']);
      
      await client.query("INSERT INTO conditions VALUES ($1, $2, $3, $4, $5)", [uuidv4(), maxId, 'Hip Dysplasia', 'managed', '2023-06-15']);
      await client.query("INSERT INTO conditions VALUES ($1, $2, $3, $4, $5)", [uuidv4(), maxId, 'Environmental Allergies', 'active', '2022-04-01']);
      
      await client.query("INSERT INTO medications VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [uuidv4(), maxId, 'Apoquel', '16mg', 'Once daily', 'Allergic dermatitis', 'ACTIVE', '2024-01-01', 'Dr. Smith']);
      await client.query("INSERT INTO medications VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [uuidv4(), maxId, 'Cosequin', '1 chew', 'Once daily', 'Joint support', 'ACTIVE', '2023-06-20', 'Dr. Smith']);
      await client.query("INSERT INTO medications VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [uuidv4(), maxId, 'Simparica Trio', '24mg', 'Monthly', 'Prevention', 'ACTIVE', '2024-01-01', 'Dr. Smith']);
      
      await client.query("INSERT INTO vaccinations VALUES ($1, $2, $3, $4, $5, $6, $7)", [uuidv4(), maxId, 'Rabies', '2024-01-15', '2027-01-15', 'Happy Paws Veterinary', 'RAB-2024-001']);
      await client.query("INSERT INTO vaccinations VALUES ($1, $2, $3, $4, $5, $6, $7)", [uuidv4(), maxId, 'DAPP', '2024-01-15', '2025-01-15', 'Happy Paws Veterinary', 'DAPP-2024-015']);
      await client.query("INSERT INTO vaccinations VALUES ($1, $2, $3, $4, $5, $6, $7)", [uuidv4(), maxId, 'Bordetella', '2024-07-15', '2025-01-15', 'Happy Paws Veterinary', 'BORD-2024-088']);
      await client.query("INSERT INTO vaccinations VALUES ($1, $2, $3, $4, $5, $6, $7)", [uuidv4(), lunaId, 'FVRCP', '2024-01-20', '2025-01-20', 'City Cat Clinic', 'FVR-2024-042']);
      await client.query("INSERT INTO vaccinations VALUES ($1, $2, $3, $4, $5, $6, $7)", [uuidv4(), lunaId, 'Rabies', '2024-01-20', '2027-01-20', 'City Cat Clinic', 'RAB-2024-102']);
      
      await client.query("INSERT INTO medical_records VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)", [uuidv4(), maxId, 'WELLNESS', '2024-01-15', 'Happy Paws Veterinary', 'Dr. Sarah Smith', 'Annual wellness exam. Max is healthy overall.', 'Annual checkup', 'Healthy, mild allergies', 'Continue current medications', 'Weight stable']);
      await client.query("INSERT INTO medical_records VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)", [uuidv4(), maxId, 'SPECIALIST', '2023-06-15', 'Regional Vet Specialists', 'Dr. Michael Chen', 'Orthopedic consultation confirms bilateral hip dysplasia.', 'Lameness evaluation', 'Bilateral hip dysplasia', 'Conservative management', 'Avoid high-impact activities']);
      await client.query("INSERT INTO medical_records VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)", [uuidv4(), lunaId, 'WELLNESS', '2024-01-20', 'City Cat Clinic', 'Dr. Emily Johnson', 'Annual wellness exam. Luna is healthy.', 'Annual checkup', 'Healthy, mild dental tartar', 'Dental treats recommended', 'Consider dental cleaning']);
      
      await client.query("INSERT INTO lab_results VALUES ($1, $2, $3, $4, $5, $6, $7)", [uuidv4(), maxId, 'Chemistry Panel', '2024-01-15', JSON.stringify([{test:'BUN',value:'18',unit:'mg/dL',range:'7-27',flag:null},{test:'Creatinine',value:'1.2',unit:'mg/dL',range:'0.5-1.8',flag:null}]), 'All values within normal limits', 'Happy Paws Veterinary']);
      
      await client.query("INSERT INTO weight_records VALUES ($1, $2, $3, $4)", [uuidv4(), maxId, 32.5, '2024-01-15']);
      await client.query("INSERT INTO weight_records VALUES ($1, $2, $3, $4)", [uuidv4(), maxId, 33.2, '2023-10-01']);
      
      await client.query("INSERT INTO access_tokens VALUES ($1, $2, $3, $4, $5, $6, 1)", [uuidv4(), userId, maxId, 'demo-share-token', 'FULL_ACCESS', '2025-12-31']);
      
      console.log('✅ Demo data seeded');
    }
  } finally {
    client.release();
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

// Helper functions
async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

async function queryOne(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

async function run(sql, params = []) {
  return pool.query(sql, params);
}

// ================== AI DOCUMENT EXTRACTION ==================

async function extractWithClaude(base64Data, mimeType, petInfo) {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');
  
  console.log(`Calling Claude API for ${petInfo.name} (${mimeType})`);
  const contentType = mimeType === 'application/pdf' ? 'document' : 'image';
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          { type: contentType, source: { type: 'base64', media_type: mimeType, data: base64Data } },
          { type: 'text', text: `Extract veterinary data for ${petInfo.name} (${petInfo.species}, ${petInfo.breed || 'unknown'}). Return JSON with: document_type, date_of_service, facility_name, provider_name, visit_summary, chief_complaint, diagnosis, treatment, notes, vaccinations[], medications_prescribed[], lab_results{}, allergies_noted[], conditions_noted[], weight_kg, follow_up. Return ONLY valid JSON.` }
        ]
      }]
    })
  });

  const responseText = await response.text();
  if (!response.ok) throw new Error(`Claude API error (${response.status}): ${responseText.substring(0, 200)}`);
  
  const data = JSON.parse(responseText);
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('No text content in Claude response');
  
  try { return JSON.parse(text); } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) return JSON.parse(match[1]);
    throw new Error('Failed to parse extraction results');
  }
}

async function saveExtractedData(petId, extracted) {
  const saved = { vaccinations: [], medications: [], records: [], labs: [], allergies: [], conditions: [] };
  const n = (val) => val === undefined ? null : val;
  
  if (extracted.vaccinations?.length) {
    for (const vax of extracted.vaccinations) {
      const id = uuidv4();
      await run("INSERT INTO vaccinations VALUES ($1, $2, $3, $4, $5, $6, $7)", [id, petId, n(vax.name), n(vax.date), n(vax.valid_until), n(extracted.facility_name), n(vax.lot_number)]);
      saved.vaccinations.push({ id, ...vax });
    }
  }
  
  if (extracted.medications_prescribed?.length) {
    for (const med of extracted.medications_prescribed) {
      const id = uuidv4();
      await run("INSERT INTO medications VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [id, petId, n(med.drug_name), n(med.dose), n(med.frequency), n(med.indication), 'ACTIVE', n(extracted.date_of_service) || new Date().toISOString().split('T')[0], n(med.prescribed_by) || n(extracted.provider_name)]);
      saved.medications.push({ id, ...med });
    }
  }
  
  if (extracted.visit_summary || extracted.diagnosis || extracted.treatment || extracted.document_type) {
    const id = uuidv4();
    await run("INSERT INTO medical_records VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)", [id, petId, n(extracted.document_type)?.toUpperCase() || 'OTHER', n(extracted.date_of_service), n(extracted.facility_name), n(extracted.provider_name), n(extracted.visit_summary), n(extracted.chief_complaint), n(extracted.diagnosis), n(extracted.treatment), n(extracted.notes) || n(extracted.follow_up)]);
    saved.records.push({ id, type: extracted.document_type, summary: extracted.visit_summary });
  }
  
  if (extracted.lab_results?.results?.length) {
    const id = uuidv4();
    await run("INSERT INTO lab_results VALUES ($1, $2, $3, $4, $5, $6, $7)", [id, petId, n(extracted.lab_results.panel_name), n(extracted.lab_results.collection_date) || n(extracted.date_of_service), JSON.stringify(extracted.lab_results.results), n(extracted.lab_results.interpretation), n(extracted.facility_name)]);
    saved.labs.push({ id, panel: extracted.lab_results.panel_name });
  }
  
  if (extracted.allergies_noted?.length) {
    for (const allergy of extracted.allergies_noted) {
      const existing = await queryOne("SELECT id FROM allergies WHERE pet_id = $1 AND allergen = $2", [petId, n(allergy.allergen)]);
      if (!existing && allergy.allergen) {
        const id = uuidv4();
        await run("INSERT INTO allergies VALUES ($1, $2, $3, $4, $5)", [id, petId, n(allergy.allergen), n(allergy.reaction), n(allergy.severity)]);
        saved.allergies.push({ id, ...allergy });
      }
    }
  }
  
  if (extracted.conditions_noted?.length) {
    for (const cond of extracted.conditions_noted) {
      const existing = await queryOne("SELECT id FROM conditions WHERE pet_id = $1 AND condition = $2", [petId, n(cond.condition)]);
      if (!existing && cond.condition) {
        const id = uuidv4();
        await run("INSERT INTO conditions VALUES ($1, $2, $3, $4, $5)", [id, petId, n(cond.condition), n(cond.status) || 'active', n(extracted.date_of_service)]);
        saved.conditions.push({ id, ...cond });
      }
    }
  }
  
  if (extracted.weight_kg && typeof extracted.weight_kg === 'number') {
    await run("INSERT INTO weight_records VALUES ($1, $2, $3, $4)", [uuidv4(), petId, extracted.weight_kg, n(extracted.date_of_service) || new Date().toISOString().split('T')[0]]);
    await run("UPDATE pets SET weight_kg = $1 WHERE id = $2", [extracted.weight_kg, petId]);
  }
  
  return saved;
}

// ================== AUTH ROUTES ==================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const existing = await queryOne("SELECT id FROM users WHERE email = $1", [email]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    
    const id = uuidv4();
    const hash = bcrypt.hashSync(password, 10);
    await run("INSERT INTO users VALUES ($1, $2, $3, $4, $5, 'FREE', $6)", [id, email, hash, firstName, lastName, uuidv4()]);
    
    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id, email, firstName, lastName } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await queryOne("SELECT * FROM users WHERE email = $1", [email]);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await queryOne("SELECT id, email, first_name, last_name, subscription_tier FROM users WHERE id = $1", [req.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, tier: user.subscription_tier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== PET ROUTES ==================

app.get('/api/pets', auth, async (req, res) => {
  try {
    const pets = await query("SELECT * FROM pets WHERE owner_id = $1 ORDER BY created_at DESC", [req.userId]);
    const result = await Promise.all(pets.map(async p => {
      const allergies = await query("SELECT * FROM allergies WHERE pet_id = $1", [p.id]);
      const conditions = await query("SELECT * FROM conditions WHERE pet_id = $1", [p.id]);
      const medications = await query("SELECT * FROM medications WHERE pet_id = $1 AND status = 'ACTIVE'", [p.id]);
      const vaccinations = await query("SELECT * FROM vaccinations WHERE pet_id = $1", [p.id]);
      return { id: p.id, name: p.name, species: p.species, breed: p.breed, sex: p.sex, dateOfBirth: p.date_of_birth, weightKg: p.weight_kg, microchipId: p.microchip_id, notes: p.notes, allergies, conditions, medications, vaccinations };
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pets/:id', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT * FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    const [allergies, conditions, medications, vaccinations, records, labs, weights] = await Promise.all([
      query("SELECT * FROM allergies WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM conditions WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM medications WHERE pet_id = $1 AND status = 'ACTIVE'", [pet.id]),
      query("SELECT * FROM vaccinations WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM medical_records WHERE pet_id = $1 ORDER BY date_of_service DESC", [pet.id]),
      query("SELECT * FROM lab_results WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM weight_records WHERE pet_id = $1 ORDER BY date DESC LIMIT 10", [pet.id])
    ]);
    
    res.json({
      id: pet.id, name: pet.name, species: pet.species, breed: pet.breed, sex: pet.sex,
      dateOfBirth: pet.date_of_birth, weightKg: pet.weight_kg, microchipId: pet.microchip_id, notes: pet.notes,
      allergies, conditions, medications, vaccinations, medicalRecords: records,
      labResults: labs.map(l => ({ ...l, results: JSON.parse(l.results || '[]') })),
      weightHistory: weights
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pets', auth, async (req, res) => {
  try {
    const { name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes } = req.body;
    const id = uuidv4();
    await run("INSERT INTO pets VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)", [id, req.userId, name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes]);
    res.status(201).json({ id, name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes });
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pets/:id', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    const { name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes } = req.body;
    await run("UPDATE pets SET name=$1, species=$2, breed=$3, sex=$4, date_of_birth=$5, weight_kg=$6, microchip_id=$7, notes=$8 WHERE id=$9", [name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes, req.params.id]);
    res.json({ id: req.params.id, name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pets/:id', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    await run("DELETE FROM allergies WHERE pet_id = $1", [req.params.id]);
    await run("DELETE FROM conditions WHERE pet_id = $1", [req.params.id]);
    await run("DELETE FROM medications WHERE pet_id = $1", [req.params.id]);
    await run("DELETE FROM vaccinations WHERE pet_id = $1", [req.params.id]);
    await run("DELETE FROM medical_records WHERE pet_id = $1", [req.params.id]);
    await run("DELETE FROM lab_results WHERE pet_id = $1", [req.params.id]);
    await run("DELETE FROM documents WHERE pet_id = $1", [req.params.id]);
    await run("DELETE FROM recordings WHERE pet_id = $1", [req.params.id]);
    await run("DELETE FROM pets WHERE id = $1", [req.params.id]);
    res.json({ message: 'Pet deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== TIMELINE ==================

app.get('/api/pets/:id/timeline', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    const records = await query("SELECT * FROM medical_records WHERE pet_id = $1 ORDER BY date_of_service DESC", [req.params.id]);
    const vaccinations = await query("SELECT * FROM vaccinations WHERE pet_id = $1", [req.params.id]);
    const labs = await query("SELECT * FROM lab_results WHERE pet_id = $1", [req.params.id]);
    
    const timeline = [
      ...records.map(r => ({ type: 'record', subtype: r.record_type, date: r.date_of_service, data: { ...r, summary: r.summary } })),
      ...vaccinations.map(v => ({ type: 'vaccination', subtype: v.vaccine_name, date: v.administration_date, data: v })),
      ...labs.map(l => ({ type: 'lab', subtype: l.panel_name, date: l.collection_date, data: { ...l, results: JSON.parse(l.results || '[]') } }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== DOCUMENT UPLOAD ==================

app.post('/api/pets/:id/upload', auth, upload.single('document'), async (req, res) => {
  try {
    const pet = await queryOne("SELECT * FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const base64Data = req.file.buffer.toString('base64');
    console.log(`Processing upload: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);
    
    if (!ANTHROPIC_API_KEY) {
      const docId = uuidv4();
      await run("INSERT INTO documents (id, pet_id, filename, mimetype, file_data, extracted_data, processing_status) VALUES ($1, $2, $3, $4, $5, $6, 'manual')", [docId, req.params.id, req.file.originalname, req.file.mimetype, base64Data, null]);
      return res.json({ success: true, documentId: docId, message: 'Document saved (AI extraction not configured)' });
    }
    
    let extracted;
    try {
      extracted = await extractWithClaude(base64Data, req.file.mimetype, { name: pet.name, species: pet.species, breed: pet.breed });
    } catch (err) {
      console.error('Claude extraction error:', err);
      return res.status(500).json({ error: `AI extraction failed: ${err.message}` });
    }
    
    let saved;
    try {
      saved = await saveExtractedData(req.params.id, extracted);
    } catch (err) {
      console.error('Save extracted data error:', err);
      return res.status(500).json({ error: `Failed to save extracted data: ${err.message}` });
    }
    
    const docId = uuidv4();
    await run("INSERT INTO documents (id, pet_id, filename, mimetype, file_data, extracted_data, processing_status) VALUES ($1, $2, $3, $4, $5, $6, 'completed')", [docId, req.params.id, req.file.originalname, req.file.mimetype, base64Data, JSON.stringify(extracted)]);
    
    res.json({ success: true, documentId: docId, extracted, saved, message: `Successfully extracted data from ${req.file.originalname}` });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================== DOCUMENTS ==================

app.get('/api/pets/:id/documents', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    const docs = await query("SELECT id, filename, mimetype, upload_date, processing_status, extracted_data FROM documents WHERE pet_id = $1 ORDER BY upload_date DESC", [req.params.id]);
    res.json(docs.map(d => ({ id: d.id, filename: d.filename, mimetype: d.mimetype, uploadDate: d.upload_date, status: d.processing_status, extracted: d.extracted_data ? JSON.parse(d.extracted_data) : null })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/documents/:id/file', auth, async (req, res) => {
  try {
    const doc = await queryOne("SELECT d.*, p.owner_id FROM documents d JOIN pets p ON d.pet_id = p.id WHERE d.id = $1", [req.params.id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    if (doc.owner_id !== req.userId) return res.status(403).json({ error: 'Access denied' });
    
    const buffer = Buffer.from(doc.file_data, 'base64');
    res.setHeader('Content-Type', doc.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${doc.filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== RECORDINGS ==================

app.get('/api/pets/:id/recordings', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    const recordings = await query("SELECT id, title, duration_seconds, transcript, summary, extracted_data, recorded_at, processing_status FROM recordings WHERE pet_id = $1 ORDER BY recorded_at DESC", [req.params.id]);
    res.json(recordings.map(r => ({ id: r.id, title: r.title, duration: r.duration_seconds, transcript: r.transcript, summary: r.summary, extracted: r.extracted_data ? JSON.parse(r.extracted_data) : null, recordedAt: r.recorded_at, status: r.processing_status })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pets/:id/recordings', auth, upload.single('audio'), async (req, res) => {
  try {
    const pet = await queryOne("SELECT * FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    if (!req.file) return res.status(400).json({ error: 'No audio file' });
    if (!OPENAI_API_KEY) return res.status(503).json({ error: 'Transcription not configured. Add OPENAI_API_KEY.' });
    if (!ANTHROPIC_API_KEY) return res.status(503).json({ error: 'AI summarization not configured. Add ANTHROPIC_API_KEY.' });
    
    const duration = parseInt(req.body.duration) || 0;
    const title = req.body.title || `Exam Recording ${new Date().toLocaleDateString()}`;
    console.log(`Processing recording: ${title} (${duration}s, ${req.file.size} bytes)`);
    
    // Transcribe with Whisper using axios + form-data
    // Write buffer to temp file
    const tempPath = path.join(os.tmpdir(), `recording-${uuidv4()}.webm`);
    fs.writeFileSync(tempPath, req.file.buffer);
    console.log(`Temp file created: ${tempPath}, size: ${fs.statSync(tempPath).size} bytes`);
    
    let transcript;
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(tempPath), {
        filename: 'recording.webm',
        contentType: 'audio/webm'
      });
      formData.append('model', 'whisper-1');
      
      const whisperRes = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            ...formData.getHeaders()
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      transcript = whisperRes.data.text;
    } catch (whisperError) {
      console.error('Whisper error:', whisperError.response?.data || whisperError.message);
      throw new Error(`Transcription failed: ${JSON.stringify(whisperError.response?.data || whisperError.message)}`);
    } finally {
      // Clean up temp file
      try { fs.unlinkSync(tempPath); } catch (e) {}
    }
    
    console.log('Transcript:', transcript.substring(0, 200));
    
    // Summarize with Claude
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: `Analyze this vet exam transcript for ${pet.name} (${pet.species}). Return JSON: {summary, chief_complaint, findings, diagnosis, treatment_plan, medications_mentioned[], vaccinations_mentioned[], follow_up, concerns_noted[], questions_asked[], weight_kg}. Transcript: ${transcript}` }]
      })
    });
    
    if (!claudeRes.ok) throw new Error(`Summarization failed: ${await claudeRes.text()}`);
    const summaryText = (await claudeRes.json()).content[0].text;
    
    let extracted;
    try { extracted = JSON.parse(summaryText); } catch {
      const match = summaryText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      extracted = match ? JSON.parse(match[1]) : { summary: summaryText };
    }
    
    // Save recording
    const recordingId = uuidv4();
    const base64Audio = req.file.buffer.toString('base64');
    await run("INSERT INTO recordings (id, pet_id, title, duration_seconds, audio_data, transcript, summary, extracted_data, processing_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed')", [recordingId, req.params.id, title, duration, base64Audio, transcript, extracted.summary, JSON.stringify(extracted)]);
    
    // Save medical record
    await run("INSERT INTO medical_records (id, pet_id, record_type, date_of_service, summary, chief_complaint, diagnosis, treatment, notes) VALUES ($1, $2, 'EXAM_RECORDING', CURRENT_DATE, $3, $4, $5, $6, $7)", [uuidv4(), req.params.id, extracted.summary, extracted.chief_complaint, extracted.diagnosis, extracted.treatment_plan, extracted.follow_up]);
    
    // Save medications
    if (extracted.medications_mentioned?.length) {
      for (const med of extracted.medications_mentioned) {
        if (med.drug_name) {
          await run("INSERT INTO medications (id, pet_id, drug_name, dose, frequency, indication, status, start_date) VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', CURRENT_DATE)", [uuidv4(), req.params.id, med.drug_name, med.dose, med.frequency, med.indication]);
        }
      }
    }
    
    res.json({ success: true, recordingId, transcript, summary: extracted.summary, extracted, message: 'Recording transcribed and summarized' });
  } catch (error) {
    console.error('Recording error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================== MEDICATIONS ==================

app.get('/api/records/medications/pet/:petId', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [req.params.petId, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    const meds = await query("SELECT * FROM medications WHERE pet_id = $1 ORDER BY start_date DESC", [req.params.petId]);
    res.json(meds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/records/medications', auth, async (req, res) => {
  try {
    const { petId, drugName, dose, frequency, indication, status } = req.body;
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [petId, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    const id = uuidv4();
    await run("INSERT INTO medications (id, pet_id, drug_name, dose, frequency, indication, status, start_date) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)", [id, petId, drugName, dose, frequency, indication, status || 'ACTIVE']);
    res.status(201).json({ id, petId, drugName, dose, frequency, indication, status: status || 'ACTIVE' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== LABS ==================

app.get('/api/records/labs/pet/:petId', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [req.params.petId, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    const labs = await query("SELECT * FROM lab_results WHERE pet_id = $1 ORDER BY collection_date DESC", [req.params.petId]);
    res.json(labs.map(l => ({ ...l, results: JSON.parse(l.results || '[]') })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== ALLERGIES & CONDITIONS ==================

app.post('/api/pets/:id/allergies', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    const { allergen, reaction, severity } = req.body;
    const id = uuidv4();
    await run("INSERT INTO allergies VALUES ($1, $2, $3, $4, $5)", [id, req.params.id, allergen, reaction, severity]);
    res.status(201).json({ id, allergen, reaction, severity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pets/:petId/allergies/:allergyId', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [req.params.petId, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    await run("DELETE FROM allergies WHERE id = $1", [req.params.allergyId]);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pets/:id/conditions', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    const { condition, status, diagnosedDate } = req.body;
    const id = uuidv4();
    await run("INSERT INTO conditions VALUES ($1, $2, $3, $4, $5)", [id, req.params.id, condition, status || 'active', diagnosedDate]);
    res.status(201).json({ id, condition, status: status || 'active', diagnosedDate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================== SHARING ==================

app.post('/api/share/quick-share', auth, async (req, res) => {
  try {
    const { petId, duration, permissionLevel } = req.body;
    const pet = await queryOne("SELECT id, name FROM pets WHERE id = $1 AND owner_id = $2", [petId, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    let validUntil = null;
    const now = new Date();
    if (duration === '1h') validUntil = new Date(now.getTime() + 60*60*1000).toISOString();
    else if (duration === '24h') validUntil = new Date(now.getTime() + 24*60*60*1000).toISOString();
    else if (duration === '7d') validUntil = new Date(now.getTime() + 7*24*60*60*1000).toISOString();
    else if (duration === '30d') validUntil = new Date(now.getTime() + 30*24*60*60*1000).toISOString();
    
    const id = uuidv4();
    const token = uuidv4();
    await run("INSERT INTO access_tokens VALUES ($1, $2, $3, $4, $5, $6, 1)", [id, req.userId, petId, token, permissionLevel || 'FULL_ACCESS', validUntil]);
    
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    const shareUrl = `${baseUrl}/share/${token}`;
    const qrCode = await QRCode.toDataURL(shareUrl, { width: 300 });
    
    res.json({ token: { id, petId, token, permissionLevel: permissionLevel || 'FULL_ACCESS', validUntil, pet }, shareUrl, qrCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/share/my-shares', auth, async (req, res) => {
  try {
    const shares = await query("SELECT at.*, p.name as pet_name FROM access_tokens at JOIN pets p ON at.pet_id = p.id WHERE at.user_id = $1 AND at.is_active = 1", [req.userId]);
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    res.json(shares.map(s => ({
      id: s.id, petId: s.pet_id, token: s.token, permissionLevel: s.permission_level, validUntil: s.valid_until,
      pet: { id: s.pet_id, name: s.pet_name }, shareUrl: `${baseUrl}/share/${s.token}`,
      isExpired: s.valid_until && new Date(s.valid_until) < new Date()
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/share/:tokenId/revoke', auth, async (req, res) => {
  try {
    await run("UPDATE access_tokens SET is_active = 0 WHERE id = $1 AND user_id = $2", [req.params.tokenId, req.userId]);
    res.json({ message: 'Revoked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/share/validate/:token', async (req, res) => {
  try {
    const token = await queryOne("SELECT * FROM access_tokens WHERE token = $1", [req.params.token]);
    if (!token) return res.status(404).json({ error: 'Invalid share link' });
    if (!token.is_active) return res.status(403).json({ error: 'Share has been revoked' });
    if (token.valid_until && new Date(token.valid_until) < new Date()) return res.status(403).json({ error: 'Share has expired' });
    
    const pet = await queryOne("SELECT id, name, species FROM pets WHERE id = $1", [token.pet_id]);
    res.json({ valid: true, pet, permissionLevel: token.permission_level });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/share/access/:token', async (req, res) => {
  try {
    const token = await queryOne("SELECT * FROM access_tokens WHERE token = $1", [req.params.token]);
    if (!token || !token.is_active) return res.status(404).json({ error: 'Invalid share link' });
    if (token.valid_until && new Date(token.valid_until) < new Date()) return res.status(403).json({ error: 'Expired' });
    
    const pet = await queryOne("SELECT * FROM pets WHERE id = $1", [token.pet_id]);
    const allergies = await query("SELECT * FROM allergies WHERE pet_id = $1", [token.pet_id]);
    const conditions = await query("SELECT * FROM conditions WHERE pet_id = $1", [token.pet_id]);
    const medications = await query("SELECT * FROM medications WHERE pet_id = $1 AND status = 'ACTIVE'", [token.pet_id]);
    const vaccinations = await query("SELECT * FROM vaccinations WHERE pet_id = $1", [token.pet_id]);
    
    let data = { pet: { name: pet.name, species: pet.species, breed: pet.breed, sex: pet.sex, weightKg: pet.weight_kg }, allergies, conditions, activeMedications: medications, vaccinations };
    
    if (token.permission_level === 'FULL_ACCESS') {
      const records = await query("SELECT * FROM medical_records WHERE pet_id = $1 ORDER BY date_of_service DESC", [token.pet_id]);
      const labs = await query("SELECT * FROM lab_results WHERE pet_id = $1", [token.pet_id]);
      data.medicalRecords = records;
      data.labResults = labs.map(l => ({ ...l, results: JSON.parse(l.results || '[]') }));
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// HEALTH CHECK
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'postgresql' }));

// Serve frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Start server
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐾 PetRecord running on http://localhost:${PORT}`);
    console.log(`   Demo: demo@petrecord.com / demo123`);
    console.log(`   Database: PostgreSQL`);
    console.log(`   AI Extraction: ${ANTHROPIC_API_KEY ? '✅ Enabled' : '❌ Add ANTHROPIC_API_KEY'}`);
    console.log(`   Voice Transcription: ${OPENAI_API_KEY ? '✅ Enabled' : '❌ Add OPENAI_API_KEY'}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
