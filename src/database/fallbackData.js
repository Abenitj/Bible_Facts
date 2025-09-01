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
    description: 'እስልምና አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
    color: '#8B4513'
  },
  {
    id: 'hindu',
    name: 'ሂንዱ',
    nameEn: 'Hinduism',
    description: 'ሂንዱ አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
    color: '#A0522D'
  },
  {
    id: 'buddhist',
    name: 'ቡዲስት',
    nameEn: 'Buddhism',
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
      concept: 'ፍጹም አንድነት ማለት እግዚአብሔር በአንድ ዓለም ውስጥ ሶስት ሰዎች እንደሚገኝ ነው። እንደ ማቴዎስ 28:19 ያለው፣ እግዚአብሔር በአብ፣ በወልድ፣ እና በመንፈስ ቅዱስ ይገኛል።',
      explanation: 'ይህ ጽንሰ ሐሳብ ለሰው ልጅ ለመረዳት አስቸጋሪ ሊሆን ይችላል፣ ነገር ግን እግዚአብሔር የራሱን ስለራሱ ያሳየን ነው። በዮሐንስ 1:1 ላይ የሚለው "በመጀመሪያ ቃል ነበረ፣ ቃልም ከእግዚአብሔር ጋር ነበረ፣ ቃልም እግዚአብሔር ነበረ" ይህን ያሳያል። እንዲሁም በዮሐንስ 10:30 ላይ "እኔ እና አብ አንድ ነን" ይለናል። እንዲሁም በዮሐንስ 14:26 ላይ የመንፈስ ቅዱስ ስለ መምጣቱ ይነገራል።',
      keyPoints: [
        'አንድ እግዚአብሔር በሶስት ሰዎች ውስጥ እንደ ማቴዎስ 28:19 ያለው',
        'እያንዳንዱ ሰው ሙሉ እግዚአብሔር ነው እንደ ዮሐንስ 1:1 ያለው',
        'እያንዳንዱ ሰው የተለየ ሚና አለው እንደ ዮሐንስ 14:26 ያለው'
      ]
    },
    references: [
      {
        verse: 'ማቴዎስ 28:19',
        text: 'እንግዲህ ሂዱ፥ ሁሉንም ሕዝብ ደቀ መዛሙርት አድርጉ፥ በአብ ስምም በወልድ ስምም በመንፈስ ቅዱስ ስምም አጥምቁአቸው።',
        explanation: 'ይህ ጥቅስ የሚያሳየን እግዚአብሔር በሶስት ሰዎች ውስጥ እንደሚገኝ ነው።'
      },
      {
        verse: 'ዮሐንስ 1:1',
        text: 'በመጀመሪያ ቃል ነበረ፣ ቃልም ከእግዚአብሔር ጋር ነበረ፣ ቃልም እግዚአብሔር ነበረ።',
        explanation: 'ይህ ጥቅስ የሚያሳየን የእግዚአብሔር ወልድ እግዚአብሔር እንደሆነ ነው።'
      },
      {
        verse: 'ዮሐንስ 14:26',
        text: 'መንፈስ ቅዱስ ግን፥ አብ በስሜ የሚልከው፥ እርሱ ሁሉን ያስተምራችኋል፥ እኔም ያልኩትን ሁሉ ያስታውራችኋል።',
        explanation: 'ይህ ጥቅስ የሚያሳየን የመንፈስ ቅዱስ ሚና እና እርሱ እግዚአብሔር እንደሆነ ነው።'
      }
    ],
    version: 1
  },
  {
    id: 'salvation',
    religionId: 'muslim',
    title: 'የመዳን መንገድ',
    titleEn: 'The Way of Salvation',
    description: 'እንዴት ሰው ልጅ መዳን ይችላል?',
    content: {
      concept: 'መዳን በኢየሱስ ክርስቶስ በኩል ብቻ ይሆናል። እንደ ዮሐንስ 14:6 ያለው "እኔ መንገድ እና እውነት እና ሕይወት ነኝ። ከእኔ ሌላ ማንም ወደ አብ አይመጣም"።',
      explanation: 'መዳን ለማግኘት ሰው ልጅ በኢየሱስ ክርስቶስ ማመን አለበት። እንደ ዮሐንስ 3:16 ያለው "እግዚአብሔር ሰው ልጁን እንደ ሰጠ ሁሉ በእርሱ ያለመ ሁሉ እንዳይጠፋ ነገር ግን የዘላለም ሕይወት እንዲያገኝ እንዲሁ አደረገ"። እንደ የሐዋርያት 4:12 ያለው "በሌላም ስም መዳን የለም፣ ምክንያቱም በሰማይ ሥር ለሰው ልጅ የተሰጠ ሌላ ስም የለም፣ በእርሱም ልንድን የምንችለው ነው"። እንዲሁም በሮሜ 6:23 ላይ "የኃጢአት ደመወዝ ሞት ነው፤ የእግዚአብሔር ስጦታ ግን በእርሱ በእኛ ጌታ በኢየሱስ ክርስቶስ የዘላለም ሕይወት ነው" ይለናል።',
      keyPoints: [
        'መዳን በኢየሱስ ክርስቶስ ብቻ ነው እንደ ዮሐንስ 14:6 ያለው',
        'በሌላ ስም መዳን የለም እንደ የሐዋርያት 4:12 ያለው',
        'በአፍ መመሰክር እና በልብ መመኘት አለብን እንደ ሮሜ 10:9 ያለው'
      ]
    },
    references: [
      {
        verse: 'ዮሐንስ 14:6',
        text: 'ኢየሱስ እርሱን። እኔ መንገድ እና እውነት እና ሕይወት ነኝ። ከእኔ ሌላ ማንም ወደ አብ አይመጣም።',
        explanation: 'ይህ ጥቅስ የሚያሳየን ኢየሱስ ክርስቶስ ብቸኛው የመዳን መንገድ እንደሆነ ነው።'
      },
      {
        verse: 'የሐዋርያት 4:12',
        text: 'በሌላም ስም መዳን የለም፣ ምክንያቱም በሰማይ ሥር ለሰው ልጅ የተሰጠ ሌላ ስም የለም፣ በእርሱም ልንድን የምንችለው ነው።',
        explanation: 'ይህ ጥቅስ የሚያሳየን በኢየሱስ ክርስቶስ ስም ብቻ መዳን እንደሚሆን ነው።'
      },
      {
        verse: 'ሮሜ 10:9',
        text: 'በአፍህ ጌታ ኢየሱስን ብትመሰክር በልብህም እግዚአብሔር እርሱን ከሙታን አስነስቶ እንደ ሆነ ብታምን ድን ያደርግሃል።',
        explanation: 'ይህ ጥቅስ የሚያሳየን መዳን ለማግኘት ምን እንደሚያስፈልግ ነው።'
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
export const getReligionsFallback = async () => {
  try {
    if (!religionsData || !Array.isArray(religionsData)) {
      console.warn('Religions data not properly initialized, reinitializing...');
      initializeFallbackData();
    }
    return religionsData || [];
  } catch (error) {
    console.error('Error in getReligionsFallback:', error);
    return [];
  }
};

export const getTopicsByReligionFallback = async (religionId) => {
  try {
    if (!topicsData || !Array.isArray(topicsData)) {
      console.warn('Topics data not properly initialized, reinitializing...');
      initializeFallbackData();
    }
    const topics = topicsData.filter(topic => topic.religionId === religionId);
    return topics || [];
  } catch (error) {
    console.error('Error in getTopicsByReligionFallback:', error);
    return [];
  }
};

export const getTopicByIdFallback = async (id) => {
  try {
    if (!topicsData || !Array.isArray(topicsData)) {
      console.warn('Topics data not properly initialized, reinitializing...');
      initializeFallbackData();
    }
    const topic = topicsData.find(topic => topic.id === id);
    return topic || null;
  } catch (error) {
    console.error('Error in getTopicByIdFallback:', error);
    return null;
  }
};

export const getReligionByIdFallback = async (id) => {
  try {
    if (!religionsData || !Array.isArray(religionsData)) {
      console.warn('Religions data not properly initialized, reinitializing...');
      initializeFallbackData();
    }
    const religion = religionsData.find(religion => religion.id === id);
    return religion || null;
  } catch (error) {
    console.error('Error in getReligionByIdFallback:', error);
    return null;
  }
};
