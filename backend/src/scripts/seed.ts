import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'

async function seed() {
  console.log('🌱 Seeding development data...')

  try {
    // Clear existing data
    await prisma.session.deleteMany()
    await prisma.projectDetails.deleteMany()
    await prisma.project.deleteMany()
    await prisma.user.deleteMany()

    // Create users
    const hashedPassword = await bcrypt.hash('password123!', 12)

    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'john.doe@example.com',
          password: hashedPassword,
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          isActive: true,
          twoFactorEnabled: false,
        },
      }),
      prisma.user.create({
        data: {
          email: 'jane.smith@example.com',
          password: hashedPassword,
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1987654321',
          isActive: true,
          twoFactorEnabled: true,
          twoFactorSecret: 'JBSWY3DPEHPK3PXP', // Test secret for development
        },
      }),
      prisma.user.create({
        data: {
          email: 'mike.johnson@example.com',
          password: hashedPassword,
          firstName: 'Mike',
          lastName: 'Johnson',
          phone: '+1555666777',
          isActive: true,
          twoFactorEnabled: false,
        },
      }),
    ])

    console.log(`✅ Created ${users.length} users`)

    // Create projects with details
    const projects = await Promise.all([
      prisma.project.create({
        data: {
          name: 'Website Redesign',
          description: 'Complete redesign of the company website with modern UI/UX',
          status: 'ACTIVE',
          userId: users[0].id,
          details: {
            create: {
              firstName: 'Alice',
              lastName: 'Williams',
              birthday: new Date('1985-03-15'),
              street: 'Main Street',
              houseNumber: '123',
              zipCode: '12345',
              city: 'New York',
              country: 'United States',
            },
          },
        },
      }),
      prisma.project.create({
        data: {
          name: 'Mobile App Development',
          description: 'Native mobile app for iOS and Android platforms',
          status: 'ACTIVE',
          userId: users[0].id,
          details: {
            create: {
              firstName: 'Bob',
              lastName: 'Anderson',
              birthday: new Date('1990-07-22'),
              street: 'Oak Avenue',
              houseNumber: '456',
              zipCode: '67890',
              city: 'Los Angeles',
              country: 'United States',
            },
          },
        },
      }),
      prisma.project.create({
        data: {
          name: 'Database Migration',
          description: 'Migrate legacy database to PostgreSQL',
          status: 'COMPLETED',
          userId: users[0].id,
          details: {
            create: {
              firstName: 'Carol',
              lastName: 'Brown',
              birthday: new Date('1988-11-08'),
              street: 'Pine Road',
              houseNumber: '789',
              zipCode: '54321',
              city: 'Chicago',
              country: 'United States',
            },
          },
        },
      }),
      prisma.project.create({
        data: {
          name: 'E-commerce Platform',
          description: 'Full-featured e-commerce solution with payment integration',
          status: 'ACTIVE',
          userId: users[1].id,
          details: {
            create: {
              firstName: 'David',
              lastName: 'Davis',
              birthday: new Date('1992-05-30'),
              street: 'Elm Street',
              houseNumber: '321',
              zipCode: '98765',
              city: 'Houston',
              country: 'United States',
            },
          },
        },
      }),
      prisma.project.create({
        data: {
          name: 'API Documentation',
          description: 'Comprehensive API documentation and developer portal',
          status: 'PAUSED',
          userId: users[1].id,
          details: {
            create: {
              firstName: 'Emma',
              lastName: 'Wilson',
              birthday: new Date('1987-09-12'),
              street: 'Maple Drive',
              houseNumber: '654',
              zipCode: '13579',
              city: 'Phoenix',
              country: 'United States',
            },
          },
        },
      }),
      prisma.project.create({
        data: {
          name: 'Security Audit',
          description: 'Complete security assessment and vulnerability testing',
          status: 'ACTIVE',
          userId: users[2].id,
          details: {
            create: {
              firstName: 'Frank',
              lastName: 'Miller',
              birthday: new Date('1991-12-25'),
              street: 'Cedar Lane',
              houseNumber: '987',
              zipCode: '24680',
              city: 'Philadelphia',
              country: 'United States',
            },
          },
        },
      }),
    ])

    console.log(`✅ Created ${projects.length} projects with details`)

    // Create development sessions
    const sessions = await Promise.all([
      prisma.session.create({
        data: {
          userId: users[0].id,
          token: 'dev_token_john_doe_12345',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      }),
      prisma.session.create({
        data: {
          userId: users[1].id,
          token: 'dev_token_jane_smith_67890',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      }),
      prisma.session.create({
        data: {
          userId: users[2].id,
          token: 'dev_token_mike_johnson_54321',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      }),
    ])

    console.log(`✅ Created ${sessions.length} development sessions`)

    console.log('🎉 Seeding completed successfully!')
    console.log('\n📝 Test Accounts:')
    console.log('Email: john.doe@example.com | Password: password123!')
    console.log('Email: jane.smith@example.com | Password: password123! (2FA enabled)')
    console.log('Email: mike.johnson@example.com | Password: password123!')
    console.log('\n🔑 Development tokens:')
    sessions.forEach((session, index) => {
      console.log(`User ${users[index]?.email}: ${session.token}`)
    })

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seed()
}

export default seed