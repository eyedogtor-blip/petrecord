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
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});

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
    CREATE TABLE IF NOT EXISTS medications (id TEXT PRIMARY KEY, pet_id TEXT, drug_name TEXT, dose TEXT, frequency TEXT, indication TEXT, status TEXT DEFAULT 'ACTIVE', start_date TEXT, prescribed_by TEXT);
    CREATE TABLE IF NOT EXISTS vaccinations (id TEXT PRIMARY KEY, pet_id TEXT, vaccine_name TEXT, administration_date TEXT, valid_until TEXT, facility_name TEXT, lot_number TEXT);
    CREATE TABLE IF NOT EXISTS medical_records (id TEXT PRIMARY KEY, pet_id TEXT, record_type TEXT, date_of_service TEXT, facility_name TEXT, provider_name TEXT, summary TEXT, chief_complaint TEXT, diagnosis TEXT, treatment TEXT, notes TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS lab_results (id TEXT PRIMARY KEY, pet_id TEXT, panel_name TEXT, collection_date TEXT, results TEXT, interpretation TEXT, facility_name TEXT);
    CREATE TABLE IF NOT EXISTS access_tokens (id TEXT PRIMARY KEY, user_id TEXT, pet_id TEXT, token TEXT UNIQUE, permission_level TEXT, valid_until TEXT, is_active INTEGER DEFAULT 1);
    CREATE TABLE IF NOT EXISTS weight_records (id TEXT PRIMARY KEY, pet_id TEXT, weight_kg REAL, date TEXT);
    CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, pet_id TEXT, filename TEXT, mimetype TEXT, file_data TEXT, upload_date TEXT, extracted_data TEXT, processing_status TEXT DEFAULT 'pending');
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
    
    db.run("INSERT INTO medications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Apoquel', '16mg', 'Once daily', 'Allergic dermatitis', 'ACTIVE', '2024-01-01', 'Dr. Smith']);
    db.run("INSERT INTO medications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Cosequin', '1 chew', 'Once daily', 'Joint support', 'ACTIVE', '2023-06-20', 'Dr. Smith']);
    db.run("INSERT INTO medications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Simparica Trio', '24mg', 'Monthly', 'Prevention', 'ACTIVE', '2024-01-01', 'Dr. Smith']);
    
    db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Rabies', '2024-01-15', '2027-01-15', 'Happy Paws Veterinary', 'RAB-2024-001']);
    db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'DAPP', '2024-01-15', '2025-01-15', 'Happy Paws Veterinary', 'DAPP-2024-015']);
    db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Bordetella', '2024-07-15', '2025-01-15', 'Happy Paws Veterinary', 'BORD-2024-088']);
    db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?, ?)", [uuidv4(), lunaId, 'FVRCP', '2024-01-20', '2025-01-20', 'City Cat Clinic', 'FVR-2024-042']);
    db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?, ?)", [uuidv4(), lunaId, 'Rabies', '2024-01-20', '2027-01-20', 'City Cat Clinic', 'RAB-2024-102']);
    
    db.run("INSERT INTO medical_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))", [uuidv4(), maxId, 'WELLNESS', '2024-01-15', 'Happy Paws Veterinary', 'Dr. Sarah Smith', 'Annual wellness exam. Max is healthy overall. Allergic dermatitis remains well-controlled on Apoquel.', 'Annual checkup', 'Healthy, mild allergies', 'Continue current medications', 'Weight stable, good body condition']);
    db.run("INSERT INTO medical_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))", [uuidv4(), maxId, 'SPECIALIST', '2023-06-15', 'Regional Vet Specialists', 'Dr. Michael Chen', 'Orthopedic consultation confirms bilateral hip dysplasia. Starting conservative management.', 'Lameness evaluation', 'Bilateral hip dysplasia', 'Conservative management, joint supplements', 'Avoid high-impact activities']);
    db.run("INSERT INTO medical_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))", [uuidv4(), lunaId, 'WELLNESS', '2024-01-20', 'City Cat Clinic', 'Dr. Emily Johnson', 'Annual wellness exam. Luna is healthy. Mild dental tartar noted.', 'Annual checkup', 'Healthy, mild dental tartar', 'Dental treats recommended', 'Consider dental cleaning next year']);
    
    db.run("INSERT INTO lab_results VALUES (?, ?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'Chemistry Panel', '2024-01-15', JSON.stringify([{test:'BUN',value:'18',unit:'mg/dL',range:'7-27',flag:null},{test:'Creatinine',value:'1.2',unit:'mg/dL',range:'0.5-1.8',flag:null},{test:'ALT',value:'45',unit:'U/L',range:'10-125',flag:null},{test:'ALP',value:'65',unit:'U/L',range:'23-212',flag:null},{test:'Glucose',value:'95',unit:'mg/dL',range:'74-143',flag:null}]), 'All values within normal limits', 'Happy Paws Veterinary']);
    db.run("INSERT INTO lab_results VALUES (?, ?, ?, ?, ?, ?, ?)", [uuidv4(), maxId, 'CBC', '2024-01-15', JSON.stringify([{test:'WBC',value:'12.5',unit:'K/uL',range:'5.5-16.9',flag:null},{test:'RBC',value:'7.2',unit:'M/uL',range:'5.5-8.5',flag:null},{test:'HCT',value:'48',unit:'%',range:'37-55',flag:null},{test:'Platelets',value:'285',unit:'K/uL',range:'175-500',flag:null}]), 'CBC within normal limits', 'Happy Paws Veterinary']);
    
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

// ================== AI DOCUMENT EXTRACTION ==================

async function extractWithClaude(base64Data, mimeType, petInfo) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  console.log(`Calling Claude API for ${petInfo.name} (${mimeType})`);

  // For PDFs use document type, for images use image type
  const contentType = mimeType === 'application/pdf' ? 'document' : 'image';
  
  const requestBody = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: [
        {
          type: contentType,
          source: {
            type: 'base64',
            media_type: mimeType,
            data: base64Data
          }
        },
        {
          type: 'text',
          text: `You are extracting veterinary medical record data for a pet named ${petInfo.name} (${petInfo.species}, ${petInfo.breed || 'unknown breed'}).

Extract ALL relevant information from this veterinary document and return a JSON object with these fields (include only fields that have data in the document):

{
  "document_type": "wellness_exam|vaccination|lab_results|surgery|specialist|emergency|prescription|other",
  "date_of_service": "YYYY-MM-DD",
  "facility_name": "clinic/hospital name",
  "provider_name": "Dr. Name",
  
  "visit_summary": "brief summary of the visit",
  "chief_complaint": "reason for visit",
  "diagnosis": "diagnoses made",
  "treatment": "treatments given",
  "notes": "additional notes",
  
  "vaccinations": [
    {"name": "vaccine name", "date": "YYYY-MM-DD", "valid_until": "YYYY-MM-DD", "lot_number": "if shown"}
  ],
  
  "medications_prescribed": [
    {"drug_name": "name", "dose": "amount", "frequency": "how often", "indication": "what for", "prescribed_by": "Dr. Name"}
  ],
  
  "lab_results": {
    "panel_name": "CBC, Chemistry, etc",
    "collection_date": "YYYY-MM-DD",
    "results": [
      {"test": "test name", "value": "number", "unit": "unit", "range": "reference range", "flag": "H|L|null"}
    ],
    "interpretation": "overall interpretation"
  },
  
  "allergies_noted": [
    {"allergen": "what", "reaction": "symptoms", "severity": "mild|moderate|severe"}
  ],
  
  "conditions_noted": [
    {"condition": "diagnosis name", "status": "active|managed|resolved"}
  ],
  
  "weight_kg": number_if_mentioned,
  
  "follow_up": "any follow-up instructions"
}

Return ONLY valid JSON, no markdown or explanation. If a section has no data, omit it entirely.`
        }
      ]
    }]
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestBody)
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    console.error('Claude API error response:', responseText);
    throw new Error(`Claude API error (${response.status}): ${responseText.substring(0, 200)}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse Claude response:', responseText.substring(0, 500));
    throw new Error('Invalid response from Claude API');
  }
  
  const text = data.content?.[0]?.text;
  if (!text) {
    console.error('No text in Claude response:', JSON.stringify(data).substring(0, 500));
    throw new Error('No text content in Claude response');
  }
  
  console.log('Claude response text:', text.substring(0, 200));
  
  // Parse JSON from response
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        console.error('Failed to parse JSON from code block:', match[1].substring(0, 200));
        throw new Error('Failed to parse extraction results from code block');
      }
    }
    console.error('Failed to parse JSON:', text.substring(0, 500));
    throw new Error('Failed to parse extraction results - response was not valid JSON');
  }
}

async function saveExtractedData(petId, extracted) {
  const saved = { vaccinations: [], medications: [], records: [], labs: [], allergies: [], conditions: [] };
  
  // Helper to convert undefined to null
  const n = (val) => val === undefined ? null : val;
  
  // Save vaccinations
  if (extracted.vaccinations && Array.isArray(extracted.vaccinations)) {
    for (const vax of extracted.vaccinations) {
      const id = uuidv4();
      db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [id, petId, n(vax.name), n(vax.date), n(vax.valid_until), n(extracted.facility_name), n(vax.lot_number)]);
      saved.vaccinations.push({ id, ...vax });
    }
  }
  
  // Save medications
  if (extracted.medications_prescribed && Array.isArray(extracted.medications_prescribed)) {
    for (const med of extracted.medications_prescribed) {
      const id = uuidv4();
      db.run("INSERT INTO medications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, petId, n(med.drug_name), n(med.dose), n(med.frequency), n(med.indication), 'ACTIVE', n(extracted.date_of_service) || new Date().toISOString().split('T')[0], n(med.prescribed_by) || n(extracted.provider_name)]);
      saved.medications.push({ id, ...med });
    }
  }
  
  // Save medical record
  if (extracted.visit_summary || extracted.diagnosis || extracted.treatment || extracted.document_type) {
    const id = uuidv4();
    db.run("INSERT INTO medical_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))",
      [id, petId, n(extracted.document_type)?.toUpperCase() || 'OTHER', n(extracted.date_of_service), n(extracted.facility_name), n(extracted.provider_name), 
       n(extracted.visit_summary), n(extracted.chief_complaint), n(extracted.diagnosis), n(extracted.treatment), n(extracted.notes) || n(extracted.follow_up)]);
    saved.records.push({ id, type: extracted.document_type, summary: extracted.visit_summary });
  }
  
  // Save lab results
  if (extracted.lab_results && extracted.lab_results.results && Array.isArray(extracted.lab_results.results)) {
    const id = uuidv4();
    db.run("INSERT INTO lab_results VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, petId, n(extracted.lab_results.panel_name), n(extracted.lab_results.collection_date) || n(extracted.date_of_service), 
       JSON.stringify(extracted.lab_results.results), n(extracted.lab_results.interpretation), n(extracted.facility_name)]);
    saved.labs.push({ id, panel: extracted.lab_results.panel_name });
  }
  
  // Save allergies
  if (extracted.allergies_noted && Array.isArray(extracted.allergies_noted)) {
    for (const allergy of extracted.allergies_noted) {
      // Check if already exists
      const existing = queryOne("SELECT id FROM allergies WHERE pet_id = ? AND allergen = ?", [petId, n(allergy.allergen)]);
      if (!existing && allergy.allergen) {
        const id = uuidv4();
        db.run("INSERT INTO allergies VALUES (?, ?, ?, ?, ?)", [id, petId, n(allergy.allergen), n(allergy.reaction), n(allergy.severity)]);
        saved.allergies.push({ id, ...allergy });
      }
    }
  }
  
  // Save conditions
  if (extracted.conditions_noted && Array.isArray(extracted.conditions_noted)) {
    for (const cond of extracted.conditions_noted) {
      const existing = queryOne("SELECT id FROM conditions WHERE pet_id = ? AND condition = ?", [petId, n(cond.condition)]);
      if (!existing && cond.condition) {
        const id = uuidv4();
        db.run("INSERT INTO conditions VALUES (?, ?, ?, ?, ?)", [id, petId, n(cond.condition), n(cond.status) || 'active', n(extracted.date_of_service)]);
        saved.conditions.push({ id, ...cond });
      }
    }
  }
  
  // Update weight if present
  if (extracted.weight_kg && typeof extracted.weight_kg === 'number') {
    const id = uuidv4();
    db.run("INSERT INTO weight_records VALUES (?, ?, ?, ?)", [id, petId, extracted.weight_kg, n(extracted.date_of_service) || new Date().toISOString().split('T')[0]]);
    db.run("UPDATE pets SET weight_kg = ? WHERE id = ?", [extracted.weight_kg, petId]);
  }
  
  return saved;
}

// ================== ROUTES ==================

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
    vaccinations: query("SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY administration_date DESC", [pet.id]),
    weightHistory: query("SELECT * FROM weight_records WHERE pet_id = ? ORDER BY date DESC LIMIT 10", [pet.id]),
  });
});

app.post('/api/pets', auth, (req, res) => {
  try {
    const { name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes } = req.body;
    if (!name || !species || !sex) return res.status(400).json({ error: 'Name, species, sex required' });
    const id = uuidv4();
    db.run("INSERT INTO pets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))", [id, req.userId, name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes]);
    if (weightKg) db.run("INSERT INTO weight_records VALUES (?, ?, ?, date('now'))", [uuidv4(), id, weightKg]);
    res.status(201).json({ id, name, species, breed, sex, dateOfBirth, weightKg, microchipId, notes, allergies: [], conditions: [] });
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
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
  
  const records = query("SELECT *, 'record' as type FROM medical_records WHERE pet_id = ? ORDER BY date_of_service DESC", [req.params.id]);
  const vaccinations = query("SELECT *, 'vaccination' as type FROM vaccinations WHERE pet_id = ?", [req.params.id]);
  const labs = query("SELECT *, 'lab' as type FROM lab_results WHERE pet_id = ?", [req.params.id]);
  
  const timeline = [
    ...records.map(r => ({ type: 'record', subtype: r.record_type, date: r.date_of_service, data: { ...r, summary: r.summary || r.visit_summary } })),
    ...vaccinations.map(v => ({ type: 'vaccination', subtype: v.vaccine_name, date: v.administration_date, data: v })),
    ...labs.map(l => ({ type: 'lab', subtype: l.panel_name, date: l.collection_date, data: { ...l, results: JSON.parse(l.results || '[]') } })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.json(timeline);
});

// DOCUMENT UPLOAD & AI EXTRACTION
app.post('/api/pets/:id/upload', auth, upload.single('document'), async (req, res) => {
  try {
    const pet = queryOne("SELECT * FROM pets WHERE id = ? AND owner_id = ?", [req.params.id, req.userId]);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    if (!ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'AI processing not configured. Add ANTHROPIC_API_KEY to enable document extraction.' });
    }
    
    console.log(`Processing upload: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);
    
    // Convert file to base64
    const base64Data = req.file.buffer.toString('base64');
    
    // Extract with Claude
    let extracted;
    try {
      extracted = await extractWithClaude(base64Data, req.file.mimetype, {
        name: pet.name,
        species: pet.species,
        breed: pet.breed
      });
    } catch (extractError) {
      console.error('Claude extraction error:', extractError);
      return res.status(500).json({ error: `AI extraction failed: ${extractError.message}` });
    }
    
    // Save extracted data
    const saved = await saveExtractedData(req.params.id, extracted);
    
    // Save document record with file data
    const docId = uuidv4();
    db.run("INSERT INTO documents VALUES (?, ?, ?, ?, ?, datetime('now'), ?, 'completed')", 
      [docId, req.params.id, req.file.originalname, req.file.mimetype, base64Data, JSON.stringify(extracted)]);
    
    res.json({
      success: true,
      documentId: docId,
      extracted,
      saved,
      message: `Successfully extracted data from ${req.file.originalname}`
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process document' });
  }
});

