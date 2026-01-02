import prisma from './lib/prisma.js';

console.log('Available models:');
console.log(Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));

process.exit(0);
