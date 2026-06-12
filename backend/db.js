const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(process.env.DATABASE_PATH) 
  : path.resolve(__dirname, 'database.sqlite');

let db = null;

/**
 * Wrapper around sql.js (SQLite compiled to WASM)
 * Mimics the sqlite3 callback-based API for backward compatibility.
 */
class Database {
  constructor(sqlDb) {
    this._db = sqlDb;
    this._queue = [];
    this._serializing = false;
  }

  /**
   * Run a query with optional params and callback (err, result)
   */
  run(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];

    let result, success = false;
    try {
      this._db.run(sql, params);
      const changes = this._db.getRowsModified();
      const lastID = this._db.exec("SELECT last_insert_rowid() as id");
      const id = lastID.length > 0 ? lastID[0].values[0][0] : null;
      result = { changes, lastID: id };
      success = true;

      // Force synchronous save to disk for write queries to keep files in sync
      const isWriteQuery = /^\s*(insert|update|delete|create|alter|drop|replace)/i.test(sql);
      if (isWriteQuery) {
        try {
          const data = this._db.export();
          fs.writeFileSync(dbPath, Buffer.from(data));
        } catch (saveErr) {
          console.error("Erreur lors de la sauvegarde immédiate de la DB:", saveErr.message);
        }
      }
    } catch (err) {
      if (callback) callback(err);
      return this;
    }
    if (success && callback) callback(null, result);
    return this;
  }

  /**
   * Get a single row
   */
  get(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];

    let row = null, success = false;
    try {
      const stmt = this._db.prepare(sql);
      if (params.length > 0) stmt.bind(params);

      if (stmt.step()) {
        const cols = stmt.getColumnNames();
        const vals = stmt.get();
        row = {};
        cols.forEach((col, i) => {
          row[col] = vals[i];
        });
      }
      stmt.free();
      success = true;
    } catch (err) {
      if (callback) callback(err);
      return this;
    }
    if (success && callback) callback(null, row);
    return this;
  }

  /**
   * Get all rows
   */
  all(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];

    let rows = [], success = false;
    try {
      const stmt = this._db.prepare(sql);
      if (params.length > 0) stmt.bind(params);

      while (stmt.step()) {
        const cols = stmt.getColumnNames();
        const vals = stmt.get();
        const row = {};
        cols.forEach((col, i) => {
          row[col] = vals[i];
        });
        rows.push(row);
      }
      stmt.free();
      success = true;
    } catch (err) {
      if (callback) callback(err);
      return this;
    }
    if (success && callback) callback(null, rows);
    return this;
  }

  /**
   * Run a group of queries serially
   */
  serialize(fn) {
    if (typeof fn === 'function') fn();
  }

  /**
   * Prepare a statement (partial support)
   */
  prepare(sql) {
    const stmt = this._db.prepare(sql);
    return {
      _stmt: stmt,
      _rows: [],
      run(...args) {
        try {
          // Flatten params if first arg is array
          const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
          stmt.bind(params);
          stmt.step();
          stmt.reset();
        } catch (e) {
          // silent
        }
        return this;
      },
      finalize() {
        stmt.free();
      }
    };
  }

  /**
   * Close the database and save to file
   */
  close(callback) {
    try {
      const data = this._db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
      this._db.close();
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
    }
  }
}

// Extended Database wrapper that also has the prepare().run().finalize() chain for seeds
class ExtendedDatabase extends Database {
  constructor(sqlDb) {
    super(sqlDb);
  }
}

