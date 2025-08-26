const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Create database file
const dbPath = path.join(__dirname, '..', 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Setting up SQLite database...');
console.log('Database path:', dbPath);

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('✅ Users table created');
    }
  });

  // Religions table
  db.run(`
    CREATE TABLE IF NOT EXISTS religions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nameEn TEXT,
      description TEXT,
      color TEXT DEFAULT '#8B4513',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating religions table:', err);
    } else {
      console.log('✅ Religions table created');
    }
  });

  // Topics table
  db.run(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      religionId INTEGER NOT NULL,
      title TEXT NOT NULL,
      titleEn TEXT,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (religionId) REFERENCES religions (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating topics table:', err);
    } else {
      console.log('✅ Topics table created');
    }
  });

  // Topic details table
  db.run(`
    CREATE TABLE IF NOT EXISTS topic_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topicId INTEGER UNIQUE NOT NULL,
      explanation TEXT NOT NULL,
      bibleVerses TEXT,
      keyPoints TEXT,
      references TEXT,
      version INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topicId) REFERENCES topics (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating topic_details table:', err);
    } else {
      console.log('✅ Topic details table created');
    }
  });

  // Insert sample data after tables are created
  setTimeout(() => {
    console.log('📝 Inserting sample data...');
    
    // Insert admin user
    const hashedPassword = bcrypt.hashSync('admin123', 12);
    db.run(`
      INSERT OR IGNORE INTO users (username, password, role) 
      VALUES (?, ?, ?)
    `, ['admin', hashedPassword, 'admin'], (err) => {
      if (err) {
        console.error('Error inserting admin user:', err);
      } else {
        console.log('✅ Admin user created');
      }
    });

    // Insert sample religions
    const religions = [
      ['እስልምና', 'Islam', 'እስልምና አካል ስለ ክርስትና ያላቸው ጥያቄዎች', '#8B4513'],
      ['ይሁዳዊነት', 'Judaism', 'ይሁዳዊነት አካል ስለ ክርስትና ያላቸው ጥያቄዎች', '#654321'],
      ['ሂንዱዊነት', 'Hinduism', 'ሂንዱዊነት አካል ስለ ክርስትና ያላቸው ጥያቄዎች', '#A0522D'],
      ['ቡዲስትነት', 'Buddhism', 'ቡዲስትነት አካል ስለ ክርስትና ያላቸው ጥያቄዎች', '#CD853F']
    ];

    religions.forEach((religion, index) => {
      db.run(`
        INSERT OR IGNORE INTO religions (name, nameEn, description, color) 
        VALUES (?, ?, ?, ?)
      `, religion, (err) => {
        if (err) {
          console.error(`Error inserting religion ${index + 1}:`, err);
        } else {
          console.log(`✅ Religion ${index + 1} created: ${religion[0]}`);
        }
      });
    });

    // Close database after all operations
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('🎉 Database setup completed!');
          console.log('📝 Admin credentials:');
          console.log('   Username: admin');
          console.log('   Password: admin123');
        }
      });
    }, 1000);
  }, 1000);
});
