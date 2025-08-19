export const biblicalFacts = [
  {
    id: 1,
    title: "The Longest Name in the Bible",
    fact: "The longest name in the Bible is Mahershalalhashbaz, which means 'Quick to the plunder, swift to the spoil'.",
    reference: "Isaiah 8:1",
    category: "People",
    favorite: false
  },
  {
    id: 2,
    title: "The Shortest Verse",
    fact: "The shortest verse in the Bible is 'Jesus wept' (John 11:35), containing only two words in English.",
    reference: "John 11:35",
    category: "Teachings",
    favorite: false
  },
  {
    id: 3,
    title: "Noah's Ark Dimensions",
    fact: "Noah's ark was 300 cubits long, 50 cubits wide, and 30 cubits high - approximately 450 feet long, 75 feet wide, and 45 feet high.",
    reference: "Genesis 6:15",
    category: "Events",
    favorite: false
  },
  {
    id: 4,
    title: "The Tower of Babel",
    fact: "The Tower of Babel was built to reach heaven, but God confused the languages of the people, causing them to scatter across the earth.",
    reference: "Genesis 11:1-9",
    category: "Places",
    favorite: false
  },
  {
    id: 5,
    title: "Moses' Age",
    fact: "Moses lived to be 120 years old, and his eyesight never failed him.",
    reference: "Deuteronomy 34:7",
    category: "People",
    favorite: false
  },
  {
    id: 6,
    title: "The Ten Commandments",
    fact: "The Ten Commandments were written on two stone tablets by the finger of God.",
    reference: "Exodus 31:18",
    category: "Teachings",
    favorite: false
  },
  {
    id: 7,
    title: "David and Goliath",
    fact: "David defeated Goliath with just a sling and five smooth stones, though he only needed one.",
    reference: "1 Samuel 17:40-50",
    category: "Events",
    favorite: false
  },
  {
    id: 8,
    title: "Solomon's Wisdom",
    fact: "God gave Solomon wisdom so great that people came from all nations to hear it.",
    reference: "1 Kings 4:29-34",
    category: "People",
    favorite: false
  },
  {
    id: 9,
    title: "The Walls of Jericho",
    fact: "The walls of Jericho fell after the Israelites marched around the city for seven days.",
    reference: "Joshua 6:1-20",
    category: "Places",
    favorite: false
  },
  {
    id: 10,
    title: "Jesus' Miracles",
    fact: "Jesus performed over 35 recorded miracles in the Gospels, including healing the sick, raising the dead, and feeding thousands.",
    reference: "Various Gospels",
    category: "Miracles",
    favorite: false
  },
  {
    id: 11,
    title: "The Twelve Disciples",
    fact: "Jesus chose twelve disciples to follow him, representing the twelve tribes of Israel.",
    reference: "Matthew 10:1-4",
    category: "People",
    favorite: false
  },
  {
    id: 12,
    title: "The Last Supper",
    fact: "The Last Supper was Jesus' final meal with his disciples before his crucifixion, where he instituted the Lord's Supper.",
    reference: "Matthew 26:17-30",
    category: "Events",
    favorite: false
  },
  {
    id: 13,
    title: "The Resurrection",
    fact: "Jesus rose from the dead on the third day after his crucifixion, appearing to over 500 people.",
    reference: "1 Corinthians 15:3-8",
    category: "Miracles",
    favorite: false
  },
  {
    id: 14,
    title: "The Great Commission",
    fact: "Jesus' final command to his disciples was to go and make disciples of all nations.",
    reference: "Matthew 28:19-20",
    category: "Teachings",
    favorite: false
  },
  {
    id: 15,
    title: "Paul's Conversion",
    fact: "Paul, originally named Saul, was converted to Christianity after encountering Jesus on the road to Damascus.",
    reference: "Acts 9:1-19",
    category: "Events",
    favorite: false
  },
  {
    id: 16,
    title: "The Garden of Eden",
    fact: "The Garden of Eden was the first home of humanity, containing the Tree of Life and the Tree of Knowledge of Good and Evil.",
    reference: "Genesis 2:8-15",
    category: "Places",
    favorite: false
  },
  {
    id: 17,
    title: "The Burning Bush",
    fact: "God spoke to Moses through a burning bush that was not consumed by the fire.",
    reference: "Exodus 3:1-6",
    category: "Miracles",
    favorite: false
  },
  {
    id: 18,
    title: "The Parting of the Red Sea",
    fact: "God parted the Red Sea so the Israelites could escape from Egypt, then closed it on the pursuing Egyptian army.",
    reference: "Exodus 14:21-28",
    category: "Miracles",
    favorite: false
  },
  {
    id: 19,
    title: "The Golden Rule",
    fact: "Jesus taught the Golden Rule: 'Do to others as you would have them do to you.'",
    reference: "Matthew 7:12",
    category: "Teachings",
    favorite: false
  },
  {
    id: 20,
    title: "The Beatitudes",
    fact: "Jesus gave the Sermon on the Mount, including the eight Beatitudes that describe the characteristics of blessed people.",
    reference: "Matthew 5:3-12",
    category: "Teachings",
    favorite: false
  }
];

export const categories = [
  { id: 'all', name: 'All Facts', icon: '📖' },
  { id: 'people', name: 'People', icon: '👥' },
  { id: 'places', name: 'Places', icon: '🏛️' },
  { id: 'events', name: 'Events', icon: '📅' },
  { id: 'teachings', name: 'Teachings', icon: '📚' },
  { id: 'miracles', name: 'Miracles', icon: '✨' }
];

export const getRandomFact = () => {
  const randomIndex = Math.floor(Math.random() * biblicalFacts.length);
  return biblicalFacts[randomIndex];
};

export const getFactsByCategory = (category) => {
  if (category === 'all') return biblicalFacts;
  return biblicalFacts.filter(fact => fact.category.toLowerCase() === category);
};

export const searchFacts = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return biblicalFacts.filter(fact => 
    fact.title.toLowerCase().includes(lowercaseQuery) ||
    fact.fact.toLowerCase().includes(lowercaseQuery) ||
    fact.reference.toLowerCase().includes(lowercaseQuery)
  );
};
