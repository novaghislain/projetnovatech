const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(process.env.DATABASE_PATH) 
  : path.resolve(__dirname, 'database.sqlite');

let client;
if (tursoUrl && tursoToken) {
  console.log('Connexion à la base de données Turso (Cloud)...');
  client = createClient({
    url: tursoUrl,
    authToken: tursoToken
  });
} else {
  console.log('Connexion à la base de données SQLite locale...');
  client = createClient({
    url: `file:${dbPath}`
  });
}

/**
 * Wrapper to mimic the sqlite3 callback-based API for backward compatibility.
 */
class Database {
  constructor(client) {
    this._client = client;
  }

  run(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];

    this._client.execute({ sql, args: params }).then(res => {
      if (callback) {
        callback(null, {
          changes: res.rowsAffected,
          lastID: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : null
        });
      }
    }).catch(err => {
      if (callback) callback(err);
    });
    return this;
  }

  get(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];

    this._client.execute({ sql, args: params }).then(res => {
      if (callback) {
        if (res.rows.length > 0) {
          callback(null, res.rows[0]);
        } else {
          callback(null, null);
        }
      }
    }).catch(err => {
      if (callback) callback(err);
    });
    return this;
  }

  all(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];

    this._client.execute({ sql, args: params }).then(res => {
      if (callback) {
        callback(null, res.rows);
      }
    }).catch(err => {
      if (callback) callback(err);
    });
    return this;
  }

  serialize(fn) {
    if (typeof fn === 'function') fn();
  }

  prepare(sql) {
    return {
      run: (...args) => {
        let params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        this._client.execute({ sql, args: params }).catch(() => {});
        return this;
      },
      finalize: () => {}
    };
  }

  close(callback) {
    try {
      this._client.close();
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
    }
  }
}

const dbWrapper = new Database(client);

