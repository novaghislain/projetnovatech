const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données:', err.message);
  } else {
    console.log('Connecté à la base de données SQLite.');
  }
});

// Initialisation des tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      courseId INTEGER,
      amount INTEGER,
      transactionId TEXT,
      paymentMethod TEXT,
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES Users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Advertisements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      advertiserName TEXT NOT NULL,
      placement TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      targetUrl TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      startDate DATE,
      endDate DATE,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      formationId INTEGER NOT NULL,
      title TEXT NOT NULL,
      orderIndex INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      moduleId INTEGER NOT NULL,
      title TEXT NOT NULL,
      orderIndex INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(moduleId) REFERENCES Modules(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapterId INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL, -- 'video' ou 'pdf'
      contentUrl TEXT NOT NULL,
      orderIndex INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(chapterId) REFERENCES Chapters(id) ON DELETE CASCADE
    )
  `);
  
  console.log('Tables initialisées (Users, Enrollments, Advertisements, Modules, Chapters, Lessons).');
});

module.exports = db;
