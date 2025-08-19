export const religions = [
  {
    id: 'muslim',
    name: 'Islam',
    icon: '📖',
    description: 'Questions from Muslim perspective about Christianity',
    color: '#8B4513'
  },
  {
    id: 'orthodox',
    name: 'Orthodox',
    icon: '⛪',
    description: 'Questions about Orthodox vs Protestant Christianity',
    color: '#A0522D'
  },
  {
    id: 'catholic',
    name: 'Catholic',
    icon: '⛪',
    description: 'Questions about Catholic vs Protestant Christianity',
    color: '#CD853F'
  },
  {
    id: 'atheist',
    name: 'Atheist',
    icon: '❓',
    description: 'Questions from atheist perspective about Christianity',
    color: '#D2691E'
  },
  {
    id: 'hindu',
    name: 'Hinduism',
    icon: '🕉️',
    description: 'Questions from Hindu perspective about Christianity',
    color: '#B8860B'
  },
  {
    id: 'buddhist',
    name: 'Buddhism',
    icon: '☸️',
    description: 'Questions from Buddhist perspective about Christianity',
    color: '#DAA520'
  },
  {
    id: 'jewish',
    name: 'Judaism',
    icon: '✡️',
    description: 'Questions from Jewish perspective about Christianity',
    color: '#BDB76B'
  }
];