// Initialize DB
const initDb = async () => {
  const SQL = await initSqlJs();

  let sqlDb;
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    sqlDb = new SQL.Database(fileBuffer);
    console.log('Connecté à la base de données SQLite existante.');
  } else {
    sqlDb = new SQL.Database();
    console.log('Nouvelle base de données SQLite créée.');
  }

  db = new ExtendedDatabase(sqlDb);

  // Enable WAL mode and foreign keys
  db._db.run('PRAGMA foreign_keys = ON;');
  db._db.run('PRAGMA journal_mode = MEMORY;');

  // ========== INITIALISATION DES TABLES ==========
  db.serialize(() => {
    // Users
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'apprenant',
        avatar TEXT,
        status TEXT DEFAULT 'active',
        resetToken TEXT,
        resetTokenExpiry DATETIME,
        refreshToken TEXT,
        companyName TEXT,
        parentName TEXT,
        parentPhone TEXT,
        bio TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns (safe to call even if exists - sql.js ignores duplicate column errors)
    const addColumnIfMissing = (table, colDef) => {
      try {
        db._db.run(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
      } catch (e) {
        // Column already exists - ignore
      }
    };

    addColumnIfMissing('Users', "role TEXT DEFAULT 'apprenant'");
    addColumnIfMissing('Users', 'avatar TEXT');
    addColumnIfMissing('Users', "status TEXT DEFAULT 'active'");
    addColumnIfMissing('Users', 'bio TEXT');
    addColumnIfMissing('Users', 'resetToken TEXT');
    addColumnIfMissing('Users', 'resetTokenExpiry DATETIME');
    addColumnIfMissing('Users', 'parentName TEXT');
    addColumnIfMissing('Users', 'parentPhone TEXT');
    addColumnIfMissing('Users', 'companyName TEXT');

    // Seed default admin and formateur if empty
    try {
      const uCount = db._db.exec("SELECT COUNT(*) as count FROM Users");
      if (uCount.length > 0 && uCount[0].values[0][0] === 0) {
        // Admin — password: password123
        db._db.run(`INSERT INTO Users (firstName, lastName, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
          ['Admin', 'Novatech', 'admin@novatech.com', '$2b$10$eCzKiogycGxEltGkv6BvkOwTzZs1yuwgxavQ2O.KSQIpPtbQiRXmu', 'admin', 'active']);
        
        // Formateur — password: password12
        db._db.run(`INSERT INTO Users (firstName, lastName, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
          ['Test', 'Formateur', 'formateur@novatech.com', '$2b$10$iV7OIMyimn3kK8qjiXV2UuedYRf3FqxFgkSC1Kpm/0PJDoZMve4Cu', 'formateur', 'active']);
          
        console.log("Comptes par défaut (admin + formateur) injectés.");
      }
    } catch (e) { /* silent */ }

    // Create Formations
    db.run(`
      CREATE TABLE IF NOT EXISTS Formations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT,
        description TEXT,
        category TEXT,
        ageGroup TEXT,
        level TEXT,
        duration TEXT,
        sessionsPerWeek INTEGER,
        sessionDuration TEXT,
        startDate DATE,
        endDate DATE,
        location TEXT,
        price INTEGER,
        registrationFee INTEGER DEFAULT 0,
        maxParticipants INTEGER,
        enrolled INTEGER DEFAULT 0,
        status TEXT DEFAULT 'draft',
        isOnline BOOLEAN DEFAULT 0,
        meetLink TEXT,
        whatsappLink TEXT,
        imageUrl TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // No default formations seeded — admin creates real formations from the dashboard

    addColumnIfMissing('Formations', 'isFull BOOLEAN DEFAULT 0');
    addColumnIfMissing('Formations', 'isLive BOOLEAN DEFAULT 0');
    addColumnIfMissing('Formations', 'liveRoomName TEXT');
    addColumnIfMissing('Formations', 'enrollmentEndDate DATE');
    addColumnIfMissing('Formations', 'formateurId INTEGER');

    // Create Enrollments
    db.run(`
      CREATE TABLE IF NOT EXISTS Enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        courseId INTEGER,
        amount INTEGER,
        paymentType TEXT DEFAULT 'full',
        totalAmount INTEGER DEFAULT 0,
        amountPaid INTEGER DEFAULT 0,
        transactionId TEXT,
        paymentMethod TEXT,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id)
      )
    `);



    // Messages
    db.run(`
      CREATE TABLE IF NOT EXISTS Messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        body TEXT NOT NULL,
        isRead BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    addColumnIfMissing('Enrollments', 'rating INTEGER');
    addColumnIfMissing('Enrollments', 'review TEXT');
    
    addColumnIfMissing('Formations', "format TEXT DEFAULT 'en_ligne'");
    addColumnIfMissing('Formations', "locationMode TEXT DEFAULT 'en_ligne'");
    addColumnIfMissing('Formations', "imageUrls TEXT");

    const enrollCols = [
      "childFirstName TEXT", "childLastName TEXT", "childAge TEXT",
      "parentName TEXT", "parentPhone TEXT", "parentEmail TEXT",
      "address TEXT", "paymentType TEXT",
      "installmentsPaid INTEGER DEFAULT 1",
      "totalInstallments INTEGER DEFAULT 3",
      "guestFirstName TEXT", "guestLastName TEXT", "guestEmail TEXT", "guestPhone TEXT",
      "progress INTEGER DEFAULT 0", "exercises TEXT DEFAULT '[]'",
      "paymentProof TEXT"
    ];
    enrollCols.forEach(col => addColumnIfMissing('Enrollments', col));

    // Testimonials
    db.run(`
      CREATE TABLE IF NOT EXISTS Testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        authorName TEXT NOT NULL,
        age TEXT,
        courseName TEXT,
        comment TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        avatar TEXT,
        mediaUrl TEXT,
        mediaType TEXT DEFAULT 'none',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    addColumnIfMissing('Testimonials', "mediaUrl TEXT");
    addColumnIfMissing('Testimonials', "mediaType TEXT DEFAULT 'none'");

    // Seed testimonials
    try {
      const tCount = db._db.exec("SELECT COUNT(*) as count FROM Testimonials");
      if (tCount.length > 0 && tCount[0].values[0][0] === 0) {
        db._db.run('INSERT INTO Testimonials (authorName, age, courseName, comment, rating, avatar) VALUES (?, ?, ?, ?, ?, ?)',
          ['Lucas', '12 ans', 'Initiation à la Programmation', "J'ai adoré créer mon propre jeu vidéo ! Les animateurs sont super sympas.", 5, '/2x.png']);
        db._db.run('INSERT INTO Testimonials (authorName, age, courseName, comment, rating, avatar) VALUES (?, ?, ?, ?, ?, ?)',
          ['Sarah', '15 ans', "Découverte de l'IA", "C'est incroyable de voir comment fonctionne une intelligence artificielle.", 4, '/4x.png']);
        console.log("Témoignages initiaux injectés.");
      }
    } catch (e) { /* silent */ }

    // Gallery
    db.run(`
      CREATE TABLE IF NOT EXISTS Gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        imageUrl TEXT NOT NULL,
        category TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    addColumnIfMissing('Gallery', "mediaType TEXT DEFAULT 'image'");

    try {
      const gCount = db._db.exec("SELECT COUNT(*) as count FROM Gallery");
      if (gCount.length > 0 && gCount[0].values[0][0] === 0) {
        db._db.run('INSERT INTO Gallery (title, imageUrl, category) VALUES (?, ?, ?)', ['Session Mars 2026', '/3x.jpeg', 'Classes']);
        db._db.run('INSERT INTO Gallery (title, imageUrl, category) VALUES (?, ?, ?)', ['Remise de Certificats', '/5x.png', 'Événements']);
        db._db.run('INSERT INTO Gallery (title, imageUrl, category) VALUES (?, ?, ?)', ['Atelier Robotique', '/11x.jpg', 'Ateliers']);
        console.log("Galerie initiale injectée.");
      }
    } catch (e) { /* silent */ }

    // Modules, Chapters, Lessons
    db.run(`CREATE TABLE IF NOT EXISTS Modules (id INTEGER PRIMARY KEY AUTOINCREMENT, formationId INTEGER NOT NULL, title TEXT NOT NULL, orderIndex INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS Chapters (id INTEGER PRIMARY KEY AUTOINCREMENT, moduleId INTEGER NOT NULL, title TEXT NOT NULL, orderIndex INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(moduleId) REFERENCES Modules(id) ON DELETE CASCADE)`);
    db.run(`CREATE TABLE IF NOT EXISTS Lessons (id INTEGER PRIMARY KEY AUTOINCREMENT, chapterId INTEGER NOT NULL, title TEXT NOT NULL, type TEXT NOT NULL, contentUrl TEXT NOT NULL, orderIndex INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(chapterId) REFERENCES Chapters(id) ON DELETE CASCADE)`);

    // CourseQuestions
    db.run(`CREATE TABLE IF NOT EXISTS CourseQuestions (id INTEGER PRIMARY KEY AUTOINCREMENT, courseId INTEGER NOT NULL, studentName TEXT NOT NULL, text TEXT NOT NULL, status TEXT DEFAULT 'pending', answerText TEXT, repliedAt DATETIME, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(courseId) REFERENCES Formations(id) ON DELETE CASCADE)`);
    db.run(`CREATE TABLE IF NOT EXISTS CourseQuestionReplies (id INTEGER PRIMARY KEY AUTOINCREMENT, questionId INTEGER NOT NULL, senderRole TEXT NOT NULL, text TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(questionId) REFERENCES CourseQuestions(id) ON DELETE CASCADE)`);

    // Formateurs
    db.run(`CREATE TABLE IF NOT EXISTS Formateurs (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, prenom TEXT NOT NULL, email TEXT UNIQUE, telephone TEXT, specialite TEXT, bio TEXT, photo TEXT, status TEXT DEFAULT 'actif', createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`);

    try {
      const fCount = db._db.exec("SELECT COUNT(*) as count FROM Formateurs");
      if (fCount.length > 0 && fCount[0].values[0][0] === 0) {
        db._db.run('INSERT INTO Formateurs (nom, prenom, email, specialite, bio, status) VALUES (?, ?, ?, ?, ?, ?)',
          ['Formateur', 'Test', 'formateur@novatech.com', 'Bureautique', "Formateur de test pour valider les connexions et le tableau de bord.", 'actif']);
        console.log("Formateur initial injecté.");
      }
    } catch (e) { /* silent */ }

    // FormateurApplications
    db.run(`CREATE TABLE IF NOT EXISTS FormateurApplications (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, specialite TEXT NOT NULL, bio TEXT NOT NULL, photo TEXT, status TEXT DEFAULT 'pending', createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(userId) REFERENCES Users(id))`);

    // LessonProgress
    db.run(`CREATE TABLE IF NOT EXISTS LessonProgress (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, lessonId INTEGER NOT NULL, courseId INTEGER NOT NULL, completedAt DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(userId, lessonId), FOREIGN KEY(userId) REFERENCES Users(id), FOREIGN KEY(lessonId) REFERENCES Lessons(id), FOREIGN KEY(courseId) REFERENCES Formations(id))`);

    // QuizQuestions
    db.run(`CREATE TABLE IF NOT EXISTS QuizQuestions (id INTEGER PRIMARY KEY AUTOINCREMENT, lessonId INTEGER NOT NULL, question TEXT NOT NULL, options TEXT NOT NULL, correctAnswer INTEGER NOT NULL, orderIndex INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(lessonId) REFERENCES Lessons(id) ON DELETE CASCADE)`);

    // Certificates
    db.run(`CREATE TABLE IF NOT EXISTS Certificates (id INTEGER PRIMARY KEY AUTOINCREMENT, certId TEXT UNIQUE NOT NULL, userId INTEGER NOT NULL, courseId INTEGER NOT NULL, firstName TEXT NOT NULL, lastName TEXT NOT NULL, email TEXT NOT NULL, courseTitle TEXT NOT NULL, issuedAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(userId) REFERENCES Users(id), FOREIGN KEY(courseId) REFERENCES Formations(id))`);

    // StaticPages
    db.run(`CREATE TABLE IF NOT EXISTS StaticPages (slug TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`);

    try {
      const spCount = db._db.exec("SELECT COUNT(*) as count FROM StaticPages");
      if (spCount.length > 0 && spCount[0].values[0][0] === 0) {
        const insertPage = (slug, title, content) => {
          db._db.run('INSERT INTO StaticPages (slug, title, content) VALUES (?, ?, ?)', [slug, title, content]);
        };

        insertPage('apropos', 'À Propos', `# À Propos de Novatech Vision

Novatech Vision est un organisme de formation spécialisé dans l'éducation informatique des enfants et jeunes de **8 à 18 ans**.

## Notre Mission
Accompagner les jeunes qui souhaitent découvrir le numérique autrement : avec plus de simplicité, de compréhension et de structure. Notre but est de leur faire gagner du temps et de leur éviter les erreurs classiques d'apprentissage.

## Notre Vision
Faire de Novatech Vision la référence de la formation numérique pour les jeunes en Afrique — un apprentissage humain, clair et accessible qui prépare une génération entière aux défis du monde digital.`);

        insertPage('faq', 'FAQ', `# Foire aux Questions

### Quels âges couvrez-vous ?
Nos programmes ciblent les enfants et jeunes de 8 à 18 ans, répartis en groupes d'âge pour garantir une pédagogie adaptée.

### Comment s'inscrire ?
Rendez-vous sur la page des formations, choisissez le programme qui vous intéresse et cliquez sur 'S'inscrire'. Le paiement sécurisé validera définitivement votre place.

### Y a-t-il des certificats délivrés ?
Oui, des attestations de réussite sont délivrées à la fin de toutes nos formations longues pour valoriser les compétences acquises.

### Puis-je payer en plusieurs fois ?
Oui, vous pouvez opter pour le paiement en 3 mensualités. Le premier tiers est payé à l'inscription, et les suivants directement depuis votre espace apprenant.`);

        insertPage('conditions', "Conditions d'utilisation", `# Conditions Générales d'Utilisation

Bienvenue sur la plateforme Novatech Vision. En accédant à ce site, vous acceptez nos conditions d'utilisation.

## 1. Services proposés
Novatech Vision propose des formations en informatique pour les enfants et adolescents.

## 2. Inscriptions et Paiements
Les inscriptions aux formations sont fermes après validation du paiement (intégral ou de la première mensualité).

## 3. Propriété intellectuelle
Tous les contenus pédagogiques partagés sur la plateforme restent la propriété exclusive de Novatech Vision.`);

        insertPage('politique', 'Politique de confidentialité', `# Politique de Confidentialité

Chez Novatech Vision, la protection de vos données personnelles est une priorité.

## 1. Collecte des données
Nous collectons les informations nécessaires à l'inscription (nom, prénom de l'enfant, âge, email et téléphone du parent).

## 2. Utilisation des données
Vos données sont uniquement utilisées pour le suivi pédagogique, la facturation et l'envoi de notifications liées aux formations.

## 3. Sécurité
Nous mettons en œuvre des mesures de sécurité pour protéger vos informations contre tout accès non autorisé.`);

        insertPage('apropos_en', 'About Us', `# About Novatech Vision

Novatech Vision is a training center specialized in computer education for kids and teens from **8 to 18 years old**.

## Our Mission
To guide kids and young people who want to discover computers in a different way: with simplicity, understanding, and structure. Our goal is to save them time and help them avoid typical learning mistakes.

## Our Vision
To make Novatech Vision the reference for IT training for kids and teens in Africa — a human, clear, and accessible learning path preparing an entire generation for the challenges of the digital world.`);

        insertPage('faq_en', 'FAQ', `# Frequently Asked Questions

### What ages do you cover?
Our programs target kids and teens from 8 to 18 years old, divided into age groups to guarantee tailored pedagogy.

### How do I enroll?
Go to the courses page, choose the program you are interested in and click on 'Enroll'. Safe online payment will confirm your spot.

### Are certificates awarded?
Yes, certificates of completion are awarded at the end of all our long training programs to highlight the skills acquired.

### Can I pay in installments?
Yes, you can opt to pay in 3 monthly installments. The first third is paid at registration, and the following ones directly from your student dashboard.`);

        insertPage('conditions_en', 'Terms of Service', `# Terms of Service

Welcome to the Novatech Vision platform. By accessing this site, you agree to our terms of service.

## 1. Services Provided
Novatech Vision offers training courses in computing for children and teenagers.

## 2. Registrations and Payments
Registrations for courses are final after payment validation (full or first installment).

## 3. Intellectual Property
All pedagogical content shared on the platform remains the exclusive property of Novatech Vision.`);

        insertPage('politique_en', 'Privacy Policy', `# Privacy Policy

At Novatech Vision, protecting your personal data is a priority.

## 1. Data Collection
We collect the necessary registration details (first name, last name, child's age, parent's email and phone number).

## 2. Data Usage
Your data is solely used for pedagogical tracking, invoicing, and sending course-related notifications.

## 3. Security
We implement security measures to protect your personal information against unauthorized access.`);

        console.log("StaticPages initiales injectées.");
      }
    } catch (e) { /* silent */ }

    // --- Meta Pixel ---
    db.run(`CREATE TABLE IF NOT EXISTS PixelSettings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pixelId TEXT DEFAULT '',
      isActive BOOLEAN DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS PixelCustomEvents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventName TEXT NOT NULL,
      cssSelector TEXT NOT NULL,
      actionType TEXT NOT NULL DEFAULT 'click',
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // --- General Settings ---
    db.run(`CREATE TABLE IF NOT EXISTS GeneralSettings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      siteName TEXT DEFAULT 'NovaTech Vision',
      contactEmail TEXT DEFAULT 'contact@novatechvision.com',
      contactPhone TEXT DEFAULT '+229 0191348557',
      themeColor TEXT DEFAULT '#8B5CF6',
      fontFamily TEXT DEFAULT 'Inter',
      registrationStatus TEXT DEFAULT 'Ouvertes',
      defaultRole TEXT DEFAULT 'Apprenant'
    )`);
    try {
      const gsCount = db._db.exec("SELECT COUNT(*) as count FROM GeneralSettings");
      if (gsCount.length > 0 && gsCount[0].values[0][0] === 0) {
        db._db.run(`INSERT INTO GeneralSettings (id, siteName, contactEmail, contactPhone, themeColor, fontFamily, registrationStatus, defaultRole)
                    VALUES (1, 'NovaTech Vision', 'contact@novatechvision.com', '+229 0191348557', '#8B5CF6', 'Inter', 'Ouvertes', 'Apprenant')`);
        console.log("Paramètres généraux initiaux injectés.");
      }
    } catch (e) { /* silent */ }

    console.log('Tables initialisées (Users, Enrollments, Advertisements, Modules, Chapters, Lessons, QuizQuestions, Certificates, StaticPages, PixelSettings, PixelCustomEvents, GeneralSettings).');

    // --- Categories ---
    db.run(`CREATE TABLE IF NOT EXISTS Categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    try {
      const catCount = db._db.exec("SELECT COUNT(*) as count FROM Categories");
      if (catCount.length > 0 && catCount[0].values[0][0] === 0) {
        ['Développement', 'Intelligence Artificielle', 'Bureautique', 'Design Graphique', 'Robotique'].forEach(name => {
          const slug = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          db._db.run('INSERT INTO Categories (name, slug) VALUES (?, ?)', [name, slug]);
        });
        console.log("Catégories initiales injectées.");
      }
    } catch (e) { /* silent */ }

    // --- Sessions ---
    db.run(`CREATE TABLE IF NOT EXISTS Sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      formationId INTEGER NOT NULL,
      startDate DATE NOT NULL,
      endDate DATE NOT NULL,
      maxPlaces INTEGER DEFAULT 20,
      enrolled INTEGER DEFAULT 0,
      status TEXT DEFAULT 'planifiee',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(formationId) REFERENCES Formations(id) ON DELETE CASCADE
    )`);
    try {
      const sCount = db._db.exec("SELECT COUNT(*) as count FROM Sessions");
      if (sCount.length > 0 && sCount[0].values[0][0] === 0) {
        db._db.run('INSERT INTO Sessions (formationId, startDate, endDate, maxPlaces, enrolled, status) VALUES (?, ?, ?, ?, ?, ?)',
          [1, '2026-07-01', '2026-07-28', 20, 15, 'ouverte']);
        db._db.run('INSERT INTO Sessions (formationId, startDate, endDate, maxPlaces, enrolled, status) VALUES (?, ?, ?, ?, ?, ?)',
          [2, '2026-06-15', '2026-07-30', 20, 20, 'complet']);
        db._db.run('INSERT INTO Sessions (formationId, startDate, endDate, maxPlaces, enrolled, status) VALUES (?, ?, ?, ?, ?, ?)',
          [1, '2026-08-01', '2026-08-28', 20, 0, 'planifiee']);
        console.log("Sessions initiales injectées.");
      }
    } catch (e) { /* silent */ }
  });

  // Save DB to file periodically
  const saveDb = () => {
    try {
      const data = db._db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbPath, buffer);
    } catch (e) {
      console.error('Erreur sauvegarde DB:', e.message);
    }
  };

  // Save every 30 seconds and on exit
  setInterval(saveDb, 30000);
  process.on('exit', saveDb);
  process.on('SIGINT', () => { saveDb(); process.exit(); });
  process.on('SIGTERM', () => { saveDb(); process.exit(); });

  return db;
};

// Initialize synchronously for immediate export
const dbPromise = initDb().catch(err => {
  console.error('Erreur lors de la connexion à la base de données:', err.message);
  process.exit(1);
});

// Export a proxy that delegates to the initialized db
const handler = {
  get(target, prop) {
    if (prop === 'then') return undefined; // not a thenable
    return (...args) => {
      return dbPromise.then(db => {
        if (typeof db[prop] === 'function') {
          return db[prop](...args);
        }
        return db[prop];
      });
    };
  }
};

module.exports = new Proxy({}, handler);
