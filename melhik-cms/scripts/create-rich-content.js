const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const richContentData = [
  {
    religion: {
      name: 'Christianity',
      nameEn: 'Christianity',
      description: 'The world\'s largest religion based on the life and teachings of Jesus Christ.',
      color: '#3B82F6'
    },
    topics: [
      {
        title: 'The Trinity',
        description: 'Understanding the Christian doctrine of the three persons in one God.',
        religionId: 1,
        useBlocks: true,
        contentBlocks: [
          {
            blockType: 'text',
            contentData: {
              text: 'The Trinity is one of the most fundamental doctrines of Christianity. It teaches that God exists as three distinct persons - the Father, the Son (Jesus Christ), and the Holy Spirit - while remaining one God in essence.'
            },
            orderIndex: 0
          },
          {
            blockType: 'image',
            contentData: {
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
              caption: 'The Holy Trinity symbol representing the three persons in one God',
              altText: 'Trinity symbol with three interlocking circles'
            },
            orderIndex: 1
          },
          {
            blockType: 'text',
            contentData: {
              text: 'This doctrine is supported by numerous biblical passages throughout both the Old and New Testaments. The concept of the Trinity helps Christians understand the nature of God as revealed in Scripture.'
            },
            orderIndex: 2
          },
          {
            blockType: 'mixed',
            contentData: {
              text: 'Key Bible verses that support the Trinity doctrine:',
              imageUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=600&h=400&fit=crop',
              caption: 'Holy Bible open to relevant passages'
            },
            orderIndex: 3
          },
          {
            blockType: 'text',
            contentData: {
              text: '• "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit" (Matthew 28:19)\n\n• "The grace of the Lord Jesus Christ and the love of God and the fellowship of the Holy Spirit be with you all" (2 Corinthians 13:14)\n\n• "In the beginning was the Word, and the Word was with God, and the Word was God" (John 1:1)'
            },
            orderIndex: 4
          },
          {
            blockType: 'gallery',
            contentData: {
              images: [
                {
                  url: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=400&h=300&fit=crop',
                  caption: 'Ancient Trinity artwork'
                },
                {
                  url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
                  caption: 'Modern Trinity representation'
                },
                {
                  url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
                  caption: 'Trinity in church architecture'
                },
                {
                  url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
                  caption: 'Biblical manuscripts'
                }
              ]
            },
            orderIndex: 5
          }
        ]
      },
      {
        title: 'The Resurrection',
        description: 'The central event of Christian faith - Jesus Christ\'s victory over death.',
        religionId: 1,
        useBlocks: true,
        contentBlocks: [
          {
            blockType: 'text',
            contentData: {
              text: 'The Resurrection of Jesus Christ is the cornerstone of Christian faith. It represents God\'s victory over sin and death, offering hope of eternal life to all who believe.'
            },
            orderIndex: 0
          },
          {
            blockType: 'image',
            contentData: {
              imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
              caption: 'Empty tomb - symbol of the Resurrection',
              altText: 'Ancient tomb entrance with stone rolled away'
            },
            orderIndex: 1
          },
          {
            blockType: 'text',
            contentData: {
              text: 'The Resurrection is not merely a spiritual concept but a historical event that changed the course of human history. It validates Jesus\' claims about His divinity and His power over death.'
            },
            orderIndex: 2
          },
          {
            blockType: 'mixed',
            contentData: {
              text: 'Biblical accounts of the Resurrection:',
              imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop',
              caption: 'Gospel manuscripts'
            },
            orderIndex: 3
          },
          {
            blockType: 'text',
            contentData: {
              text: '• "He is not here; he has risen, just as he said. Come and see the place where he lay" (Matthew 28:6)\n\n• "Why do you look for the living among the dead? He is not here; he has risen!" (Luke 24:5-6)\n\n• "I am the resurrection and the life. The one who believes in me will live, even though they die" (John 11:25)'
            },
            orderIndex: 4
          },
          {
            blockType: 'gallery',
            contentData: {
              images: [
                {
                  url: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=400&h=300&fit=crop',
                  caption: 'Resurrection artwork'
                },
                {
                  url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
                  caption: 'Easter celebration'
                },
                {
                  url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
                  caption: 'Church resurrection imagery'
                }
              ]
            },
            orderIndex: 5
          }
        ]
      },
      {
        title: 'Salvation by Grace',
        description: 'Understanding how God\'s grace brings salvation through faith in Jesus Christ.',
        religionId: 1,
        useBlocks: true,
        contentBlocks: [
          {
            blockType: 'text',
            contentData: {
              text: 'Salvation by grace is the heart of the Christian gospel. It teaches that eternal life is a free gift from God, received through faith in Jesus Christ, not earned by good works.'
            },
            orderIndex: 0
          },
          {
            blockType: 'image',
            contentData: {
              imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
              caption: 'The cross - symbol of God\'s grace and sacrifice',
              altText: 'Wooden cross against a sunset sky'
            },
            orderIndex: 1
          },
          {
            blockType: 'text',
            contentData: {
              text: 'This doctrine emphasizes that salvation is entirely God\'s work, not human achievement. While good works are important, they are the result of salvation, not the cause of it.'
            },
            orderIndex: 2
          },
          {
            blockType: 'mixed',
            contentData: {
              text: 'Key verses on salvation by grace:',
              imageUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=600&h=400&fit=crop',
              caption: 'Bible open to Ephesians'
            },
            orderIndex: 3
          },
          {
            blockType: 'text',
            contentData: {
              text: '• "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast" (Ephesians 2:8-9)\n\n• "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life" (John 3:16)\n\n• "Therefore, since we have been justified through faith, we have peace with God through our Lord Jesus Christ" (Romans 5:1)'
            },
            orderIndex: 4
          }
        ]
      }
    ]
  },
  {
    religion: {
      name: 'Islam',
      nameEn: 'Islam',
      description: 'A monotheistic religion based on the teachings of the Prophet Muhammad.',
      color: '#10B981'
    },
    topics: [
      {
        title: 'The Five Pillars',
        description: 'The five fundamental acts of worship in Islam that form the foundation of Muslim life.',
        religionId: 2,
        useBlocks: true,
        contentBlocks: [
          {
            blockType: 'text',
            contentData: {
              text: 'The Five Pillars of Islam are the core beliefs and practices that every Muslim is expected to follow. These pillars provide a framework for spiritual growth and community life.'
            },
            orderIndex: 0
          },
          {
            blockType: 'image',
            contentData: {
              imageUrl: 'https://images.unsplash.com/photo-1564769626-aa5167a193aa?w=800&h=600&fit=crop',
              caption: 'Islamic calligraphy representing the Five Pillars',
              altText: 'Beautiful Arabic calligraphy in gold'
            },
            orderIndex: 1
          },
          {
            blockType: 'text',
            contentData: {
              text: 'Each pillar serves a specific purpose in the spiritual development of a Muslim and strengthens their relationship with Allah and the Muslim community.'
            },
            orderIndex: 2
          },
          {
            blockType: 'mixed',
            contentData: {
              text: 'The Five Pillars of Islam:',
              imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
              caption: 'Islamic geometric patterns'
            },
            orderIndex: 3
          },
          {
            blockType: 'text',
            contentData: {
              text: '1. **Shahada (Declaration of Faith)**: "There is no god but Allah, and Muhammad is his messenger"\n\n2. **Salah (Prayer)**: Five daily prayers facing Mecca\n\n3. **Zakat (Charity)**: Giving 2.5% of wealth to the poor\n\n4. **Sawm (Fasting)**: Fasting during the month of Ramadan\n\n5. **Hajj (Pilgrimage)**: Journey to Mecca at least once in a lifetime'
            },
            orderIndex: 4
          },
          {
            blockType: 'gallery',
            contentData: {
              images: [
                {
                  url: 'https://images.unsplash.com/photo-1564769626-aa5167a193aa?w=400&h=300&fit=crop',
                  caption: 'Prayer at the mosque'
                },
                {
                  url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
                  caption: 'Kaaba during Hajj'
                },
                {
                  url: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=400&h=300&fit=crop',
                  caption: 'Ramadan iftar meal'
                },
                {
                  url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
                  caption: 'Islamic charity distribution'
                }
              ]
            },
            orderIndex: 5
          }
        ]
      },
      {
        title: 'The Quran',
        description: 'The holy book of Islam, believed to be the word of Allah revealed to Prophet Muhammad.',
        religionId: 2,
        useBlocks: true,
        contentBlocks: [
          {
            blockType: 'text',
            contentData: {
              text: 'The Quran is the central religious text of Islam, believed by Muslims to be a revelation from Allah. It is written in Arabic and is considered the literal word of God.'
            },
            orderIndex: 0
          },
          {
            blockType: 'image',
            contentData: {
              imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
              caption: 'Beautiful Quran with ornate cover',
              altText: 'Open Quran with decorative Arabic text'
            },
            orderIndex: 1
          },
          {
            blockType: 'text',
            contentData: {
              text: 'The Quran contains 114 chapters (surahs) and over 6,000 verses (ayahs). It covers various aspects of life including theology, law, morality, and guidance for personal conduct.'
            },
            orderIndex: 2
          },
          {
            blockType: 'mixed',
            contentData: {
              text: 'Key themes in the Quran:',
              imageUrl: 'https://images.unsplash.com/photo-1564769626-aa5167a193aa?w=600&h=400&fit=crop',
              caption: 'Quranic verses in calligraphy'
            },
            orderIndex: 3
          },
          {
            blockType: 'text',
            contentData: {
              text: '• **Tawhid (Oneness of God)**: The fundamental belief in the unity of Allah\n\n• **Prophethood**: Recognition of all prophets including Muhammad\n\n• **Day of Judgment**: Belief in resurrection and accountability\n\n• **Divine Guidance**: The Quran as a guide for righteous living\n\n• **Social Justice**: Emphasis on fairness, charity, and community welfare'
            },
            orderIndex: 4
          }
        ]
      }
    ]
  },
  {
    religion: {
      name: 'Judaism',
      nameEn: 'Judaism',
      description: 'One of the oldest monotheistic religions, the foundation of both Christianity and Islam.',
      color: '#F59E0B'
    },
    topics: [
      {
        title: 'The Torah',
        description: 'The first five books of the Hebrew Bible, containing the fundamental laws and teachings of Judaism.',
        religionId: 3,
        useBlocks: true,
        contentBlocks: [
          {
            blockType: 'text',
            contentData: {
              text: 'The Torah, also known as the Pentateuch, consists of the first five books of the Hebrew Bible: Genesis, Exodus, Leviticus, Numbers, and Deuteronomy. It contains the fundamental laws, teachings, and history of the Jewish people.'
            },
            orderIndex: 0
          },
          {
            blockType: 'image',
            contentData: {
              imageUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800&h=600&fit=crop',
              caption: 'Torah scroll in a synagogue',
              altText: 'Ancient Torah scroll with Hebrew text'
            },
            orderIndex: 1
          },
          {
            blockType: 'text',
            contentData: {
              text: 'The Torah is considered the most sacred text in Judaism and is read publicly in synagogues throughout the year. It provides guidance on religious practice, ethical behavior, and the relationship between God and humanity.'
            },
            orderIndex: 2
          },
          {
            blockType: 'mixed',
            contentData: {
              text: 'The Five Books of the Torah:',
              imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop',
              caption: 'Hebrew Bible manuscripts'
            },
            orderIndex: 3
          },
          {
            blockType: 'text',
            contentData: {
              text: '1. **Bereshit (Genesis)**: The creation of the world and the stories of the patriarchs\n\n2. **Shemot (Exodus)**: The liberation from Egypt and the giving of the Ten Commandments\n\n3. **Vayikra (Leviticus)**: Laws concerning worship, sacrifice, and ritual purity\n\n4. **Bamidbar (Numbers)**: The journey through the wilderness and census of the Israelites\n\n5. **Devarim (Deuteronomy)**: Moses\' final speeches and the renewal of the covenant'
            },
            orderIndex: 4
          }
        ]
      }
    ]
  }
];