// Check AI status
app.get('/api/ai/status', auth, (req, res) => {
  res.json({ 
    enabled: !!ANTHROPIC_API_KEY,
    message: ANTHROPIC_API_KEY ? 'AI document extraction is enabled' : 'Add ANTHROPIC_API_KEY to Railway variables to enable AI extraction'
  });
});

// RECORDS
app.get('/api/records/pet/:petId', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  res.json(query("SELECT * FROM medical_records WHERE pet_id = ? ORDER BY date_of_service DESC", [req.params.petId]));
});

app.post('/api/records', auth, (req, res) => {
  const { petId, recordType, dateOfService, facilityName, providerName, summary, chiefComplaint, diagnosis, treatment, notes } = req.body;
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const id = uuidv4();
  db.run("INSERT INTO medical_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))", 
    [id, petId, recordType, dateOfService, facilityName, providerName, summary, chiefComplaint, diagnosis, treatment, notes]);
  res.status(201).json({ id, petId, recordType, dateOfService, facilityName, summary });
});

// VACCINATIONS
app.get('/api/records/vaccinations/pet/:petId', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  res.json(query("SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY administration_date DESC", [req.params.petId]));
});

app.post('/api/records/vaccinations', auth, (req, res) => {
  const { petId, vaccineName, administrationDate, validUntil, facilityName, lotNumber } = req.body;
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const id = uuidv4();
  db.run("INSERT INTO vaccinations VALUES (?, ?, ?, ?, ?, ?, ?)", [id, petId, vaccineName, administrationDate, validUntil, facilityName, lotNumber]);
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
  const { petId, drugName, dose, frequency, indication, status, prescribedBy } = req.body;
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [petId, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const id = uuidv4();
  db.run("INSERT INTO medications VALUES (?, ?, ?, ?, ?, ?, ?, date('now'), ?)", [id, petId, drugName, dose, frequency, indication, status || 'ACTIVE', prescribedBy]);
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

// DOCUMENTS
app.get('/api/pets/:id/documents', auth, (req, res) => {
  const pet = queryOne("SELECT id FROM pets WHERE id = ? AND owner_id = ?", [req.params.id, req.userId]);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });
  const docs = query("SELECT id, filename, mimetype, upload_date, processing_status, extracted_data FROM documents WHERE pet_id = ? ORDER BY upload_date DESC", [req.params.id]);
  res.json(docs.map(d => ({
    id: d.id,
    filename: d.filename,
    mimetype: d.mimetype,
    uploadDate: d.upload_date,
    status: d.processing_status,
    extracted: d.extracted_data ? JSON.parse(d.extracted_data) : null
  })));
});

app.get('/api/documents/:id', auth, (req, res) => {
  const doc = queryOne("SELECT d.*, p.owner_id FROM documents d JOIN pets p ON d.pet_id = p.id WHERE d.id = ?", [req.params.id]);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  if (doc.owner_id !== req.userId) return res.status(403).json({ error: 'Access denied' });
  res.json({
    id: doc.id,
    filename: doc.filename,
    mimetype: doc.mimetype,
    uploadDate: doc.upload_date,
    status: doc.processing_status,
    extracted: doc.extracted_data ? JSON.parse(doc.extracted_data) : null
  });
});

app.get('/api/documents/:id/file', auth, (req, res) => {
  const doc = queryOne("SELECT d.*, p.owner_id FROM documents d JOIN pets p ON d.pet_id = p.id WHERE d.id = ?", [req.params.id]);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  if (doc.owner_id !== req.userId) return res.status(403).json({ error: 'Access denied' });
  
  const buffer = Buffer.from(doc.file_data, 'base64');
  res.setHeader('Content-Type', doc.mimetype);
  res.setHeader('Content-Disposition', `inline; filename="${doc.filename}"`);
  res.send(buffer);
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
    console.log(`   AI Extraction: ${ANTHROPIC_API_KEY ? '✅ Enabled' : '❌ Add ANTHROPIC_API_KEY'}`);
  });
});
