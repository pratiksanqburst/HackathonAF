/**
 * db.js — SQLite persistence layer for Deckora
 * Uses better-sqlite3 (synchronous API — perfect for Express).
 * DB file: server/deckora.db  (gitignore-able, auto-created on first run)
 */

const Database = require('better-sqlite3')
const path = require('path')
const fs   = require('fs')

const DB_PATH = path.join(__dirname, '../deckora.db')

const db = new Database(DB_PATH)

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id                TEXT PRIMARY KEY,
    name              TEXT NOT NULL,
    email             TEXT DEFAULT '',
    contact           TEXT DEFAULT '',
    address           TEXT DEFAULT '',
    company           TEXT DEFAULT '',
    age               INTEGER DEFAULT 35,
    persona           TEXT DEFAULT 'family-planner',
    current           REAL DEFAULT 0,
    goal              REAL DEFAULT 0,
    sharpe            REAL DEFAULT 1.4,
    volatility        REAL DEFAULT 12.0,
    logo              TEXT,
    portfolio_holdings TEXT,   -- JSON string
    created_at        TEXT NOT NULL,
    client_type       TEXT DEFAULT 'individual',
    brand_colors      TEXT DEFAULT '[]',   -- JSON array of hex strings
    data_sheet        TEXT
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id          TEXT PRIMARY KEY,
    type        TEXT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT DEFAULT '',
    user_name   TEXT DEFAULT 'Alex Reed',
    timestamp   TEXT NOT NULL,
    metadata    TEXT DEFAULT '{}'   -- JSON string
  );
