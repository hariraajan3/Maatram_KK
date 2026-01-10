import prisma from './backend/src/lib/prisma.js';

async function checkSchema() {
    try {
        const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student_application';
    `;
        console.log('Columns in student_application:');
        console.log(JSON.stringify(result, null, 2));

        const students = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student';
    `;
        console.log('\nColumns in student:');
        console.log(JSON.stringify(students, null, 2));
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchema();
