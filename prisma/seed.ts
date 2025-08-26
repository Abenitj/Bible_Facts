import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const hashedPassword = await hashPassword('admin123')
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    }
  })
  console.log('✅ Admin user created:', adminUser.username)

  // Create sample religions
  const religions = await Promise.all([
    prisma.religion.upsert({
      where: { name: 'እስልምና' },
      update: {},
      create: {
        name: 'እስልምና',
        nameEn: 'Islam',
        description: 'እስልምና አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
        color: '#8B4513'
      }
    }),
    prisma.religion.upsert({
      where: { name: 'ይሁዳዊነት' },
      update: {},
      create: {
        name: 'ይሁዳዊነት',
        nameEn: 'Judaism',
        description: 'ይሁዳዊነት አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
        color: '#654321'
      }
    }),
    prisma.religion.upsert({
      where: { name: 'ሂንዱዊነት' },
      update: {},
      create: {
        name: 'ሂንዱዊነት',
        nameEn: 'Hinduism',
        description: 'ሂንዱዊነት አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
        color: '#A0522D'
      }
    }),
    prisma.religion.upsert({
      where: { name: 'ቡዲስትነት' },
      update: {},
      create: {
        name: 'ቡዲስትነት',
        nameEn: 'Buddhism',
        description: 'ቡዲስትነት አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
        color: '#CD853F'
      }
    })
  ])
  console.log('✅ Religions created:', religions.length)

  // Create sample topics for Islam
  const islamTopics = await Promise.all([
    prisma.topic.upsert({
      where: { 
        religionId_title: {
          religionId: religions[0].id,
          title: 'ፍጹም አንድነት'
        }
      },
      update: {},
      create: {
        religionId: religions[0].id,
        title: 'ፍጹም አንድነት',
        titleEn: 'The Trinity',
        description: 'እግዚአብሔር እንዴት ሶስት በአንድ ሆኖ ይገኛል?'
      }
    }),
    prisma.topic.upsert({
      where: { 
        religionId_title: {
          religionId: religions[0].id,
          title: 'የኢየሱስ አምላክነት'
        }
      },
      update: {},
      create: {
        religionId: religions[0].id,
        title: 'የኢየሱስ አምላክነት',
        titleEn: 'Divinity of Jesus',
        description: 'ኢየሱስ እግዚአብሔር እንዴት ሊሆን ይችላል?'
      }
    })
  ])
  console.log('✅ Islam topics created:', islamTopics.length)

  // Create sample topic details
  const topicDetails = await Promise.all([
    prisma.topicDetail.upsert({
      where: { topicId: islamTopics[0].id },
      update: {},
      create: {
        topicId: islamTopics[0].id,
        explanation: `ይህ ጽንሰ ሐሳብ ለሰው ልጅ ለመረዳት አስቸጋሪ ሊሆን ይችላል። ነገር ግን በመጽሐፍ ቅዱስ ውስጥ በግልጽ የተገለጸ ነው።

እግዚአብሔር በሶስት ሰዎች ውስጥ እንደ ማቴዎስ 28:19 ያለው። እያንዳንዱ ሰው ሙሉ እግዚአብሔር ነው እንደ ዮሐንስ 1:1 ያለው።

ይህ እንደ ትሪያንግል ነው - ሶስት ጎኖች አሉት ነገር ግን አንድ ትሪያንግል ነው።`,
        bibleVerses: ['Matthew 28:19', 'John 1:1', 'John 10:30'],
        keyPoints: [
          'አንድ እግዚአብሔር በሶስት ሰዎች ውስጥ እንደ ማቴዎስ 28:19 ያለው',
          'እያንዳንዱ ሰው ሙሉ እግዚአብሔር ነው እንደ ዮሐንስ 1:1 ያለው',
          'ይህ እንደ ትሪያንግል ነው - ሶስት ጎኖች አሉት ነገር ግን አንድ ትሪያንግል ነው'
        ],
        references: [
          {
            verse: 'ማቴዎስ 28:19',
            text: 'እንግዲህ ሂዱ፥ ሁሉንም ሕዝብ ደቀ መዛሙርት አድርጉ፥ በአብ ስምም በወልድ ስምም በመንፈስ ቅዱስ ስምም አጥምቁአቸው።',
            explanation: 'ይህ ጥቅስ የሚያሳየን እግዚአብሔር በሶስት ሰዎች ውስጥ እንደሚገኝ ነው።'
          },
          {
            verse: 'ዮሐንስ 1:1',
            text: 'በመጀመሪያ የሐሳብ ነበረ፥ የሐሳብም ከእግዚአብሔር ጋር ነበረ፥ እርሱም እግዚአብሔር ነበረ።',
            explanation: 'ይህ ጥቅስ የሚያሳየን የሐሳብ (ኢየሱስ) እግዚአብሔር እንደሆነ ነው።'
          }
        ],
        version: 1
      }
    })
  ])
  console.log('✅ Topic details created:', topicDetails.length)

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
