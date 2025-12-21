// Prisma Seed File for Maatram KK Database (Prisma v7 with pg adapter)
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log('🌱 Starting seed...');

  // Create users with hashed passwords
  const adminPassword = await bcrypt.hash('admin@123', 10);
  const leadPassword = await bcrypt.hash('lead@123', 10);
  const tutorPassword = await bcrypt.hash('tutor@123', 10);
  const coordPassword = await bcrypt.hash('coord@123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@maatram.org' },
    update: {},
    create: {
      name: 'Akila Admin',
      email: 'admin@maatram.org',
      passwordHash: adminPassword,
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Akila+Admin',
    },
  });

  // Create tutor lead user
  const lead = await prisma.user.upsert({
    where: { email: 'lead@maatram.org' },
    update: {},
    create: {
      name: 'Latha Lead',
      email: 'lead@maatram.org',
      passwordHash: leadPassword,
      role: 'tutor_leads',
      avatar: 'https://ui-avatars.com/api/?name=Latha+Lead',
    },
  });

  // Create tutor user
  const tutorUser = await prisma.user.upsert({
    where: { email: 'tutor@maatram.org' },
    update: {},
    create: {
      name: 'Siva Tutor',
      email: 'tutor@maatram.org',
      passwordHash: tutorPassword,
      role: 'tutor',
      avatar: 'https://ui-avatars.com/api/?name=Siva+Tutor',
    },
  });

  // Create coordinator user
  const coord = await prisma.user.upsert({
    where: { email: 'coord@maatram.org' },
    update: {},
    create: {
      name: 'Priya Coordinator',
      email: 'coord@maatram.org',
      passwordHash: coordPassword,
      role: 'tutor_leads',
      avatar: 'https://ui-avatars.com/api/?name=Priya+Coord',
    },
  });

  // Create tutor profile
  const tutor = await prisma.tutor.upsert({
    where: { userId: tutorUser.id },
    update: {},
    create: {
      userId: tutorUser.id,
      name: 'Siva Tutor',
      email: 'tutor@maatram.org',
      phoneEncrypted: null, // Encrypt in production
      status: 'active',
      subjects: ['Math', 'Science'],
      avgAttendance: 92.0,
    },
  });

  // Create sample students
  const student1 = await prisma.student.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Mani K',
      phase: 'Selection',
      guardianContactEncrypted: null, // Encrypt in production
      group: 'KK-2025-A',
      progressScore: 78,
    },
  });

  const student2 = await prisma.student.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Harini D',
      phase: 'Scheduling',
      guardianContactEncrypted: null, // Encrypt in production
      group: 'KK-2025-B',
      progressScore: 84,
    },
  });

  const student3 = await prisma.student.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Kumar S',
      phase: 'Attendance',
      guardianContactEncrypted: null, // Encrypt in production
      group: 'KK-2025-C',
      progressScore: 66,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('Created users:', { admin: admin.email, lead: lead.email, tutor: tutorUser.email, coord: coord.email });
  console.log('Created tutor profile:', tutor.email);
  console.log('Created students:', student1.name, student2.name, student3.name);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