`)

// Migration: Add new columns if they don't exist (for existing DBs)
try {
  db.exec(`ALTER TABLE clients ADD COLUMN client_type TEXT DEFAULT 'individual'`)
} catch {}
try {
  db.exec(`ALTER TABLE clients ADD COLUMN brand_colors TEXT DEFAULT '[]'`)
} catch {}
try {
  db.exec(`ALTER TABLE clients ADD COLUMN data_sheet TEXT`)
} catch {}

// ─── Seed demo data (only on first run when tables are empty) ─────────────────

const clientCount = db.prepare('SELECT COUNT(*) as n FROM clients').get().n

if (clientCount === 0) {
  const insert = db.prepare(`
    INSERT INTO clients (id, name, email, contact, address, company, age, persona, current, goal, sharpe, volatility, logo, portfolio_holdings, created_at, client_type, brand_colors, data_sheet)
    VALUES (@id, @name, @email, @contact, @address, @company, @age, @persona, @current, @goal, @sharpe, @volatility, @logo, @portfolio_holdings, @created_at, @client_type, @brand_colors, @data_sheet)
  `)

  const seedClients = [
    { id: 'margaret', name: 'Margaret Chen',    email: 'margaret.chen@email.com', contact: '+1 (415) 555-0101', address: '123 Market St, San Francisco, CA', company: 'TechVentures Inc',    age: 48, persona: 'family-planner',    current: 620000,  goal: 1000000, sharpe: 1.55, volatility: 10.4, logo: null, portfolio_holdings: null, created_at: '2024-01-15T00:00:00.000Z', client_type: 'organizational', brand_colors: '[]', data_sheet: null },
    { id: 'robert',   name: 'Robert Harrington', email: 'r.harrington@finance.com', contact: '+1 (212) 555-0182', address: '456 Wall St, New York, NY',        company: 'Harrington Capital',   age: 52, persona: 'young-investor',   current: 850000,  goal: 1200000, sharpe: 1.68, volatility: 18.2, logo: null, portfolio_holdings: null, created_at: '2024-02-20T00:00:00.000Z', client_type: 'organizational', brand_colors: '[]', data_sheet: null },
    { id: 'patricia', name: 'Patricia Sullivan', email: 'patricia.s@wealth.com',   contact: '+1 (312) 555-0247', address: '789 Lake Shore Dr, Chicago, IL',   company: 'Sullivan Family Trust', age: 61, persona: 'retirement-client', current: 1450000, goal: 1800000, sharpe: 1.12, volatility: 6.5,  logo: null, portfolio_holdings: null, created_at: '2024-03-10T00:00:00.000Z', client_type: 'individual', brand_colors: '[]', data_sheet: null },
    { id: 'james',    name: 'James Okonkwo',     email: 'james.o@globalinv.com',   contact: '+1 (713) 555-0330', address: '101 Energy Blvd, Houston, TX',     company: 'Global Investments',   age: 44, persona: 'family-planner',    current: 480000,  goal: 800000,  sharpe: 1.45, volatility: 11.8, logo: null, portfolio_holdings: null, created_at: '2024-04-05T00:00:00.000Z', client_type: 'organizational', brand_colors: '[]', data_sheet: null },
    { id: 'sarah_k',  name: 'Sarah Kowalski',    email: 'sarah.k@startupvc.com',   contact: '+1 (650) 555-0415', address: '222 Silicon Ave, Palo Alto, CA',   company: 'Kowalski Ventures',    age: 35, persona: 'young-investor',   current: 320000,  goal: 600000,  sharpe: 1.92, volatility: 21.5, logo: null, portfolio_holdings: null, created_at: '2024-05-18T00:00:00.000Z', client_type: 'individual', brand_colors: '[]', data_sheet: null },
    { id: 'david_k',  name: 'David Kim',          email: 'david.kim@kimprop.com',   contact: '+1 (310) 555-0512', address: '333 Wilshire Blvd, Los Angeles, CA', company: 'Kim Properties',      age: 42, persona: 'family-planner',    current: 750000,  goal: 1100000, sharpe: 1.38, volatility: 9.6,  logo: null, portfolio_holdings: null, created_at: '2024-06-01T00:00:00.000Z', client_type: 'individual', brand_colors: '[]', data_sheet: null },
  ]

  const seedMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row)
  })
  seedMany(seedClients)
  console.log('🌱 Seeded 6 demo clients into SQLite')
}

const activityCount = db.prepare('SELECT COUNT(*) as n FROM activity_logs').get().n

if (activityCount === 0) {
  const insertAct = db.prepare(`
    INSERT INTO activity_logs (id, type, title, description, user_name, timestamp, metadata)
    VALUES (@id, @type, @title, @description, @user_name, @timestamp, @metadata)
  `)
  const now = Date.now()
  const seedActivities = [
    { id: 'act-1', type: 'client_create',    title: 'New Client Created',          description: 'Client profile created for Margaret Chen.',                                     user_name: 'Alex Reed', timestamp: new Date(now - 5 * 60000).toISOString(),       metadata: JSON.stringify({ clientId: 'margaret', clientName: 'Margaret Chen' }) },
    { id: 'act-2', type: 'portfolio_upload', title: 'Portfolio Sheet Imported',     description: 'Custom portfolio CSV holding sheet uploaded for Robert Harrington.',           user_name: 'Alex Reed', timestamp: new Date(now - 45 * 60000).toISOString(),      metadata: JSON.stringify({ clientId: 'robert',   clientName: 'Robert Harrington' }) },
    { id: 'act-3', type: 'deck_generate',   title: 'Investment Slide Deck Generated', description: 'Generated a 7-slide wealth strategy presentation for Patricia Sullivan.',   user_name: 'Alex Reed', timestamp: new Date(now - 3 * 3600000).toISOString(),     metadata: JSON.stringify({ clientId: 'patricia', clientName: 'Patricia Sullivan' }) },
    { id: 'act-4', type: 'logo_upload',     title: 'Company Logo Uploaded',         description: 'Uploaded company logo for TechVentures Inc (Margaret Chen).',                user_name: 'Alex Reed', timestamp: new Date(now - 5 * 3600000).toISOString(),     metadata: JSON.stringify({ clientId: 'margaret', clientName: 'Margaret Chen' }) },
    { id: 'act-5', type: 'client_update',   title: 'Client Profile Updated',        description: 'Updated investment strategy parameters for David Kim.',                       user_name: 'Alex Reed', timestamp: new Date(now - 24 * 3600000).toISOString(),    metadata: JSON.stringify({ clientId: 'david_k',  clientName: 'David Kim' }) },
  ]
  const seedActMany = db.transaction((rows) => {
    for (const row of rows) insertAct.run(row)
  })
  seedActMany(seedActivities)
  console.log('🌱 Seeded 5 demo activity logs into SQLite')
}

// ─── Helper: deserialise a raw DB row into the shape the frontend expects ─────

function deserialiseClient(row) {
  if (!row) return null
  return {
    id:                row.id,
    name:              row.name,
    email:             row.email,
    contact:           row.contact,
    address:           row.address,
    company:           row.company,
    age:               row.age,
    persona:           row.persona,
    current:           row.current,
    goal:              row.goal,
    sharpe:            row.sharpe,
    volatility:        row.volatility,
    logo:              row.logo || null,
    portfolioHoldings: row.portfolio_holdings ? JSON.parse(row.portfolio_holdings) : null,
    createdAt:         row.created_at,
    clientType:        row.client_type || 'individual',
    brandColors:       row.brand_colors ? JSON.parse(row.brand_colors) : [],
    dataSheet:         row.data_sheet || null,
  }
}

function deserialiseActivity(row) {
  if (!row) return null
  return {
    id:          row.id,
    type:        row.type,
    title:       row.title,
    description: row.description,
    user:        row.user_name,
    timestamp:   row.timestamp,
    metadata:    row.metadata ? JSON.parse(row.metadata) : {},
  }
}

// ─── Prepared statements ───────────────────────────────────────────────────────

const stmts = {
  // Clients
  getAllClients:    db.prepare('SELECT * FROM clients ORDER BY created_at DESC'),
  getClientById:   db.prepare('SELECT * FROM clients WHERE id = ?'),
  insertClient:    db.prepare(`
    INSERT INTO clients (id, name, email, contact, address, company, age, persona, current, goal, sharpe, volatility, logo, portfolio_holdings, created_at, client_type, brand_colors, data_sheet)
    VALUES (@id, @name, @email, @contact, @address, @company, @age, @persona, @current, @goal, @sharpe, @volatility, @logo, @portfolio_holdings, @created_at, @client_type, @brand_colors, @data_sheet)
  `),
  updateClient:    db.prepare(`
    UPDATE clients
    SET name=@name, email=@email, contact=@contact, address=@address, company=@company,
        age=@age, persona=@persona, current=@current, goal=@goal, sharpe=@sharpe, volatility=@volatility,
        client_type=@client_type
    WHERE id=@id
  `),
  deleteClient:    db.prepare('DELETE FROM clients WHERE id = ?'),
  updateLogo:      db.prepare('UPDATE clients SET logo = @logo WHERE id = @id'),
  updateHoldings:  db.prepare('UPDATE clients SET portfolio_holdings = @portfolio_holdings, current = @current, sharpe = @sharpe, volatility = @volatility WHERE id = @id'),
  updateBrandColors: db.prepare('UPDATE clients SET brand_colors = @brand_colors WHERE id = @id'),
  updateDataSheet:   db.prepare('UPDATE clients SET data_sheet = @data_sheet WHERE id = @id'),

  // Activity
  getAllActivity:   db.prepare('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100'),
  insertActivity:  db.prepare(`
    INSERT INTO activity_logs (id, type, title, description, user_name, timestamp, metadata)
    VALUES (@id, @type, @title, @description, @user_name, @timestamp, @metadata)
  `),
}

// ─── Public API ───────────────────────────────────────────────────────────────

module.exports = {
  // Clients
  getAllClients()          { return stmts.getAllClients.all().map(deserialiseClient) },
  getClientById(id)       { return deserialiseClient(stmts.getClientById.get(id)) },
  insertClient(client)    { stmts.insertClient.run(client);   return this.getClientById(client.id) },
  updateClient(id, fields) {
    const existing = stmts.getClientById.get(id)
    if (!existing) return null
    const merged = {
      id,
      name:        fields.name        ?? existing.name,
      email:       fields.email       ?? existing.email,
      contact:     fields.contact     ?? existing.contact,
      address:     fields.address     ?? existing.address,
      company:     fields.company     ?? existing.company,
      age:         fields.age         ?? existing.age,
      persona:     fields.persona     ?? existing.persona,
      current:     fields.current     ?? existing.current,
      goal:        fields.goal        ?? existing.goal,
      sharpe:      fields.sharpe      ?? existing.sharpe,
      volatility:  fields.volatility  ?? existing.volatility,
      client_type: fields.clientType  ?? fields.client_type ?? existing.client_type ?? 'individual',
    }
    stmts.updateClient.run(merged)
    return this.getClientById(id)
  },
  deleteClient(id)        { stmts.deleteClient.run(id) },
  updateLogo(id, logoUrl) {
    stmts.updateLogo.run({ id, logo: logoUrl })
    return this.getClientById(id)
  },
  updateHoldings(id, holdings, newCurrent, newSharpe, newVolatility) {
    stmts.updateHoldings.run({
      id,
      portfolio_holdings: JSON.stringify(holdings),
      current: newCurrent,
      sharpe: newSharpe,
      volatility: newVolatility,
    })
    return this.getClientById(id)
  },
  updateBrandColors(id, colors) {
    stmts.updateBrandColors.run({ id, brand_colors: JSON.stringify(colors) })
    return this.getClientById(id)
  },
  updateDataSheet(id, dataSheetUrl) {
    stmts.updateDataSheet.run({ id, data_sheet: dataSheetUrl })
    return this.getClientById(id)
  },

  // Activity
  getAllActivity()       { return stmts.getAllActivity.all().map(deserialiseActivity) },
  insertActivity(act)   { stmts.insertActivity.run(act);  return deserialiseActivity(stmts.getAllActivity.all()[0]) },
}
