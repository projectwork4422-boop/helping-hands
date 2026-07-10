import { prisma } from './src/lib/prisma';

async function main() {
  const pending = await prisma.employeeProfile.findMany({
    where: { status: "PENDING" },
    include: { user: true }
  });
  console.dir(pending, { depth: null });
}
main().finally(() => prisma.$disconnect());
