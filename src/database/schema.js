import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

// Create a more robust database setup
let db = null;

const getDatabase = () => {
  if (!db) {
    try {
      db = SQLite.openDatabase('melhik.db');
      console.log('Database opened successfully');
    } catch (error) {
      console.error('Error opening database:', error);
      throw error;
    }
  }
  return db;
};

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    console.log('Starting database initialization...');
    try {
      const database = getDatabase();
      database.transaction(tx => {
      // Religions table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS religions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          nameEn TEXT,
          icon TEXT,
          description TEXT,
          color TEXT,
          lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `, [], 
      () => console.log('Religions table created/verified'),
      (_, error) => console.error('Error creating religions table:', error)
      );

      // Topics table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS topics (
          id TEXT PRIMARY KEY,
          religionId TEXT,
          title TEXT NOT NULL,
          titleEn TEXT,
          description TEXT,
          content TEXT,
          references TEXT,
          version INTEGER DEFAULT 1,
          lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (religionId) REFERENCES religions (id)
        );
      `, [],
      () => console.log('Topics table created/verified'),
      (_, error) => console.error('Error creating topics table:', error)
      );

      // App settings table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `, [],
      () => console.log('Settings table created/verified'),
      (_, error) => console.error('Error creating settings table:', error)
      );
      }, 
      (error) => {
        console.error('Database transaction error:', error);
        reject(error);
      }, 
      () => {
        console.log('Database initialization completed successfully');
        resolve();
      });
    } catch (error) {
      console.error('Database initialization error:', error);
      reject(error);
    }
  });
};

// Religion operations
export const insertReligion = (religion) => {
  return new Promise((resolve, reject) => {
    try {
      const database = getDatabase();
      database.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO religions (id, name, nameEn, icon, description, color, lastUpdated) 
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [religion.id, religion.name, religion.nameEn, religion.icon, religion.description, religion.color],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    } catch (error) {
      console.error('Error in insertReligion:', error);
      reject(error);
    }
  });
};

export const getReligions = () => {
  return new Promise((resolve, reject) => {
    try {
      const database = getDatabase();
      database.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM religions ORDER BY name',
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    } catch (error) {
      console.error('Error in getReligions:', error);
      reject(error);
    }
  });
};

export const getReligionById = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const database = getDatabase();
      database.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM religions WHERE id = ?',
          [id],
          (_, { rows }) => resolve(rows._array[0]),
          (_, error) => reject(error)
        );
      });
    } catch (error) {
      console.error('Error in getReligionById:', error);
      reject(error);
    }
  });
};

// Topic operations
export const insertTopic = (topic) => {
  return new Promise((resolve, reject) => {
    try {
      const database = getDatabase();
      database.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO topics (id, religionId, title, titleEn, description, content, references, version, lastUpdated) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            topic.id, 
            topic.religionId, 
            topic.title, 
            topic.titleEn, 
            topic.description, 
            JSON.stringify(topic.content), 
            JSON.stringify(topic.references), 
            topic.version || 1
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    } catch (error) {
      console.error('Error in insertTopic:', error);
      reject(error);
    }
  });
};

export const getTopicsByReligion = (religionId) => {
  return new Promise((resolve, reject) => {
    try {
      const database = getDatabase();
      database.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM topics WHERE religionId = ? ORDER BY title',
          [religionId],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    } catch (error) {
      console.error('Error in getTopicsByReligion:', error);
      reject(error);
    }
  });
};

export const getTopicById = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const database = getDatabase();
      database.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM topics WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows._array[0]) {
              const topic = rows._array[0];
              return resolve({
                ...topic,
                content: JSON.parse(topic.content),
                references: JSON.parse(topic.references)
              });
            }
            resolve(null);
          },
          (_, error) => reject(error)
        );
      });
    } catch (error) {
      console.error('Error in getTopicById:', error);
      reject(error);
    }
  });
};

// Settings operations
export const getSetting = (key) => {
  return new Promise((resolve, reject) => {
    try {
      const database = getDatabase();
      database.transaction(tx => {
        tx.executeSql(
          'SELECT value FROM app_settings WHERE key = ?',
          [key],
          (_, { rows }) => resolve(rows._array[0]?.value),
          (_, error) => reject(error)
        );
      });
    } catch (error) {
      console.error('Error in getSetting:', error);
      reject(error);
    }
  });
};

export const setSetting = (key, value) => {
  return new Promise((resolve, reject) => {
    try {
      const database = getDatabase();
      database.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO app_settings (key, value, lastUpdated) 
           VALUES (?, ?, CURRENT_TIMESTAMP)`,
          [key, value],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    } catch (error) {
      console.error('Error in setSetting:', error);
      reject(error);
    }
  });
};

// Initialize with sample data
export const initializeSampleData = async () => {
  try {
    const religions = [
      {
        id: 'muslim',
        name: 'እስልምና',
        nameEn: 'Islam',
        icon: '📖',
        description: 'እስልምና አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
        color: '#8B4513'
      },
      {
        id: 'hindu',
        name: 'ሂንዱ',
        nameEn: 'Hinduism',
        icon: '🕉️',
        description: 'ሂንዱ አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
        color: '#A0522D'
      },
      {
        id: 'buddhist',
        name: 'ቡዲስት',
        nameEn: 'Buddhism',
        icon: '☸️',
        description: 'ቡዲስት አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
        color: '#CD853F'
      }
    ];

    for (const religion of religions) {
      await insertReligion(religion);
    }

    const topics = [
      {
        id: 'trinity',
        religionId: 'muslim',
        title: 'ፍጹም አንድነት',
        titleEn: 'The Trinity',
        description: 'እግዚአብሔር እንዴት ሶስት በአንድ ሆኖ ይገኛል?',
        content: {
          concept: 'ፍጹም አንድነት ማለት እግዚአብሔር በአንድ ዓለም ውስጥ ሶስት ሰዎች እንደሚገኝ ነው።',
          explanation: 'ይህ ጽንሰ ሐሳብ ለሰው ልጅ ለመረዳት አስቸጋሪ ሊሆን ይችላል፣ ነገር ግን እግዚአብሔር የራሱን ስለራሱ ያሳየን ነው።',
          keyPoints: [
            'አንድ እግዚአብሔር በሶስት ሰዎች ውስጥ',
            'እያንዳንዱ ሰው ሙሉ እግዚአብሔር ነው',
            'እያንዳንዱ ሰው የተለየ ሚና አለው'
          ]
        },
        references: [
          {
            verse: 'ማቴዎስ 28:19',
            text: 'እንግዲህ ሂዱ፥ ሁሉንም ሕዝብ ደቀ መዛሙርት አድርጉ፥ በአብ ስምም በወልድ ስምም በመንፈስ ቅዱስ ስምም አጥምቁአቸው።',
            explanation: 'ይህ ጥቅስ የሚያሳየን እግዚአብሔር በሶስት ሰዎች ውስጥ እንደሚገኝ ነው።'
          }
        ],
        version: 1
      }
    ];

    for (const topic of topics) {
      await insertTopic(topic);
    }

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};
