import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10)
  const contentManagerPassword = await bcrypt.hash('content123', 10)
  
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@melhik.com',
      password: adminPassword,
      role: 'admin',
      status: 'active'
    }
  })

  console.log('✅ Admin user created:', adminUser.username)

  // Create content manager user
  const contentManagerUser = await prisma.user.upsert({
    where: { username: 'content_manager' },
    update: {},
    create: {
      username: 'content_manager',
      email: 'content@melhik.com',
      password: contentManagerPassword,
      role: 'content_manager',
      status: 'active',
      createdBy: adminUser.id
    }
  })

  console.log('✅ Content Manager user created:', contentManagerUser.username)

  // Create some sample religions
  const christianity = await prisma.religion.create({
    data: {
      name: 'Christianity',
      nameEn: 'Christianity',
      description: 'A monotheistic religion based on the life and teachings of Jesus Christ',
      color: '#3B82F6'
    }
  })

  const islam = await prisma.religion.create({
    data: {
      name: 'Islam',
      nameEn: 'Islam',
      description: 'A monotheistic religion based on the teachings of the Prophet Muhammad',
      color: '#059669'
    }
  })

  console.log('✅ Sample religions created')

  // Create some sample topics
  const topic1 = await prisma.topic.create({
    data: {
      religionId: christianity.id,
      title: 'The Trinity',
      titleEn: 'The Trinity',
      description: 'The Christian doctrine of God as three persons in one'
    }
  })

  const topic2 = await prisma.topic.create({
    data: {
      religionId: islam.id,
      title: 'The Five Pillars',
      titleEn: 'The Five Pillars',
      description: 'The five basic acts of worship in Islam'
    }
  })

  console.log('✅ Sample topics created')

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Login Credentials:')
  console.log('Admin:')
  console.log('  Username: admin')
  console.log('  Password: admin123')
  console.log('\nContent Manager:')
  console.log('  Username: content_manager')
  console.log('  Password: content123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