// Initialize DB schema asynchronously
const initDb = async () => {
  // Foreign keys
  try { await client.execute('PRAGMA foreign_keys = ON;'); } catch(e){}

  const runSql = async (sql, args = []) => {
    try {
      return await client.execute({ sql, args });
    } catch(e) {
      console.error("SQL Error in init:", e.message, sql);
    }
  };

  const addColumnIfMissing = async (table, colDef) => {
    try {
      await client.execute(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
    } catch (e) {
      // ignore
    }
  };

  // Users
  await runSql(`
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

  await addColumnIfMissing('Users', "role TEXT DEFAULT 'apprenant'");
  await addColumnIfMissing('Users', 'avatar TEXT');
  await addColumnIfMissing('Users', "status TEXT DEFAULT 'active'");
  await addColumnIfMissing('Users', 'bio TEXT');
  await addColumnIfMissing('Users', 'resetToken TEXT');
  await addColumnIfMissing('Users', 'resetTokenExpiry DATETIME');
  await addColumnIfMissing('Users', 'parentName TEXT');
  await addColumnIfMissing('Users', 'parentPhone TEXT');
  await addColumnIfMissing('Users', 'companyName TEXT');

  try {
    const uCountRes = await client.execute("SELECT COUNT(*) as count FROM Users");
    if (uCountRes.rows[0].count === 0) {
      await runSql(`INSERT INTO Users (firstName, lastName, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Admin', 'FormationNova', 'admin@FormationNova.com', '$2b$10$eCzKiogycGxEltGkv6BvkOwTzZs1yuwgxavQ2O.KSQIpPtbQiRXmu', 'admin', 'active']);
      await runSql(`INSERT INTO Users (firstName, lastName, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Test', 'Formateur', 'formateur@FormationNova.com', '$2b$10$iV7OIMyimn3kK8qjiXV2UuedYRf3FqxFgkSC1Kpm/0PJDoZMve4Cu', 'formateur', 'active']);
      console.log("Comptes par défaut injectés.");
    }
  } catch (e) {}

  await runSql(`
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

  await addColumnIfMissing('Formations', 'isFull BOOLEAN DEFAULT 0');
  await addColumnIfMissing('Formations', 'isLive BOOLEAN DEFAULT 0');
  await addColumnIfMissing('Formations', 'liveRoomName TEXT');
  await addColumnIfMissing('Formations', 'enrollmentEndDate DATE');
  await addColumnIfMissing('Formations', 'formateurId INTEGER');
  await addColumnIfMissing('Formations', "format TEXT DEFAULT 'en_ligne'");
  await addColumnIfMissing('Formations', "locationMode TEXT DEFAULT 'en_ligne'");
  await addColumnIfMissing('Formations', "imageUrls TEXT");
  await addColumnIfMissing('Formations', "contactInstruction TEXT");
  await addColumnIfMissing('Formations', "descriptionEn TEXT");

  await runSql(`
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

  await addColumnIfMissing('Enrollments', 'rating INTEGER');
  await addColumnIfMissing('Enrollments', 'review TEXT');

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
  for (let col of enrollCols) {
    await addColumnIfMissing('Enrollments', col);
  }

  await runSql(`
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

  await runSql(`
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

  await addColumnIfMissing('Testimonials', "mediaUrl TEXT");
  await addColumnIfMissing('Testimonials', "mediaType TEXT DEFAULT 'none'");

  try {
    const tCountRes = await client.execute("SELECT COUNT(*) as count FROM Testimonials");
    if (tCountRes.rows[0].count === 0) {
      await runSql('INSERT INTO Testimonials (authorName, age, courseName, comment, rating, avatar) VALUES (?, ?, ?, ?, ?, ?)',
        ['Lucas', '12 ans', 'Initiation à la Programmation', "J'ai adoré créer mon propre jeu vidéo ! Les animateurs sont super sympas.", 5, '/2x.png']);
      await runSql('INSERT INTO Testimonials (authorName, age, courseName, comment, rating, avatar) VALUES (?, ?, ?, ?, ?, ?)',
        ['Sarah', '15 ans', "Découverte de l'IA", "C'est incroyable de voir comment fonctionne une intelligence artificielle.", 4, '/4x.png']);
      console.log("Témoignages initiaux injectés.");
    }
  } catch(e){}

  await runSql(`
    CREATE TABLE IF NOT EXISTS Gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      imageUrl TEXT NOT NULL,
      category TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await addColumnIfMissing('Gallery', "mediaType TEXT DEFAULT 'image'");

  try {
    const gCountRes = await client.execute("SELECT COUNT(*) as count FROM Gallery");
    if (gCountRes.rows[0].count === 0) {
      await runSql('INSERT INTO Gallery (title, imageUrl, category) VALUES (?, ?, ?)', ['Session Mars 2026', '/3x.jpeg', 'Classes']);
      await runSql('INSERT INTO Gallery (title, imageUrl, category) VALUES (?, ?, ?)', ['Remise de Certificats', '/5x.png', 'Événements']);
      await runSql('INSERT INTO Gallery (title, imageUrl, category) VALUES (?, ?, ?)', ['Atelier Robotique', '/11x.jpg', 'Ateliers']);
      console.log("Galerie initiale injectée.");
    }
  } catch(e){}

  await runSql(`CREATE TABLE IF NOT EXISTS Modules (id INTEGER PRIMARY KEY AUTOINCREMENT, formationId INTEGER NOT NULL, title TEXT NOT NULL, orderIndex INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`);
  await runSql(`CREATE TABLE IF NOT EXISTS Chapters (id INTEGER PRIMARY KEY AUTOINCREMENT, moduleId INTEGER NOT NULL, title TEXT NOT NULL, orderIndex INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(moduleId) REFERENCES Modules(id) ON DELETE CASCADE)`);
  await runSql(`CREATE TABLE IF NOT EXISTS Lessons (id INTEGER PRIMARY KEY AUTOINCREMENT, chapterId INTEGER NOT NULL, title TEXT NOT NULL, type TEXT NOT NULL, contentUrl TEXT NOT NULL, orderIndex INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(chapterId) REFERENCES Chapters(id) ON DELETE CASCADE)`);

  await runSql(`CREATE TABLE IF NOT EXISTS CourseQuestions (id INTEGER PRIMARY KEY AUTOINCREMENT, courseId INTEGER NOT NULL, studentName TEXT NOT NULL, text TEXT NOT NULL, status TEXT DEFAULT 'pending', answerText TEXT, repliedAt DATETIME, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(courseId) REFERENCES Formations(id) ON DELETE CASCADE)`);
  await runSql(`CREATE TABLE IF NOT EXISTS CourseQuestionReplies (id INTEGER PRIMARY KEY AUTOINCREMENT, questionId INTEGER NOT NULL, senderRole TEXT NOT NULL, text TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(questionId) REFERENCES CourseQuestions(id) ON DELETE CASCADE)`);

  await runSql(`CREATE TABLE IF NOT EXISTS Formateurs (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, prenom TEXT NOT NULL, email TEXT UNIQUE, telephone TEXT, specialite TEXT, bio TEXT, photo TEXT, status TEXT DEFAULT 'actif', createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  try {
    const fCountRes = await client.execute("SELECT COUNT(*) as count FROM Formateurs");
    if (fCountRes.rows[0].count === 0) {
      await runSql('INSERT INTO Formateurs (nom, prenom, email, specialite, bio, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['Formateur', 'Test', 'formateur@FormationNova.com', 'Bureautique', "Formateur de test pour valider les connexions et le tableau de bord.", 'actif']);
      console.log("Formateur initial injecté.");
    }
  } catch(e){}

  await runSql(`CREATE TABLE IF NOT EXISTS FormateurApplications (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, specialite TEXT NOT NULL, bio TEXT NOT NULL, photo TEXT, status TEXT DEFAULT 'pending', createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(userId) REFERENCES Users(id))`);
  await runSql(`CREATE TABLE IF NOT EXISTS LessonProgress (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, lessonId INTEGER NOT NULL, courseId INTEGER NOT NULL, completedAt DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(userId, lessonId), FOREIGN KEY(userId) REFERENCES Users(id), FOREIGN KEY(lessonId) REFERENCES Lessons(id), FOREIGN KEY(courseId) REFERENCES Formations(id))`);
  await runSql(`CREATE TABLE IF NOT EXISTS QuizQuestions (id INTEGER PRIMARY KEY AUTOINCREMENT, lessonId INTEGER NOT NULL, question TEXT NOT NULL, options TEXT NOT NULL, correctAnswer INTEGER NOT NULL, orderIndex INTEGER DEFAULT 0, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(lessonId) REFERENCES Lessons(id) ON DELETE CASCADE)`);
  await runSql(`CREATE TABLE IF NOT EXISTS Certificates (id INTEGER PRIMARY KEY AUTOINCREMENT, certId TEXT UNIQUE NOT NULL, userId INTEGER NOT NULL, courseId INTEGER NOT NULL, firstName TEXT NOT NULL, lastName TEXT NOT NULL, email TEXT NOT NULL, courseTitle TEXT NOT NULL, issuedAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(userId) REFERENCES Users(id), FOREIGN KEY(courseId) REFERENCES Formations(id))`);

  await runSql(`CREATE TABLE IF NOT EXISTS StaticPages (slug TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT NOT NULL, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  try {
    const spCountRes = await client.execute("SELECT COUNT(*) as count FROM StaticPages");
    if (spCountRes.rows[0].count === 0) {
      await runSql('INSERT INTO StaticPages (slug, title, content) VALUES (?, ?, ?)', ['apropos', 'À Propos', '']);
      await runSql('INSERT INTO StaticPages (slug, title, content) VALUES (?, ?, ?)', ['faq', 'FAQ', '']);
      await runSql('INSERT INTO StaticPages (slug, title, content) VALUES (?, ?, ?)', ['conditions', "Conditions d'utilisation", '']);
      await runSql('INSERT INTO StaticPages (slug, title, content) VALUES (?, ?, ?)', ['politique', 'Politique de confidentialité', '']);
      await runSql('INSERT INTO StaticPages (slug, title, content) VALUES (?, ?, ?)', ['apropos_en', 'About Us', '']);
      await runSql('INSERT INTO StaticPages (slug, title, content) VALUES (?, ?, ?)', ['faq_en', 'FAQ', '']);
      await runSql('INSERT INTO StaticPages (slug, title, content) VALUES (?, ?, ?)', ['conditions_en', 'Terms of Service', '']);
      await runSql('INSERT INTO StaticPages (slug, title, content) VALUES (?, ?, ?)', ['politique_en', 'Privacy Policy', '']);
      console.log("StaticPages initiales injectées.");
    }
  } catch(e){}

  await runSql(`CREATE TABLE IF NOT EXISTS PixelSettings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pixelId TEXT DEFAULT '',
    isActive BOOLEAN DEFAULT 0,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await runSql(`CREATE TABLE IF NOT EXISTS PixelCustomEvents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventName TEXT NOT NULL,
    cssSelector TEXT NOT NULL,
    actionType TEXT NOT NULL DEFAULT 'click',
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await runSql(`CREATE TABLE IF NOT EXISTS GeneralSettings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    siteName TEXT DEFAULT 'FormationNova',
    contactEmail TEXT DEFAULT 'contact@FormationNovavision.com',
    contactPhone TEXT DEFAULT '+229 0191348557',
    themeColor TEXT DEFAULT '#8B5CF6',
    fontFamily TEXT DEFAULT 'Inter',
    registrationStatus TEXT DEFAULT 'Ouvertes',
    defaultRole TEXT DEFAULT 'Apprenant',
    seoTitle TEXT DEFAULT 'FormationNova - L''informatique à la portée de tous',
    seoDescription TEXT DEFAULT 'FormationNova propose des formations en code, IA et bureautique adaptées aux enfants et adultes.',
    seoKeywords TEXT DEFAULT 'formation, code, IA, informatique, apprentissage',
    smtpUser TEXT DEFAULT '',
    smtpPass TEXT DEFAULT '',
    contactReceiverEmail TEXT DEFAULT 'contact@formationnova.com'
  )`);

  try {
    await runSql(`ALTER TABLE GeneralSettings ADD COLUMN seoTitle TEXT DEFAULT 'FormationNova - L''informatique à la portée de tous'`);
    await runSql(`ALTER TABLE GeneralSettings ADD COLUMN seoDescription TEXT DEFAULT 'FormationNova propose des formations en code, IA et bureautique adaptées aux enfants et adultes.'`);
    await runSql(`ALTER TABLE GeneralSettings ADD COLUMN seoKeywords TEXT DEFAULT 'formation, code, IA, informatique, apprentissage'`);
    await runSql(`ALTER TABLE GeneralSettings ADD COLUMN smtpUser TEXT DEFAULT ''`);
    await runSql(`ALTER TABLE GeneralSettings ADD COLUMN smtpPass TEXT DEFAULT ''`);
    await runSql(`ALTER TABLE GeneralSettings ADD COLUMN contactReceiverEmail TEXT DEFAULT 'contact@formationnova.com'`);
    await runSql(`ALTER TABLE GeneralSettings ADD COLUMN smtpHost TEXT DEFAULT 'smtp.gmail.com'`);
    await runSql(`ALTER TABLE GeneralSettings ADD COLUMN smtpPort TEXT DEFAULT '465'`);
  } catch(e) {}

  try {
    const gsCountRes = await client.execute("SELECT COUNT(*) as count FROM GeneralSettings");
    if (gsCountRes.rows[0].count === 0) {
      await runSql(`INSERT INTO GeneralSettings (
        id, siteName, contactEmail, contactPhone, themeColor, fontFamily, registrationStatus, defaultRole,
        seoTitle, seoDescription, seoKeywords, smtpUser, smtpPass, contactReceiverEmail
      ) VALUES (
        1, 'FormationNova', 'contact@FormationNovavision.com', '+229 0191348557', '#8B5CF6', 'Inter', 'Ouvertes', 'Apprenant',
        'FormationNova - L''informatique à la portée de tous',
        'FormationNova propose des formations en code, IA et bureautique adaptées aux enfants et adultes.',
        'formation, code, IA, informatique, apprentissage',
        '', '', 'contact@formationnova.com'
      )`);
      console.log("Paramètres généraux initiaux injectés.");
    }
  } catch(e){}

  await runSql(`CREATE TABLE IF NOT EXISTS Categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  try {
    const catCountRes = await client.execute("SELECT COUNT(*) as count FROM Categories");
    if (catCountRes.rows[0].count === 0) {
      ['Développement', 'Intelligence Artificielle', 'Bureautique', 'Design Graphique', 'Robotique'].forEach(async name => {
        const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        await runSql('INSERT INTO Categories (name, slug) VALUES (?, ?)', [name, slug]);
      });
      console.log("Catégories initiales injectées.");
    }
  } catch(e){}

  await runSql(`CREATE TABLE IF NOT EXISTS Sessions (
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
    const sCountRes = await client.execute("SELECT COUNT(*) as count FROM Sessions");
    if (sCountRes.rows[0].count === 0) {
      await runSql('INSERT INTO Sessions (formationId, startDate, endDate, maxPlaces, enrolled, status) VALUES (?, ?, ?, ?, ?, ?)',
        [1, '2026-07-01', '2026-07-28', 20, 15, 'ouverte']);
      await runSql('INSERT INTO Sessions (formationId, startDate, endDate, maxPlaces, enrolled, status) VALUES (?, ?, ?, ?, ?, ?)',
        [2, '2026-06-15', '2026-07-30', 20, 20, 'complet']);
      await runSql('INSERT INTO Sessions (formationId, startDate, endDate, maxPlaces, enrolled, status) VALUES (?, ?, ?, ?, ?, ?)',
        [1, '2026-08-01', '2026-08-28', 20, 0, 'planifiee']);
      console.log("Sessions initiales injectées.");
    }
  } catch(e){}

  console.log('Toutes les tables ont été initialisées avec succès via libsql.');

  return dbWrapper;
};

// Start initialization
const dbPromise = initDb().catch(err => {
  console.error('Erreur lors de l\'initialisation de la base de données:', err);
});

// Proxy trick as before
const handler = {
  get(target, prop) {
    if (prop === 'then') return undefined; 
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
