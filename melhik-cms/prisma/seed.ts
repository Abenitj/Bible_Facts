import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('✅ Created admin user:', adminUser.username)

  // Create sample religions
  const islam = await prisma.religion.create({
    data: {
      name: 'እስልምና',
      nameEn: 'Islam',
      description: 'እስልምና አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
      color: '#8B4513'
    }
  })

  const orthodox = await prisma.religion.create({
    data: {
      name: 'ኦርቶዶክስ',
      nameEn: 'Orthodox',
      description: 'ኦርቶዶክስ አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
      color: '#0066CC'
    }
  })

  const protestant = await prisma.religion.create({
    data: {
      name: 'ፕሮቴስታንት',
      nameEn: 'Protestant',
      description: 'ፕሮቴስታንት አካል ስለ ክርስትና ያላቸው ጥያቄዎች',
      color: '#CC6600'
    }
  })

  console.log('✅ Created religions:', islam.name, orthodox.name, protestant.name)

  // Create sample topics for Islam
  const trinityTopic = await prisma.topic.create({
    data: {
      religionId: islam.id,
      title: 'ፍጹም አንድነት',
      titleEn: 'The Trinity',
      description: 'እግዚአብሔር እንዴት ሶስት በአንድ ሆኖ ይገኛል?'
    }
  })

  const jesusTopic = await prisma.topic.create({
    data: {
      religionId: islam.id,
      title: 'የኢየሱስ ክርስቶስ አምላክነት',
      titleEn: 'The Divinity of Jesus Christ',
      description: 'ኢየሱስ ክርስቶስ እግዚአብሔር ናቸው ወይስ የእግዚአብሔር ልጅ ናቸው?'
    }
  })

  console.log('✅ Created topics for Islam')

  // Create sample topic details
  const trinityDetails = await prisma.topicDetail.upsert({
    where: { topicId: trinityTopic.id },
    update: {},
    create: {
      topicId: trinityTopic.id,
      explanation: `የፍጹም አንድነት ጽንሰ ሐሳብ ለሰው ልጅ ለመረዳት አስቸጋሪ ሊሆን ይችላል። ነገር ግን ይህ የእግዚአብሔር ተግባቢ ነው።

እግዚአብሔር በሶስት ሰዎች ውስጥ እንደሚገኝ በመጽሐፍ ቅዱስ ውስጥ በብዙ ስፍራዎች ይታያል። ለምሳሌ፡

1. በአብ (Father) - የሰማይ እና ምድር ፈጣሪ
2. በወልድ (Son) - ኢየሱስ ክርስቶስ
3. በመንፈስ ቅዱስ (Holy Spirit) - የእግዚአብሔር መንፈስ

ይህ ሶስት ሰዎች አንድ እግዚአብሔር ናቸው። እያንዳንዱ ሰው ሙሉ እግዚአብሔር ነው።`,
      bibleVerses: JSON.stringify([
        "Matthew 28:19",
        "John 1:1",
        "John 10:30",
        "2 Corinthians 13:14"
      ]),
      keyPoints: JSON.stringify([
        "አንድ እግዚአብሔር በሶስት ሰዎች ውስጥ እንደ ማቴዎስ 28:19 ያለው",
        "እያንዳንዱ ሰው ሙሉ እግዚአብሔር ነው እንደ ዮሐንስ 1:1 ያለው",
        "የሶስቱ ሰዎች አንድነት በዮሐንስ 10:30 ይታያል"
      ]),
      references: JSON.stringify([
        {
          verse: "Matthew 28:19",
          text: "እንግዲህ ሂዱ፥ ሁሉንም ሕዝብ ደቀ መዛሙርት አድርጉ፥ በአብ ስምም በወልድ ስምም በመንፈስ ቅዱስ ስምም አጥምቁአቸው።",
          explanation: "ይህ ጥቅስ የሚያሳየን እግዚአብሔር በሶስት ሰዎች ውስጥ እንደሚገኝ ነው።"
        }
      ]),
      version: 1
    }
  })

  console.log('✅ Created topic details for Trinity')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