export const topics = {
  muslim: [
    {
      id: 'trinity',
      title: 'The Trinity',
      icon: '📖',
      description: 'How can God be three in one?',
      content: {
        concept: 'The Trinity is the Christian belief that God exists as three distinct persons - Father, Son, and Holy Spirit - yet is one God. This is a divine mystery that goes beyond human understanding but is clearly taught in Scripture.',
        explanation: 'Just as water can exist as liquid, solid (ice), and gas (steam) while remaining H2O, God exists as three persons while remaining one God. Each person of the Trinity is fully God, yet they are distinct in their roles and relationships.',
        keyPoints: [
          'God is one in essence but three in person',
          'Each person is fully God',
          'They are co-equal and co-eternal',
          'This is a divine mystery beyond human comprehension'
        ]
      },
      references: [
        {
          verse: 'Matthew 28:19',
          text: 'Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit',
          explanation: 'Jesus commands baptism in the name of all three persons, showing they are equally divine.'
        },
        {
          verse: 'John 1:1',
          text: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
          explanation: 'Shows that Jesus (the Word) is both with God and is God Himself.'
        },
        {
          verse: '2 Corinthians 13:14',
          text: 'The grace of the Lord Jesus Christ and the love of God and the fellowship of the Holy Spirit be with you all.',
          explanation: 'Paul mentions all three persons of the Trinity in one blessing.'
        }
      ]
    },
    {
      id: 'jesus-divinity',
      title: 'Jesus as God',
      icon: '👑',
      description: 'How can Jesus be God and man?',
      content: {
        concept: 'Jesus Christ is both fully God and fully human. This is called the hypostatic union - the union of divine and human natures in one person.',
        explanation: 'Jesus is not half-God and half-man, but 100% God and 100% human. This is essential for our salvation - as God, He could pay the infinite penalty for sin; as man, He could represent humanity.',
        keyPoints: [
          'Jesus is fully divine - He is God',
          'Jesus is fully human - He experienced human life',
          'These two natures are united in one person',
          'This is essential for salvation'
        ]
      },
      references: [
        {
          verse: 'John 1:1, 14',
          text: 'In the beginning was the Word, and the Word was with God, and the Word was God... And the Word became flesh and dwelt among us.',
          explanation: 'Shows Jesus as God who became human.'
        },
        {
          verse: 'Colossians 2:9',
          text: 'For in him the whole fullness of deity dwells bodily.',
          explanation: 'All of God\'s divine nature dwells in Jesus bodily.'
        },
        {
          verse: 'Philippians 2:6-7',
          text: 'Who, though he was in the form of God, did not count equality with God a thing to be grasped, but emptied himself, by taking the form of a servant, being born in the likeness of men.',
          explanation: 'Shows Jesus\' divine nature and His voluntary incarnation.'
        }
      ]
    },
    {
      id: 'salvation-grace',
      title: 'Salvation by Grace',
      icon: '💝',
      description: 'How can salvation be free?',
      content: {
        concept: 'Salvation is a free gift from God, received by faith alone, not by good works. This is called "salvation by grace through faith."',
        explanation: 'We cannot earn salvation through good works because our best efforts are still tainted by sin. Salvation is God\'s gift to us, paid for by Jesus\' death on the cross.',
        keyPoints: [
          'Salvation is a free gift from God',
          'It cannot be earned by good works',
          'It is received by faith in Jesus Christ',
          'Good works are the result, not the cause of salvation'
        ]
      },
      references: [
        {
          verse: 'Ephesians 2:8-9',
          text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.',
          explanation: 'Clear statement that salvation is by grace through faith, not works.'
        },
        {
          verse: 'Romans 6:23',
          text: 'For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.',
          explanation: 'Salvation is described as a free gift, contrasting with the wages of sin.'
        },
        {
          verse: 'Titus 3:5',
          text: 'He saved us, not because of works done by us in righteousness, but according to his own mercy.',
          explanation: 'Salvation is based on God\'s mercy, not our righteous works.'
        }
      ]
    }
  ],
  orthodox: [
    {
      id: 'sola-scriptura',
      title: 'Sola Scriptura',
      icon: '📖',
      description: 'Why Scripture alone as authority?',
      content: {
        concept: 'Sola Scriptura means "Scripture alone" - the belief that the Bible is the sole infallible authority for Christian faith and practice.',
        explanation: 'While tradition and church history are valuable, they must be tested against Scripture. The Bible is God\'s inspired Word and the final authority for all matters of faith.',
        keyPoints: [
          'Scripture is the final authority',
          'Tradition must align with Scripture',
          'The Bible is sufficient for salvation',
          'All teachings must be tested against Scripture'
        ]
      },
      references: [
        {
          verse: '2 Timothy 3:16-17',
          text: 'All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness, that the man of God may be complete, equipped for every good work.',
          explanation: 'Shows that Scripture is God-breathed and sufficient for equipping believers.'
        },
        {
          verse: 'Acts 17:11',
          text: 'Now these Jews were more noble than those in Thessalonica; they received the word with all eagerness, examining the Scriptures daily to see if these things were so.',
          explanation: 'The Bereans tested Paul\'s teaching against Scripture, showing Scripture as the authority.'
        }
      ]
    }
  ],
  catholic: [
    {
      id: 'justification-faith',
      title: 'Justification by Faith',
      icon: '⚖️',
      description: 'How are we justified before God?',
      content: {
        concept: 'Justification is God\'s declaration that a sinner is righteous in His sight. This happens instantly when a person places their faith in Jesus Christ.',
        explanation: 'Justification is not a process but an immediate declaration. God credits Christ\'s righteousness to us when we believe, making us legally righteous in His sight.',
        keyPoints: [
          'Justification is immediate upon faith',
          'It is a legal declaration, not a process',
          'We are declared righteous, not made righteous',
          'It is based on Christ\'s work, not ours'
        ]
      },
      references: [
        {
          verse: 'Romans 4:5',
          text: 'And to the one who does not work but believes in him who justifies the ungodly, his faith is counted as righteousness.',
          explanation: 'Shows that justification comes to those who believe, not work.'
        },
        {
          verse: 'Galatians 2:16',
          text: 'Yet we know that a person is not justified by works of the law but through faith in Jesus Christ.',
          explanation: 'Clear statement that justification is by faith, not works of the law.'
        }
      ]
    }
  ],
  atheist: [
    {
      id: 'existence-god',
      title: 'Existence of God',
      icon: '🌌',
      description: 'How do we know God exists?',
      content: {
        concept: 'God\'s existence can be known through creation, conscience, and Scripture. The universe itself points to a Creator.',
        explanation: 'The complexity and order of the universe, the existence of moral law, and the historical evidence for Jesus\' resurrection all point to God\'s existence.',
        keyPoints: [
          'Creation reveals God\'s power and nature',
          'Human conscience points to moral law',
          'Historical evidence supports biblical claims',
          'Personal experience confirms God\'s reality'
        ]
      },
      references: [
        {
          verse: 'Romans 1:20',
          text: 'For his invisible attributes, namely, his eternal power and divine nature, have been clearly perceived, ever since the creation of the world, in the things that have been made.',
          explanation: 'God\'s existence is evident from creation itself.'
        },
        {
          verse: 'Psalm 19:1',
          text: 'The heavens declare the glory of God, and the sky above proclaims his handiwork.',
          explanation: 'The natural world proclaims God\'s existence and glory.'
        }
      ]
    }
  ],
  hindu: [
    {
      id: 'one-way-salvation',
      title: 'One Way to Salvation',
      icon: '🛤️',
      description: 'Why only Jesus?',
      content: {
        concept: 'Jesus is the only way to salvation because He alone paid the penalty for sin and conquered death. Other religions offer different paths, but only Christianity offers a Savior.',
        explanation: 'All religions cannot be equally true because they make contradictory claims. Jesus\' unique claims, miracles, and resurrection set Him apart as the only true way to God.',
        keyPoints: [
          'Jesus made exclusive claims about Himself',
          'His resurrection validates His claims',
          'Only He paid the penalty for sin',
          'Other religions offer works, not grace'
        ]
      },
      references: [
        {
          verse: 'John 14:6',
          text: 'Jesus said to him, "I am the way, and the truth, and the life. No one comes to the Father except through me."',
          explanation: 'Jesus\' exclusive claim to be the only way to God.'
        },
        {
          verse: 'Acts 4:12',
          text: 'And there is salvation in no one else, for there is no other name under heaven given among men by which we must be saved.',
          explanation: 'Salvation is found only in Jesus Christ.'
        }
      ]
    }
  ],
  buddhist: [
    {
      id: 'suffering-purpose',
      title: 'Purpose of Suffering',
      icon: '💔',
      description: 'Why does God allow suffering?',
      content: {
        concept: 'Suffering exists because of human sin and the fall, but God uses it for good purposes. He doesn\'t cause suffering but can redeem it.',
        explanation: 'Suffering is not meaningless in Christianity. God uses it to refine our character, draw us closer to Him, and prepare us for eternity. Jesus Himself suffered to save us.',
        keyPoints: [
          'Suffering entered through human sin',
          'God can use suffering for good',
          'Jesus suffered to save us',
          'Suffering has purpose and meaning'
        ]
      },
      references: [
        {
          verse: 'Romans 8:28',
          text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
          explanation: 'God works all things, including suffering, for good.'
        },
        {
          verse: 'James 1:2-4',
          text: 'Count it all joy, my brothers, when you meet trials of various kinds, for you know that the testing of your faith produces steadfastness.',
          explanation: 'Trials produce character and spiritual growth.'
        }
      ]
    }
  ],
  jewish: [
    {
      id: 'messiah-fulfilled',
      title: 'Messiah Fulfilled',
      icon: '👑',
      description: 'How is Jesus the Messiah?',
      content: {
        concept: 'Jesus fulfilled hundreds of Old Testament prophecies about the Messiah, including His birth, ministry, death, and resurrection.',
        explanation: 'The probability of one person fulfilling all the messianic prophecies by chance is mathematically impossible. Jesus\' life perfectly matches the biblical description of the Messiah.',
        keyPoints: [
          'Jesus fulfilled hundreds of prophecies',
          'His life matches messianic expectations',
          'His death and resurrection were predicted',
          'The timing of His coming was foretold'
        ]
      },
      references: [
        {
          verse: 'Isaiah 53:5',
          text: 'But he was pierced for our transgressions; he was crushed for our iniquities; upon him was the chastisement that brought us peace, and with his wounds we are healed.',
          explanation: 'Prophesies the Messiah\'s suffering and death for our sins.'
        },
        {
          verse: 'Psalm 22:16-18',
          text: 'For dogs encompass me; a company of evildoers encircles me; they have pierced my hands and feet... they divide my garments among them, and for my clothing they cast lots.',
          explanation: 'Prophesies the crucifixion and soldiers casting lots for Jesus\' clothing.'
        }
      ]
    }
  ]
};

export const getTopicsByReligion = (religionId) => {
  return topics[religionId] || [];
};

export const getTopicById = (religionId, topicId) => {
  const religionTopics = topics[religionId];
  return religionTopics ? religionTopics.find(topic => topic.id === topicId) : null;
};