async function createRichContent() {
  try {
    console.log('🌱 Starting to create rich content...');

    // Clear existing data
    await prisma.contentBlock.deleteMany();
    await prisma.topicDetail.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.religion.deleteMany();

    console.log('✅ Cleared existing data');

    for (const religionData of richContentData) {
      // Create religion
      const religion = await prisma.religion.create({
        data: {
          name: religionData.religion.name,
          nameEn: religionData.religion.nameEn,
          description: religionData.religion.description,
          color: religionData.religion.color,
        },
      });

      console.log(`✅ Created religion: ${religion.name}`);

      // Create topics for this religion
      for (const topicData of religionData.topics) {
        const topic = await prisma.topic.create({
          data: {
            title: topicData.title,
            titleEn: topicData.title,
            description: topicData.description,
            religionId: religion.id,
          },
        });

        console.log(`✅ Created topic: ${topic.title}`);

        // Create topic detail with content blocks
        const topicDetail = await prisma.topicDetail.create({
          data: {
            topicId: topic.id,
            useBlocks: topicData.useBlocks,
          },
        });

        // Create content blocks
        for (const blockData of topicData.contentBlocks) {
          await prisma.contentBlock.create({
            data: {
              topicDetailId: topicDetail.id,
              blockType: blockData.blockType,
              contentData: JSON.stringify(blockData.contentData),
              orderIndex: blockData.orderIndex,
            },
          });
        }

        console.log(`✅ Created ${topicData.contentBlocks.length} content blocks for: ${topic.title}`);
      }
    }

    console.log('🎉 Rich content creation completed successfully!');
    console.log('\n📊 Summary:');
    
    const religionCount = await prisma.religion.count();
    const topicCount = await prisma.topic.count();
    const topicDetailCount = await prisma.topicDetail.count();
    const contentBlockCount = await prisma.contentBlock.count();

    console.log(`• Religions: ${religionCount}`);
    console.log(`• Topics: ${topicCount}`);
    console.log(`• Topic Details: ${topicDetailCount}`);
    console.log(`• Content Blocks: ${contentBlockCount}`);

  } catch (error) {
    console.error('❌ Error creating rich content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRichContent();
