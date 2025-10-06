const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createRichSampleData() {
  try {
    console.log('Creating rich sample data with various content blocks...')
    
    // Create sample religions
    const christianity = await prisma.religion.create({
      data: {
        name: 'Christianity',
        nameEn: 'Christianity',
        description: 'A monotheistic religion based on the life and teachings of Jesus Christ',
        color: '#3B82F6',
        syncStatus: 'synced'
      }
    })
    console.log('✅ Created Christianity religion')
    
    const islam = await prisma.religion.create({
      data: {
        name: 'Islam',
        nameEn: 'Islam', 
        description: 'A monotheistic religion based on the teachings of the Prophet Muhammad',
        color: '#059669',
        syncStatus: 'synced'
      }
    })
    console.log('✅ Created Islam religion')
    
    // Create sample topics
    const trinityTopic = await prisma.topic.create({
      data: {
        title: 'The Trinity',
        titleEn: 'The Trinity',
        description: 'The Christian doctrine of God as three persons in one',
        religionId: christianity.id,
        syncStatus: 'synced'
      }
    })
    console.log('✅ Created Trinity topic')
    
    const fivePillarsTopic = await prisma.topic.create({
      data: {
        title: 'The Five Pillars',
        titleEn: 'The Five Pillars', 
        description: 'The five basic acts of worship in Islam',
        religionId: islam.id,
        syncStatus: 'synced'
      }
    })
    console.log('✅ Created Five Pillars topic')
    
    const prayerTopic = await prisma.topic.create({
      data: {
        title: 'Christian Prayer',
        titleEn: 'Christian Prayer',
        description: 'The practice of communicating with God through prayer',
        religionId: christianity.id,
        syncStatus: 'synced'
      }
    })
    console.log('✅ Created Prayer topic')
    
    // Create Trinity topic with rich content blocks
    const trinityTopicDetail = await prisma.topicDetail.create({
      data: {
        topicId: trinityTopic.id,
        version: 1,
        useBlocks: true,
        syncStatus: 'synced'
      }
    })
    
    // Text block 1
    await prisma.contentBlock.create({
      data: {
        topicDetailId: trinityTopicDetail.id,
        blockType: 'text',
        contentData: JSON.stringify({
          text: 'The Trinity is the Christian doctrine that God exists as three distinct persons: the Father, the Son (Jesus Christ), and the Holy Spirit. These three persons are co-equal and co-eternal, yet they are one God in essence.'
        }),
        orderIndex: 1,
        syncStatus: 'synced'
      }
    })
    
    // Image block
    await prisma.contentBlock.create({
      data: {
        topicDetailId: trinityTopicDetail.id,
        blockType: 'image',
        contentData: JSON.stringify({
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
          alt: 'Trinity symbol representation',
          caption: 'A visual representation of the Trinity doctrine'
        }),
        orderIndex: 2,
        syncStatus: 'synced'
      }
    })
    
    // Text block 2
    await prisma.contentBlock.create({
      data: {
        topicDetailId: trinityTopicDetail.id,
        blockType: 'text',
        contentData: JSON.stringify({
          text: 'This doctrine is fundamental to Christian theology and distinguishes Christianity from other monotheistic religions. The Trinity is revealed throughout the Bible, particularly in the New Testament.'
        }),
        orderIndex: 3,
        syncStatus: 'synced'
      }
    })
    
    // Mixed block with text and images
    await prisma.contentBlock.create({
      data: {
        topicDetailId: trinityTopicDetail.id,
        blockType: 'mixed',
        contentData: JSON.stringify({
          text: 'The three persons of the Trinity each have distinct roles:',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=150&fit=crop',
              alt: 'God the Father',
              caption: 'God the Father - Creator and Sustainer'
            },
            {
              url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=200&h=150&fit=crop',
              alt: 'Jesus Christ',
              caption: 'Jesus Christ - Savior and Redeemer'
            },
            {
              url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
              alt: 'Holy Spirit',
              caption: 'Holy Spirit - Comforter and Guide'
            }
          ]
        }),
        orderIndex: 4,
        syncStatus: 'synced'
      }
    })
    
    // Create Five Pillars topic with content
    const fivePillarsTopicDetail = await prisma.topicDetail.create({
      data: {
        topicId: fivePillarsTopic.id,
        version: 1,
        useBlocks: true,
        syncStatus: 'synced'
      }
    })
    
    // Text block for Five Pillars
    await prisma.contentBlock.create({
      data: {
        topicDetailId: fivePillarsTopicDetail.id,
        blockType: 'text',
        contentData: JSON.stringify({
          text: 'The Five Pillars of Islam are the five basic acts of worship that are considered mandatory for all Muslims. These pillars form the foundation of Muslim life and practice.'
        }),
        orderIndex: 1,
        syncStatus: 'synced'
      }
    })
    
    // Gallery block
    await prisma.contentBlock.create({
      data: {
        topicDetailId: fivePillarsTopicDetail.id,
        blockType: 'gallery',
        contentData: JSON.stringify({
          images: [
            {
              url: 'https://images.unsplash.com/photo-1564769626-aa15be2d743f?w=300&h=200&fit=crop',
              alt: 'Shahada - Declaration of Faith',
              caption: '1. Shahada - Declaration of Faith'
            },
            {
              url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
              alt: 'Salah - Prayer',
              caption: '2. Salah - Prayer'
            },
            {
              url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop',
              alt: 'Zakat - Charity',
              caption: '3. Zakat - Charity'
            },
            {
              url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop',
              alt: 'Sawm - Fasting',
              caption: '4. Sawm - Fasting'
            },
            {
              url: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=300&h=200&fit=crop',
              alt: 'Hajj - Pilgrimage',
              caption: '5. Hajj - Pilgrimage'
            }
          ]
        }),
        orderIndex: 2,
        syncStatus: 'synced'
      }
    })
    
    // Create Prayer topic (empty for demonstration)
    console.log('✅ Created Prayer topic (empty for demonstration)')
    
    console.log('🎉 Rich sample data created successfully!')
    console.log('📝 You now have:')
    console.log('   - 2 religions (Christianity, Islam)')
    console.log('   - 3 topics (Trinity with rich content, Five Pillars with gallery, Prayer empty)')
    console.log('   - Various content block types: text, image, mixed, gallery')
    console.log('   - Ready to test the new block-based content editor!')
    
  } catch (error) {
    console.error('❌ Error creating rich sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRichSampleData()



