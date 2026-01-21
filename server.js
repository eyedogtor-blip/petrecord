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
const PDFDocument = require('pdfkit');

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

// Get lab trends for charting
app.get('/api/pets/:id/lab-trends', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    const labs = await query("SELECT * FROM lab_results WHERE pet_id = $1 ORDER BY collection_date ASC", [req.params.id]);
    
    // Reference ranges for common tests
    const referenceRanges = {
      // Chemistry
      'BUN': { min: 7, max: 27, unit: 'mg/dL', category: 'Kidney', name: 'Blood Urea Nitrogen' },
      'Creatinine': { min: 0.5, max: 1.8, unit: 'mg/dL', category: 'Kidney', name: 'Creatinine' },
      'SDMA': { min: 0, max: 14, unit: 'µg/dL', category: 'Kidney', name: 'SDMA' },
      'Phosphorus': { min: 2.5, max: 6.8, unit: 'mg/dL', category: 'Kidney', name: 'Phosphorus' },
      'ALT': { min: 10, max: 125, unit: 'U/L', category: 'Liver', name: 'ALT (SGPT)' },
      'ALP': { min: 23, max: 212, unit: 'U/L', category: 'Liver', name: 'Alkaline Phosphatase' },
      'AST': { min: 0, max: 50, unit: 'U/L', category: 'Liver', name: 'AST (SGOT)' },
      'GGT': { min: 0, max: 11, unit: 'U/L', category: 'Liver', name: 'GGT' },
      'Bilirubin': { min: 0, max: 0.9, unit: 'mg/dL', category: 'Liver', name: 'Total Bilirubin' },
      'Albumin': { min: 2.3, max: 4.0, unit: 'g/dL', category: 'Liver', name: 'Albumin' },
      'Glucose': { min: 74, max: 143, unit: 'mg/dL', category: 'Metabolic', name: 'Glucose' },
      'Fructosamine': { min: 190, max: 365, unit: 'µmol/L', category: 'Metabolic', name: 'Fructosamine' },
      'Cholesterol': { min: 110, max: 320, unit: 'mg/dL', category: 'Metabolic', name: 'Cholesterol' },
      'Triglycerides': { min: 50, max: 150, unit: 'mg/dL', category: 'Metabolic', name: 'Triglycerides' },
      'Total Protein': { min: 5.2, max: 8.2, unit: 'g/dL', category: 'Protein', name: 'Total Protein' },
      'Globulin': { min: 2.5, max: 4.5, unit: 'g/dL', category: 'Protein', name: 'Globulin' },
      // Electrolytes
      'Sodium': { min: 144, max: 160, unit: 'mEq/L', category: 'Electrolytes', name: 'Sodium' },
      'Potassium': { min: 3.5, max: 5.8, unit: 'mEq/L', category: 'Electrolytes', name: 'Potassium' },
      'Chloride': { min: 109, max: 122, unit: 'mEq/L', category: 'Electrolytes', name: 'Chloride' },
      'Calcium': { min: 7.9, max: 12.0, unit: 'mg/dL', category: 'Electrolytes', name: 'Calcium' },
      // CBC
      'WBC': { min: 5.5, max: 16.9, unit: 'K/µL', category: 'CBC', name: 'White Blood Cells' },
      'RBC': { min: 5.5, max: 8.5, unit: 'M/µL', category: 'CBC', name: 'Red Blood Cells' },
      'HCT': { min: 37, max: 55, unit: '%', category: 'CBC', name: 'Hematocrit' },
      'Hemoglobin': { min: 12, max: 18, unit: 'g/dL', category: 'CBC', name: 'Hemoglobin' },
      'Platelets': { min: 175, max: 500, unit: 'K/µL', category: 'CBC', name: 'Platelets' },
      'MCV': { min: 60, max: 77, unit: 'fL', category: 'CBC', name: 'MCV' },
      'MCH': { min: 19.5, max: 24.5, unit: 'pg', category: 'CBC', name: 'MCH' },
      'MCHC': { min: 31, max: 36, unit: 'g/dL', category: 'CBC', name: 'MCHC' },
      // Thyroid
      'T4': { min: 1.0, max: 4.0, unit: 'µg/dL', category: 'Thyroid', name: 'Total T4' },
      'Free T4': { min: 0.6, max: 2.5, unit: 'ng/dL', category: 'Thyroid', name: 'Free T4' },
      'TSH': { min: 0.03, max: 0.5, unit: 'ng/mL', category: 'Thyroid', name: 'TSH' },
      // Pancreas
      'Lipase': { min: 0, max: 200, unit: 'U/L', category: 'Pancreas', name: 'Lipase' },
      'Amylase': { min: 500, max: 1500, unit: 'U/L', category: 'Pancreas', name: 'Amylase' },
      'cPLI': { min: 0, max: 200, unit: 'µg/L', category: 'Pancreas', name: 'Canine Pancreatic Lipase' },
    };
    
    // Build trends by test name
    const trends = {};
    
    for (const lab of labs) {
      const results = JSON.parse(lab.results || '[]');
      const date = lab.collection_date;
      
      for (const result of results) {
        const testName = result.test || result.name;
        if (!testName) continue;
        
        // Normalize test name
        const normalizedName = normalizeTestName(testName);
        const value = parseFloat(result.value);
        if (isNaN(value)) continue;
        
        if (!trends[normalizedName]) {
          const ref = referenceRanges[normalizedName] || {};
          trends[normalizedName] = {
            name: ref.name || normalizedName,
            category: ref.category || 'Other',
            unit: result.unit || ref.unit || '',
            referenceRange: ref.min !== undefined ? { min: ref.min, max: ref.max } : null,
            dataPoints: []
          };
        }
        
        const ref = trends[normalizedName].referenceRange;
        let flag = null;
        if (ref) {
          if (value < ref.min) flag = 'low';
          else if (value > ref.max) flag = 'high';
        }
        
        trends[normalizedName].dataPoints.push({
          date,
          value,
          flag,
          panelName: lab.panel_name,
          facility: lab.facility_name
        });
      }
    }
    
    // Convert to array and sort by category
    const trendArray = Object.values(trends)
      .filter(t => t.dataPoints.length >= 1)
      .sort((a, b) => {
        const categoryOrder = ['Kidney', 'Liver', 'Metabolic', 'CBC', 'Thyroid', 'Electrolytes', 'Pancreas', 'Protein', 'Other'];
        return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      });
    
    res.json({
      trends: trendArray,
      totalTests: trendArray.length,
      totalDataPoints: trendArray.reduce((sum, t) => sum + t.dataPoints.length, 0),
      dateRange: labs.length > 0 ? {
        earliest: labs[0].collection_date,
        latest: labs[labs.length - 1].collection_date
      } : null
    });
    
  } catch (error) {
    console.error('Lab trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper to normalize test names
function normalizeTestName(name) {
  const mappings = {
    'blood urea nitrogen': 'BUN',
    'urea nitrogen': 'BUN',
    'creat': 'Creatinine',
    'creatinine': 'Creatinine',
    'alanine aminotransferase': 'ALT',
    'alt (sgpt)': 'ALT',
    'sgpt': 'ALT',
    'alkaline phosphatase': 'ALP',
    'alk phos': 'ALP',
    'aspartate aminotransferase': 'AST',
    'ast (sgot)': 'AST',
    'sgot': 'AST',
    'total bilirubin': 'Bilirubin',
    'tbil': 'Bilirubin',
    'alb': 'Albumin',
    'glu': 'Glucose',
    'chol': 'Cholesterol',
    'trig': 'Triglycerides',
    'tp': 'Total Protein',
    'total protein': 'Total Protein',
    'glob': 'Globulin',
    'na': 'Sodium',
    'k': 'Potassium',
    'cl': 'Chloride',
    'ca': 'Calcium',
    'phos': 'Phosphorus',
    'wbc': 'WBC',
    'rbc': 'RBC',
    'hct': 'HCT',
    'hematocrit': 'HCT',
    'hgb': 'Hemoglobin',
    'hemoglobin': 'Hemoglobin',
    'plt': 'Platelets',
    'platelets': 'Platelets',
    't4': 'T4',
    'total t4': 'T4',
    'thyroxine': 'T4',
    'free t4': 'Free T4',
    'ft4': 'Free T4',
    'tsh': 'TSH',
    'spec cpl': 'cPLI',
    'cpli': 'cPLI',
  };
  
  const lower = name.toLowerCase().trim();
  return mappings[lower] || name;
}

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

// Status endpoint for frontend
app.get('/api/status', (req, res) => res.json({ 
  aiEnabled: !!ANTHROPIC_API_KEY,
  voiceEnabled: !!OPENAI_API_KEY
}));

// ================== EXPORTS ==================

// Generate insurance claim export
app.post('/api/pets/:id/export/insurance-claim', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT * FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    const user = await queryOne("SELECT * FROM users WHERE id = $1", [req.userId]);
    const { startDate, endDate, claimReason, includeRecords } = req.body;
    
    // Gather all relevant data
    const [records, medications, vaccinations, labs, conditions, allergies] = await Promise.all([
      query("SELECT * FROM medical_records WHERE pet_id = $1 AND ($2::text IS NULL OR date_of_service >= $2) AND ($3::text IS NULL OR date_of_service <= $3) ORDER BY date_of_service DESC", [pet.id, startDate || null, endDate || null]),
      query("SELECT * FROM medications WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM vaccinations WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM lab_results WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM conditions WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM allergies WHERE pet_id = $1", [pet.id])
    ]);
    
    // Generate claim document using Claude
    if (!ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'AI not configured for document generation' });
    }
    
    const prompt = `Generate a professional pet insurance claim summary document. Use this data:

PATIENT INFORMATION:
- Name: ${pet.name}
- Species: ${pet.species}
- Breed: ${pet.breed || 'Unknown'}
- Sex: ${pet.sex || 'Unknown'}
- Date of Birth: ${pet.date_of_birth || 'Unknown'}
- Weight: ${pet.weight_kg ? pet.weight_kg + ' kg' : 'Unknown'}
- Microchip: ${pet.microchip_id || 'None on file'}

OWNER INFORMATION:
- Name: ${user.first_name} ${user.last_name}
- Email: ${user.email}

CLAIM DETAILS:
- Claim Period: ${startDate || 'All records'} to ${endDate || 'Present'}
- Reason for Claim: ${claimReason || 'Medical expenses reimbursement'}

KNOWN CONDITIONS:
${conditions.map(c => `- ${c.condition} (${c.status}, diagnosed ${c.diagnosed_date || 'unknown date'})`).join('\n') || 'None on file'}

KNOWN ALLERGIES:
${allergies.map(a => `- ${a.allergen}: ${a.reaction || 'reaction not specified'} (${a.severity || 'severity unknown'})`).join('\n') || 'None on file'}

CURRENT MEDICATIONS:
${medications.filter(m => m.status === 'ACTIVE').map(m => `- ${m.drug_name} ${m.dose || ''} ${m.frequency || ''} - ${m.indication || 'indication not specified'}`).join('\n') || 'None'}

MEDICAL RECORDS FOR CLAIM PERIOD:
${records.map(r => `
Date: ${r.date_of_service}
Facility: ${r.facility_name || 'Not specified'}
Provider: ${r.provider_name || 'Not specified'}
Type: ${r.record_type}
Chief Complaint: ${r.chief_complaint || 'N/A'}
Diagnosis: ${r.diagnosis || 'N/A'}
Treatment: ${r.treatment || 'N/A'}
Summary: ${r.summary || 'N/A'}
`).join('\n---\n') || 'No records in this period'}

RELEVANT LAB RESULTS:
${labs.map(l => `- ${l.panel_name} (${l.collection_date}): ${l.interpretation || 'See detailed results'}`).join('\n') || 'None'}

Generate a well-formatted insurance claim summary document that includes:
1. A header with "PET INSURANCE CLAIM SUMMARY" and date generated
2. Patient and owner information section
3. Claim period and reason
4. Medical history summary relevant to the claim
5. Itemized list of visits/treatments during claim period
6. Current medications related to claim
7. Supporting documentation checklist
8. Owner certification statement

Format it professionally with clear sections. Use plain text formatting (no markdown).`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    if (!response.ok) throw new Error('Failed to generate document');
    const data = await response.json();
    const documentText = data.content[0].text;
    
    res.json({
      success: true,
      document: documentText,
      metadata: {
        petName: pet.name,
        generatedAt: new Date().toISOString(),
        recordCount: records.length,
        dateRange: { start: startDate, end: endDate }
      }
    });
    
  } catch (error) {
    console.error('Insurance export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate referral summary for specialists
app.post('/api/pets/:id/export/referral-summary', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT * FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    const user = await queryOne("SELECT * FROM users WHERE id = $1", [req.userId]);
    const { referralReason, referringVet, specialtyType, urgency, additionalNotes } = req.body;
    
    // Gather comprehensive patient data
    const [records, medications, vaccinations, labs, conditions, allergies, weights] = await Promise.all([
      query("SELECT * FROM medical_records WHERE pet_id = $1 ORDER BY date_of_service DESC LIMIT 10", [pet.id]),
      query("SELECT * FROM medications WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM vaccinations WHERE pet_id = $1 ORDER BY administration_date DESC", [pet.id]),
      query("SELECT * FROM lab_results WHERE pet_id = $1 ORDER BY collection_date DESC LIMIT 5", [pet.id]),
      query("SELECT * FROM conditions WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM allergies WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM weight_records WHERE pet_id = $1 ORDER BY date DESC LIMIT 5", [pet.id])
    ]);
    
    if (!ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'AI not configured for document generation' });
    }
    
    const prompt = `Generate a professional veterinary referral summary letter. Use this data:

PATIENT SIGNALMENT:
- Name: ${pet.name}
- Species: ${pet.species}
- Breed: ${pet.breed || 'Unknown'}
- Sex: ${pet.sex || 'Unknown'}
- Date of Birth: ${pet.date_of_birth || 'Unknown'} ${pet.date_of_birth ? `(${calculateAge(pet.date_of_birth)})` : ''}
- Weight: ${pet.weight_kg ? pet.weight_kg + ' kg' : 'Unknown'}
- Microchip: ${pet.microchip_id || 'None'}

OWNER:
- ${user.first_name} ${user.last_name}
- ${user.email}

REFERRAL DETAILS:
- Reason for Referral: ${referralReason || 'Specialist consultation requested'}
- Referring Veterinarian: ${referringVet || 'Primary care veterinarian'}
- Specialty: ${specialtyType || 'Not specified'}
- Urgency: ${urgency || 'Routine'}

ADDITIONAL NOTES FROM OWNER:
${additionalNotes || 'None provided'}

PROBLEM LIST / ACTIVE CONDITIONS:
${conditions.filter(c => c.status === 'active' || c.status === 'managed').map(c => `- ${c.condition} (${c.status}, diagnosed ${c.diagnosed_date || 'unknown'})`).join('\n') || 'None documented'}

ALLERGIES/ADVERSE REACTIONS:
${allergies.map(a => `- ${a.allergen}: ${a.reaction || 'unknown reaction'} (Severity: ${a.severity || 'unknown'})`).join('\n') || 'NKDA (No Known Drug Allergies)'}

CURRENT MEDICATIONS:
${medications.filter(m => m.status === 'ACTIVE').map(m => `- ${m.drug_name} ${m.dose || ''} ${m.frequency || ''} for ${m.indication || 'unspecified indication'} (Started: ${m.start_date || 'unknown'})`).join('\n') || 'None'}

DISCONTINUED MEDICATIONS:
${medications.filter(m => m.status !== 'ACTIVE').map(m => `- ${m.drug_name} - ${m.indication || 'unspecified'}`).join('\n') || 'None documented'}

VACCINATION STATUS:
${vaccinations.slice(0, 5).map(v => `- ${v.vaccine_name}: ${v.administration_date} (Valid until: ${v.valid_until || 'unknown'})`).join('\n') || 'None on file'}

WEIGHT HISTORY:
${weights.map(w => `- ${w.date}: ${w.weight_kg} kg`).join('\n') || 'No weight history'}

RECENT MEDICAL HISTORY:
${records.map(r => `
${r.date_of_service} - ${r.record_type} at ${r.facility_name || 'Unknown facility'}
Provider: ${r.provider_name || 'Not specified'}
Chief Complaint: ${r.chief_complaint || 'N/A'}
Diagnosis: ${r.diagnosis || 'N/A'}
Treatment: ${r.treatment || 'N/A'}
Notes: ${r.summary || r.notes || 'N/A'}
`).join('\n---\n') || 'No recent records'}

RECENT LABORATORY RESULTS:
${labs.map(l => {
  const results = JSON.parse(l.results || '[]');
  return `${l.collection_date} - ${l.panel_name}
${results.map(r => `  ${r.test}: ${r.value} ${r.unit || ''} (Ref: ${r.range || 'N/A'})${r.flag ? ' **' + r.flag + '**' : ''}`).join('\n')}
Interpretation: ${l.interpretation || 'None provided'}`;
}).join('\n\n') || 'No recent labs'}

Generate a professional referral letter that a specialist would expect to receive. Include:
1. Header with "VETERINARY REFERRAL SUMMARY" and date
2. Patient signalment in standard format
3. Owner contact information
4. Reason for referral (prominent)
5. Pertinent medical history summary
6. Current problem list
7. Allergies (highlighted if any drug allergies)
8. Current medications with doses
9. Relevant recent diagnostics summary
10. Vaccination status
11. Specific questions or concerns for the specialist

Format professionally. Flag any critical information (allergies, urgent findings). Use plain text.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    if (!response.ok) throw new Error('Failed to generate document');
    const data = await response.json();
    const documentText = data.content[0].text;
    
    res.json({
      success: true,
      document: documentText,
      metadata: {
        petName: pet.name,
        generatedAt: new Date().toISOString(),
        referralType: specialtyType,
        urgency: urgency
      }
    });
    
  } catch (error) {
    console.error('Referral export error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper to calculate age
function calculateAge(dob) {
  const birth = new Date(dob);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (years === 0) return `${months} months`;
  if (months < 0) return `${years - 1} years`;
  return `${years} years`;
}

// Generate Insurance Claim PDF
app.post('/api/pets/:id/export/insurance-claim/pdf', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT * FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    const user = await queryOne("SELECT * FROM users WHERE id = $1", [req.userId]);
    const { startDate, endDate, claimReason, insuranceCompany, policyNumber } = req.body;
    
    const [records, medications, vaccinations, labs, conditions, allergies] = await Promise.all([
      query("SELECT * FROM medical_records WHERE pet_id = $1 AND ($2::text IS NULL OR date_of_service >= $2) AND ($3::text IS NULL OR date_of_service <= $3) ORDER BY date_of_service DESC", [pet.id, startDate || null, endDate || null]),
      query("SELECT * FROM medications WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM vaccinations WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM lab_results WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM conditions WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM allergies WHERE pet_id = $1", [pet.id])
    ]);
    
    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('error', err => {
      console.error('PDF generation error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'PDF generation failed: ' + err.message });
      }
    });
    doc.on('end', () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${pet.name}-insurance-claim-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.send(pdfBuffer);
      } catch (err) {
        console.error('PDF send error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: err.message });
        }
      }
    });
    
    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('PET INSURANCE CLAIM SUMMARY', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    
    // Insurance Info
    if (insuranceCompany || policyNumber) {
      doc.fontSize(12).font('Helvetica-Bold').text('INSURANCE INFORMATION');
      doc.fontSize(10).font('Helvetica');
      if (insuranceCompany) doc.text(`Company: ${insuranceCompany}`);
      if (policyNumber) doc.text(`Policy Number: ${policyNumber}`);
      doc.moveDown();
    }
    
    // Patient Info
    doc.fontSize(12).font('Helvetica-Bold').text('PATIENT INFORMATION');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${pet.name}`);
    doc.text(`Species: ${pet.species === 'DOG' ? 'Canine' : pet.species === 'CAT' ? 'Feline' : pet.species}`);
    doc.text(`Breed: ${pet.breed || 'Unknown'}`);
    doc.text(`Sex: ${pet.sex || 'Unknown'}`);
    doc.text(`Date of Birth: ${pet.date_of_birth || 'Unknown'}${pet.date_of_birth ? ` (${calculateAge(pet.date_of_birth)})` : ''}`);
    doc.text(`Weight: ${pet.weight_kg ? pet.weight_kg + ' kg' : 'Unknown'}`);
    doc.text(`Microchip: ${pet.microchip_id || 'None on file'}`);
    doc.moveDown();
    
    // Owner Info
    doc.fontSize(12).font('Helvetica-Bold').text('OWNER INFORMATION');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${user.first_name} ${user.last_name}`);
    doc.text(`Email: ${user.email}`);
    doc.moveDown();
    
    // Claim Details
    doc.fontSize(12).font('Helvetica-Bold').text('CLAIM DETAILS');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Claim Period: ${startDate || 'All records'} to ${endDate || 'Present'}`);
    doc.text(`Reason: ${claimReason || 'Medical expenses reimbursement'}`);
    doc.moveDown();
    
    // Conditions
    doc.fontSize(12).font('Helvetica-Bold').text('KNOWN CONDITIONS');
    doc.fontSize(10).font('Helvetica');
    if (conditions.length === 0) {
      doc.text('None on file');
    } else {
      conditions.forEach(c => doc.text(`• ${c.condition} (${c.status}, diagnosed ${c.diagnosed_date || 'unknown'})`));
    }
    doc.moveDown();
    
    // Allergies
    doc.fontSize(12).font('Helvetica-Bold').text('ALLERGIES');
    doc.fontSize(10).font('Helvetica');
    if (allergies.length === 0) {
      doc.text('None on file');
    } else {
      allergies.forEach(a => doc.text(`• ${a.allergen}: ${a.reaction || 'unknown reaction'} (${a.severity || 'unknown severity'})`));
    }
    doc.moveDown();
    
    // Medical Records
    doc.fontSize(12).font('Helvetica-Bold').text('MEDICAL RECORDS FOR CLAIM PERIOD');
    doc.fontSize(10).font('Helvetica');
    if (records.length === 0) {
      doc.text('No records in this period');
    } else {
      records.forEach((r, i) => {
        if (i > 0) doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text(`${r.date_of_service} - ${r.record_type}`);
        doc.font('Helvetica');
        doc.text(`Facility: ${r.facility_name || 'Not specified'}`);
        doc.text(`Provider: ${r.provider_name || 'Not specified'}`);
        if (r.chief_complaint) doc.text(`Chief Complaint: ${r.chief_complaint}`);
        if (r.diagnosis) doc.text(`Diagnosis: ${r.diagnosis}`);
        if (r.treatment) doc.text(`Treatment: ${r.treatment}`);
        if (r.summary) doc.text(`Summary: ${r.summary}`);
      });
    }
    doc.moveDown();
    
    // Medications
    doc.fontSize(12).font('Helvetica-Bold').text('CURRENT MEDICATIONS');
    doc.fontSize(10).font('Helvetica');
    const activeMeds = medications.filter(m => m.status === 'ACTIVE');
    if (activeMeds.length === 0) {
      doc.text('None');
    } else {
      activeMeds.forEach(m => doc.text(`• ${m.drug_name} ${m.dose || ''} ${m.frequency || ''} - ${m.indication || ''}`));
    }
    doc.moveDown();
    
    // Certification
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(10).font('Helvetica-Bold').text('CERTIFICATION');
    doc.fontSize(9).font('Helvetica');
    doc.text('I certify that the information provided in this claim summary is accurate to the best of my knowledge.');
    doc.moveDown();
    doc.text('Owner Signature: _________________________    Date: _____________');
    
    doc.end();
    
  } catch (error) {
    console.error('Insurance PDF error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Referral Summary PDF
app.post('/api/pets/:id/export/referral-summary/pdf', auth, async (req, res) => {
  try {
    const pet = await queryOne("SELECT * FROM pets WHERE id = $1 AND owner_id = $2", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    const user = await queryOne("SELECT * FROM users WHERE id = $1", [req.userId]);
    const { referralReason, referringVet, referringClinic, specialtyType, urgency, additionalNotes } = req.body;
    
    const [records, medications, vaccinations, labs, conditions, allergies, weights] = await Promise.all([
      query("SELECT * FROM medical_records WHERE pet_id = $1 ORDER BY date_of_service DESC LIMIT 10", [pet.id]),
      query("SELECT * FROM medications WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM vaccinations WHERE pet_id = $1 ORDER BY administration_date DESC", [pet.id]),
      query("SELECT * FROM lab_results WHERE pet_id = $1 ORDER BY collection_date DESC LIMIT 5", [pet.id]),
      query("SELECT * FROM conditions WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM allergies WHERE pet_id = $1", [pet.id]),
      query("SELECT * FROM weight_records WHERE pet_id = $1 ORDER BY date DESC LIMIT 5", [pet.id])
    ]);
    
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('error', err => {
      console.error('PDF generation error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'PDF generation failed: ' + err.message });
      }
    });
    doc.on('end', () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${pet.name}-referral-summary-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.send(pdfBuffer);
      } catch (err) {
        console.error('PDF send error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: err.message });
        }
      }
    });
    
    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('VETERINARY REFERRAL SUMMARY', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();
    
    // Urgency banner if urgent
    if (urgency === 'urgent' || urgency === 'emergency') {
      const bannerColor = urgency === 'emergency' ? '#dc2626' : '#f59e0b';
      doc.rect(50, doc.y, 500, 25).fill(bannerColor);
      doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold');
      doc.text(`URGENCY: ${urgency.toUpperCase()}`, 60, doc.y - 18, { width: 480 });
      doc.fillColor('#000000');
      doc.moveDown(0.5);
    }
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    
    // Referral Info
    doc.fontSize(12).font('Helvetica-Bold').text('REFERRAL INFORMATION');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Reason for Referral: ${referralReason || 'Specialist consultation requested'}`);
    doc.text(`Specialty: ${specialtyType || 'Not specified'}`);
    doc.text(`Urgency: ${urgency || 'Routine'}`);
    if (referringVet) doc.text(`Referring Veterinarian: ${referringVet}`);
    if (referringClinic) doc.text(`Referring Clinic: ${referringClinic}`);
    doc.moveDown();
    
    // Patient Signalment
    doc.fontSize(12).font('Helvetica-Bold').text('PATIENT SIGNALMENT');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Name: ${pet.name}`);
    doc.text(`Species: ${pet.species === 'DOG' ? 'Canine' : pet.species === 'CAT' ? 'Feline' : pet.species}`);
    doc.text(`Breed: ${pet.breed || 'Unknown'}`);
    doc.text(`Sex: ${pet.sex || 'Unknown'}`);
    doc.text(`Age: ${pet.date_of_birth ? calculateAge(pet.date_of_birth) : 'Unknown'} (DOB: ${pet.date_of_birth || 'Unknown'})`);
    doc.text(`Weight: ${pet.weight_kg ? pet.weight_kg + ' kg' : 'Unknown'}`);
    doc.text(`Microchip: ${pet.microchip_id || 'None'}`);
    doc.moveDown();
    
    // Owner
    doc.fontSize(12).font('Helvetica-Bold').text('OWNER CONTACT');
    doc.fontSize(10).font('Helvetica');
    doc.text(`${user.first_name} ${user.last_name}`);
    doc.text(`${user.email}`);
    doc.moveDown();
    
    // Allergies - highlighted if present
    doc.fontSize(12).font('Helvetica-Bold').text('ALLERGIES / ADVERSE REACTIONS');
    doc.fontSize(10).font('Helvetica');
    if (allergies.length === 0) {
      doc.text('NKDA (No Known Drug Allergies)');
    } else {
      doc.fillColor('#dc2626');
      allergies.forEach(a => doc.text(`! ${a.allergen}: ${a.reaction || 'unknown'} (${a.severity || 'unknown severity'})`));
      doc.fillColor('#000000');
    }
    doc.moveDown();
    
    // Problem List
    doc.fontSize(12).font('Helvetica-Bold').text('PROBLEM LIST / ACTIVE CONDITIONS');
    doc.fontSize(10).font('Helvetica');
    const activeConditions = conditions.filter(c => c.status === 'active' || c.status === 'managed');
    if (activeConditions.length === 0) {
      doc.text('None documented');
    } else {
      activeConditions.forEach(c => doc.text(`• ${c.condition} (${c.status}, diagnosed ${c.diagnosed_date || 'unknown'})`));
    }
    doc.moveDown();
    
    // Current Medications
    doc.fontSize(12).font('Helvetica-Bold').text('CURRENT MEDICATIONS');
    doc.fontSize(10).font('Helvetica');
    const activeMeds = medications.filter(m => m.status === 'ACTIVE');
    if (activeMeds.length === 0) {
      doc.text('None');
    } else {
      activeMeds.forEach(m => doc.text(`• ${m.drug_name} ${m.dose || ''} ${m.frequency || ''} for ${m.indication || 'unspecified'}`));
    }
    doc.moveDown();
    
    // Vaccination Status
    doc.fontSize(12).font('Helvetica-Bold').text('VACCINATION STATUS');
    doc.fontSize(10).font('Helvetica');
    if (vaccinations.length === 0) {
      doc.text('None on file');
    } else {
      vaccinations.slice(0, 6).forEach(v => {
        const isExpired = v.valid_until && new Date(v.valid_until) < new Date();
        doc.text(`• ${v.vaccine_name}: ${v.administration_date}${v.valid_until ? ` (Valid until: ${v.valid_until}${isExpired ? ' - EXPIRED' : ''})` : ''}`);
      });
    }
    doc.moveDown();
    
    // Recent History
    doc.fontSize(12).font('Helvetica-Bold').text('RECENT MEDICAL HISTORY');
    doc.fontSize(10).font('Helvetica');
    if (records.length === 0) {
      doc.text('No recent records');
    } else {
      records.slice(0, 5).forEach((r, i) => {
        if (i > 0) doc.moveDown(0.3);
        doc.font('Helvetica-Bold').text(`${r.date_of_service} - ${r.record_type}`, { continued: false });
        doc.font('Helvetica');
        if (r.facility_name) doc.text(`  Facility: ${r.facility_name}`);
        if (r.diagnosis) doc.text(`  Diagnosis: ${r.diagnosis}`);
        if (r.treatment) doc.text(`  Treatment: ${r.treatment}`);
      });
    }
    doc.moveDown();
    
    // Additional Notes
    if (additionalNotes) {
      doc.fontSize(12).font('Helvetica-Bold').text('ADDITIONAL NOTES FROM OWNER');
      doc.fontSize(10).font('Helvetica');
      doc.text(additionalNotes);
      doc.moveDown();
    }
    
    // Footer
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(8).font('Helvetica').text('This referral summary was generated by PetRecord. Please verify all information with the pet owner.', { align: 'center' });
    
    doc.end();
    
  } catch (error) {
    console.error('Referral PDF error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================== EMAIL FORWARDING ==================

// Webhook for inbound emails (works with SendGrid, Mailgun, Postmark)
app.post('/api/email/inbound', express.raw({ type: '*/*', limit: '25mb' }), async (req, res) => {
  try {
    let emailData;
    
    // Parse based on content type
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      emailData = JSON.parse(req.body.toString());
    } else if (contentType.includes('multipart/form-data')) {
      // For SendGrid/Mailgun multipart posts, use multer
      // This is handled by the separate route below
      return res.status(400).json({ error: 'Use /api/email/inbound/multipart for multipart data' });
    } else {
      emailData = JSON.parse(req.body.toString());
    }
    
    console.log('Inbound email received:', emailData.to || emailData.recipient || 'unknown');
    
    // Extract email fields (normalize across providers)
    const to = emailData.to || emailData.recipient || emailData.To || '';
    const from = emailData.from || emailData.sender || emailData.From || '';
    const subject = emailData.subject || emailData.Subject || '';
    const textBody = emailData.text || emailData['body-plain'] || emailData.TextBody || '';
    const htmlBody = emailData.html || emailData['body-html'] || emailData.HtmlBody || '';
    const attachments = emailData.attachments || emailData.Attachments || [];
    
    // Find user by forwarding address
    const forwardingId = extractForwardingId(to);
    if (!forwardingId) {
      console.log('No forwarding ID found in:', to);
      return res.status(200).json({ message: 'No matching forwarding address' });
    }
    
    const user = await queryOne("SELECT * FROM users WHERE email_forwarding = $1", [forwardingId]);
    if (!user) {
      console.log('No user found for forwarding ID:', forwardingId);
      return res.status(200).json({ message: 'No matching user' });
    }
    
    console.log(`Processing email for user: ${user.email}`);
    
    // Get user's pets to match against
    const pets = await query("SELECT * FROM pets WHERE owner_id = $1", [user.id]);
    if (pets.length === 0) {
      console.log('User has no pets');
      return res.status(200).json({ message: 'User has no pets' });
    }
    
    // Use Claude to extract data from email
    const extracted = await extractFromEmail(subject, textBody || htmlBody, pets);
    
    if (!extracted || !extracted.pet_id) {
      console.log('Could not extract data or match pet');
      return res.status(200).json({ message: 'Could not process email content' });
    }
    
    // Save extracted data
    const saved = await saveExtractedData(extracted.pet_id, extracted);
    
    // Save email record
    const emailId = uuidv4();
    await run(
      "INSERT INTO documents (id, pet_id, filename, mimetype, file_data, extracted_data, processing_status) VALUES ($1, $2, $3, $4, $5, $6, 'email')",
      [emailId, extracted.pet_id, `Email: ${subject.substring(0, 50)}`, 'message/rfc822', Buffer.from(textBody || htmlBody).toString('base64'), JSON.stringify(extracted)]
    );
    
    console.log('Email processed successfully:', { emailId, saved });
    res.status(200).json({ success: true, emailId, saved });
    
  } catch (error) {
    console.error('Email processing error:', error);
    // Always return 200 to prevent email service retries
    res.status(200).json({ error: error.message });
  }
});

// Multipart form handler for SendGrid/Mailgun
const emailUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

app.post('/api/email/inbound/multipart', emailUpload.any(), async (req, res) => {
  try {
    console.log('Multipart email received');
    
    // Extract fields from multipart form
    const to = req.body.to || req.body.recipient || req.body.envelope?.to?.[0] || '';
    const from = req.body.from || req.body.sender || '';
    const subject = req.body.subject || '';
    const textBody = req.body.text || req.body['body-plain'] || '';
    const htmlBody = req.body.html || req.body['body-html'] || '';
    
    console.log('Email to:', to, 'Subject:', subject);
    
    // Find user by forwarding address
    const forwardingId = extractForwardingId(to);
    if (!forwardingId) {
      return res.status(200).json({ message: 'No matching forwarding address' });
    }
    
    const user = await queryOne("SELECT * FROM users WHERE email_forwarding = $1", [forwardingId]);
    if (!user) {
      return res.status(200).json({ message: 'No matching user' });
    }
    
    const pets = await query("SELECT * FROM pets WHERE owner_id = $1", [user.id]);
    if (pets.length === 0) {
      return res.status(200).json({ message: 'User has no pets' });
    }
    
    // Process attachments first (PDFs, images)
    let attachmentResults = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
          console.log('Processing attachment:', file.originalname, file.mimetype);
          try {
            const base64Data = file.buffer.toString('base64');
            const petInfo = pets[0]; // Use first pet as default
            const extracted = await extractWithClaude(base64Data, file.mimetype, petInfo);
            
            // Try to match pet name in extracted data
            let matchedPet = pets[0];
            if (extracted.patient_name) {
              const found = pets.find(p => p.name.toLowerCase() === extracted.patient_name.toLowerCase());
              if (found) matchedPet = found;
            }
            
            const saved = await saveExtractedData(matchedPet.id, extracted);
            
            // Save document
            const docId = uuidv4();
            await run(
              "INSERT INTO documents (id, pet_id, filename, mimetype, file_data, extracted_data, processing_status) VALUES ($1, $2, $3, $4, $5, $6, 'completed')",
              [docId, matchedPet.id, file.originalname, file.mimetype, base64Data, JSON.stringify(extracted)]
            );
            
            attachmentResults.push({ filename: file.originalname, docId, saved });
          } catch (err) {
            console.error('Attachment processing error:', err);
          }
        }
      }
    }
    
    // If no attachments, try to extract from email body
    if (attachmentResults.length === 0 && (textBody || htmlBody)) {
      const extracted = await extractFromEmail(subject, textBody || htmlBody, pets);
      if (extracted && extracted.pet_id) {
        const saved = await saveExtractedData(extracted.pet_id, extracted);
        attachmentResults.push({ source: 'email_body', saved });
      }
    }
    
    res.status(200).json({ success: true, results: attachmentResults });
    
  } catch (error) {
    console.error('Multipart email error:', error);
    res.status(200).json({ error: error.message });
  }
});

// Helper to extract forwarding ID from email address
function extractForwardingId(email) {
  // Supports formats:
  // - {id}@inbound.petrecord.app
  // - petrecord+{id}@domain.com
  // - inbound+{id}@petrecord.app
  
  const patterns = [
    /^([a-f0-9-]+)@/i,                    // id@domain
    /\+([a-f0-9-]+)@/i,                   // user+id@domain
    /^inbound\+([a-f0-9-]+)@/i,           // inbound+id@domain
  ];
  
  for (const pattern of patterns) {
    const match = email.match(pattern);
    if (match && match[1].length >= 8) {
      return match[1];
    }
  }
  
  return null;
}

// Extract data from email body using Claude
async function extractFromEmail(subject, body, pets) {
  if (!ANTHROPIC_API_KEY) return null;
  
  const petList = pets.map(p => `- ${p.name} (${p.species}, ${p.breed || 'unknown breed'})`).join('\n');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'x-api-key': ANTHROPIC_API_KEY, 
      'anthropic-version': '2023-06-01' 
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Extract veterinary information from this email. Match to one of these pets:
${petList}

Email Subject: ${subject}

Email Body:
${body.substring(0, 10000)}

Return JSON with:
{
  "pet_name": "matched pet name from list above",
  "document_type": "wellness_exam|vaccination|lab_results|surgery|specialist|emergency|prescription|reminder|other",
  "date_of_service": "YYYY-MM-DD if mentioned",
  "facility_name": "clinic name if mentioned",
  "provider_name": "Dr. Name if mentioned",
  "visit_summary": "summary of the email content",
  "diagnosis": "any diagnoses mentioned",
  "treatment": "any treatments mentioned",
  "vaccinations": [{"name": "vaccine", "date": "YYYY-MM-DD", "valid_until": "YYYY-MM-DD"}],
  "medications_prescribed": [{"drug_name": "name", "dose": "dose", "frequency": "frequency"}],
  "follow_up": "any follow-up instructions",
  "appointment_reminder": {"date": "YYYY-MM-DD", "time": "HH:MM", "reason": "reason"} 
}

Return ONLY valid JSON. If you can't match a pet, use the first one.`
      }]
    })
  });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) return null;
  
  try {
    const extracted = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
    
    // Match pet
    const matchedPet = pets.find(p => 
      p.name.toLowerCase() === extracted.pet_name?.toLowerCase()
    ) || pets[0];
    
    extracted.pet_id = matchedPet.id;
    return extracted;
  } catch {
    return null;
  }
}

// Get user's forwarding address
app.get('/api/email/forwarding-address', auth, async (req, res) => {
  try {
    const user = await queryOne("SELECT email_forwarding FROM users WHERE id = $1", [req.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Generate address based on your email setup
    const baseUrl = process.env.EMAIL_DOMAIN || 'inbound.petrecord.app';
    const address = `${user.email_forwarding}@${baseUrl}`;
    
    res.json({ 
      forwardingAddress: address,
      forwardingId: user.email_forwarding,
      instructions: `Forward vet emails to this address to automatically extract and save medical records.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Regenerate forwarding address
app.post('/api/email/regenerate-address', auth, async (req, res) => {
  try {
    const newId = uuidv4();
    await run("UPDATE users SET email_forwarding = $1 WHERE id = $2", [newId, req.userId]);
    
    const baseUrl = process.env.EMAIL_DOMAIN || 'inbound.petrecord.app';
    res.json({ 
      forwardingAddress: `${newId}@${baseUrl}`,
      forwardingId: newId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
