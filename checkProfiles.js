const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allProfiles = await prisma.employeeProfile.findMany({ include: { user: true } });
  console.log(JSON.stringify(allProfiles, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
