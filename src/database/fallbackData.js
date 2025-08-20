// Fallback data store for when SQLite fails
let religionsData = [];
let topicsData = [];
let settingsData = {};

// Sample religions data
const sampleReligions = [
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

// Sample topics data
const sampleTopics = [
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

// Initialize fallback data
export const initializeFallbackData = () => {
  religionsData = [...sampleReligions];
  topicsData = [...sampleTopics];
  console.log('Fallback data initialized');
};

// Fallback functions
export const getReligionsFallback = () => {
  return Promise.resolve(religionsData);
};

export const getTopicsByReligionFallback = (religionId) => {
  const topics = topicsData.filter(topic => topic.religionId === religionId);
  return Promise.resolve(topics);
};

export const getTopicByIdFallback = (id) => {
  const topic = topicsData.find(topic => topic.id === id);
  return Promise.resolve(topic || null);
};

export const getReligionByIdFallback = (id) => {
  const religion = religionsData.find(religion => religion.id === id);
  return Promise.resolve(religion || null);
};
