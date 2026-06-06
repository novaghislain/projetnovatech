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
      role TEXT DEFAULT 'apprenant',
      avatar TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Ajouter la colonne role si elle n'existe pas
  db.run("ALTER TABLE Users ADD COLUMN role TEXT DEFAULT 'apprenant'", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Migration 'role' sur Users : ignorée ou erreur (", err.message, ")");
    }
  });

  // Migration: Ajouter la colonne avatar si elle n'existe pas
  db.run("ALTER TABLE Users ADD COLUMN avatar TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Migration 'avatar' sur Users : ignorée ou erreur (", err.message, ")");
    }
  });

  // Migration: Ajouter la colonne status si elle n'existe pas
  db.run("ALTER TABLE Users ADD COLUMN status TEXT DEFAULT 'active'", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Migration 'status' sur Users : ignorée ou erreur (", err.message, ")");
    }
  });

  // Migration: Ajouter la colonne status sur Users si elle n'existe pas
  db.run("ALTER TABLE Users ADD COLUMN status TEXT DEFAULT 'active'", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Migration 'status' sur Users : ignorée ou erreur (", err.message, ")");
    }
  });

  // Migrations pour la réinitialisation de mot de passe
  db.run("ALTER TABLE Users ADD COLUMN resetToken TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Migration 'resetToken' sur Users : ignorée ou erreur (", err.message, ")");
    }
  });

  db.run("ALTER TABLE Users ADD COLUMN resetTokenExpiry DATETIME", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Migration 'resetTokenExpiry' sur Users : ignorée ou erreur (", err.message, ")");
    }
  });

  db.run("ALTER TABLE Users ADD COLUMN companyName TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Migration 'companyName' sur Users : ignorée ou erreur (", err.message, ")");
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS Formations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
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
  `, (err) => {
    if (!err) {
      // Seed default formations si la table est vide
      db.get("SELECT COUNT(*) as count FROM Formations", (err, row) => {
        if (!err && row.count === 0) {
          const insertForm = db.prepare(`INSERT INTO Formations (title, category, price, duration, ageGroup, maxParticipants, status, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
          insertForm.run('Initiation à la Programmation', 'Développement', 25000, '4 semaines', '10-14 ans', 20, 'published', '/7x.jpg');
          insertForm.run("Découverte de l'IA", 'Intelligence Artificielle', 30000, '6 semaines', '14-18 ans', 20, 'published', '/8x.jpeg');
          insertForm.run('Bureautique Avancée', 'Bureautique', 20000, '3 semaines', 'Tous âges', 15, 'published', '/10x.jpg');
          insertForm.finalize();
          console.log("Données initiales Formations injectées.");
        }
      });
    }
  });

  db.run("ALTER TABLE Formations ADD COLUMN isFull BOOLEAN DEFAULT 0", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Migration 'isFull' sur Formations : ignorée ou erreur (", err.message, ")");
    }
  });

  // Migrations: Live streaming
  db.run("ALTER TABLE Formations ADD COLUMN isLive BOOLEAN DEFAULT 0", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Migration 'isLive' sur Formations : ignorée ou erreur (", err.message, ")");
    }
  });
  db.run("ALTER TABLE Formations ADD COLUMN liveRoomName TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Migration 'liveRoomName' sur Formations : ignorée ou erreur (", err.message, ")");
    }
  });

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

  // Migration: Ajouter la colonne rating à Enrollments
  db.run("ALTER TABLE Enrollments ADD COLUMN rating INTEGER", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("Migration 'rating' sur Enrollments : ignorée ou erreur (", err.message, ")");
    }
  });

  // Migrations Enrollments
  const enrollCols = [
    "childFirstName TEXT", "childLastName TEXT", "childAge TEXT", 
    "parentName TEXT", "parentPhone TEXT", "parentEmail TEXT", 
    "address TEXT", "paymentType TEXT"
  ];
  enrollCols.forEach(colDef => {
    db.run(`ALTER TABLE Enrollments ADD COLUMN ${colDef}`, (err) => {
      // Ignore if column already exists
    });
  });

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

  const adCols = [
    "userId INTEGER",
    "title TEXT",
    "status TEXT DEFAULT 'En attente'",
    "paymentStatus TEXT DEFAULT 'En attente'",
    "budget INTEGER DEFAULT 0"
  ];
  adCols.forEach(colDef => {
    db.run(`ALTER TABLE Advertisements ADD COLUMN ${colDef}`, (err) => {
      // Ignore if column already exists
    });
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS Testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      authorName TEXT NOT NULL,
      age TEXT,
      courseName TEXT,
      comment TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      avatar TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (!err) {
      db.get("SELECT COUNT(*) as count FROM Testimonials", (err, row) => {
        if (!err && row.count === 0) {
          const insertTesti = db.prepare(`INSERT INTO Testimonials (authorName, age, courseName, comment, rating, avatar) VALUES (?, ?, ?, ?, ?, ?)`);
          insertTesti.run('Lucas', '12 ans', 'Initiation à la Programmation', "J'ai adoré créer mon propre jeu vidéo ! Les animateurs sont super sympas.", 5, '/2x.png');
          insertTesti.run('Sarah', '15 ans', "Découverte de l'IA", "C'est incroyable de voir comment fonctionne une intelligence artificielle.", 4, '/4x.png');
          insertTesti.finalize();
        }
      });
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS Gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      imageUrl TEXT NOT NULL,
      category TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (!err) {
      db.get("SELECT COUNT(*) as count FROM Gallery", (err, row) => {
        if (!err && row.count === 0) {
          const insertGallery = db.prepare(`INSERT INTO Gallery (title, imageUrl, category) VALUES (?, ?, ?)`);
          insertGallery.run('Session Mars 2026', '/3x.jpeg', 'Classes');
          insertGallery.run('Remise de Certificats', '/5x.png', 'Événements');
          insertGallery.run('Atelier Robotique', '/11x.jpg', 'Ateliers');
          insertGallery.finalize();
        }
      });
    }
  });

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

  db.run(`
    CREATE TABLE IF NOT EXISTS CourseQuestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      studentName TEXT NOT NULL,
      text TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      answerText TEXT,
      repliedAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(courseId) REFERENCES Formations(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS CourseQuestionReplies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questionId INTEGER NOT NULL,
      senderRole TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(questionId) REFERENCES CourseQuestions(id) ON DELETE CASCADE
    )
  `);

  // Table Formateurs
  db.run(`
    CREATE TABLE IF NOT EXISTS Formateurs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT UNIQUE,
      telephone TEXT,
      specialite TEXT,
      bio TEXT,
      photo TEXT,
      status TEXT DEFAULT 'actif',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (!err) {
      db.get("SELECT COUNT(*) as count FROM Formateurs", (err, row) => {
        if (!err && row.count === 0) {
          const insertF = db.prepare(`INSERT INTO Formateurs (nom, prenom, email, specialite, bio, status) VALUES (?, ?, ?, ?, ?, ?)`);
          insertF.run('Togbossi', 'Jean-Marc', 'jm.togbossi@novatech.com', 'Développement Web', 'Expert en programmation avec 8 ans d\'expérience dans l\'enseignement du code aux jeunes.', 'actif');
          insertF.run('Ahouandjinou', 'Marie', 'marie.a@novatech.com', 'Intelligence Artificielle', 'Passionnée d\'IA et de data science, elle rend les concepts complexes accessibles aux ados.', 'actif');
          insertF.finalize();
          console.log("Formateurs initiaux injectés.");
        }
      });
    }
  });
  
  // Table FormateurApplications
  db.run(`
    CREATE TABLE IF NOT EXISTS FormateurApplications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      specialite TEXT NOT NULL,
      bio TEXT NOT NULL,
      photo TEXT,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES Users(id)
    )
  `);
  
  // Table LessonProgress (suivi de progression)
  db.run(`
    CREATE TABLE IF NOT EXISTS LessonProgress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      lessonId INTEGER NOT NULL,
      courseId INTEGER NOT NULL,
      completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId, lessonId),
      FOREIGN KEY(userId) REFERENCES Users(id),
      FOREIGN KEY(lessonId) REFERENCES Lessons(id),
      FOREIGN KEY(courseId) REFERENCES Formations(id)
    )
  `);
  
  // Table QuizQuestions
  db.run(`
    CREATE TABLE IF NOT EXISTS QuizQuestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lessonId INTEGER NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correctAnswer INTEGER NOT NULL,
      orderIndex INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(lessonId) REFERENCES Lessons(id) ON DELETE CASCADE
    )
  `);

  // Table Certificates (pour validation publique)
  db.run(`
    CREATE TABLE IF NOT EXISTS Certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      certId TEXT UNIQUE NOT NULL,
      userId INTEGER NOT NULL,
      courseId INTEGER NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL,
      courseTitle TEXT NOT NULL,
      issuedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES Users(id),
      FOREIGN KEY(courseId) REFERENCES Formations(id)
    )
  `);

  console.log('Tables initialisées (Users, Enrollments, Advertisements, Modules, Chapters, Lessons, QuizQuestions, Certificates).');
});

module.exports = db;
