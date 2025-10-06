const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearAllContent() {
  try {
    console.log('Starting to clear all content...')
    
    // Delete all content blocks first (due to foreign key constraints)
    const deletedContentBlocks = await prisma.contentBlock.deleteMany({})
    console.log(`Deleted ${deletedContentBlocks.count} content blocks`)
    
    // Delete all topic details
    const deletedTopicDetails = await prisma.topicDetail.deleteMany({})
    console.log(`Deleted ${deletedTopicDetails.count} topic details`)
    
    // Delete all topics
    const deletedTopics = await prisma.topic.deleteMany({})
    console.log(`Deleted ${deletedTopics.count} topics`)
    
    // Delete all religions
    const deletedReligions = await prisma.religion.deleteMany({})
    console.log(`Deleted ${deletedReligions.count} religions`)
    
    console.log('✅ All content cleared successfully!')
    console.log('You can now start fresh with the new block-based content editor.')
    
  } catch (error) {
    console.error('❌ Error clearing content:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearAllContent()



