import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Prisma is working:', result);
  } catch (error) {
    console.error('Prisma error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();