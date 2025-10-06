const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicates() {
  try {
    console.log('🧹 Cleaning up duplicate data in CMS...\n');
    
    // First, let's see all the data
    const allReligions = await prisma.religion.findMany({
      include: {
        topics: {
          include: {
            details: {
              include: {
                contentBlocks: true
              }
            }
          }
        }
      }
    });
    
    console.log('📊 Current Data:');
    allReligions.forEach(religion => {
      console.log(`Religion ${religion.id}: ${religion.name} (${religion.nameEn}) - ${religion.topics.length} topics`);
      religion.topics.forEach(topic => {
        console.log(`  Topic ${topic.id}: ${topic.title} - ${topic.details?.contentBlocks?.length || 0} content blocks`);
      });
    });
    
    // Find unique religions by name
    const uniqueReligions = new Map();
    allReligions.forEach(religion => {
      const key = `${religion.name}-${religion.nameEn}`;
      if (!uniqueReligions.has(key)) {
        uniqueReligions.set(key, religion);
      }
    });
    
    console.log(`\n📋 Found ${allReligions.length} religions, ${uniqueReligions.size} unique`);
    
    // Keep the first occurrence of each unique religion
    const religionsToKeep = Array.from(uniqueReligions.values());
    const religionsToDelete = allReligions.filter(r => !religionsToKeep.includes(r));
    
    console.log(`\n🗑️  Deleting ${religionsToDelete.length} duplicate religions...`);
    
    for (const religion of religionsToDelete) {
      console.log(`Deleting Religion ${religion.id}: ${religion.name}`);
      
      // Delete all related data
      await prisma.contentBlock.deleteMany({
        where: {
          topicDetail: {
            topic: {
              religionId: religion.id
            }
          }
        }
      });
      
      await prisma.topicDetail.deleteMany({
        where: {
          topic: {
            religionId: religion.id
          }
        }
      });
      
      await prisma.topic.deleteMany({
        where: {
          religionId: religion.id
        }
      });
      
      await prisma.religion.delete({
        where: {
          id: religion.id
        }
      });
    }
    
    // Verify cleanup
    const remainingReligions = await prisma.religion.findMany({
      include: {
        topics: {
          include: {
            details: {
              include: {
                contentBlocks: true
              }
            }
          }
        }
      }
    });
    
    console.log('\n✅ Cleanup Complete!');
    console.log('📊 Remaining Data:');
    remainingReligions.forEach(religion => {
      console.log(`Religion ${religion.id}: ${religion.name} (${religion.nameEn}) - ${religion.topics.length} topics`);
      religion.topics.forEach(topic => {
        console.log(`  Topic ${topic.id}: ${topic.title} - ${topic.details?.contentBlocks?.length || 0} content blocks`);
      });
    });
    
    console.log(`\n🎉 Cleanup successful! Now you have ${remainingReligions.length} unique religions.`);
    console.log('The mobile app should now show clean data without duplicates.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicates();



