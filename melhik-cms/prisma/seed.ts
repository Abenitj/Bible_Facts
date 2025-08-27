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

  // Create more topics for Islam
  const prayerTopic = await prisma.topic.create({
    data: {
      religionId: islam.id,
      title: 'የእስልምና ጸሎት',
      titleEn: 'Islamic Prayer',
      description: 'የእስልምና ጸሎት እንዴት እንደሚደረግ እና ለምን እንደሚደረግ'
    }
  })

  const fastingTopic = await prisma.topic.create({
    data: {
      religionId: islam.id,
      title: 'የረመዳን ጾም',
      titleEn: 'Ramadan Fasting',
      description: 'የረመዳን ጾም ትርጉም እና አስፈላጊነት'
    }
  })

  // Create topics for Orthodox
  const orthodoxPrayer = await prisma.topic.create({
    data: {
      religionId: orthodox.id,
      title: 'የኦርቶዶክስ ጸሎት',
      titleEn: 'Orthodox Prayer',
      description: 'የኦርቶዶክስ ቤተ ክርስቲያን ጸሎት ስርዓት'
    }
  })

  const orthodoxFasting = await prisma.topic.create({
    data: {
      religionId: orthodox.id,
      title: 'የኦርቶዶክስ ጾም',
      titleEn: 'Orthodox Fasting',
      description: 'የኦርቶዶክስ ቤተ ክርስቲያን ጾም ስርዓት'
    }
  })

  // Create topics for Protestant
  const protestantPrayer = await prisma.topic.create({
    data: {
      religionId: protestant.id,
      title: 'የፕሮቴስታንት ጸሎት',
      titleEn: 'Protestant Prayer',
      description: 'የፕሮቴስታንት ጸሎት ስርዓት እና መርሆዎች'
    }
  })

  const protestantBible = await prisma.topic.create({
    data: {
      religionId: protestant.id,
      title: 'የመጽሐፍ ቅዱስ አስተምህሮ',
      titleEn: 'Bible Teaching',
      description: 'የፕሮቴስታንት መጽሐፍ ቅዱስ አስተምህሮ መርሆዎች'
    }
  })

  console.log('✅ Created additional topics for all religions')

  // Create sample topic details for Trinity
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

  // Create content for Jesus topic
  const jesusDetails = await prisma.topicDetail.upsert({
    where: { topicId: jesusTopic.id },
    update: {},
    create: {
      topicId: jesusTopic.id,
      explanation: `ኢየሱስ ክርስቶስ የእግዚአብሔር ልጅ ናቸው። በመጽሐፍ ቅዱስ ውስጥ በብዙ ስፍራዎች የኢየሱስ ክርስቶስ አምላክነት ይታያል።

የኢየሱስ ክርስቶስ አምላክነት የሚታየው፡
1. በስማቸው - እግዚአብሔር እንደሚለው
2. በተሰጣቸው ክብር - እግዚአብሔር እንደሚሰጥ ያለው
3. በድርሳናቸው - እግዚአብሔር እንደሚያደርገው ያለው`,
      bibleVerses: JSON.stringify([
        "John 1:1",
        "John 1:14",
        "John 10:30",
        "Colossians 2:9"
      ]),
      keyPoints: JSON.stringify([
        "ኢየሱስ ክርስቶስ የእግዚአብሔር ልጅ ናቸው እንደ ዮሐንስ 1:1 ያለው",
        "በሥጋ ሆነ እንደ ዮሐንስ 1:14 ያለው",
        "እኔ እና አብ አንድ ነን እንደ ዮሐንስ 10:30 ያለው"
      ]),
      references: JSON.stringify([
        {
          verse: "John 1:1",
          text: "በመጀመሪያ የሐልመት ነበረ፥ የሐልመትም ከእግዚአብሔር ጋር ነበረ፥ የሐልመትም እግዚአብሔር ነበረ።",
          explanation: "ይህ ጥቅስ የሚያሳየን ኢየሱስ ክርስቶስ እግዚአብሔር እንደሆኑ ነው።"
        }
      ]),
      version: 1
    }
  })

  // Create content for Islamic Prayer
  const prayerDetails = await prisma.topicDetail.upsert({
    where: { topicId: prayerTopic.id },
    update: {},
    create: {
      topicId: prayerTopic.id,
      explanation: `የእስልምና ጸሎት የሚደረገው በየቀኑ አምስት ጊዜ ነው። እያንዳንዱ ጸሎት የራሱ ጊዜ አለው።

የእስልምና ጸሎት ዓላማዎች፡
1. እግዚአብሔርን ማምለክ
2. የራስን ስነ ምግባር ማሻሻል
3. የማህበረሰብ አንድነት ማጎልበት`,
      bibleVerses: JSON.stringify([
        "Acts 2:42",
        "1 Thessalonians 5:17",
        "Philippians 4:6"
      ]),
      keyPoints: JSON.stringify([
        "የእስልምና ጸሎት በየቀኑ አምስት ጊዜ ይደረጋል",
        "እያንዳንዱ ጸሎት የራሱ ጊዜ አለው",
        "ጸሎት የራስን ስነ ምግባር ያሻሽላል"
      ]),
      references: JSON.stringify([
        {
          verse: "Acts 2:42",
          text: "የሐዋርያትም ሥርዓት ሲያዙ፥ በጸሎትም ሲሰተኩ፥ በእንግድም ሲሰተኩ እንደ ቆዩ።",
          explanation: "ይህ ጥቅስ የሚያሳየን ጸሎት አስፈላጊ እንደሆነ ነው።"
        }
      ]),
      version: 1
    }
  })

  console.log('✅ Created topic details for multiple topics')

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
