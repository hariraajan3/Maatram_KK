import prisma from './lib/prisma.js';

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });
        console.log('Total Users:', users.length);
        console.log('Users list:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('Error fetching users:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
